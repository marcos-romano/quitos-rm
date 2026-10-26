import { useState } from 'react'
import { MEASURE_LABELS } from '../../../domain/format.ts'
import { cleanName, normalizeName } from '../../../domain/names.ts'
import type { Block, Exercise, Id } from '../../../domain/types.ts'
import { Button } from '../../components/Button.tsx'
import { PlanList } from '../../components/PlanList.tsx'
import { Screen } from '../../components/Screen.tsx'
import { Section } from '../../components/Section.tsx'
import { TextField } from '../../components/TextField.tsx'

/**
 * Buscador del catálogo para agregar un ejercicio al bloque. Busca sin importar
 * mayúsculas ni tildes; si el nombre no existe, ofrece crearlo.
 */
export function ExercisePickerView({
  block,
  catalog,
  onPick,
  onCreate,
  onBack,
}: {
  block: Block
  catalog: Exercise[]
  onPick: (exerciseId: Id) => void
  onCreate: (name: string) => void
  onBack: () => void
}) {
  const [query, setQuery] = useState('')
  const key = normalizeName(query)
  const matches = catalog.filter((exercise) => exercise.nameKey.includes(key))
  const exists = catalog.some((exercise) => exercise.nameKey === key)

  return (
    <Screen title="Agregar ejercicio" subtitle={block.name} onBack={onBack}>
      <Section>
        <TextField label="Buscar o crear" value={query} onChange={setQuery} placeholder="Por ejemplo Sentadilla" />
        {key !== '' && !exists && (
          <Button fullWidth onClick={() => onCreate(query)}>
            Crear «{cleanName(query)}»
          </Button>
        )}
      </Section>
      <Section title={key === '' ? 'Catálogo' : 'Resultados'}>
        <PlanList
          items={matches.map((exercise) => ({
            id: exercise.id,
            title: exercise.name,
            subtitle: MEASURE_LABELS[exercise.measure],
          }))}
          editing={false}
          emptyText="No hay ejercicios con ese nombre."
          onOpen={onPick}
        />
      </Section>
    </Screen>
  )
}
