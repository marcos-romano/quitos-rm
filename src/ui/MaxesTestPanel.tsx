// Panel de prueba temporal (paso 2.6): cargar máximos y ver el cálculo de cargas
// en el iPhone. Se reemplaza por la pantalla de Máximos en el paso 7.

import { liveQuery } from 'dexie'
import { useEffect, useState } from 'react'
import { db } from '../db/appDb.ts'
import { createExercise, listExercises } from '../db/exercises.ts'
import { addMax, getMaxHistory } from '../db/maxes.ts'
import { requestPersistentStorage, type PersistenceStatus } from '../db/persist.ts'
import { getSettings } from '../db/settings.ts'
import {
  formatDate,
  formatIncrement,
  formatKg,
  formatLoad,
  parseDecimal,
  toLocalDate,
} from '../domain/format.ts'
import { prescribedLoad, resolveIncrement } from '../domain/load.ts'
import { DEFAULT_SETTINGS, type Settings } from '../domain/settings.ts'
import type { Exercise, Id, Max } from '../domain/types.ts'
import './MaxesTestPanel.css'

type Message = { kind: 'ok' | 'error'; text: string }

const PERSISTENCE_TEXT: Record<PersistenceStatus, string> = {
  granted: 'Concedido: Safari no va a borrar los datos.',
  denied: 'No concedido: conviene hacer respaldos.',
  unsupported: 'Este navegador no permite pedirlo.',
}

export function MaxesTestPanel() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [selectedId, setSelectedId] = useState<Id>()
  const [history, setHistory] = useState<Max[]>([])
  const [persistence, setPersistence] = useState<PersistenceStatus>()

  const [newName, setNewName] = useState('')
  const [maxText, setMaxText] = useState('')
  const [percentText, setPercentText] = useState('70')
  const [message, setMessage] = useState<Message>()

  useEffect(() => {
    let cancelled = false
    void getSettings(db).then((loaded) => {
      if (!cancelled) setSettings(loaded)
    })
    void requestPersistentStorage().then((status) => {
      if (!cancelled) setPersistence(status)
    })
    // La lista se actualiza sola cuando cambia el catálogo, por ejemplo al importar un programa.
    const subscription = liveQuery(() => listExercises(db)).subscribe((list) => {
      setExercises(list)
      setSelectedId((id) => id ?? list[0]?.id)
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    void getMaxHistory(db, selectedId).then((list) => {
      if (!cancelled) setHistory(list)
    })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const selected = exercises.find((e) => e.id === selectedId)
  const currentMax = history[0]
  const increment = selected
    ? resolveIncrement(selected, settings.globalRounding)
    : settings.globalRounding
  const percent = parseDecimal(percentText)
  const result =
    percent === undefined
      ? undefined
      : prescribedLoad({ kind: 'percent', percent }, currentMax?.kg, increment)
  const load = result && formatLoad(result)
  const loadIsNumber = result?.status === 'calculated' || result?.status === 'fixed'

  async function handleAddExercise() {
    try {
      const created = await createExercise(db, { name: newName })
      setExercises(await listExercises(db))
      setSelectedId(created.id)
      setHistory([])
      setNewName('')
      setMessage({ kind: 'ok', text: `Se agregó "${created.name}".` })
    } catch (error) {
      setMessage({ kind: 'error', text: (error as Error).message })
    }
  }

  async function handleSaveMax() {
    if (!selectedId) return
    const kg = parseDecimal(maxText)
    if (kg === undefined) {
      setMessage({ kind: 'error', text: 'Escribí el máximo con números, por ejemplo 87,5.' })
      return
    }
    try {
      // La fecha se guarda sola: el día en que se carga el máximo.
      await addMax(db, { exerciseId: selectedId, kg, date: toLocalDate(new Date()) })
      setHistory(await getMaxHistory(db, selectedId))
      setMaxText('')
      setMessage({ kind: 'ok', text: `Máximo de ${formatKg(kg)} guardado.` })
    } catch (error) {
      setMessage({ kind: 'error', text: (error as Error).message })
    }
  }

  return (
    <div className="panel">
      <p className="panel-intro">
        Panel de prueba: cargá un máximo, cerrá la app del todo y volvé a abrirla.
      </p>

      <section className="card">
        <label className="field">
          <span className="field-label">Ejercicio</span>
          <select
            className="input"
            value={selectedId ?? ''}
            onChange={(event) => {
              setSelectedId(event.target.value)
              setMessage(undefined)
            }}
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>
        <p className="secondary">
          Redondeo: {formatIncrement(increment)}
          {selected?.roundingIncrement !== undefined ? ' (propio del ejercicio)' : ' (global)'}
        </p>

        <div className="row">
          <input
            className="input"
            placeholder="Nuevo ejercicio"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
          <button
            type="button"
            className="button-secondary"
            disabled={newName.trim() === ''}
            onClick={() => void handleAddExercise()}
          >
            Agregar
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Máximo</h2>
        {currentMax ? (
          <p className="big-number">{formatKg(currentMax.kg)}</p>
        ) : (
          <p className="secondary">Sin máximo cargado.</p>
        )}
        {currentMax && <p className="secondary">Vigente desde el {formatDate(currentMax.date)}</p>}

        <label className="field">
          <span className="field-label">Nuevo máximo (kg)</span>
          <input
            className="input"
            inputMode="decimal"
            placeholder="87,5"
            value={maxText}
            onChange={(event) => setMaxText(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="button-primary button-full"
          disabled={maxText.trim() === '' || !selectedId}
          onClick={() => void handleSaveMax()}
        >
          Guardar máximo
        </button>

        {message && (
          <p className={message.kind === 'error' ? 'message message-error' : 'message'} role="status">
            {message.text}
          </p>
        )}

        {history.length > 0 && (
          <>
            <span className="field-label">Historial</span>
            <ul className="history">
              {history.map((max, index) => (
                <li key={max.id}>
                  <span>{formatKg(max.kg)}</span>
                  <span className="secondary">
                    {formatDate(max.date)}
                    {index === 0 && ' · vigente'}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">Cálculo de carga</h2>
        <label className="field">
          <span className="field-label">Porcentaje del máximo</span>
          <input
            className="input"
            inputMode="decimal"
            value={percentText}
            onChange={(event) => setPercentText(event.target.value)}
          />
        </label>
        {load ? (
          <>
            <p className={loadIsNumber ? 'big-number' : 'secondary'}>{load.main}</p>
            {load.secondary && <p className="secondary">{load.secondary}</p>}
          </>
        ) : (
          <p className="secondary">Escribí un porcentaje, por ejemplo 70.</p>
        )}
      </section>

      <p className="secondary">
        Almacenamiento persistente: {persistence ? PERSISTENCE_TEXT[persistence] : 'consultando…'}
      </p>
    </div>
  )
}
