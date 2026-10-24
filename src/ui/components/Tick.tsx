import { Check } from 'lucide-react'
import './components.css'

type TickProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Qué se tilda, para lectores de pantalla: "Sentadilla, serie 2". */
  label: string
}

/** Tilde de ejercicio (DISENO.md §5): 44 × 44, vacía con borde; completada en verde con tilde negra. */
export function Tick({ checked, onChange, label }: TickProps) {
  return (
    <button
      type="button"
      className={checked ? 'tick tick-checked' : 'tick'}
      aria-pressed={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      {checked && <Check size={22} strokeWidth={2} aria-hidden="true" />}
    </button>
  )
}
