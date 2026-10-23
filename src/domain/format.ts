// Formatos de la interfaz en español rioplatense (es-AR): coma decimal y fechas dd/mm/aaaa.

import type { LoadResult } from './load.ts'
import type { LocalDate, RoundingIncrement } from './types.ts'

const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })

/** Número con coma decimal y hasta dos decimales: 87.5 → "87,5", 85 → "85". */
export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

/**
 * Número escrito por el usuario, con coma o punto decimal: "87,5" → 87.5.
 * Cualquier otra cosa (por ejemplo "1O" con la letra O) da `undefined`: no se adivina.
 */
export function parseDecimal(text: string): number | undefined {
  const trimmed = text.trim()
  if (!/^\d+([.,]\d+)?$/.test(trimmed)) return undefined
  return Number(trimmed.replace(',', '.'))
}

/** Texto del botón del día (DISENO.md §5): "Semana 3 · Día 2". */
export function formatDayLabel(weekNumber: number, dayName: string): string {
  return `Semana ${weekNumber} · ${dayName}`
}

/** 1.25 → "1,25 kg"; 'exact' → "exacto". */
export function formatIncrement(increment: RoundingIncrement): string {
  return increment === 'exact' ? 'exacto' : formatKg(increment)
}

/** 87.5 → "87,5 kg". */
export function formatKg(kg: number): string {
  return `${formatNumber(kg)} kg`
}

/** Texto de la carga de una serie: el dato principal y, si corresponde, uno secundario. */
export function formatLoad(result: LoadResult): { main: string; secondary?: string } {
  switch (result.status) {
    case 'free':
      return { main: 'Libre' }
    case 'missing-max':
      return { main: 'Falta cargar el máximo' }
    case 'fixed':
      return { main: formatKg(result.kg) }
    case 'calculated':
      return { main: formatKg(result.kg), secondary: `${formatNumber(result.exactKg)} exactos` }
  }
}

/**
 * Día local de un momento dado: "2026-10-23".
 * No se usa la hora universal (UTC), que a las 23 h de Argentina ya es el día siguiente.
 */
export function toLocalDate(date: Date): LocalDate {
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** "2026-10-23" → "23/10/2026". */
export function formatDate(date: LocalDate): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}
