import { useState } from 'react'
import { DesignSample } from './ui/DesignSample.tsx'
import { MaxesTestPanel } from './ui/MaxesTestPanel.tsx'
import { UpdatePrompt } from './ui/UpdatePrompt.tsx'

type View = 'panel' | 'sample'

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
        <button type="button" aria-pressed={view === 'sample'} onClick={() => setView('sample')}>
          Muestra de diseño
        </button>
      </div>
      {view === 'panel' ? <MaxesTestPanel /> : <DesignSample />}
      <UpdatePrompt />
    </main>
  )
}

export default App
