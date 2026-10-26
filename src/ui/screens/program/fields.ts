// Reglas de los campos del editor del plan.

import { parseSeconds } from '../../../domain/format.ts'

export function requireName(text: string): string | undefined {
  return text.trim() === '' ? 'Escribí un nombre.' : undefined
}

/** Texto opcional: vacío se guarda como "sin dato". */
export function optional(text: string): string | undefined {
  return text.trim() === '' ? undefined : text.trim()
}

export function secondsError(text: string): string | undefined {
  return parseSeconds(text) === undefined ? 'Escribí los segundos, por ejemplo 120.' : undefined
}
