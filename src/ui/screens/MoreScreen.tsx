import { useState } from 'react'
import { Button } from '../components/Button.tsx'
import { Screen } from '../components/Screen.tsx'
import { Section } from '../components/Section.tsx'
import { ComponentCatalog } from '../ComponentCatalog.tsx'

// Datos de la aplicación y el catálogo temporal de componentes. Más adelante
// suma "Importar programa", el respaldo y los ajustes (CLAUDE.md §6.6 y §6.7).
export function MoreScreen({ worksOffline }: { worksOffline: boolean }) {
  const [showCatalog, setShowCatalog] = useState(false)

  function openCatalog(open: boolean) {
    setShowCatalog(open)
    window.scrollTo(0, 0)
  }

  if (showCatalog) {
    return (
      <Screen title="Componentes" onBack={() => openCatalog(false)}>
        <ComponentCatalog />
      </Screen>
    )
  }

  return (
    <Screen title="Más">
      <Section title="Aplicación">
        <p className="text-body">Versión {__APP_VERSION__}</p>
        {worksOffline && <p className="text-secondary">Lista para usar sin conexión</p>}
      </Section>
      <Section title="Componentes (temporal)">
        <p className="text-secondary">Las piezas base de la app, con sus estados.</p>
        <Button fullWidth onClick={() => openCatalog(true)}>
          Ver componentes
        </Button>
      </Section>
    </Screen>
  )
}
