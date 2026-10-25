import { Screen } from '../components/Screen.tsx'
import { Section } from '../components/Section.tsx'

// Provisoria hasta el paso 6 (CLAUDE.md §6.1).
export function HomeScreen() {
  return (
    <Screen title="quitos_RM">
      <Section>
        <p className="text-secondary">
          Llega en el paso 6. Acá va a estar el botón con la semana y el día que te toca entrenar,
          y la cuadrícula con todo el programa.
        </p>
      </Section>
    </Screen>
  )
}
