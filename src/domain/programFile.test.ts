// Esta prueba lee un archivo de la Mac: necesita los tipos de Node.
/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { normalizeName } from './names.ts'
import { buildProgram, parseProgramFile, summarizeProgram, type FileProgram } from './programFile.ts'
import type { Exercise } from './types.ts'

const NOW = new Date('2026-10-25T15:00:00.000Z')

/** Un archivo chico pero completo: una semana, un día y un bloque con dos ejercicios. */
function sampleFile(program: Record<string, unknown> = {}) {
  return {
    format: 'quitos-rm-program',
    version: 1,
    program: {
      name: 'Plan de fuerza',
      weeks: [
        {
          number: 1,
          days: [
            {
              name: 'Día 1',
              prep: "5' foam roll",
              blocks: [
                {
                  name: 'Fuerza 1',
                  type: 'strength',
                  restSec: 180,
                  exercises: [
                    {
                      exercise: 'dominadas',
                      note: 'Agarre prono',
                      sets: [{ reps: 8, percent: 65 }, { reps: 8, percent: 70, restSec: 240 }],
                    },
                    { exercise: 'Isquio isométrico', sets: [{ seconds: 30 }, { seconds: 30 }] },
                    { exercise: 'Caminata de granjero', sets: [{ meters: 15, kg: 24 }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
      ...program,
    },
  }
}

const parse = (data: unknown) => parseProgramFile(JSON.stringify(data))

function parsed(data: unknown = sampleFile()): FileProgram {
  const result = parse(data)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.program
}

function errorsOf(data: unknown): string[] {
  const result = parse(data)
  return result.ok ? [] : result.errors
}

/** El catálogo de un iPhone que ya tiene Dominadas, con su redondeo propio. */
const catalog: Exercise[] = [
  { id: 'dominadas', name: 'Dominadas', nameKey: 'dominadas', measure: 'reps', roundingIncrement: 1.25 },
]

describe('leer el archivo', () => {
  test('un archivo correcto se lee con cada serie por separado', () => {
    const program = parsed()
    const exercises = program.weeks[0].days[0].blocks[0].exercises
    expect(exercises[0].sets).toEqual([
      { measure: { kind: 'reps', value: 8 }, load: { kind: 'percent', percent: 65 } },
      { measure: { kind: 'reps', value: 8 }, load: { kind: 'percent', percent: 70 }, restSec: 240 },
    ])
    expect(exercises[1].sets[0]).toEqual({ measure: { kind: 'time', value: 30 }, load: { kind: 'free' } })
    expect(exercises[2].sets[0]).toEqual({ measure: { kind: 'distance', value: 15 }, load: { kind: 'kg', kg: 24 } })
  })

  test('un archivo que no es JSON o no es de quitos_RM se rechaza', () => {
    expect(parseProgramFile('esto no es un programa')).toEqual({
      ok: false,
      errors: ['El archivo no es un programa de quitos_RM: no se pudo leer.'],
    })
    expect(errorsOf({ program: {} })).toEqual(['El archivo no es un programa de quitos_RM.'])
    expect(errorsOf({ ...sampleFile(), version: 2 })[0]).toMatch('versión')
  })

  test('un texto en lugar de un número es un error, con su ubicación', () => {
    const file = sampleFile()
    file.program.weeks[0].days[0].blocks[0].exercises[0].sets[1] = { reps: '8O' } as never
    expect(errorsOf(file)).toEqual([
      'Semana 1 · Día 1 · Fuerza 1 · dominadas · serie 2: la medida tiene que ser un número mayor que cero.',
    ])
  })

  test('cada serie tiene una sola medida y una sola carga', () => {
    const file = sampleFile()
    const sets = file.program.weeks[0].days[0].blocks[0].exercises[1].sets as Record<string, number>[]
    sets[0] = { seconds: 30, reps: 8 }
    sets[1] = { seconds: 30, percent: 70, kg: 20 }
    expect(errorsOf(file)).toEqual([
      'Semana 1 · Día 1 · Fuerza 1 · Isquio isométrico · serie 1: tiene que tener una sola medida (repeticiones, segundos o metros).',
      'Semana 1 · Día 1 · Fuerza 1 · Isquio isométrico · serie 2: la carga es un porcentaje o kg, no las dos cosas.',
    ])
  })

  test('las repeticiones son enteras; los segundos y los metros pueden tener decimales', () => {
    const file = sampleFile()
    const exercises = file.program.weeks[0].days[0].blocks[0].exercises
    ;(exercises[0].sets as Record<string, number>[])[0] = { reps: 8.5 }
    ;(exercises[2].sets as Record<string, number>[])[0] = { meters: 12.5 }
    expect(errorsOf(file)).toEqual([
      'Semana 1 · Día 1 · Fuerza 1 · dominadas · serie 1: la medida tiene que ser un número mayor que cero.',
    ])
  })

  test('se juntan todos los errores en vez de cortar en el primero', () => {
    const file = sampleFile()
    const block = file.program.weeks[0].days[0].blocks[0] as Record<string, unknown>
    block.type = 'cardio'
    block.restSec = '180'
    expect(errorsOf(file)).toEqual([
      'Semana 1 · Día 1 · Fuerza 1: el tipo "cardio" no existe.',
      'Semana 1 · Día 1 · Fuerza 1: el descanso tiene que ser un número de segundos.',
    ])
  })

  test('faltan nombres o listas vacías', () => {
    expect(errorsOf(sampleFile({ name: '  ', weeks: [] }))).toEqual([
      'Programa: falta el nombre.',
      'Programa: no tiene semanas.',
    ])
    expect(errorsOf(sampleFile({ weeks: [{ number: 0, days: [] }] }))).toEqual([
      'Semana 1: el número tiene que ser un entero mayor que cero.',
      'Semana 1: no tiene días.',
    ])
  })
})

describe('del archivo al programa', () => {
  test('los ejercicios se buscan en el catálogo sin importar mayúsculas ni tildes', () => {
    const { program, newExercises } = buildProgram(parsed(), catalog, NOW)
    const exercises = program.weeks[0].days[0].blocks[0].exercises
    expect(exercises[0].exerciseId).toBe('dominadas')
    expect(newExercises.map((e) => [e.name, e.measure])).toEqual([
      ['Isquio isométrico', 'time'],
      ['Caminata de granjero', 'distance'],
    ])
    expect(exercises[1].exerciseId).toBe(newExercises[0].id)
    expect(newExercises[0].nameKey).toBe(normalizeName('Isquio isométrico'))
  })

  test('un ejercicio nuevo que aparece varias veces se agrega una sola vez', () => {
    const file = parsed()
    const day = file.weeks[0].days[0]
    const copy: FileProgram = { ...file, weeks: [file.weeks[0], { number: 2, days: [day] }] }
    const { program, newExercises } = buildProgram(copy, catalog, NOW)
    expect(newExercises).toHaveLength(2)
    const idsOf = (week: number) => program.weeks[week].days[0].blocks[0].exercises.map((e) => e.exerciseId)
    expect(idsOf(1)).toEqual(idsOf(0))
  })

  test('el programa sale completo, con ids nuevos y sin campos vacíos', () => {
    const { program } = buildProgram(parsed(), catalog, NOW)
    expect(program).toMatchObject({ name: 'Plan de fuerza', createdAt: '2026-10-25T15:00:00.000Z' })
    expect(program).not.toHaveProperty('description')
    const day = program.weeks[0].days[0]
    expect(day).toMatchObject({ name: 'Día 1', prep: "5' foam roll" })
    expect(day.blocks[0]).toMatchObject({ name: 'Fuerza 1', type: 'strength', restSec: 180 })
    expect(day.blocks[0].exercises[0].note).toBe('Agarre prono')
    expect(day.blocks[0].exercises[1]).not.toHaveProperty('note')
    const ids = [program.id, program.weeks[0].id, day.id, ...day.blocks[0].exercises.flatMap((e) => [e.id, ...e.sets.map((s) => s.id)])]
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('el resumen cuenta semanas, días, ejercicios distintos y series', () => {
    const { program } = buildProgram(parsed(), catalog, NOW)
    expect(summarizeProgram(program)).toEqual({ weeks: 1, days: 1, exercises: 3, sets: 5 })
  })
})

// El programa del entrenador vive en referencias/, que nunca se publica: esta prueba
// solo corre en la Mac, donde está el archivo.
const COACH_FILE = 'referencias/programa-entrenador.json'

describe.skipIf(!existsSync(COACH_FILE))('programa del entrenador', () => {
  const program = () => parsed(JSON.parse(readFileSync(COACH_FILE, 'utf8')))

  test('se lee sin errores: 4 semanas de 4 días', () => {
    const coach = program()
    expect(coach.weeks.map((week) => week.number)).toEqual([1, 2, 3, 4])
    expect(coach.weeks.map((week) => week.days.map((day) => day.name))).toEqual(
      Array(4).fill(['Día 1', 'Día 2', 'Día 3', 'Día 4']),
    )
  })

  test('las dominadas del Día 1 siguen la progresión del PDF', () => {
    const dominadas = program().weeks.map(
      (week) => week.days[0].blocks[1].exercises.find((e) => e.exercise === 'Dominadas')!.sets,
    )
    const summary = (sets: (typeof dominadas)[number]) =>
      sets.map((set) => `${set.measure.value}@${set.load.kind === 'percent' ? set.load.percent : '-'}`)
    expect(dominadas.map(summary)).toEqual([
      ['8@65', '8@65', '8@70', '8@70'],
      ['6@75', '6@75', '6@80', '6@80'],
      ['6@85', '5@85', '4@85', '4@85', '4@85'],
      ['6@75', '5@80', '4@85', '2@90', '2@90'],
    ])
  })

  test('tiempo y distancia van en el mismo lugar que las repeticiones', () => {
    const exercises = program().weeks[0].days.flatMap((day) => day.blocks.flatMap((block) => block.exercises))
    const first = (name: string) => exercises.find((e) => e.exercise === name)!.sets[0].measure
    expect(first('Isquio isométrico')).toEqual({ kind: 'time', value: 30 })
    expect(first('Plancha Copenhagen')).toEqual({ kind: 'time', value: 15 })
    expect(first('Caminata de granjero')).toEqual({ kind: 'distance', value: 15 })
    expect(first('Press landmine')).toEqual({ kind: 'reps', value: 6 })
  })
})
