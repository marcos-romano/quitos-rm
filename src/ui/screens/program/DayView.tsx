import type { ReactNode } from 'react'
import { BLOCK_TYPE_LABELS, formatRest, formatWeekTitle } from '../../../domain/format.ts'
import { duplicateItem, moveItem, removeItem, updateDay } from '../../../domain/plan.ts'
import type { Day, Exercise, Id, Week } from '../../../domain/types.ts'
import { AutoSaveField } from '../../components/AutoSaveField.tsx'
import { Button } from '../../components/Button.tsx'
import { PlanList } from '../../components/PlanList.tsx'
import { Screen } from '../../components/Screen.tsx'
import { Section } from '../../components/Section.tsx'
import { optional, requireName } from './fields.ts'
import type { ChangeProgram } from './shared.tsx'

/** Un día: su movilidad y entrada en calor, y sus bloques con los ejercicios de cada uno. */
export function DayView({
  week,
  day,
  catalog,
  editing,
  editToggle,
  onChange,
  onOpenBlock,
  onAddBlock,
  onBack,
}: {
  week: Week
  day: Day
  catalog: Map<Id, Exercise>
  editing: boolean
  editToggle: ReactNode
  onChange: ChangeProgram
  onOpenBlock: (blockId: Id) => void
  onAddBlock: () => void
  onBack: () => void
}) {
  const path = { weekId: week.id, dayId: day.id }
  return (
    <Screen title={day.name} subtitle={formatWeekTitle(week)} onBack={onBack} action={editToggle}>
      {editing ? (
        <Section title="Datos del día">
          <AutoSaveField
            label="Nombre"
            value={day.name}
            validate={requireName}
            onSave={(name) => onChange((p) => updateDay(p, path, { name }))}
          />
          <AutoSaveField
            label="Movilidad + entrada en calor"
            value={day.prep ?? ''}
            placeholder="Opcional, por ejemplo 5' foam roll"
            onSave={(text) => onChange((p) => updateDay(p, path, { prep: optional(text) }))}
          />
        </Section>
      ) : (
        <Section title="Movilidad + entrada en calor">
          <p className={day.prep ? 'text-body' : 'text-secondary'}>{day.prep ?? 'Nada cargado.'}</p>
        </Section>
      )}
      <Section title="Bloques">
        <PlanList
          items={day.blocks.map((block) => ({
            id: block.id,
            title: block.name,
            subtitle: `${BLOCK_TYPE_LABELS[block.type]} · descanso ${formatRest(block.restSec)}`,
            detail: block.exercises.map((e) => catalog.get(e.exerciseId)?.name ?? 'Ejercicio sin nombre').join(' · '),
          }))}
          editing={editing}
          emptyText="Todavía no hay bloques."
          onOpen={onOpenBlock}
          onMove={(blockId, offset) => onChange((p) => moveItem(p, { ...path, blockId }, offset))}
          onDuplicate={(blockId) => onChange((p) => duplicateItem(p, { ...path, blockId }))}
          onDelete={(blockId) => onChange((p) => removeItem(p, { ...path, blockId }))}
          deleteTitle={(item) => `¿Eliminar el bloque ${item.title}?`}
          deleteMessage="Se borran sus ejercicios y series. Las sesiones ya registradas no se modifican."
        />
        {editing && (
          <Button fullWidth onClick={onAddBlock}>
            Agregar bloque
          </Button>
        )}
      </Section>
    </Screen>
  )
}
