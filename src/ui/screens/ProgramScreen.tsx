import { Screen } from '../components/Screen.tsx'
import { Section } from '../components/Section.tsx'

// Provisoria hasta las tandas 4.4 y 4.5, que traen el editor del plan (CLAUDE.md §6.2).
export function ProgramScreen() {
  return (
    <Screen title="Programa">
      <Section>
        <p className="text-secondary">
          Llega en las próximas tandas del paso 4. Acá vas a armar tu plan: semanas, días,
          bloques, ejercicios y series.
        </p>
      </Section>
    </Screen>
  )
}
