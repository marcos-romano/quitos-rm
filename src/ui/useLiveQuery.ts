import { liveQuery } from 'dexie'
import { useEffect, useState } from 'react'

/**
 * Lee de la base y se actualiza solo cada vez que esos datos cambian, por ejemplo
 * al guardar desde otra pantalla. Mientras carga la primera vez, da `undefined`.
 * La consulta se arma una sola vez, al mostrarse el componente.
 */
export function useLiveQuery<T>(query: () => Promise<T>): T | undefined {
  const [value, setValue] = useState<T>()
  useEffect(() => {
    const subscription = liveQuery(query).subscribe({
      next: setValue,
      error: (error: unknown) => console.error(error),
    })
    return () => subscription.unsubscribe()
    // La consulta se arma una sola vez, a propósito.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return value
}
