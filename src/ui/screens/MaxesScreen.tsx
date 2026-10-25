import { Screen } from '../components/Screen.tsx'
import { MaxesTestPanel } from '../MaxesTestPanel.tsx'

// Usa el panel de prueba hasta que el paso 7 traiga la pantalla definitiva (CLAUDE.md §6.4).
export function MaxesScreen() {
  return (
    <Screen title="Máximos">
      <MaxesTestPanel />
    </Screen>
  )
}
