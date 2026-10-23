// Catálogo temporal de componentes (paso 3): cada pieza base con sus estados, para
// aprobarlas en el iPhone antes de usarlas en las pantallas reales.

import { useState } from 'react'
import { formatDayLabel, parseDecimal } from '../domain/format.ts'
import { prescribedLoad } from '../domain/load.ts'
import { Button } from './components/Button.tsx'
import { LoadValue } from './components/LoadValue.tsx'
import { RpeSelector } from './components/RpeSelector.tsx'
import { Section } from './components/Section.tsx'
import { TextField } from './components/TextField.tsx'
import { Tick } from './components/Tick.tsx'

export function ComponentCatalog() {
  const [maxText, setMaxText] = useState('1O')
  const [ticks, setTicks] = useState([true, false])
  const [rpe, setRpe] = useState<number | undefined>(8)

  const maxError =
    maxText.trim() !== '' && parseDecimal(maxText) === undefined
      ? 'Escribí el máximo con números, por ejemplo 87,5.'
      : undefined

  return (
    <div>
      <Section title="Botones">
        <Button variant="primary" fullWidth>
          {formatDayLabel(3, 'Día 2')}
        </Button>
        <Button fullWidth>Agregar ejercicio</Button>
        <Button variant="destructive" fullWidth>
          Eliminar semana
        </Button>
        <Button variant="primary" fullWidth disabled>
          Deshabilitado
        </Button>
      </Section>

      <Section title="Campo de texto">
        <TextField
          label="Máximo (kg)"
          value={maxText}
          onChange={setMaxText}
          inputMode="decimal"
          placeholder="87,5"
          error={maxError}
        />
        <p className="text-secondary">Probá borrar la letra O y escribir un número.</p>
      </Section>

      <Section title="Carga">
        <LoadValue result={prescribedLoad({ kind: 'percent', percent: 70 }, 120, 2.5)} />
        <LoadValue result={prescribedLoad({ kind: 'free' }, undefined, 2.5)} />
        <LoadValue result={prescribedLoad({ kind: 'percent', percent: 70 }, undefined, 2.5)} />
      </Section>

      <Section title="Tilde">
        {[
          { name: 'Sentadilla · 8', load: '85 kg' },
          { name: 'Isquio isométrico · 30 s', load: 'Libre' },
        ].map((row, index) => (
          <div key={row.name} className="catalog-row">
            <span className="text-body">{row.name}</span>
            <span className="catalog-row-end">
              <span className="text-body">{row.load}</span>
              <Tick
                checked={ticks[index]}
                label={row.name}
                onChange={(checked) => setTicks(ticks.map((t, i) => (i === index ? checked : t)))}
              />
            </span>
          </div>
        ))}
      </Section>

      <Section title="RPE">
        <RpeSelector value={rpe} onChange={setRpe} />
      </Section>
    </div>
  )
}
