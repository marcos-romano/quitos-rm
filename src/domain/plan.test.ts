import { describe, expect, test } from 'vitest'
import { coachDay1Week1 } from './coachDay1Week1.fixture.ts'
import {
  addBlock,
  addDay,
  addExercise,
  addSet,
  addWeek,
  createProgram,
  duplicateItem,
  duplicateProgram,
  moveItem,
  nextWeekNumber,
  removeItem,
  updateBlock,
  updateDay,
  updateExercise,
  updateProgram,
  updateSet,
  updateWeek,
  type ExercisePath,
} from './plan.ts'
import type { Program } from './types.ts'

const NOW = new Date('2026-10-25T15:00:00.000Z')

/** Programa de 3 semanas (1, 2 y 3); la primera tiene el Día 1 del entrenador. */
function sampleProgram(): Program {
  return deepFreeze({
    id: 'programa',
    name: 'Plan de fuerza',
    weeks: [
      { id: 'w1', number: 1, days: [coachDay1Week1] },
      { id: 'w2', number: 2, days: [] },
      { id: 'w3', number: 3, days: [] },
    ],
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
  })
}

/**
 * Congela el programa de prueba: si alguna función intentara modificar el
 * original en lugar de devolver uno nuevo, la prueba fallaría.
 */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

/** Todos los ids del programa, de todos los niveles. */
function allIds(program: Program): string[] {
  return program.weeks.flatMap((week) => [
    week.id,
    ...week.days.flatMap((day) => [
      day.id,
      ...day.blocks.flatMap((block) => [
        block.id,
        ...block.exercises.flatMap((exercise) => [exercise.id, ...exercise.sets.map((set) => set.id)]),
      ]),
    ]),
  ])
}

/** El mismo contenido, sin mirar los ids. */
function withoutIds(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value), (key, inner: unknown) => (key === 'id' ? undefined : inner))
}

const day1 = { weekId: 'w1', dayId: 'w1-d1' }
const fuerza1 = { ...day1, blockId: 'fuerza-1' }
const dominadas: ExercisePath = { ...fuerza1, blockExerciseId: 'fuerza-1-dominadas' }

const weekNumbers = (program: Program) => program.weeks.map((week) => week.number)
const blockNames = (program: Program) => program.weeks[0].days[0].blocks.map((block) => block.name)
const fuerza1Exercises = (program: Program) => program.weeks[0].days[0].blocks[1].exercises
const dominadasSets = (program: Program) => fuerza1Exercises(program)[0].sets

describe('programas', () => {
  test('uno nuevo arranca vacío, con su fecha de creación', () => {
    const program = createProgram('  Plan   de octubre ', NOW)
    expect(program).toMatchObject({
      name: 'Plan de octubre',
      weeks: [],
      createdAt: '2026-10-25T15:00:00.000Z',
      updatedAt: '2026-10-25T15:00:00.000Z',
    })
  })

  test('se edita el nombre y la descripción', () => {
    const program = updateProgram(sampleProgram(), { name: 'Fuerza', description: '4 semanas' })
    expect(program).toMatchObject({ name: 'Fuerza', description: '4 semanas' })
  })

  test('la copia tiene todo igual, con ids nuevos y "(copia)" en el nombre', () => {
    const original = sampleProgram()
    const copy = duplicateProgram(original, NOW)
    expect(copy.name).toBe('Plan de fuerza (copia)')
    expect(copy.createdAt).toBe('2026-10-25T15:00:00.000Z')
    expect(withoutIds(copy.weeks)).toEqual(withoutIds(original.weeks))
    expect(copy.id).not.toBe(original.id)
    const originalIds = new Set(allIds(original))
    expect(allIds(copy).filter((id) => originalIds.has(id))).toEqual([])
  })
})

describe('semanas', () => {
  test('una semana nueva propone el número siguiente al mayor', () => {
    expect(nextWeekNumber(createProgram('Vacío'))).toBe(1)
    expect(weekNumbers(addWeek(sampleProgram()))).toEqual([1, 2, 3, 4])
  })

  test('el número propuesto sigue al mayor aunque haya saltos', () => {
    const program = updateWeek(sampleProgram(), { weekId: 'w3' }, { number: 7 })
    expect(nextWeekNumber(program)).toBe(8)
  })

  test('se puede crear con el número y la etiqueta que elija el usuario', () => {
    const program = addWeek(sampleProgram(), { number: 10, label: 'Descarga' })
    expect(program.weeks.at(-1)).toMatchObject({ number: 10, label: 'Descarga', days: [] })
  })

  test('el número se edita a mano y se aceptan repetidos', () => {
    const program = updateWeek(sampleProgram(), { weekId: 'w3' }, { number: 2 })
    expect(weekNumbers(program)).toEqual([1, 2, 2])
  })

  test('mover una semana no cambia ningún número', () => {
    const program = moveItem(sampleProgram(), { weekId: 'w3' }, -1)
    expect(program.weeks.map((week) => week.id)).toEqual(['w1', 'w3', 'w2'])
    expect(weekNumbers(program)).toEqual([1, 3, 2])
  })

  test('eliminar una semana no renumera las demás', () => {
    const program = removeItem(sampleProgram(), { weekId: 'w2' })
    expect(weekNumbers(program)).toEqual([1, 3])
  })

  test('la copia va al final, con el número siguiente y todo su contenido', () => {
    const original = sampleProgram()
    const program = duplicateItem(original, { weekId: 'w1' })
    expect(weekNumbers(program)).toEqual([1, 2, 3, 4])
    const copy = program.weeks[3]
    expect(withoutIds(copy.days)).toEqual(withoutIds(original.weeks[0].days))
  })
})

