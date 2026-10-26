import { useLayoutEffect, useRef, useState } from 'react'
import { db } from '../../db/appDb.ts'
import { createExercise, listExercises } from '../../db/exercises.ts'
import { listCurrentMaxes } from '../../db/maxes.ts'
import { addProgram, changeProgram, listPrograms, setActiveProgram } from '../../db/programs.ts'
import { getSettings } from '../../db/settings.ts'
import { resolveIncrement } from '../../domain/load.ts'
import { addBlock, addExercise, createProgram } from '../../domain/plan.ts'
import type { Id, Program } from '../../domain/types.ts'
import { useLiveQuery } from '../useLiveQuery.ts'
import { BlockView } from './program/BlockView.tsx'
import { DayView } from './program/DayView.tsx'
import { ExercisePickerView } from './program/ExercisePickerView.tsx'
import { ExerciseView } from './program/ExerciseView.tsx'
import { ProgramListView } from './program/ProgramListView.tsx'
import { ProgramView } from './program/ProgramView.tsx'
import { SetView } from './program/SetView.tsx'
import { EditToggle } from './program/shared.tsx'
import { WeekView } from './program/WeekView.tsx'

/**
 * Dónde está parado el usuario dentro del plan:
 * programa > semana > día > bloque > ejercicio > serie. `picking` es el buscador
 * para agregar un ejercicio al bloque.
 */
interface PlanLocation {
  programId?: Id
  weekId?: Id
  dayId?: Id
  blockId?: Id
  picking?: boolean
  blockExerciseId?: Id
  setId?: Id
}

/** El nivel de arriba: el que muestra "←". */
function parentOf({ picking, ...location }: PlanLocation): PlanLocation {
  if (location.setId) return { ...location, setId: undefined }
  if (picking) return location
  if (location.blockExerciseId) return { ...location, blockExerciseId: undefined }
  if (location.blockId) return { ...location, blockId: undefined }
  if (location.dayId) return { ...location, dayId: undefined }
  if (location.weekId) return { ...location, weekId: undefined }
  return {}
}

/**
 * Pestaña Programa (CLAUDE.md §6.2): de la lista de programas hasta cada serie.
 * Los datos se leen en vivo de la base y cada cambio se guarda solo. Si lo que se
 * estaba mirando deja de existir (por ejemplo, se eliminó), se muestra el nivel de arriba.
 */
