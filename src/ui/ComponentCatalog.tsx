// Catálogo temporal de componentes (paso 3): cada pieza base con sus estados, para
// aprobarlas en el iPhone antes de usarlas en las pantallas reales.

import { useState } from 'react'
import { formatDayLabel, parseDecimal } from '../domain/format.ts'
import { prescribedLoad } from '../domain/load.ts'
import { BottomNav, type Tab } from './components/BottomNav.tsx'
import { Button } from './components/Button.tsx'
import { ConfirmDialog } from './components/ConfirmDialog.tsx'
import { LoadValue } from './components/LoadValue.tsx'
import { RpeSelector } from './components/RpeSelector.tsx'
import { Section } from './components/Section.tsx'
import { SessionBar } from './components/SessionBar.tsx'
import { TextField } from './components/TextField.tsx'
import { Tick } from './components/Tick.tsx'

export function ComponentCatalog() {
  const [maxText, setMaxText] = useState('1O')
  const [ticks, setTicks] = useState([true, false])
  const [rpe, setRpe] = useState<number | undefined>(8)
  const [showBars, setShowBars] = useState(false)
  const [tab, setTab] = useState<Tab>('home')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notice, setNotice] = useState<string>()

  const maxError =
    maxText.trim() !== '' && parseDecimal(maxText) === undefined
      ? 'Escribí el máximo con números, por ejemplo 87,5.'
      : undefined

  return (
    <div>
      <Section title="Botones">
        <Button variant="primary" fullWidth>
          {formatDayLabel(3, 'Día 2')}
        </Button>
        <Button fullWidth>Agregar ejercicio</Button>
        <Button variant="destructive" fullWidth>
          Eliminar semana
        </Button>
        <Button variant="primary" fullWidth disabled>
          Deshabilitado
        </Button>
      </Section>

      <Section title="Campo de texto">
        <TextField
          label="Máximo (kg)"
          value={maxText}
          onChange={setMaxText}
          inputMode="decimal"
          placeholder="87,5"
          error={maxError}
        />
        <p className="text-secondary">Probá borrar la letra O y escribir un número.</p>
      </Section>

      <Section title="Carga">
        <LoadValue result={prescribedLoad({ kind: 'percent', percent: 70 }, 120, 2.5)} />
        <LoadValue result={prescribedLoad({ kind: 'free' }, undefined, 2.5)} />
        <LoadValue result={prescribedLoad({ kind: 'percent', percent: 70 }, undefined, 2.5)} />
      </Section>

      <Section title="Tilde">
        {[
          { name: 'Sentadilla · 8', load: '85 kg' },
          { name: 'Isquio isométrico · 30 s', load: 'Libre' },
        ].map((row, index) => (
          <div key={row.name} className="catalog-row">
            <span className="text-body">{row.name}</span>
            <span className="catalog-row-end">
              <span className="text-body">{row.load}</span>
              <Tick
                checked={ticks[index]}
                label={row.name}
                onChange={(checked) => setTicks(ticks.map((t, i) => (i === index ? checked : t)))}
              />
            </span>
          </div>
        ))}
      </Section>

      <Section title="RPE">
        <RpeSelector value={rpe} onChange={setRpe} />
      </Section>

      <Section title="Navegación y sesión en curso">
        <p className="text-secondary">
          La barra de navegación y la de sesión en curso quedan fijas abajo, en todas las
          pantallas. Tocá los ítems para ver cómo se marca el activo.
        </p>
        <Button fullWidth onClick={() => setShowBars(!showBars)}>
          {showBars ? 'Ocultar barras' : 'Mostrar barras'}
        </Button>
      </Section>

      <Section title="Confirmación">
        <Button variant="destructive" fullWidth onClick={() => setDialogOpen(true)}>
          Eliminar semana
        </Button>
        {notice && <p className="text-secondary">{notice}</p>}
      </Section>

      <ConfirmDialog
        open={dialogOpen}
        title="¿Eliminar la Semana 2?"
        message="Se borran sus días y todas sus series. Las sesiones ya registradas no se modifican."
        confirmLabel="Eliminar"
        onConfirm={() => {
          setDialogOpen(false)
          setNotice('Elegiste eliminar. Es una prueba: no se borró nada.')
        }}
        onCancel={() => {
          setDialogOpen(false)
          setNotice('Cancelaste: no pasó nada.')
        }}
      />

      {showBars && (
        <>
          {/* Espacio para que las barras fijas no tapen el final de la página. */}
          <div className="catalog-bars-space" />
          <SessionBar
            dayLabel={formatDayLabel(3, 'Día 2')}
            onReturn={() => setNotice('Acá volverías a la sesión en curso.')}
          />
          <BottomNav active={tab} onSelect={setTab} />
        </>
      )}
    </div>
  )
}
