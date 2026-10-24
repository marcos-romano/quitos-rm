import type { ComponentProps } from 'react'
import './components.css'

type ButtonProps = ComponentProps<'button'> & {
  /** Principal (relleno azul), secundario (borde neutro) o destructivo (rojo, siempre con confirmación). */
  variant?: 'primary' | 'secondary' | 'destructive'
  /** Ancho completo, para las acciones principales. */
  fullWidth?: boolean
}

export function Button({
  variant = 'secondary',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = ['button', `button-${variant}`, fullWidth && 'button-full', className]
  return <button type={type} className={classes.filter(Boolean).join(' ')} {...props} />
}
