import { useState, type ReactNode } from 'react'
import {
  LOAD_KIND_LABELS,
  MEASURE_LABELS,
  formatKg,
  formatNumber,
  formatNumberForInput,
  formatRest,
  parseDecimal,
  parseSeconds,
  parseWholeNumber,
} from '../../../domain/format.ts'
import { prescribedLoad } from '../../../domain/load.ts'
import { updateSet, type SetPath } from '../../../domain/plan.ts'
import type { Block, Exercise, Load, MeasureKind, PrescribedSet, RoundingIncrement } from '../../../domain/types.ts'
import { AutoSaveField } from '../../components/AutoSaveField.tsx'
import { LoadValue } from '../../components/LoadValue.tsx'
import { Screen } from '../../components/Screen.tsx'
import { Section } from '../../components/Section.tsx'
import { SelectField } from '../../components/SelectField.tsx'
import { secondsError } from './fields.ts'
import type { ChangeProgram } from './shared.tsx'

const MEASURE_OPTIONS = (Object.keys(MEASURE_LABELS) as MeasureKind[]).map((value) => ({
  value,
  label: MEASURE_LABELS[value],
}))

const LOAD_OPTIONS = (Object.keys(LOAD_KIND_LABELS) as Load['kind'][]).map((value) => ({
  value,
  label: LOAD_KIND_LABELS[value],
}))

const MEASURE_UNITS: Record<MeasureKind, [singular: string, plural: string]> = {
  reps: ['repetición', 'repeticiones'],
  time: ['segundo', 'segundos'],
  distance: ['metro', 'metros'],
}

/** Repeticiones: enteras. Segundos y metros: pueden tener decimales. */
function parseMeasure(kind: MeasureKind, text: string): number | undefined {
  const value = kind === 'reps' ? parseWholeNumber(text) : parseDecimal(text)
  return value !== undefined && value > 0 ? value : undefined
}

/** Una serie: su medida, su carga con el cálculo en grande y su descanso. */
export function SetView({
  path,
  index,
  set,
  block,
  exercise,
  maxKg,
  increment,
  editing,
  editToggle,
  onChange,
  onBack,
}: {
  path: SetPath
  index: number
  set: PrescribedSet
  block: Block
  exercise: Exercise
  maxKg?: number
  increment: RoundingIncrement
  editing: boolean
  editToggle: ReactNode
  onChange: ChangeProgram
  onBack: () => void
}) {
  const result = prescribedLoad(set.load, maxKg, increment)
  const save = (changes: Partial<Omit<PrescribedSet, 'id'>>) => onChange((p) => updateSet(p, path, changes))
  const { kind, value } = set.measure

  return (
    <Screen title={`Serie ${index + 1}`} subtitle={`${exercise.name} · ${block.name}`} onBack={onBack} action={editToggle}>
      <Section title="Medida">
        {editing ? (
          <>
            <SelectField
              label="Se mide en"
              value={kind}
              options={MEASURE_OPTIONS}
              onChange={(next) => save({ measure: { kind: next, value } })}
            />
            <AutoSaveField
              key={kind}
              label={MEASURE_LABELS[kind]}
              value={formatNumberForInput(value)}
              inputMode={kind === 'reps' ? 'numeric' : 'decimal'}
              validate={(text) =>
                parseMeasure(kind, text) === undefined
                  ? kind === 'reps'
                    ? 'Escribí un número entero, por ejemplo 8.'
                    : 'Escribí un número, por ejemplo 30 o 12,5.'
                  : undefined
              }
              onSave={(text) => save({ measure: { kind, value: parseMeasure(kind, text)! } })}
            />
          </>
        ) : (
          <div className="load-value">
            <p className="number-large">{formatNumber(value)}</p>
            <p className="text-secondary">{MEASURE_UNITS[kind][value === 1 ? 0 : 1]}</p>
          </div>
        )}
      </Section>
      <Section title="Carga">
        {editing && <LoadEditor key={set.id} load={set.load} onSave={(load) => save({ load })} />}
        {set.load.kind === 'percent' && (
          <p className="text-body">
            {formatNumber(set.load.percent)}% del máximo{maxKg === undefined ? '' : ` (${formatKg(maxKg)})`}
          </p>
        )}
        <LoadValue result={result} />
      </Section>
      <Section title="Descanso">
        {editing ? (
          <AutoSaveField
            label="Descanso propio de esta serie (s)"
            value={set.restSec === undefined ? '' : String(set.restSec)}
            inputMode="numeric"
            placeholder={`Vacío: el del bloque, ${formatRest(block.restSec)}`}
            validate={(text) => (text.trim() === '' ? undefined : secondsError(text))}
            onSave={(text) => save({ restSec: text.trim() === '' ? undefined : parseSeconds(text) })}
          />
        ) : (
          <>
            <p className="text-body">{formatRest(set.restSec ?? block.restSec)}</p>
            <p className="text-secondary">
              {set.restSec === undefined ? 'El del bloque, al cerrar la ronda.' : 'Propio de esta serie.'}
            </p>
          </>
        )}
      </Section>
    </Screen>
  )
}

/**
 * Tipo de carga y su valor. Al pasar a porcentaje o kg no se inventa un número:
 * no se guarda nada hasta que se escribe uno válido.
 */
function LoadEditor({ load, onSave }: { load: Load; onSave: (load: Load) => void }) {
  const [kind, setKind] = useState<Load['kind']>(load.kind)
  const stored = load.kind === kind ? load : undefined

  return (
    <>
      <SelectField
        label="Tipo de carga"
        value={kind}
        options={LOAD_OPTIONS}
        onChange={(next) => {
          setKind(next)
          if (next === 'free') onSave({ kind: 'free' })
        }}
      />
      {kind !== 'free' && (
        <AutoSaveField
          key={kind}
          label={kind === 'percent' ? 'Porcentaje' : 'Kg'}
          value={
            stored?.kind === 'percent'
              ? formatNumberForInput(stored.percent)
              : stored?.kind === 'kg'
                ? formatNumberForInput(stored.kg)
                : ''
          }
          inputMode="decimal"
          placeholder={kind === 'percent' ? 'Por ejemplo 70' : 'Por ejemplo 20'}
          validate={(text) => (parseDecimal(text) ? undefined : 'Escribí un número, por ejemplo 70 o 62,5.')}
          onSave={(text) => {
            const number = parseDecimal(text)!
            onSave(kind === 'percent' ? { kind, percent: number } : { kind, kg: number })
          }}
        />
      )}
    </>
  )
}
