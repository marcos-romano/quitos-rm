import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import './components.css'

/**
 * Pantalla con su título de 28 px (DISENO.md §3). Las pantallas internas llevan
 * arriba un botón "←" que vuelve a la anterior.
 */
export function Screen({
  title,
  onBack,
  children,
}: {
  title: string
  onBack?: () => void
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
        <h1 className="screen-title">{title}</h1>
      </header>
      {children}
    </div>
  )
}
