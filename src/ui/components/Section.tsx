import type { ReactNode } from 'react'
import './components.css'

/** Sección sin tarjeta: una línea fina arriba y espacio (DISENO.md §5). */
export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="section">
      {title && <h2 className="text-label">{title}</h2>}
      {children}
    </section>
  )
}
