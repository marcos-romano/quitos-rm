import type { ReactNode } from 'react'
import { formatKg, formatMeasure, formatRest, formatSetLoad } from '../../../domain/format.ts'
import { prescribedLoad } from '../../../domain/load.ts'
import { addSet, duplicateItem, moveItem, removeItem, updateExercise } from '../../../domain/plan.ts'
import type { Block, BlockExercise, Day, Exercise, Id, RoundingIncrement, Week } from '../../../domain/types.ts'
import { AutoSaveField } from '../../components/AutoSaveField.tsx'
import { Button } from '../../components/Button.tsx'
import { PlanList } from '../../components/PlanList.tsx'
import { Screen } from '../../components/Screen.tsx'
import { Section } from '../../components/Section.tsx'
import { optional } from './fields.ts'
import type { ChangeProgram } from './shared.tsx'

/** Un ejercicio dentro del bloque: su nota y sus series, cada una con la carga calculada. */
export function ExerciseView({
  week,
  day,
  block,
  entry,
  exercise,
  maxKg,
  increment,
  editing,
  editToggle,
  onChange,
  onOpenSet,
  onBack,
}: {
  week: Week
  day: Day
  block: Block
  entry: BlockExercise
  exercise: Exercise
  maxKg?: number
  increment: RoundingIncrement
  editing: boolean
  editToggle: ReactNode
  onChange: ChangeProgram
  onOpenSet: (setId: Id) => void
  onBack: () => void
}) {
  const path = { weekId: week.id, dayId: day.id, blockId: block.id, blockExerciseId: entry.id }
  const usesPercent = entry.sets.some((set) => set.load.kind === 'percent')

  return (
    <Screen title={exercise.name} subtitle={block.name} onBack={onBack} action={editToggle}>
      {editing ? (
        <Section title="Nota">
          <AutoSaveField
            label="Nota del ejercicio"
            value={entry.note ?? ''}
            placeholder="Opcional, por ejemplo una indicación técnica"
            onSave={(text) => onChange((p) => updateExercise(p, path, { note: optional(text) }))}
          />
        </Section>
      ) : (
        entry.note && (
          <Section title="Nota">
            <p className="text-body">{entry.note}</p>
          </Section>
        )
      )}
      {usesPercent && (
        <Section title="Máximo">
          <p className={maxKg === undefined ? 'text-secondary' : 'text-body'}>
            {maxKg === undefined
              ? 'Sin máximo cargado: las series con porcentaje no se pueden calcular. Cargalo en Máximos.'
              : `${formatKg(maxKg)}. Las cargas se calculan con este máximo.`}
          </p>
        </Section>
      )}
      <Section title="Series">
        <PlanList
          items={entry.sets.map((set, index) => ({
            id: set.id,
            title: `Serie ${index + 1}`,
            subtitle: `${formatMeasure(set.measure)} · ${formatSetLoad(set.load, prescribedLoad(set.load, maxKg, increment))}`,
            detail: set.restSec === undefined ? undefined : `Descanso propio: ${formatRest(set.restSec)}`,
          }))}
          editing={editing}
          emptyText="Todavía no hay series."
          onOpen={onOpenSet}
          onMove={(setId, offset) => onChange((p) => moveItem(p, { ...path, setId }, offset))}
          onDuplicate={(setId) => onChange((p) => duplicateItem(p, { ...path, setId }))}
          onDelete={(setId) => onChange((p) => removeItem(p, { ...path, setId }))}
          deleteTitle={(item) => `¿Eliminar la ${item.title}?`}
          deleteMessage="Las series que siguen pasan a la ronda anterior. Las sesiones ya registradas no se modifican."
        />
        {editing && (
          <>
            <Button fullWidth onClick={() => onChange((p) => addSet(p, path, exercise.measure))}>
              Agregar serie
            </Button>
            <p className="text-secondary">Cada serie nueva es una copia de la anterior.</p>
          </>
        )}
      </Section>
    </Screen>
  )
}
