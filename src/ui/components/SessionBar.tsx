import { Button } from './Button.tsx'
import './components.css'

/**
 * Barra de sesión en curso (CLAUDE.md §6.8, DISENO.md §5): fija sobre la
 * navegación inferior en todas las pantallas, lleva de vuelta con un toque.
 */
export function SessionBar({ dayLabel, onReturn }: { dayLabel: string; onReturn: () => void }) {
  return (
    <div className="session-bar" role="status">
      <div className="session-bar-text">
        <span className="text-label">Sesión en curso</span>
        <span className="text-body">{dayLabel}</span>
      </div>
      <Button onClick={onReturn}>Volver</Button>
    </div>
  )
}
