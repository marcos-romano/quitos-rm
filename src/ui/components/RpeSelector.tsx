import { RPE_VALUES, rpeDescription, rpeTone } from '../../domain/rpe.ts'
import './components.css'

type RpeSelectorProps = {
  value: number | undefined
  /** Tocar el valor elegido lo borra: el RPE es opcional. */
  onChange: (value: number | undefined) => void
}

/** Diez fichas del 1 al 10 en dos filas, cada una de al menos 44 px (DISENO.md §5). */
export function RpeSelector({ value, onChange }: RpeSelectorProps) {
  return (
    <div className="rpe">
      <div className="rpe-grid" role="group" aria-label="RPE">
        {RPE_VALUES.map((rpe) => (
          <button
            key={rpe}
            type="button"
            className={`rpe-chip rpe-${rpeTone(rpe)}`}
            aria-pressed={value === rpe}
            aria-label={`RPE ${rpe}: ${rpeDescription(rpe)}`}
            onClick={() => onChange(value === rpe ? undefined : rpe)}
          >
            {rpe}
          </button>
        ))}
      </div>
      <p className="text-secondary">
        {value === undefined ? 'Sin RPE' : `${value} · ${rpeDescription(value)}`}
      </p>
    </div>
  )
}
