import type { ReactNode } from 'react'
import {
  BLOCK_TYPE_LABELS,
  formatCount,
  formatRest,
  formatSetShort,
  formatWeekTitle,
  parseSeconds,
} from '../../../domain/format.ts'
import { duplicateItem, moveItem, removeItem, updateBlock } from '../../../domain/plan.ts'
import type { Block, BlockType, Day, Exercise, Id, Week } from '../../../domain/types.ts'
import { AutoSaveField } from '../../components/AutoSaveField.tsx'
import { Button } from '../../components/Button.tsx'
import { PlanList } from '../../components/PlanList.tsx'
import { Screen } from '../../components/Screen.tsx'
import { Section } from '../../components/Section.tsx'
import { SelectField } from '../../components/SelectField.tsx'
import { requireName, secondsError } from './fields.ts'
import type { ChangeProgram } from './shared.tsx'

const BLOCK_TYPE_OPTIONS = (Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((value) => ({
  value,
  label: BLOCK_TYPE_LABELS[value],
}))

/** Un bloque: su tipo, su descanso por ronda y sus ejercicios, con cada serie listada. */
export function BlockView({
  week,
  day,
  block,
  catalog,
  editing,
  editToggle,
  onChange,
  onOpenExercise,
  onAddExercise,
  onBack,
}: {
  week: Week
  day: Day
  block: Block
  catalog: Map<Id, Exercise>
  editing: boolean
  editToggle: ReactNode
  onChange: ChangeProgram
  onOpenExercise: (blockExerciseId: Id) => void
  onAddExercise: () => void
  onBack: () => void
}) {
  const path = { weekId: week.id, dayId: day.id, blockId: block.id }
  return (
    <Screen title={block.name} subtitle={`${day.name} · ${formatWeekTitle(week)}`} onBack={onBack} action={editToggle}>
      {editing ? (
        <Section title="Datos del bloque">
          <AutoSaveField
            label="Nombre"
            value={block.name}
            validate={requireName}
            onSave={(name) => onChange((p) => updateBlock(p, path, { name }))}
          />
          <SelectField
            label="Tipo"
            value={block.type}
            options={BLOCK_TYPE_OPTIONS}
            onChange={(type) => onChange((p) => updateBlock(p, path, { type }))}
          />
          <AutoSaveField
            label="Descanso al cerrar cada ronda (s)"
            value={String(block.restSec)}
            inputMode="numeric"
            validate={secondsError}
            onSave={(text) => onChange((p) => updateBlock(p, path, { restSec: parseSeconds(text)! }))}
          />
        </Section>
      ) : (
        <Section>
          <p className="text-body">{BLOCK_TYPE_LABELS[block.type]}</p>
          <p className="text-secondary">Descanso al cerrar cada ronda: {formatRest(block.restSec)}</p>
        </Section>
      )}
      <Section title="Ejercicios">
        <PlanList
          items={block.exercises.map((entry) => ({
            id: entry.id,
            title: catalog.get(entry.exerciseId)?.name ?? 'Ejercicio sin nombre',
            subtitle: formatCount(entry.sets.length, 'serie', 'series'),
            detail: entry.sets.map(formatSetShort).join(' · '),
          }))}
          editing={editing}
          emptyText="Todavía no hay ejercicios."
          onOpen={onOpenExercise}
          onMove={(blockExerciseId, offset) => onChange((p) => moveItem(p, { ...path, blockExerciseId }, offset))}
          onDuplicate={(blockExerciseId) => onChange((p) => duplicateItem(p, { ...path, blockExerciseId }))}
          onDelete={(blockExerciseId) => onChange((p) => removeItem(p, { ...path, blockExerciseId }))}
          deleteTitle={(item) => `¿Quitar ${item.title} de este bloque?`}
          deleteMessage="Se borran sus series en este bloque. El ejercicio sigue en el catálogo y las sesiones ya registradas no se modifican."
        />
        {editing && (
          <Button fullWidth onClick={onAddExercise}>
            Agregar ejercicio
          </Button>
        )}
      </Section>
    </Screen>
  )
}
