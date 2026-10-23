// Muestra de diseño temporal (paso 3): variantes de azul más oscuro, con el verde,
// el rojo y el resplandor neón ya elegidos, para decidir viéndolos en el iPhone.

import { useState, type CSSProperties } from 'react'
import './DesignSample.css'

// Del azul actual hacia el azul medianoche (#191970).
const BLUES = [
  { hex: '#2F5BFF', label: 'actual, como referencia' },
  { hex: '#2744CD', label: 'un poco más oscuro' },
  { hex: '#243AB8', label: 'intermedio entre el actual y medianoche' },
  { hex: '#2233A9', label: 'más cerca de medianoche' },
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <polyline points="5 12.5 10 17.5 19 7" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function DesignSample() {
  const [blue, setBlue] = useState(2)

  return (
    <div className="ds ds-neon" style={{ '--sample-blue': BLUES[blue].hex } as CSSProperties}>
      <section className="ds-section">
        <p className="ds-label">Azul más oscuro</p>
        <p className="ds-note">
          Verde, rojo y resplandor neón ya están elegidos. Probá los azules y mirá sobre todo el
          borde de la ronda activa y el botón principal.
        </p>
        <div className="ds-choice">
          <p className="ds-body">
            Azul {blue + 1} · {BLUES[blue].label} · {BLUES[blue].hex}
          </p>
          <div className="ds-switch" role="group" aria-label="Azul">
            {BLUES.map((option, index) => (
              <button
                key={option.hex}
                type="button"
                aria-pressed={blue === index}
                className="ds-switch-option"
                onClick={() => setBlue(index)}
              >
                <span className="ds-swatch" style={{ backgroundColor: option.hex }} />
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-section">
        <p className="ds-label">En contexto</p>

        <div className="ds-round ds-round-done">
          <div className="ds-round-row">
            <span className="ds-strike">Ronda 1</span>
            <span className="ds-check ds-check-done">
              <CheckIcon />
            </span>
          </div>
        </div>

        <div className="ds-round ds-round-active">
          <p className="ds-label">Ronda 2 · activa</p>
          <div className="ds-round-row">
            <span>Sentadilla · 8</span>
            <span className="ds-row-end">
              <span className="ds-number">85 kg</span>
              <span className="ds-check ds-check-done">
                <CheckIcon />
              </span>
            </span>
          </div>
          <div className="ds-round-row">
            <span>Isquio isométrico · 30 s</span>
            <span className="ds-row-end">
              <span className="ds-number">Libre</span>
              <span className="ds-check" />
            </span>
          </div>
          <p className="ds-secondary">Descanso: 180 s</p>
        </div>

        <div className="ds-rpe">
          <p className="ds-label">RPE</p>
          <div className="ds-rpe-row">
            <span className="ds-chip ds-chip-green">4</span>
            <span className="ds-chip">7</span>
            <span className="ds-chip ds-chip-red">10</span>
          </div>
          <p className="ds-text-green">RPE 4 · liviano</p>
          <p className="ds-text-red">RPE 10 · esfuerzo máximo</p>
        </div>

        <button type="button" className="ds-button ds-button-primary">
          Semana 3 · Día 2
        </button>
        <button type="button" className="ds-button ds-button-destructive">
          Eliminar semana
        </button>
      </section>
    </div>
  )
}