export function ProgramScreen() {
  const programs = useLiveQuery(() => listPrograms(db))
  const settings = useLiveQuery(() => getSettings(db))
  const exercises = useLiveQuery(() => listExercises(db))
  const maxes = useLiveQuery(() => listCurrentMaxes(db))
  const [location, setLocation] = useState<PlanLocation>({})
  const [editing, setEditing] = useState(false)

  // Al volver, cada nivel aparece en la misma posición en que se lo dejó.
  const scrollStack = useRef<number[]>([])
  const pendingScroll = useRef<number | undefined>(undefined)

  /** Abre un nivel más abajo. `replace` lo cambia por el actual (por ejemplo, del buscador al ejercicio elegido). */
  function open(next: PlanLocation, { edit = false, replace = false } = {}) {
    if (!replace) scrollStack.current.push(window.scrollY)
    pendingScroll.current = 0
    setLocation(next)
    setEditing(edit)
  }

  function back() {
    pendingScroll.current = scrollStack.current.pop() ?? 0
    setLocation(parentOf(location))
    setEditing(false)
  }

  useLayoutEffect(() => {
    if (pendingScroll.current === undefined) return
    window.scrollTo(0, pendingScroll.current)
    pendingScroll.current = undefined
  }, [location])

  if (!programs || !settings || !exercises || !maxes) return null

  const catalog = new Map(exercises.map((exercise) => [exercise.id, exercise]))
  const program = programs.find((p) => p.id === location.programId)
  const week = program?.weeks.find((w) => w.id === location.weekId)
  const day = week?.days.find((d) => d.id === location.dayId)
  const block = day?.blocks.find((b) => b.id === location.blockId)
  const entry = block?.exercises.find((e) => e.id === location.blockExerciseId)
  const setIndex = entry ? entry.sets.findIndex((s) => s.id === location.setId) : -1
  const editToggle = <EditToggle editing={editing} onToggle={() => setEditing(!editing)} />

  /** Guarda un cambio del editor; devuelve el programa ya guardado. */
  const apply = (target: Program, change: (p: Program) => Program) =>
    changeProgram(db, target.id, change).catch((error: unknown) => {
      console.error(error)
      return undefined
    })
  const changeOf = (target: Program) => (change: (p: Program) => Program) => void apply(target, change)

  if (program && week && day && block && entry) {
    const exercise = catalog.get(entry.exerciseId)
    if (exercise) {
      const maxKg = maxes.get(exercise.id)
      const increment = resolveIncrement(exercise, settings.globalRounding)
      const set = entry.sets[setIndex]
      if (set) {
        return (
          <SetView
            key={set.id}
            path={{ weekId: week.id, dayId: day.id, blockId: block.id, blockExerciseId: entry.id, setId: set.id }}
            index={setIndex}
            set={set}
            block={block}
            exercise={exercise}
            maxKg={maxKg}
            increment={increment}
            editing={editing}
            editToggle={editToggle}
            onChange={changeOf(program)}
            onBack={back}
          />
        )
      }
      return (
        <ExerciseView
          key={entry.id}
          week={week}
          day={day}
          block={block}
          entry={entry}
          exercise={exercise}
          maxKg={maxKg}
          increment={increment}
          editing={editing}
          editToggle={editToggle}
          onChange={changeOf(program)}
          onOpenSet={(setId) => open({ ...location, setId })}
          onBack={back}
        />
      )
    }
  }

  if (program && week && day && block) {
    const blockPath = { weekId: week.id, dayId: day.id, blockId: block.id }
    /** Agrega el ejercicio al final del bloque y lo abre en modo "Editar", para cargarle las series. */
    const addAndOpen = async (exerciseId: Id) => {
      const saved = await apply(program, (p) => addExercise(p, blockPath, exerciseId))
      const added = saved?.weeks
        .find((w) => w.id === week.id)
        ?.days.find((d) => d.id === day.id)
        ?.blocks.find((b) => b.id === block.id)
        ?.exercises.at(-1)
      if (added) open({ ...location, picking: undefined, blockExerciseId: added.id }, { edit: true, replace: true })
    }

    if (location.picking) {
      return (
        <ExercisePickerView
          block={block}
          catalog={exercises}
          onPick={(exerciseId) => void addAndOpen(exerciseId)}
          onCreate={(name) =>
            void createExercise(db, { name })
              .then((created) => addAndOpen(created.id))
              .catch((error: unknown) => console.error(error))
          }
          onBack={back}
        />
      )
    }
    return (
      <BlockView
        key={block.id}
        week={week}
        day={day}
        block={block}
        catalog={catalog}
        editing={editing}
        editToggle={editToggle}
        onChange={changeOf(program)}
        onOpenExercise={(blockExerciseId) => open({ ...location, blockExerciseId })}
        onAddExercise={() => open({ ...location, picking: true })}
        onBack={back}
      />
    )
  }

  if (program && week && day) {
    return (
      <DayView
        key={day.id}
        week={week}
        day={day}
        catalog={catalog}
        editing={editing}
        editToggle={editToggle}
        onChange={changeOf(program)}
        onOpenBlock={(blockId) => open({ ...location, blockId })}
        onAddBlock={() => {
          // Un bloque nuevo se abre en modo "Editar", para ponerle nombre, tipo y descanso.
          const path = { weekId: week.id, dayId: day.id }
          const fields = { name: `Bloque ${day.blocks.length + 1}`, type: 'other', restSec: 90 } as const
          void apply(program, (p) => addBlock(p, path, fields)).then((saved) => {
            const added = saved?.weeks
              .find((w) => w.id === week.id)
              ?.days.find((d) => d.id === day.id)
              ?.blocks.at(-1)
            if (added) open({ ...location, blockId: added.id }, { edit: true })
          })
        }}
        onBack={back}
      />
    )
  }

  if (program && week) {
    return (
      <WeekView
        key={week.id}
        program={program}
        week={week}
        editing={editing}
        editToggle={editToggle}
        onChange={changeOf(program)}
        onOpenDay={(dayId) => open({ ...location, dayId })}
        onBack={back}
      />
    )
  }

  if (program) {
    return (
      <ProgramView
        key={program.id}
        program={program}
        active={settings.activeProgramId === program.id}
        editing={editing}
        editToggle={editToggle}
        onChange={changeOf(program)}
        onActivate={() => void setActiveProgram(db, program.id)}
        onOpenWeek={(weekId) => open({ ...location, weekId })}
        onBack={back}
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
