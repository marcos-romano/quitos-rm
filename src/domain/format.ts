// Formatos de la interfaz en español rioplatense (es-AR): coma decimal y fechas dd/mm/aaaa.

import type { LoadResult } from './load.ts'
import type { BlockType, Load, LocalDate, Measure, MeasureKind, RoundingIncrement } from './types.ts'

const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })

/** Número con coma decimal y hasta dos decimales: 87.5 → "87,5", 85 → "85". */
export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

/**
 * Número para un campo editable: con coma decimal y sin separador de miles, para
 * que al volver a leerlo no se confunda el punto de miles con uno decimal.
 * 1200 → "1200", 87.5 → "87,5".
 */
export function formatNumberForInput(value: number): string {
  return String(value).replace('.', ',')
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

/**
 * Número entero mayor que cero escrito por el usuario, por ejemplo el de una semana:
 * "3" → 3. "3,5", "0" o "tres" dan `undefined`.
 */
export function parseWholeNumber(text: string): number | undefined {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) return undefined
  const value = Number(trimmed)
  return value > 0 ? value : undefined
}

/** Segundos de descanso escritos por el usuario: "120" → 120. Acepta 0 (sin descanso). */
export function parseSeconds(text: string): number | undefined {
  const trimmed = text.trim()
  return /^\d+$/.test(trimmed) ? Number(trimmed) : undefined
}

/** Cantidad con su palabra en singular o plural: "1 semana", "4 semanas". */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}

/** Descanso en segundos, como se muestra en el plan y en la sesión: "180 s". */
export function formatRest(seconds: number): string {
  return `${formatNumber(seconds)} s`
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  power: 'Potencia',
  strength: 'Fuerza',
  hypertrophy: 'Hipertrofia',
  structure: 'Estructura',
  extra: 'Extra',
  other: 'Otro',
}

export const MEASURE_LABELS: Record<MeasureKind, string> = {
  reps: 'Repeticiones',
  time: 'Segundos',
  distance: 'Metros',
}

export const LOAD_KIND_LABELS: Record<Load['kind'], string> = {
  percent: 'Porcentaje del máximo',
  kg: 'Kg fijos',
  free: 'Libre',
}

/** Medida de una serie: "8 repeticiones", "1 repetición", "30 s", "15 m". */
export function formatMeasure(measure: Measure): string {
  const value = formatNumber(measure.value)
  switch (measure.kind) {
    case 'reps':
      return `${value} ${measure.value === 1 ? 'repetición' : 'repeticiones'}`
    case 'time':
      return `${value} s`
    case 'distance':
      return `${value} m`
  }
}

/**
 * Una serie en pocas palabras, para listarlas una por una (nunca "4 x 8"):
 * "8 al 65%", "8 con 20 kg", "8", "30 s", "15 m con 24 kg".
 */
export function formatSetShort(set: { measure: Measure; load: Load }): string {
  const value = formatNumber(set.measure.value)
  const measure = set.measure.kind === 'reps' ? value : formatMeasure(set.measure)
  switch (set.load.kind) {
    case 'percent':
      return `${measure} al ${formatNumber(set.load.percent)}%`
    case 'kg':
      return `${measure} con ${formatKg(set.load.kg)}`
    case 'free':
      return measure
  }
}

/** Carga de una serie con su cálculo: "65% · 22,5 kg", "20 kg", "Libre". */
export function formatSetLoad(load: Load, result: LoadResult): string {
  const { main } = formatLoad(result)
  return load.kind === 'percent' ? `${formatNumber(load.percent)}% · ${main}` : main
}

/** Título de una semana, con su etiqueta entre paréntesis: "Semana 1", "Semana 1 (copia)". */
export function formatWeekTitle(week: { number: number; label?: string }): string {
  return week.label ? `Semana ${week.number} (${week.label})` : `Semana ${week.number}`
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
