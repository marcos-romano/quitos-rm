// Escala RPE de 1 a 10 (CLAUDE.md §6.3). Es solo ilustrativa: no entra en ningún cálculo.

export const RPE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

/** Color de la escala (DISENO.md §5): 1 a 5 verde, 6 a 8 neutro, 9 y 10 rojo. */
export type RpeTone = 'low' | 'neutral' | 'high'

export function rpeTone(rpe: number): RpeTone {
  if (rpe <= 5) return 'low'
  if (rpe <= 8) return 'neutral'
  return 'high'
}

/** Referencia de cada valor: 10 esfuerzo máximo, 9 una repetición en reserva, etc. */
export function rpeDescription(rpe: number): string {
  if (rpe >= 10) return 'Esfuerzo máximo'
  if (rpe === 9) return 'Una repetición en reserva'
  if (rpe === 8) return 'Dos repeticiones en reserva'
  if (rpe === 7) return 'Tres repeticiones en reserva'
  if (rpe >= 5) return 'Moderado'
  return 'Liviano'
}
