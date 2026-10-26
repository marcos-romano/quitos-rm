// IndexedDB no existe fuera del navegador: fake-indexeddb la imita en memoria.
import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { coachDay1Week1 } from '../domain/coachDay1Week1.fixture.ts'
import { prescribedLoad, resolveIncrement } from '../domain/load.ts'
import { addWeek, createProgram, updateProgram } from '../domain/plan.ts'
import type { FileProgram } from '../domain/programFile.ts'
import type { Program, Session } from '../domain/types.ts'
import { createDatabase, type QuitosDb } from './db.ts'
import { createExercise, findExerciseByName, listExercises } from './exercises.ts'
import { addMax, getCurrentMax, getMaxHistory, listCurrentMaxes } from './maxes.ts'
import {
  addProgram,
  changeProgram,
  deleteProgram,
  getProgram,
  importProgram,
  listPrograms,
  saveProgram,
  setActiveProgram,
} from './programs.ts'
import { getSettings, updateSettings } from './settings.ts'

// Cada prueba usa una base nueva y la borra al terminar.
let dbName: string
let db: QuitosDb

beforeEach(() => {
  dbName = `test-${crypto.randomUUID()}`
  db = createDatabase(dbName)
})

afterEach(async () => {
  await db.delete()
})

/** Simula cerrar la app del todo y volver a abrirla. */
async function closeAndReopen(): Promise<QuitosDb> {
  db.close()
  db = createDatabase(dbName)
  await db.open()
  return db
}

function sampleProgram(): Program {
  return {
    id: 'programa-fuerza',
    name: 'Plan de fuerza',
    description: '4 semanas, 4 días',
    weeks: [{ id: 'w1', number: 1, days: [coachDay1Week1] }],
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
  }
}

describe('catálogo de ejercicios', () => {
  test('al crear la base se carga Dominadas con incremento propio de 1,25 kg', async () => {
    const exercises = await listExercises(db)
    expect(exercises).toHaveLength(1)
    expect(exercises[0]).toMatchObject({ name: 'Dominadas', measure: 'reps', roundingIncrement: 1.25 })
  })

  test('crea un ejercicio con medida por repeticiones si no se indica otra', async () => {
    const created = await createExercise(db, { name: '  Sentadilla  ' })
    expect(created).toMatchObject({ name: 'Sentadilla', nameKey: 'sentadilla', measure: 'reps' })
    expect(created.roundingIncrement).toBeUndefined()
  })

  test('no se duplican ejercicios aunque cambien mayúsculas, tildes o espacios', async () => {
    await createExercise(db, { name: 'Sentadilla' })
    await expect(createExercise(db, { name: ' SENTADÍLLA ' })).rejects.toThrow(
      'Ya existe un ejercicio llamado "Sentadilla".',
    )
    await expect(createExercise(db, { name: 'dominadas' })).rejects.toThrow('Ya existe')
    expect(await listExercises(db)).toHaveLength(2)
  })

  test('un nombre vacío no se acepta', async () => {
    await expect(createExercise(db, { name: '   ' })).rejects.toThrow('necesita un nombre')
  })

  test('busca por nombre sin importar mayúsculas ni tildes', async () => {
    await createExercise(db, { name: 'Peso muerto rumano', measure: 'reps' })
    expect((await findExerciseByName(db, 'PESO MUERTO RUMANO'))?.name).toBe('Peso muerto rumano')
    expect(await findExerciseByName(db, 'Peso muerto')).toBeUndefined()
  })

  test('la lista sale en orden alfabético', async () => {
    await createExercise(db, { name: 'Sentadilla' })
    await createExercise(db, { name: 'Arranque' })
    expect((await listExercises(db)).map((e) => e.name)).toEqual(['Arranque', 'Dominadas', 'Sentadilla'])
  })
})

