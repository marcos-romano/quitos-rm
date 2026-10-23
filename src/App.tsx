import { UpdatePrompt } from './ui/UpdatePrompt.tsx'

function App() {
  return (
    <main className="home">
      <h1 className="home-title">quitos_RM</h1>
      <p className="home-version">Versión {__APP_VERSION__}</p>
      <UpdatePrompt />
    </main>
  )
}

export default App
