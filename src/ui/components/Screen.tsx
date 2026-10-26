import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import './components.css'

/**
 * Pantalla con su título de 28 px (DISENO.md §3). Las pantallas internas llevan
 * arriba un botón "←" que vuelve a la anterior; `action` va arriba a la derecha
 * (por ejemplo "Editar") y `subtitle`, debajo del título.
 */
export function Screen({
  title,
  subtitle,
  onBack,
  action,
  children,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div>
      <header className="screen-header">
        {onBack && (
          <button type="button" className="back-button" aria-label="Volver" onClick={onBack}>
            <ArrowLeft size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
        <div className="screen-heading">
          <h1 className="screen-title">{title}</h1>
          {subtitle && <p className="text-secondary">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </div>
  )
}