describe('máximos', () => {
  test('el vigente de cada ejercicio, todos juntos', async () => {
    const squat = await createExercise(db, { name: 'Sentadilla' })
    const bench = await createExercise(db, { name: 'Press plano' })
    await addMax(db, { exerciseId: squat.id, kg: 110, date: '2026-09-01' })
    await addMax(db, { exerciseId: squat.id, kg: 120, date: '2026-10-01' })
    await addMax(db, { exerciseId: bench.id, kg: 80, date: '2026-10-05' })

    expect(await listCurrentMaxes(db)).toEqual(
      new Map([
        [squat.id, 120],
        [bench.id, 80],
      ]),
    )
  })

  test('un ejercicio sin máximos no tiene máximo actual', async () => {
    const squat = await createExercise(db, { name: 'Sentadilla' })
    expect(await getCurrentMax(db, squat.id)).toBeUndefined()
  })

  test('el actual es el de fecha más reciente y el historial conserva todos', async () => {
    const squat = await createExercise(db, { name: 'Sentadilla' })
    await addMax(db, { exerciseId: squat.id, kg: 100, date: '2026-09-01' })
    await addMax(db, { exerciseId: squat.id, kg: 105, date: '2026-10-01' })
    // Un máximo viejo cargado tarde no reemplaza al vigente.
    await addMax(db, { exerciseId: squat.id, kg: 97.5, date: '2026-08-15' })

    expect((await getCurrentMax(db, squat.id))?.kg).toBe(105)
    expect((await getMaxHistory(db, squat.id)).map((m) => m.kg)).toEqual([105, 100, 97.5])
  })

  test('dos máximos el mismo día: vale el último cargado', async () => {
    const squat = await createExercise(db, { name: 'Sentadilla' })
    await addMax(db, { exerciseId: squat.id, kg: 110, date: '2026-10-23' }, new Date('2026-10-23T10:00:00Z'))
    await addMax(db, { exerciseId: squat.id, kg: 112.5, date: '2026-10-23' }, new Date('2026-10-23T10:05:00Z'))
    expect((await getCurrentMax(db, squat.id))?.kg).toBe(112.5)
  })

  test('los máximos de un ejercicio no se mezclan con los de otro', async () => {
    const squat = await createExercise(db, { name: 'Sentadilla' })
    const bench = await createExercise(db, { name: 'Press plano' })
    await addMax(db, { exerciseId: squat.id, kg: 120, date: '2026-10-01' })
    await addMax(db, { exerciseId: bench.id, kg: 80, date: '2026-10-02' })
    expect((await getCurrentMax(db, squat.id))?.kg).toBe(120)
    expect(await getMaxHistory(db, bench.id)).toHaveLength(1)
  })

  test.each([0, -5, Number.NaN])('un máximo de %s kg no se acepta', async (kg) => {
    const squat = await createExercise(db, { name: 'Sentadilla' })
    await expect(addMax(db, { exerciseId: squat.id, kg, date: '2026-10-23' })).rejects.toThrow(
      'mayor que cero',
    )
  })

  test('una fecha con otro formato no se acepta', async () => {
    const squat = await createExercise(db, { name: 'Sentadilla' })
    await expect(addMax(db, { exerciseId: squat.id, kg: 100, date: '23/10/2026' })).rejects.toThrow(
      'Fecha inválida',
    )
  })

  test('con el máximo cargado, Dominadas calcula su carga con 1,25 kg', async () => {
    const pullUps = (await findExerciseByName(db, 'Dominadas'))!
    await addMax(db, { exerciseId: pullUps.id, kg: 35, date: '2026-10-23' })

    const settings = await getSettings(db)
    const max = await getCurrentMax(db, pullUps.id)
    const increment = resolveIncrement(pullUps, settings.globalRounding)
    expect(prescribedLoad({ kind: 'percent', percent: 75 }, max?.kg, increment)).toEqual({
      status: 'calculated',
      kg: 26.25,
      exactKg: 26.25,
    })
  })
})

describe('ajustes', () => {
  test('por defecto: redondeo de 2,5 kg, kg y recordatorio a los 14 días', async () => {
    expect(await getSettings(db)).toEqual({ globalRounding: 2.5, unit: 'kg', backupReminderDays: 14 })
  })

  test('cambiar un ajuste deja los demás como estaban', async () => {
    await updateSettings(db, { globalRounding: 1.25 })
    expect(await getSettings(db)).toEqual({ globalRounding: 1.25, unit: 'kg', backupReminderDays: 14 })
  })
})

