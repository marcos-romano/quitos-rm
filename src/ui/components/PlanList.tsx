import { ArrowDown, ArrowUp, ChevronRight, Copy, Trash2, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ConfirmDialog } from './ConfirmDialog.tsx'
import './components.css'

export interface PlanListItem {
  id: string
  title: string
  subtitle?: ReactNode
  /** Segunda línea secundaria, por ejemplo los ejercicios de un bloque. */
  detail?: string
}

/**
 * Lista del plan (programas, semanas, días, bloques): una fila por elemento,
 * separadas por líneas finas. Mirar no cambia nada; en modo "Editar" cada fila
 * muestra sus controles. Eliminar siempre pide confirmación.
 */
export function PlanList({
  items,
  editing,
  emptyText,
  onOpen,
  onMove,
  onDuplicate,
  onDelete,
  deleteTitle,
  deleteMessage,
}: {
  items: PlanListItem[]
  editing: boolean
  emptyText: string
  /** Sin `onOpen`, las filas no se pueden abrir. */
  onOpen?: (id: string) => void
  /** Sin `onMove`, no hay flechas para reordenar. */
  onMove?: (id: string, offset: -1 | 1) => void
  /** Sin `onDuplicate` ni `onDelete` (por ejemplo, en un buscador), no hay controles. */
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  deleteTitle?: (item: PlanListItem) => string
  deleteMessage?: string
}) {
  const [pendingDelete, setPendingDelete] = useState<PlanListItem>()

  if (items.length === 0) return <p className="text-secondary">{emptyText}</p>

  return (
    <>
      <ul className="plan-list">
        {items.map((item, index) => {
          const content = (
            <>
              <span className="plan-row-title">{item.title}</span>
              {item.subtitle && <span className="text-secondary">{item.subtitle}</span>}
              {item.detail && <span className="text-secondary">{item.detail}</span>}
            </>
          )
          return (
            <li key={item.id} className="plan-row">
              {onOpen ? (
                <button type="button" className="plan-row-main" onClick={() => onOpen(item.id)}>
                  {content}
                </button>
              ) : (
                <div className="plan-row-main">{content}</div>
              )}
              {editing ? (
                <div className="plan-row-actions">
                  {onMove && (
                    <>
                      <IconButton
                        icon={ArrowUp}
                        label={`Subir ${item.title}`}
                        disabled={index === 0}
                        onClick={() => onMove(item.id, -1)}
                      />
                      <IconButton
                        icon={ArrowDown}
                        label={`Bajar ${item.title}`}
                        disabled={index === items.length - 1}
                        onClick={() => onMove(item.id, 1)}
                      />
                    </>
                  )}
                  {onDuplicate && (
                    <IconButton icon={Copy} label={`Duplicar ${item.title}`} onClick={() => onDuplicate(item.id)} />
                  )}
                  {onDelete && (
                    <IconButton
                      icon={Trash2}
                      label={`Eliminar ${item.title}`}
                      destructive
                      onClick={() => setPendingDelete(item)}
                    />
                  )}
                </div>
              ) : (
                onOpen && <ChevronRight className="plan-row-chevron" size={20} strokeWidth={1.5} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ul>
      <ConfirmDialog
        open={pendingDelete !== undefined}
        title={pendingDelete && deleteTitle ? deleteTitle(pendingDelete) : ''}
        message={deleteMessage ?? ''}
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (pendingDelete) onDelete?.(pendingDelete.id)
          setPendingDelete(undefined)
        }}
        onCancel={() => setPendingDelete(undefined)}
      />
    </>
  )
}

function IconButton({
  icon: Icon,
  label,
  destructive = false,
  disabled = false,
  onClick,
}: {
  icon: LucideIcon
  label: string
  destructive?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={destructive ? 'icon-button icon-button-destructive' : 'icon-button'}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
    </button>
  )
}
