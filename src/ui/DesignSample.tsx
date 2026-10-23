// Muestra de diseño temporal (paso 3): variantes de verde, rojo y azul y un
// resplandor neón suave, para elegir viéndolos en el iPhone.

import { useState, type CSSProperties } from 'react'
import './DesignSample.css'

type Accent = 'green' | 'red' | 'blue'

const VARIANTS: Record<Accent, { name: string; options: { hex: string; label: string }[] }> = {
  green: {
    name: 'Verde',
    options: [
      { hex: '#089981', label: 'actual' },
      { hex: '#0DB592', label: 'un poco más luminoso' },
      { hex: '#12C9A0', label: 'un poco más todavía' },
    ],
  },
  red: {
    name: 'Rojo',
    options: [
      { hex: '#F23645', label: 'actual' },
      { hex: '#FF3D52', label: 'un poco más luminoso' },
      { hex: '#FF4F63', label: 'un poco más todavía' },
    ],
  },
  blue: {
    name: 'Azul',
    options: [
      { hex: '#2F5BFF', label: 'actual' },
      { hex: '#3A5FE0', label: 'un poco más apagado' },
      { hex: '#4466D6', label: 'más apagado' },
    ],
  },
}

const ACCENTS: Accent[] = ['green', 'red', 'blue']

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <polyline points="5 12.5 10 17.5 19 7" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function DesignSample() {
  const [chosen, setChosen] = useState<Record<Accent, number>>({ green: 0, red: 0, blue: 0 })
  const [neon, setNeon] = useState(true)

  const colors = {
    '--sample-green': VARIANTS.green.options[chosen.green].hex,
    '--sample-red': VARIANTS.red.options[chosen.red].hex,
    '--sample-blue': VARIANTS.blue.options[chosen.blue].hex,
  } as CSSProperties

  return (
    <div className={neon ? 'ds ds-neon' : 'ds'} style={colors}>
      <section className="ds-section">
        <p className="ds-label">Colores y efecto neón</p>
        <p className="ds-note">
          Elegí una variante de cada color y prendé o apagá el resplandor. Abajo se ve cómo
          quedan en la app.
        </p>

        {ACCENTS.map((accent) => (
          <div key={accent} className="ds-choice">
            <p className="ds-body">
              {VARIANTS[accent].name} {chosen[accent] + 1} · {VARIANTS[accent].options[chosen[accent]].label} ·{' '}
              {VARIANTS[accent].options[chosen[accent]].hex}
            </p>
            <div className="ds-switch" role="group" aria-label={VARIANTS[accent].name}>
              {VARIANTS[accent].options.map((option, index) => (
                <button
                  key={option.hex}
                  type="button"
                  aria-pressed={chosen[accent] === index}
                  className="ds-switch-option"
                  onClick={() => setChosen({ ...chosen, [accent]: index })}
                >
                  <span className="ds-swatch" style={{ backgroundColor: option.hex }} />
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="ds-choice">
          <p className="ds-body">Resplandor neón</p>
          <div className="ds-switch" role="group" aria-label="Resplandor neón">
            <button type="button" aria-pressed={neon} className="ds-switch-option" onClick={() => setNeon(true)}>
              Prendido
            </button>
            <button type="button" aria-pressed={!neon} className="ds-switch-option" onClick={() => setNeon(false)}>
              Apagado
            </button>
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
