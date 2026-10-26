// Piezas comunes de las pantallas del plan.

import type { Program } from '../../../domain/types.ts'
import { Button } from '../../components/Button.tsx'

/** Aplica un cambio del editor (ver plan.ts) al programa que se está mirando. */
export type ChangeProgram = (change: (program: Program) => Program) => void

/** Botón de arriba a la derecha: "Editar" muestra los controles y "Listo" los oculta. */
export function EditToggle({ editing, onToggle }: { editing: boolean; onToggle: () => void }) {
  return (
    <Button variant={editing ? 'primary' : 'secondary'} onClick={onToggle}>
      {editing ? 'Listo' : 'Editar'}
    </Button>
  )
}
