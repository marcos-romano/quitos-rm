import { formatLoad } from '../../domain/format.ts'
import type { LoadResult } from '../../domain/load.ts'
import './components.css'

/** Carga de una serie: "85 kg" en grande y "84 exactos" debajo; "Libre" o el aviso sin máximo, en texto normal. */
export function LoadValue({ result }: { result: LoadResult }) {
  const { main, secondary } = formatLoad(result)
  const isNumber = result.status === 'calculated' || result.status === 'fixed'
  return (
    <div className="load-value">
      <p className={isNumber ? 'number-large' : 'text-body'}>{main}</p>
      {secondary && <p className="text-secondary">{secondary}</p>}
    </div>
  )
}
