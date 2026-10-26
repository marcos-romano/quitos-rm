// Máximos por ejercicio. Cada máximo nuevo se agrega: el historial nunca se pisa.

import type { Id, LocalDate, Max } from '../domain/types.ts'
import type { QuitosDb } from './db.ts'

export async function addMax(
  db: QuitosDb,
  input: { exerciseId: Id; kg: number; date: LocalDate },
  now: Date = new Date(),
): Promise<Max> {
  if (!Number.isFinite(input.kg) || input.kg <= 0) {
    throw new Error('El máximo tiene que ser un número mayor que cero.')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error(`Fecha inválida: "${input.date}".`)
  }

  const max: Max = { id: crypto.randomUUID(), ...input, createdAt: now.toISOString() }
  await db.maxes.add(max)
  return max
}

/** Historial del ejercicio, del más reciente al más antiguo (por fecha y, en el mismo día, el último cargado primero). */
export async function getMaxHistory(db: QuitosDb, exerciseId: Id): Promise<Max[]> {
  const maxes = await db.maxes.where('exerciseId').equals(exerciseId).toArray()
  return maxes.sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  )
}

/** El máximo vigente de cada ejercicio que tiene alguno, en kg. Sirve para calcular todas las cargas de una vez. */
export async function listCurrentMaxes(db: QuitosDb): Promise<Map<Id, number>> {
  const maxes = await db.maxes.toArray()
  maxes.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  const current = new Map<Id, number>()
  for (const max of maxes) {
    if (!current.has(max.exerciseId)) current.set(max.exerciseId, max.kg)
  }
  return current
}

/** El máximo vigente: el de fecha más reciente. `undefined` si el ejercicio no tiene. */
export async function getCurrentMax(db: QuitosDb, exerciseId: Id): Promise<Max | undefined> {
  const [current] = await getMaxHistory(db, exerciseId)
  return current
}
