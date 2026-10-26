import type { ReactNode } from 'react'
import { formatCount, parseWholeNumber } from '../../../domain/format.ts'
import { addDay, duplicateItem, moveItem, removeItem, updateWeek } from '../../../domain/plan.ts'
import type { Id, Program, Week } from '../../../domain/types.ts'
import { AutoSaveField } from '../../components/AutoSaveField.tsx'
import { Button } from '../../components/Button.tsx'
import { PlanList } from '../../components/PlanList.tsx'
import { Screen } from '../../components/Screen.tsx'
import { Section } from '../../components/Section.tsx'
import { optional } from './fields.ts'
import type { ChangeProgram } from './shared.tsx'

/** Una semana: su número, su etiqueta y sus días. */
export function WeekView({
  program,
  week,
  editing,
  editToggle,
  onChange,
  onOpenDay,
  onBack,
}: {
  program: Program
  week: Week
  editing: boolean
  editToggle: ReactNode
  onChange: ChangeProgram
  onOpenDay: (dayId: Id) => void
  onBack: () => void
}) {
  const weekId = week.id
  return (
    <Screen
      title={`Semana ${week.number}`}
      subtitle={[week.label, program.name].filter(Boolean).join(' · ')}
      onBack={onBack}
      action={editToggle}
    >
      {editing && (
        <Section title="Datos de la semana">
          <AutoSaveField
            label="Número"
            value={String(week.number)}
            inputMode="numeric"
            validate={(text) =>
              parseWholeNumber(text) === undefined ? 'Escribí un número entero, por ejemplo 3.' : undefined
            }
            onSave={(text) => onChange((p) => updateWeek(p, { weekId }, { number: parseWholeNumber(text)! }))}
          />
          <AutoSaveField
            label="Etiqueta"
            value={week.label ?? ''}
            placeholder="Opcional, por ejemplo Descarga"
            onSave={(text) => onChange((p) => updateWeek(p, { weekId }, { label: optional(text) }))}
          />
        </Section>
      )}
      <Section title="Días">
        <PlanList
          items={week.days.map((day) => {
            const exercises = day.blocks.reduce((total, block) => total + block.exercises.length, 0)
            return {
              id: day.id,
              title: day.name,
              subtitle: `${formatCount(day.blocks.length, 'bloque', 'bloques')} · ${formatCount(exercises, 'ejercicio', 'ejercicios')}`,
            }
          })}
          editing={editing}
          emptyText="Todavía no hay días."
          onOpen={onOpenDay}
          onMove={(dayId, offset) => onChange((p) => moveItem(p, { weekId, dayId }, offset))}
          onDuplicate={(dayId) => onChange((p) => duplicateItem(p, { weekId, dayId }))}
          onDelete={(dayId) => onChange((p) => removeItem(p, { weekId, dayId }))}
          deleteTitle={(item) => `¿Eliminar el ${item.title}?`}
          deleteMessage="Se borran sus bloques y series. Las sesiones ya registradas no se modifican."
        />
        {editing && (
          <Button fullWidth onClick={() => onChange((p) => addDay(p, { weekId }))}>
            Agregar día
          </Button>
        )}
      </Section>
    </Screen>
  )
}
