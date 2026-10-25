import { useRef, useState } from 'react'
import { db } from '../../db/appDb.ts'
import { listExercises } from '../../db/exercises.ts'
import { importProgram } from '../../db/programs.ts'
import { buildProgram, parseProgramFile } from '../../domain/programFile.ts'
import { Button } from '../components/Button.tsx'
import { Screen } from '../components/Screen.tsx'
import { Section } from '../components/Section.tsx'
import { ComponentCatalog } from '../ComponentCatalog.tsx'
import { ImportProgramScreen, type ImportPreview } from './ImportProgramScreen.tsx'

type View = 'main' | 'catalog' | 'import'

// Datos de la aplicación, importar un programa y el catálogo temporal de componentes.
// Más adelante suma el respaldo y los ajustes (CLAUDE.md §6.6 y §6.7).
export function MoreScreen({ worksOffline }: { worksOffline: boolean }) {
  const [view, setView] = useState<View>('main')
  const [preview, setPreview] = useState<ImportPreview>()
  const [notice, setNotice] = useState<string>()
  const fileInput = useRef<HTMLInputElement>(null)

  function open(next: View) {
    setView(next)
    window.scrollTo(0, 0)
  }

  /** Lee el archivo elegido y arma la revisión. Todavía no guarda nada. */
  async function handleFile(file: File) {
    const result = parseProgramFile(await file.text())
    const catalog = await listExercises(db)
    const plan = result.ok ? buildProgram(result.program, catalog) : undefined
    const newIds = new Set(plan?.newExercises.map((exercise) => exercise.id))
    const usedIds = new Set(
      plan?.program.weeks.flatMap((week) =>
        week.days.flatMap((day) => day.blocks.flatMap((block) => block.exercises.map((e) => e.exerciseId))),
      ),
    )
    const existingNames = catalog
      .filter((exercise) => usedIds.has(exercise.id) && !newIds.has(exercise.id))
      .map((exercise) => exercise.name)
    setPreview({ fileName: file.name, result, plan, existingNames })
    setNotice(undefined)
    open('import')
  }

  async function handleImport() {
    if (!preview?.result.ok) return
    const { program } = await importProgram(db, preview.result.program)
    setNotice(`Se guardó «${program.name}». Lo vas a ver en Programa cuando llegue el editor.`)
    setPreview(undefined)
    open('main')
  }

  if (view === 'catalog') {
    return (
      <Screen title="Componentes" onBack={() => open('main')}>
        <ComponentCatalog />
      </Screen>
    )
  }

  if (view === 'import' && preview) {
    return (
      <ImportProgramScreen
        preview={preview}
        onConfirm={handleImport}
        onCancel={() => {
          setPreview(undefined)
          open('main')
        }}
      />
    )
  }

  return (
    <Screen title="Más">
      <Section title="Programas">
        <p className="text-secondary">Cargá un programa desde un archivo. Antes de guardar, lo revisás.</p>
        <Button fullWidth onClick={() => fileInput.current?.click()}>
          Importar programa
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            // Se vacía para poder elegir el mismo archivo otra vez.
            event.target.value = ''
            if (file) void handleFile(file)
          }}
        />
        {notice && (
          <p className="text-body" role="status">
            {notice}
          </p>
        )}
      </Section>
      <Section title="Aplicación">
        <p className="text-body">Versión {__APP_VERSION__}</p>
        {worksOffline && <p className="text-secondary">Lista para usar sin conexión</p>}
      </Section>
      <Section title="Componentes (temporal)">
        <p className="text-secondary">Las piezas base de la app, con sus estados.</p>
        <Button fullWidth onClick={() => open('catalog')}>
          Ver componentes
        </Button>
      </Section>
    </Screen>
  )
}
