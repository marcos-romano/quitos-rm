// Muestra de diseño temporal (paso 3): grosores de Jost, estilo sin tarjetas con
// esquinas rectas y colores de acento, para decidir viéndolos en el iPhone.

import { useState } from 'react'
import './DesignSample.css'

type WeightId = 'current' | 'a' | 'b' | 'c'

const WEIGHTS: { id: WeightId; name: string; description: string }[] = [
  { id: 'current', name: 'Actual', description: 'Seminegrita en lo grande, normal en lo chico' },
  { id: 'a', name: 'A', description: 'Fina en lo grande, normal en lo chico' },
  { id: 'b', name: 'B', description: 'Fina en todo' },
  { id: 'c', name: 'C', description: 'Muy fina en lo grande, fina en lo chico' },
]

const ACCENTS = [
  { name: 'Verde', hex: '#089981', className: 'green', fill: 'Completado', text: 'RPE 4 · liviano' },
  { name: 'Rojo', hex: '#F23645', className: 'red', fill: 'Eliminar', text: 'RPE 10 · esfuerzo máximo' },
  { name: 'Azul', hex: '#2F5BFF', className: 'blue', fill: 'Empezar', text: 'Ronda activa' },
]

function WeightBlock({ weight }: { weight: WeightId }) {
  return (
    <div className={`ds-weight ds-weight-${weight}`}>
      <p className="ds-title">Sentadilla</p>
      <p className="ds-big">85 kg</p>
      <p className="ds-secondary">84 exactos</p>
      <p className="ds-body">8 repeticiones · Descanso: 180 s</p>
      <p className="ds-label">Ronda 2 de 4</p>
    </div>
  )
}

export function DesignSample() {
  const [weight, setWeight] = useState<WeightId>('a')
  const [maxText, setMaxText] = useState('87,5')
  const [dateText, setDateText] = useState('2026-10-22')

  return (
    <div className="ds">
      <section className="ds-section">
        <h2 className="ds-heading">1. Grosor de la letra</h2>
        <p className="ds-note">El mismo bloque con cada grosor. Miralo con el brazo estirado.</p>
        {WEIGHTS.map((w) => (
          <div key={w.id} className="ds-compare">
            <p className="ds-variant">
              {w.name} · {w.description}
            </p>
            <WeightBlock weight={w.id} />
          </div>
        ))}
      </section>

      <section className="ds-section">
        <h2 className="ds-heading">2. Sin tarjetas, esquinas rectas</h2>
        <p className="ds-note">Elegí el grosor para ver la pantalla completa con él.</p>
        <div className="ds-switch" role="group" aria-label="Grosor">
          {WEIGHTS.map((w) => (
            <button
              key={w.id}
              type="button"
              aria-pressed={weight === w.id}
              className="ds-switch-option"
              onClick={() => setWeight(w.id)}
            >
              {w.name}
            </button>
          ))}
        </div>

        <div className={`ds-preview ds-weight-${weight}`}>
          <div className="ds-block">
            <p className="ds-label">Ejercicio</p>
            <p className="ds-title">Dominadas</p>
            <p className="ds-secondary">Redondeo: 1,25 kg (propio del ejercicio)</p>
          </div>

          <div className="ds-block">
            <p className="ds-label">Máximo</p>
            <p className="ds-big">40 kg</p>
            <p className="ds-secondary">Vigente desde el 22/10/2026</p>
            <div className="ds-row">
              <label className="ds-field">
                <span className="ds-label">Kg</span>
                <input
                  className="ds-input"
                  inputMode="decimal"
                  value={maxText}
                  onChange={(event) => setMaxText(event.target.value)}
                />
              </label>
              <label className="ds-field">
                <span className="ds-label">Fecha</span>
                <input
                  className="ds-input"
                  type="date"
                  value={dateText}
                  onChange={(event) => setDateText(event.target.value)}
                />
              </label>
            </div>
            <button type="button" className="ds-button ds-button-primary">
              Guardar máximo
            </button>
            <button type="button" className="ds-button ds-button-secondary">
              Agregar ejercicio
            </button>
          </div>

          <div className="ds-block">
            <p className="ds-label">Cálculo de carga · 70%</p>
            <p className="ds-big">25 kg</p>
            <p className="ds-secondary">24,5 exactos</p>
          </div>

          <div className="ds-block">
            <p className="ds-label">Lo que conserva recuadro: la ronda activa</p>
            <div className="ds-round">
              <p className="ds-label">Ronda 2 · activa</p>
              <div className="ds-round-row">
                <span className="ds-body">Sentadilla · 8</span>
                <span className="ds-number">85 kg</span>
              </div>
              <div className="ds-round-row">
                <span className="ds-body">Isquio isométrico · 30 s</span>
                <span className="ds-number">Libre</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-section">
        <h2 className="ds-heading">3. Colores de acento</h2>
        <p className="ds-note">Como relleno y como texto sobre el fondo. ¿Se ven bien en tu pantalla?</p>
        {ACCENTS.map((accent) => (
          <div key={accent.name} className="ds-accent">
            <div className={`ds-fill ds-fill-${accent.className}`}>{accent.fill}</div>
            <p className={`ds-body ds-text-${accent.className}`}>{accent.text}</p>
            <p className="ds-secondary">
              {accent.name} · {accent.hex}
            </p>
          </div>
        ))}
      </section>

      <section className="ds-section">
        <h2 className="ds-heading">4. Números alineados</h2>
        <p className="ds-note">
          Izquierda: números normales. Derecha: de ancho fijo. Si Jost los tiene, las comas de
          la derecha quedan en columna.
        </p>
        <div className="ds-columns">
          <div className="ds-numbers">
            <span>111,25 kg</span>
            <span>85,00 kg</span>
            <span>102,50 kg</span>
          </div>
          <div className="ds-numbers ds-tabular">
            <span>111,25 kg</span>
            <span>85,00 kg</span>
            <span>102,50 kg</span>
          </div>
        </div>
      </section>
    </div>
  )
}
