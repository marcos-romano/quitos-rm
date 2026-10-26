import { useId, type HTMLAttributes } from 'react'
import './components.css'

type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** "decimal" muestra el teclado numérico con coma en el iPhone. */
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  /** Mensaje de error debajo del campo; el borde pasa a rojo. */
  error?: string
  onFocus?: () => void
  onBlur?: () => void
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  error,
  onFocus,
  onBlur,
}: TextFieldProps) {
  const errorId = useId()
  return (
    <label className="text-field">
      <span className="text-label">{label}</span>
      <input
        className={error ? 'text-input text-input-error' : 'text-input'}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {error && (
        <span id={errorId} className="text-error">
          {error}
        </span>
      )}
    </label>
  )
}
