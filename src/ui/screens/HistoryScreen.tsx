import { Screen } from '../components/Screen.tsx'
import { Section } from '../components/Section.tsx'

// Provisoria hasta el paso 7 (CLAUDE.md §6.5).
export function HistoryScreen() {
  return (
    <Screen title="Historial">
      <Section>
        <p className="text-secondary">
          Llega en el paso 7. Acá vas a ver cada entrenamiento terminado, con lo que hiciste, el
          RPE y las notas.
        </p>
      </Section>
    </Screen>
  )
}
