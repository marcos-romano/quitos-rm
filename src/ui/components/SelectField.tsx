import { ChevronDown } from 'lucide-react'
import './components.css'

/**
 * Lista desplegable con el mismo aspecto que los campos de texto (DISENO.md §5).
 * En el iPhone abre la rueda de opciones del sistema.
 */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <label className="text-field">
      <span className="text-label">{label}</span>
      <span className="select-wrap">
        <select
          className="text-input select-input"
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-icon" size={20} strokeWidth={1.5} aria-hidden="true" />
      </span>
    </label>
  )
}
