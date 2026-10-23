import { MaxesTestPanel } from './ui/MaxesTestPanel.tsx'
import { UpdatePrompt } from './ui/UpdatePrompt.tsx'

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">quitos_RM</h1>
        <p className="app-version">Versión {__APP_VERSION__}</p>
      </header>
      <MaxesTestPanel />
      <UpdatePrompt />
    </main>
  )
}

export default App
