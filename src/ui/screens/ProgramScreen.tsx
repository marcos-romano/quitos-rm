import { useLayoutEffect, useRef, useState } from 'react'
import { db } from '../../db/appDb.ts'
import { listExercises } from '../../db/exercises.ts'
import { addProgram, changeProgram, listPrograms, setActiveProgram } from '../../db/programs.ts'
import { getSettings } from '../../db/settings.ts'
import { createProgram } from '../../domain/plan.ts'
import type { Id, Program } from '../../domain/types.ts'
import { useLiveQuery } from '../useLiveQuery.ts'
import { DayView } from './program/DayView.tsx'
import { ProgramListView } from './program/ProgramListView.tsx'
import { ProgramView } from './program/ProgramView.tsx'
import { EditToggle } from './program/shared.tsx'
import { WeekView } from './program/WeekView.tsx'

/** Dónde está parado el usuario dentro del plan: programa > semana > día. */
interface PlanLocation {
  programId?: Id
  weekId?: Id
  dayId?: Id
}

/**
 * Pestaña Programa (CLAUDE.md §6.2): de la lista de programas a sus semanas y días.
 * Los datos se leen en vivo de la base y cada cambio se guarda solo. Si lo que se
 * estaba mirando deja de existir (por ejemplo, se eliminó), se muestra el nivel de arriba.
 */
export function ProgramScreen() {
  const programs = useLiveQuery(() => listPrograms(db))
  const settings = useLiveQuery(() => getSettings(db))
  const exercises = useLiveQuery(() => listExercises(db))
  const [location, setLocation] = useState<PlanLocation>({})
  const [editing, setEditing] = useState(false)

  // Al volver, cada nivel aparece en la misma posición en que se lo dejó.
  const scrollStack = useRef<number[]>([])
  const pendingScroll = useRef<number | undefined>(undefined)

  function open(next: PlanLocation, { edit = false } = {}) {
    scrollStack.current.push(window.scrollY)
    pendingScroll.current = 0
    setLocation(next)
    setEditing(edit)
  }

  function back(parent: PlanLocation) {
    pendingScroll.current = scrollStack.current.pop() ?? 0
    setLocation(parent)
    setEditing(false)
  }

  useLayoutEffect(() => {
    if (pendingScroll.current === undefined) return
    window.scrollTo(0, pendingScroll.current)
    pendingScroll.current = undefined
  }, [location])

  if (!programs || !settings || !exercises) return null

  const program = programs.find((p) => p.id === location.programId)
  const week = program?.weeks.find((w) => w.id === location.weekId)
  const day = week?.days.find((d) => d.id === location.dayId)
  const editToggle = <EditToggle editing={editing} onToggle={() => setEditing(!editing)} />

  const changeOf = (target: Program) => (change: (p: Program) => Program) =>
    void changeProgram(db, target.id, change).catch((error: unknown) => console.error(error))

  if (program && week && day) {
    return (
      <DayView
        week={week}
        day={day}
        exerciseNames={new Map(exercises.map((e) => [e.id, e.name]))}
        editing={editing}
        editToggle={editToggle}
        onChange={changeOf(program)}
        onBack={() => back({ programId: program.id, weekId: week.id })}
      />
    )
  }

  if (program && week) {
    return (
      <WeekView
        program={program}
        week={week}
        editing={editing}
        editToggle={editToggle}
        onChange={changeOf(program)}
        onOpenDay={(dayId) => open({ programId: program.id, weekId: week.id, dayId })}
        onBack={() => back({ programId: program.id })}
      />
    )
  }

  if (program) {
    return (
      <ProgramView
        program={program}
        active={settings.activeProgramId === program.id}
        editing={editing}
        editToggle={editToggle}
        onChange={changeOf(program)}
        onActivate={() => void setActiveProgram(db, program.id)}
        onOpenWeek={(weekId) => open({ programId: program.id, weekId })}
        onBack={() => back({})}
      />
    )
  }

  return (
    <ProgramListView
      programs={programs}
      activeId={settings.activeProgramId}
      editing={editing}
      editToggle={editToggle}
      onOpen={(programId) => open({ programId })}
      onCreate={() => {
        // Se abre en modo "Editar", con el campo del nombre a mano.
        const created = createProgram('Programa nuevo')
        void addProgram(db, created).then(() => open({ programId: created.id }, { edit: true }))
      }}
    />
  )
}
