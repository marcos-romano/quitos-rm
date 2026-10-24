import { useEffect, useId, useRef } from 'react'
import { Button } from './Button.tsx'
import './components.css'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  /** Rojo para acciones destructivas (eliminar); azul para el resto. */
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Cuadro de confirmación (DISENO.md §5): panel sobre un velo negro al 60%.
 * Arranca con "Cancelar" seleccionado, para que un toque apurado no borre nada.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const messageId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)

  useEffect(() => {
    onCancelRef.current = onCancel
  })

  // Solo al abrirse: selecciona "Cancelar" y permite cerrar con la tecla Escape.
  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancelRef.current()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  if (!open) return null

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="dialog-title">
          {title}
        </h2>
        <p id={messageId} className="text-body">
          {message}
        </p>
        <div className="dialog-actions">
          <Button ref={cancelRef} onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant={destructive ? 'destructive' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
