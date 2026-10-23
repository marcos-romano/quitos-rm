// Ajustes de la aplicación (CLAUDE.md §6.7) y sus valores por defecto.

import { DEFAULT_GLOBAL_ROUNDING } from './load.ts'
import type { Id, RoundingIncrement, Timestamp } from './types.ts'

export interface Settings {
  globalRounding: RoundingIncrement
  unit: 'kg'
  /** Días sin respaldo a partir de los cuales se muestra el recordatorio. */
  backupReminderDays: number
  activeProgramId?: Id
  lastBackupAt?: Timestamp
}

export const DEFAULT_SETTINGS: Settings = {
  globalRounding: DEFAULT_GLOBAL_ROUNDING,
  unit: 'kg',
  backupReminderDays: 14,
}
