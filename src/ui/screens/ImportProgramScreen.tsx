import { useState } from 'react'
import { formatCount } from '../../domain/format.ts'
import type { ImportPlan, ParseResult } from '../../domain/programFile.ts'
import { summarizeProgram } from '../../domain/programFile.ts'
import { Button } from '../components/Button.tsx'
import { Screen } from '../components/Screen.tsx'
import { Section } from '../components/Section.tsx'

/** Lo leído del archivo elegido, antes de guardar nada. */
export interface ImportPreview {
  fileName: string
  result: ParseResult
  /** Solo si el archivo no tiene errores. */
  plan?: ImportPlan
  /** Ejercicios del archivo que ya estaban en el catálogo. */
  existingNames: string[]
}

const MAX_ERRORS = 30

/**
 * Revisión antes de guardar (CLAUDE.md §7): muestra qué se va a cargar o, si el
 * archivo tiene errores, cada uno con su ubicación. Mirar no guarda nada.
 */
export function ImportProgramScreen({
  preview,
  onConfirm,
  onCancel,
}: {
  preview: ImportPreview
  onConfirm: () => Promise<void>
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string>()
  const { result, plan } = preview

  async function handleConfirm() {
    setSaving(true)
    setSaveError(undefined)
    try {
      await onConfirm()
    } catch (error) {
      setSaveError(`No se pudo guardar: ${(error as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  if (!result.ok || !plan) {
    const errors = result.ok ? [] : result.errors
    return (
      <Screen title="Importar programa" onBack={onCancel}>
        <Section title="Archivo">
          <p className="text-secondary">{preview.fileName}</p>
        </Section>
        <Section title="No se puede importar">
          <p className="text-body">
            {errors.length === 1 ? 'El archivo tiene un error.' : `El archivo tiene ${errors.length} errores.`} No se
            guardó nada.
          </p>
          {errors.slice(0, MAX_ERRORS).map((error) => (
            <p key={error} className="text-error">
              {error}
            </p>
          ))}
          {errors.length > MAX_ERRORS && (
            <p className="text-secondary">Y {errors.length - MAX_ERRORS} más.</p>
          )}
          <Button fullWidth onClick={onCancel}>
            Volver
          </Button>
        </Section>
      </Screen>
    )
  }

  const summary = summarizeProgram(plan.program)
  const newNames = plan.newExercises.map((exercise) => exercise.name)

  return (
    <Screen title="Importar programa" onBack={onCancel}>
      <Section title="Archivo">
        <p className="text-secondary">{preview.fileName}</p>
      </Section>
      <Section title="Programa">
        <p className="text-body">{plan.program.name}</p>
        {plan.program.description && <p className="text-secondary">{plan.program.description}</p>}
        <p className="text-body">
          {[
            formatCount(summary.weeks, 'semana', 'semanas'),
            formatCount(summary.days, 'día', 'días'),
            formatCount(summary.exercises, 'ejercicio', 'ejercicios'),
            formatCount(summary.sets, 'serie', 'series'),
          ].join(' · ')}
        </p>
      </Section>
      <Section title={`Ejercicios nuevos en el catálogo (${newNames.length})`}>
        <p className="text-secondary">
          {newNames.length > 0 ? newNames.join(', ') : 'Ninguno: todos ya estaban en el catálogo.'}
        </p>
      </Section>
      {preview.existingNames.length > 0 && (
        <Section title={`Ya estaban en el catálogo (${preview.existingNames.length})`}>
          <p className="text-secondary">{preview.existingNames.join(', ')}</p>
        </Section>
      )}
      <Section>
        <p className="text-secondary">
          Se guarda como un programa nuevo. No cambia nada de lo que ya tenés.
        </p>
        <Button variant="primary" fullWidth disabled={saving} onClick={() => void handleConfirm()}>
          Guardar programa
        </Button>
        {saveError && (
          <p className="text-error" role="alert">
            {saveError}
          </p>
        )}
        <Button fullWidth disabled={saving} onClick={onCancel}>
          Cancelar
        </Button>
      </Section>
    </Screen>
  )
}