describe('programas', () => {
  test('un programa guardado se relee idéntico, con todos sus bloques y series', async () => {
    const program = sampleProgram()
    await saveProgram(db, program, new Date('2026-10-23T15:00:00.000Z'))

    expect(await getProgram(db, program.id)).toEqual({
      ...program,
      updatedAt: '2026-10-23T15:00:00.000Z',
    })
  })

  test('volver a guardar un programa lo actualiza en lugar de duplicarlo', async () => {
    const program = sampleProgram()
    await saveProgram(db, program)
    await saveProgram(db, { ...program, name: 'Plan de fuerza (ajustado)' })

    const programs = await listPrograms(db)
    expect(programs).toHaveLength(1)
    expect(programs[0].name).toBe('Plan de fuerza (ajustado)')
  })

  test('eliminar un programa no toca sus sesiones y deja de estar activo', async () => {
    const program = sampleProgram()
    await saveProgram(db, program)
    await updateSettings(db, { activeProgramId: program.id })
    const session: Session = {
      id: 'sesion-1',
      programId: program.id,
      weekId: 'w1',
      dayId: coachDay1Week1.id,
      status: 'completed',
      date: '2026-10-24',
      day: coachDay1Week1,
      sets: {},
      efforts: {},
      startedAt: '2026-10-24T10:00:00.000Z',
    }
    await db.sessions.put(session)

    await deleteProgram(db, program.id)

    expect(await listPrograms(db)).toEqual([])
    expect((await getSettings(db)).activeProgramId).toBeUndefined()
    expect(await db.sessions.get('sesion-1')).toEqual(session)
  })

  test('el primer programa creado queda activo; los siguientes, no', async () => {
    const first = createProgram('Octubre')
    const second = createProgram('Noviembre')
    await addProgram(db, first)
    await addProgram(db, second)

    expect((await getSettings(db)).activeProgramId).toBe(first.id)
    await setActiveProgram(db, second.id)
    expect((await getSettings(db)).activeProgramId).toBe(second.id)
  })

  test('cada cambio se aplica sobre la última versión guardada', async () => {
    const program = createProgram('Octubre')
    await addProgram(db, program)

    // Dos cambios lanzados a la vez, como dos toques seguidos en la pantalla.
    await Promise.all([
      changeProgram(db, program.id, (p) => updateProgram(p, { description: '4 semanas' })),
      changeProgram(db, program.id, (p) => addWeek(p)),
    ])

    const saved = await getProgram(db, program.id)
    expect(saved?.description).toBe('4 semanas')
    expect(saved?.weeks).toHaveLength(1)
  })

  test('cambiar un programa que ya no existe da error', async () => {
    await expect(changeProgram(db, 'no-existe', (p) => p)).rejects.toThrow('El programa ya no existe.')
  })

  test('eliminar otro programa deja el activo como estaba', async () => {
    await saveProgram(db, sampleProgram())
    await saveProgram(db, { ...sampleProgram(), id: 'otro' })
    await updateSettings(db, { activeProgramId: 'programa-fuerza' })

    await deleteProgram(db, 'otro')

    expect((await getSettings(db)).activeProgramId).toBe('programa-fuerza')
    expect((await listPrograms(db)).map((p) => p.id)).toEqual(['programa-fuerza'])
  })
})

describe('importar un programa', () => {
  /** Un día con Dominadas (que ya está en el catálogo) y un ejercicio nuevo. */
  function sampleFile(name = 'Plan de fuerza'): FileProgram {
    const sets = [{ measure: { kind: 'reps', value: 8 }, load: { kind: 'percent', percent: 65 } }] as const
    return {
      name,
      weeks: [
        {
          number: 1,
          days: [
            {
              name: 'Día 1',
              blocks: [
                {
                  name: 'Fuerza 1',
                  type: 'strength',
                  restSec: 180,
                  exercises: [
                    { exercise: 'DOMINADAS', sets: [...sets] },
                    { exercise: 'Press landmine', sets: [...sets] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
  }

  test('se guarda como programa nuevo, activo si no había otro', async () => {
    const { program, newExercises } = await importProgram(db, sampleFile())

    expect(await getProgram(db, program.id)).toEqual(program)
    expect((await getSettings(db)).activeProgramId).toBe(program.id)
    expect(newExercises.map((e) => e.name)).toEqual(['Press landmine'])
    expect((await listExercises(db)).map((e) => e.name)).toEqual(['Dominadas', 'Press landmine'])
  })

  test('usa los ejercicios del catálogo, con su redondeo propio', async () => {
    const { program } = await importProgram(db, sampleFile())

    const dominadas = await findExerciseByName(db, 'Dominadas')
    expect(program.weeks[0].days[0].blocks[0].exercises[0].exerciseId).toBe(dominadas!.id)
    expect(dominadas!.roundingIncrement).toBe(1.25)
  })

  test('importar otro no reemplaza el primero ni cambia el activo', async () => {
    const first = await importProgram(db, sampleFile())
    const second = await importProgram(db, sampleFile('Plan de noviembre'))

    expect((await listPrograms(db)).map((p) => p.id).sort()).toEqual([first.program.id, second.program.id].sort())
    expect((await getSettings(db)).activeProgramId).toBe(first.program.id)
    expect(second.newExercises).toEqual([])
    expect(await listExercises(db)).toHaveLength(2)
  })
})

describe('cerrar y reabrir la app', () => {
  test('no se pierde nada y Dominadas no se vuelve a cargar', async () => {
    const squat = await createExercise(db, { name: 'Sentadilla' })
    await addMax(db, { exerciseId: squat.id, kg: 120, date: '2026-10-23' })
    await updateSettings(db, { globalRounding: 1 })
    await saveProgram(db, sampleProgram())
    const before = {
      exercises: await listExercises(db),
      maxes: await getMaxHistory(db, squat.id),
      settings: await getSettings(db),
      program: await getProgram(db, 'programa-fuerza'),
    }

    const reopened = await closeAndReopen()

    expect({
      exercises: await listExercises(reopened),
      maxes: await getMaxHistory(reopened, squat.id),
      settings: await getSettings(reopened),
      program: await getProgram(reopened, 'programa-fuerza'),
    }).toEqual(before)
    expect(before.exercises.map((e) => e.name)).toEqual(['Dominadas', 'Sentadilla'])
  })
})
