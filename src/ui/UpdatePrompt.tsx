import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

// Muestra si la app quedó guardada para usarse sin conexión y avisa cuando hay
// una versión nueva. La versión nueva se aplica solo al tocar "Actualizar",
// para que la app nunca se recargue sola en medio de un entrenamiento.
export function UpdatePrompt() {
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

  return (
    <>
      {worksOffline && <p className="offline-status">Lista para usar sin conexión</p>}
      {needRefresh && (
        <div className="update-prompt" role="status">
          <span>Nueva versión disponible</span>
          <button
            type="button"
            className="button-primary"
            onClick={() => void updateServiceWorker(true)}
          >
            Actualizar
          </button>
        </div>
      )}
    </>
  )
}
