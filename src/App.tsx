import { useState } from 'react'
import { ComponentCatalog } from './ui/ComponentCatalog.tsx'
import { MaxesTestPanel } from './ui/MaxesTestPanel.tsx'
import { UpdatePrompt } from './ui/UpdatePrompt.tsx'

type View = 'panel' | 'catalog'

function App() {
  const [view, setView] = useState<View>('panel')

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">quitos_RM</h1>
        <p className="app-version">Versión {__APP_VERSION__}</p>
      </header>
      <div className="view-switch" role="group" aria-label="Pantalla">
        <button type="button" aria-pressed={view === 'panel'} onClick={() => setView('panel')}>
          Panel de prueba
        </button>
        <button type="button" aria-pressed={view === 'catalog'} onClick={() => setView('catalog')}>
          Componentes
        </button>
      </div>
      {view === 'panel' ? <MaxesTestPanel /> : <ComponentCatalog />}
      <UpdatePrompt />
    </main>
  )
}

export default App
