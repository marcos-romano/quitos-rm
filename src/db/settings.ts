// Ajustes. Lo que no se cambió nunca toma el valor por defecto.

import { DEFAULT_SETTINGS, type Settings } from '../domain/settings.ts'
import type { QuitosDb } from './db.ts'

const SETTINGS_ID = 'app'

export async function getSettings(db: QuitosDb): Promise<Settings> {
  const stored = await db.settings.get(SETTINGS_ID)
  const { id: _id, ...changes } = stored ?? { id: SETTINGS_ID }
  return { ...DEFAULT_SETTINGS, ...changes }
}

/** Cambia solo los ajustes indicados; el resto queda como estaba. */
export async function updateSettings(db: QuitosDb, changes: Partial<Settings>): Promise<Settings> {
  const current = await getSettings(db)
  const updated: Settings = { ...current, ...changes }
  await db.settings.put({ id: SETTINGS_ID, ...updated })
  return updated
}
