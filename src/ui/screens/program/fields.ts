// Reglas de los campos del editor del plan.

export function requireName(text: string): string | undefined {
  return text.trim() === '' ? 'Escribí un nombre.' : undefined
}

/** Texto opcional: vacío se guarda como "sin dato". */
export function optional(text: string): string | undefined {
  return text.trim() === '' ? undefined : text.trim()
}
