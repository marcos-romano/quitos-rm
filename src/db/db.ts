// Base de datos local (IndexedDB, con Dexie). Vive dentro de Safari en el iPhone.

import Dexie, { type EntityTable } from 'dexie'
import { PULL_UP_ROUNDING } from '../domain/load.ts'
import { normalizeName } from '../domain/names.ts'
import type { Settings } from '../domain/settings.ts'
import type { Exercise, Max, Program, Session } from '../domain/types.ts'

export const DB_NAME = 'quitos-rm'

/** Los ajustes se guardan como una única ficha con id fijo. */
export type StoredSettings = Partial<Settings> & { id: 'app' }

export type QuitosDb = Dexie & {
  programs: EntityTable<Program, 'id'>
  exercises: EntityTable<Exercise, 'id'>
  maxes: EntityTable<Max, 'id'>
  sessions: EntityTable<Session, 'id'>
  settings: EntityTable<StoredSettings, 'id'>
}

/**
 * Abre (o crea) la base. Cada `version` describe las tablas y los campos por los
 * que se busca; para cambiar algo más adelante se agrega una versión nueva y
 * Dexie actualiza la base del teléfono sin perder datos.
 */
export function createDatabase(name: string = DB_NAME): QuitosDb {
  const db = new Dexie(name) as QuitosDb

  db.version(1).stores({
    programs: 'id',
    exercises: 'id, &nameKey', // & = único: no puede haber dos ejercicios con el mismo nombre
    maxes: 'id, exerciseId',
    sessions: 'id, programId, status, [programId+dayId]',
    settings: 'id',
  })

  // Solo la primera vez que se crea la base (CLAUDE.md §5).
  db.on('populate', (tx) => {
    const pullUps: Exercise = {
      id: crypto.randomUUID(),
      name: 'Dominadas',
      nameKey: normalizeName('Dominadas'),
      measure: 'reps',
      roundingIncrement: PULL_UP_ROUNDING,
    }
    void tx.table('exercises').add(pullUps)
  })

  return db
}
