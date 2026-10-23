// Formatos de la interfaz en español rioplatense (es-AR): coma decimal.

const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })

/** Número con coma decimal y hasta dos decimales: 87.5 → "87,5", 85 → "85". */
export function formatNumber(value: number): string {
  return numberFormat.format(value)
}
