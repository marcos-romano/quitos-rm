// Almacenamiento persistente: se le pide a Safari que no borre los datos de la app.
// iOS borra los datos de sitios web sin uso durante 7 días, pero no los de las apps
// instaladas en la pantalla de inicio. El respaldo JSON es la red de seguridad.

export type PersistenceStatus = 'granted' | 'denied' | 'unsupported'

export async function requestPersistentStorage(): Promise<PersistenceStatus> {
  if (!navigator.storage?.persist) return 'unsupported'
  try {
    if (await navigator.storage.persisted()) return 'granted'
    return (await navigator.storage.persist()) ? 'granted' : 'denied'
  } catch {
    return 'unsupported'
  }
}
