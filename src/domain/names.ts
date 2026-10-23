// Nombres de ejercicios: texto libre, pero sin duplicados por mayúsculas, tildes o espacios.

/** Nombre tal como se guarda: sin espacios sobrantes. "  Press   plano " → "Press plano". */
export function cleanName(name: string): string {
  return name.replace(/\s+/g, ' ').trim()
}

/** Clave para comparar nombres: "  Sentadílla  BÚLGARA" → "sentadilla bulgara". */
export function normalizeName(name: string): string {
  return cleanName(name)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}
