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
      {checked && (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <polyline points="5 12.5 10 17.5 19 7" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
    </button>
  )
}
