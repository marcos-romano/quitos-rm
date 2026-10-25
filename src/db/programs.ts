// Programas: cada uno se guarda como una sola ficha completa (semanas, días, bloques...).

import { buildProgram, type FileProgram, type ImportPlan } from '../domain/programFile.ts'
import type { Id, Program } from '../domain/types.ts'
import type { QuitosDb } from './db.ts'
import { getSettings, updateSettings } from './settings.ts'

/** Guarda el programa completo y actualiza su fecha de modificación. */
export async function saveProgram(db: QuitosDb, program: Program, now: Date = new Date()): Promise<Program> {
  const saved: Program = { ...program, updatedAt: now.toISOString() }
  await db.programs.put(saved)
  return saved
}

export async function getProgram(db: QuitosDb, id: Id): Promise<Program | undefined> {
  return db.programs.get(id)
}

/** Todos los programas, del creado más recientemente al más antiguo. */
export async function listPrograms(db: QuitosDb): Promise<Program[]> {
  const programs = await db.programs.toArray()
  return programs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/**
 * Borra el programa (la pantalla pide confirmación antes). Las sesiones ya
 * registradas no se tocan. Si era el programa activo, deja de haber uno activo.
 */
export async function deleteProgram(db: QuitosDb, id: Id): Promise<void> {
  await db.transaction('rw', db.programs, db.settings, async () => {
    await db.programs.delete(id)
    if ((await getSettings(db)).activeProgramId === id) {
      await updateSettings(db, { activeProgramId: undefined })
    }
  })
}

/**
 * Guarda un programa leído de un archivo (ver programFile.ts) como programa nuevo:
 * nunca reemplaza otro. Agrega al catálogo los ejercicios que faltan y, si no había
 * programa activo, deja este como activo. Todo o nada: si algo falla, no queda nada a medias.
 */
export async function importProgram(db: QuitosDb, file: FileProgram, now: Date = new Date()): Promise<ImportPlan> {
  return db.transaction('rw', db.exercises, db.programs, db.settings, async () => {
    const plan = buildProgram(file, await db.exercises.toArray(), now)
    await db.exercises.bulkAdd(plan.newExercises)
    await db.programs.add(plan.program)
    if ((await getSettings(db)).activeProgramId === undefined) {
      await updateSettings(db, { activeProgramId: plan.program.id })
    }
    return plan
  })
}
