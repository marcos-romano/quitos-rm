import { CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatCount } from '../../../domain/format.ts'
import { addWeek, duplicateItem, moveItem, removeItem, updateProgram } from '../../../domain/plan.ts'
import type { Id, Program } from '../../../domain/types.ts'
import { AutoSaveField } from '../../components/AutoSaveField.tsx'
import { Button } from '../../components/Button.tsx'
import { PlanList } from '../../components/PlanList.tsx'
import { Screen } from '../../components/Screen.tsx'
import { Section } from '../../components/Section.tsx'
import { optional, requireName } from './fields.ts'
import type { ChangeProgram } from './shared.tsx'

/** Un programa: si es el activo y sus semanas. */
export function ProgramView({
  program,
  active,
  editing,
  editToggle,
  onChange,
  onActivate,
  onOpenWeek,
  onBack,
}: {
  program: Program
  active: boolean
  editing: boolean
  editToggle: ReactNode
  onChange: ChangeProgram
  onActivate: () => void
  onOpenWeek: (weekId: Id) => void
  onBack: () => void
}) {
  return (
    <Screen title={program.name} subtitle={program.description} onBack={onBack} action={editToggle}>
      {editing && (
        <Section title="Datos del programa">
          <AutoSaveField
            label="Nombre"
            value={program.name}
            validate={requireName}
            onSave={(name) => onChange((p) => updateProgram(p, { name }))}
          />
          <AutoSaveField
            label="Descripción"
            value={program.description ?? ''}
            placeholder="Opcional"
            onSave={(text) => onChange((p) => updateProgram(p, { description: optional(text) }))}
          />
        </Section>
      )}
      <Section>
        {active ? (
          <p className="status-line">
            <CircleCheck size={20} strokeWidth={1.5} aria-hidden="true" />
            Programa activo
          </p>
        ) : (
          <Button fullWidth onClick={onActivate}>
            Usar como programa activo
          </Button>
        )}
      </Section>
      <Section title="Semanas">
        <PlanList
          items={program.weeks.map((week) => ({
            id: week.id,
            title: `Semana ${week.number}`,
            subtitle: [week.label, formatCount(week.days.length, 'día', 'días')].filter(Boolean).join(' · '),
          }))}
          editing={editing}
          emptyText="Todavía no hay semanas."
          onOpen={onOpenWeek}
          onMove={(weekId, offset) => onChange((p) => moveItem(p, { weekId }, offset))}
          onDuplicate={(weekId) => onChange((p) => duplicateItem(p, { weekId }))}
          onDelete={(weekId) => onChange((p) => removeItem(p, { weekId }))}
          deleteTitle={(item) => `¿Eliminar la ${item.title}?`}
          deleteMessage="Se borran sus días, bloques y series. Las sesiones ya registradas no se modifican."
        />
        {editing && (
          <Button fullWidth onClick={() => onChange((p) => addWeek(p))}>
            Agregar semana
          </Button>
        )}
      </Section>
    </Screen>
  )
}
