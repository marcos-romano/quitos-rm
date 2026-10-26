import { CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { db } from '../../../db/appDb.ts'
import { addProgram, deleteProgram } from '../../../db/programs.ts'
import { formatCount } from '../../../domain/format.ts'
import { duplicateProgram } from '../../../domain/plan.ts'
import type { Id, Program } from '../../../domain/types.ts'
import { Button } from '../../components/Button.tsx'
import { PlanList } from '../../components/PlanList.tsx'
import { Screen } from '../../components/Screen.tsx'
import { Section } from '../../components/Section.tsx'

export function ProgramListView({
  programs,
  activeId,
  editing,
  editToggle,
  onOpen,
  onCreate,
}: {
  programs: Program[]
  activeId?: Id
  editing: boolean
  editToggle: ReactNode
  onOpen: (id: Id) => void
  onCreate: () => void
}) {
  return (
    <Screen title="Programas" action={programs.length > 0 ? editToggle : undefined}>
      <Section>
        <PlanList
          items={programs.map((program) => {
            const weeks = formatCount(program.weeks.length, 'semana', 'semanas')
            return {
              id: program.id,
              title: program.name,
              subtitle:
                program.id === activeId ? (
                  <span className="status-inline">
                    <CircleCheck size={16} strokeWidth={1.5} aria-hidden="true" />
                    Activo · {weeks}
                  </span>
                ) : (
                  weeks
                ),
            }
          })}
          editing={editing}
          emptyText="Todavía no hay programas. Podés importar uno desde Más o crear uno nuevo."
          onOpen={onOpen}
          onDuplicate={(id) => {
            const program = programs.find((p) => p.id === id)
            if (program) void addProgram(db, duplicateProgram(program))
          }}
          onDelete={(id) => void deleteProgram(db, id)}
          deleteTitle={(item) => `¿Eliminar «${item.title}»?`}
          deleteMessage="Se borran sus semanas, días, bloques y series. Las sesiones ya registradas no se modifican."
        />
        {(editing || programs.length === 0) && (
          <Button fullWidth onClick={onCreate}>
            Nuevo programa
          </Button>
        )}
      </Section>
    </Screen>
  )
}
