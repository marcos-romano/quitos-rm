import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Estado de la app instalada: si quedó guardada para usarse sin conexión y si hay
 * una versión nueva publicada. Se usa una sola vez, en App.
 *
 * La versión nueva se aplica solo al llamar a `update` (botón "Actualizar"), para
 * que la app nunca se recargue sola en medio de un entrenamiento.
 */
export function usePwa() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>()
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, reg) {
      setRegistration(reg)
    },
  })

  // En el iPhone la app suele retomarse sin recargarse: al volver a primer
  // plano se busca si hay una versión nueva publicada.
  useEffect(() => {
    if (!registration) return
    const checkForUpdate = () => {
      if (document.visibilityState === 'visible') void registration.update()
    }
    document.addEventListener('visibilitychange', checkForUpdate)
    return () => document.removeEventListener('visibilitychange', checkForUpdate)
  }, [registration])

  const worksOffline =
    offlineReady ||
    ('serviceWorker' in navigator && navigator.serviceWorker.controller !== null)

  return { worksOffline, needRefresh, update: () => void updateServiceWorker(true) }
}
