import { useState, type HTMLAttributes } from 'react'
import { TextField } from './TextField.tsx'

/**
 * Campo que guarda mientras se escribe: no hay botón "Guardar". Muestra lo escrito
 * aunque la base tarde un instante, y si el texto no es válido no lo guarda y
 * muestra el error. Al salir del campo vuelve a mostrar lo que quedó guardado.
 */
export function AutoSaveField({
  label,
  value,
  onSave,
  validate,
  placeholder,
  inputMode,
}: {
  label: string
  /** Lo que está guardado. */
  value: string
  onSave: (text: string) => void
  /** Mensaje de error si el texto no sirve; nada si está bien. */
  validate?: (text: string) => string | undefined
  placeholder?: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  const [draft, setDraft] = useState(value)
  const [focused, setFocused] = useState(false)
  const error = focused ? validate?.(draft) : undefined

  return (
    <TextField
      label={label}
      value={focused ? draft : value}
      placeholder={placeholder}
      inputMode={inputMode}
      error={error}
      onFocus={() => {
        setDraft(value)
        setFocused(true)
      }}
      onBlur={() => setFocused(false)}
      onChange={(text) => {
        setDraft(text)
        if (!validate?.(text)) onSave(text)
      }}
    />
  )
}
