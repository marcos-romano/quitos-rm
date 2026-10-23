// Programas: cada uno se guarda como una sola ficha completa (semanas, días, bloques...).

import type { Id, Program } from '../domain/types.ts'
import type { QuitosDb } from './db.ts'

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