describe('días', () => {
  test('un día nuevo se llama "Día N" según su posición', () => {
    let program = addDay(sampleProgram(), { weekId: 'w2' })
    program = addDay(program, { weekId: 'w2' }, { prep: "5' foam roll" })
    expect(program.weeks[1].days).toMatchObject([
      { name: 'Día 1', blocks: [] },
      { name: 'Día 2', prep: "5' foam roll", blocks: [] },
    ])
  })

  test('se le puede dar otro nombre', () => {
    const program = addDay(sampleProgram(), { weekId: 'w2' }, { name: ' Pierna ' })
    expect(program.weeks[1].days[0].name).toBe('Pierna')
  })

  test('se editan el nombre y la preparación', () => {
    const program = updateDay(sampleProgram(), day1, { name: 'Día A', prep: 'Movilidad' })
    expect(program.weeks[0].days[0]).toMatchObject({ name: 'Día A', prep: 'Movilidad' })
  })

  test('la copia va justo después, con "(copia)" en el nombre', () => {
    let program = addDay(sampleProgram(), { weekId: 'w1' })
    program = duplicateItem(program, day1)
    expect(program.weeks[0].days.map((day) => day.name)).toEqual(['Día 1', 'Día 1 (copia)', 'Día 2'])
  })

  test('se mueven y se eliminan', () => {
    let program = addDay(sampleProgram(), { weekId: 'w1' })
    program = moveItem(program, day1, 1)
    expect(program.weeks[0].days.map((day) => day.name)).toEqual(['Día 2', 'Día 1'])
    program = removeItem(program, day1)
    expect(program.weeks[0].days.map((day) => day.name)).toEqual(['Día 2'])
  })
})

describe('bloques', () => {
  test('uno nuevo va al final del día, sin ejercicios', () => {
    const program = addBlock(sampleProgram(), day1, { name: 'Extras', type: 'extra', restSec: 90 })
    expect(program.weeks[0].days[0].blocks.at(-1)).toMatchObject({
      name: 'Extras',
      type: 'extra',
      restSec: 90,
      exercises: [],
    })
  })

  test('se editan el nombre, el tipo y el descanso', () => {
    const program = updateBlock(sampleProgram(), fuerza1, { type: 'hypertrophy', restSec: 150 })
    expect(program.weeks[0].days[0].blocks[1]).toMatchObject({ name: 'Fuerza 1', type: 'hypertrophy', restSec: 150 })
  })

  test('la copia va justo después, con "(copia)" en el nombre', () => {
    const program = duplicateItem(sampleProgram(), fuerza1)
    expect(blockNames(program)).toEqual(['Potencia', 'Fuerza 1', 'Fuerza 1 (copia)', 'Fuerza 2', 'Estructura'])
  })

  test('se mueven: en los extremos no pasa nada', () => {
    const original = sampleProgram()
    expect(blockNames(moveItem(original, fuerza1, -1))).toEqual(['Fuerza 1', 'Potencia', 'Fuerza 2', 'Estructura'])
    const potencia = { ...day1, blockId: 'potencia' }
    expect(blockNames(moveItem(original, potencia, -1))).toEqual(blockNames(original))
  })
})

describe('ejercicios del bloque', () => {
  test('uno nuevo referencia al catálogo y arranca sin series', () => {
    const program = addExercise(sampleProgram(), fuerza1, 'sentadilla')
    expect(fuerza1Exercises(program).at(-1)).toMatchObject({ exerciseId: 'sentadilla', sets: [] })
  })

  test('tiene una sola nota, opcional', () => {
    const program = updateExercise(sampleProgram(), dominadas, { note: 'Agarre prono' })
    expect(fuerza1Exercises(program)[0].note).toBe('Agarre prono')
  })

  test('se duplican, se mueven y se eliminan', () => {
    let program = duplicateItem(sampleProgram(), dominadas)
    expect(fuerza1Exercises(program).map((e) => e.exerciseId)).toEqual([
      'dominadas',
      'dominadas',
      'press-landmine',
      'buda-cobra',
    ])
    program = moveItem(program, dominadas, 1)
    program = removeItem(program, { ...fuerza1, blockExerciseId: 'fuerza-1-buda-cobra' })
    expect(fuerza1Exercises(program).map((e) => e.exerciseId)).toEqual(['dominadas', 'dominadas', 'press-landmine'])
    expect(fuerza1Exercises(program)[1].id).toBe('fuerza-1-dominadas')
  })
})

