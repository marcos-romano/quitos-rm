import { ClipboardList, Dumbbell, Ellipsis, History, House, type LucideIcon } from 'lucide-react'
import './components.css'

export type Tab = 'home' | 'program' | 'maxes' | 'history' | 'more'

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Inicio', icon: House },
  { id: 'program', label: 'Programa', icon: ClipboardList },
  { id: 'maxes', label: 'Máximos', icon: Dumbbell },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'more', label: 'Más', icon: Ellipsis },
]

/**
 * Barra de navegación inferior (DISENO.md §5): cinco ítems con ícono y etiqueta.
 * El activo lleva el ícono en azul con resplandor, la etiqueta en blanco y una
 * línea arriba, para que no dependa solo del color.
 */
export function BottomNav({ active, onSelect }: { active: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className="nav-item"
          aria-current={active === id ? 'page' : undefined}
          onClick={() => onSelect(id)}
        >
          <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