describe('series', () => {
  test('una serie nueva es copia de la anterior, con id propio', () => {
    const program = addSet(sampleProgram(), dominadas, 'reps')
    const sets = dominadasSets(program)
    expect(sets).toHaveLength(5)
    expect(sets[4].id).not.toBe(sets[3].id)
    expect(withoutIds(sets[4])).toEqual(withoutIds(sets[3]))
  })

  test('editar la copia no cambia la anterior', () => {
    let program = addSet(sampleProgram(), dominadas, 'reps')
    const copyId = dominadasSets(program)[4].id
    program = updateSet(program, { ...dominadas, setId: copyId }, { load: { kind: 'percent', percent: 75 } })
    expect(dominadasSets(program).map((set) => set.load)).toEqual([
      { kind: 'percent', percent: 65 },
      { kind: 'percent', percent: 65 },
      { kind: 'percent', percent: 70 },
      { kind: 'percent', percent: 70 },
      { kind: 'percent', percent: 75 },
    ])
  })

  test('la primera serie arranca con la medida del ejercicio y carga libre', () => {
    let program = addExercise(sampleProgram(), fuerza1, 'plancha')
    const plancha = { ...fuerza1, blockExerciseId: fuerza1Exercises(program).at(-1)!.id }
    program = addSet(program, plancha, 'time')
    expect(fuerza1Exercises(program).at(-1)!.sets).toMatchObject([
      { measure: { kind: 'time', value: 30 }, load: { kind: 'free' } },
    ])
  })

  test('se edita cada una por separado: medida, carga y descanso', () => {
    const second = { ...dominadas, setId: 'dominadas-2' }
    const program = updateSet(sampleProgram(), second, {
      measure: { kind: 'reps', value: 6 },
      load: { kind: 'kg', kg: 20 },
      restSec: 240,
    })
    expect(dominadasSets(program)[1]).toEqual({
      id: 'dominadas-2',
      measure: { kind: 'reps', value: 6 },
      load: { kind: 'kg', kg: 20 },
      restSec: 240,
    })
    expect(dominadasSets(program)[0]).toEqual(dominadasSets(sampleProgram())[0])
  })

  test('se duplican justo después, se mueven y se eliminan', () => {
    const first = { ...dominadas, setId: 'dominadas-1' }
    let program = updateSet(sampleProgram(), first, { measure: { kind: 'reps', value: 10 } })
    program = duplicateItem(program, first)
    expect(dominadasSets(program).map((set) => set.measure.value)).toEqual([10, 10, 8, 8, 8])
    program = moveItem(program, first, 1)
    expect(dominadasSets(program)[1].id).toBe('dominadas-1')
    program = removeItem(program, { ...dominadas, setId: 'dominadas-4' })
    expect(dominadasSets(program)).toHaveLength(4)
  })
})

describe('en todos los niveles', () => {
  test('el programa original nunca se modifica', () => {
    const original = sampleProgram()
    const before = JSON.stringify(original)
    let program = addWeek(original)
    program = duplicateItem(program, { weekId: 'w1' })
    program = addSet(program, dominadas, 'reps')
    program = removeItem(program, fuerza1)
    program = moveItem(program, { weekId: 'w2' }, -1)
    expect(JSON.stringify(original)).toBe(before)
    expect(program).not.toBe(original)
  })

  test('después de varias copias no hay ids repetidos', () => {
    let program = duplicateItem(sampleProgram(), { weekId: 'w1' })
    program = duplicateItem(program, day1)
    program = duplicateItem(program, fuerza1)
    program = duplicateItem(program, dominadas)
    program = duplicateItem(program, { ...dominadas, setId: 'dominadas-1' })
    const ids = allIds(program)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('una ruta que no existe da error en lugar de cambiar otra cosa', () => {
    expect(() => removeItem(sampleProgram(), { weekId: 'w9' })).toThrow('No se encontró')
    expect(() => updateDay(sampleProgram(), { weekId: 'w1', dayId: 'otro' }, { name: 'X' })).toThrow(
      'No se encontró',
    )
    expect(() => moveItem(sampleProgram(), { ...dominadas, setId: 'nada' }, 1)).toThrow('No se encontró')
  })
})
