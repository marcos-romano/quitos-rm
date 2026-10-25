/** Aviso fijo sobre la navegación cuando hay una versión nueva (ver usePwa). */
export function UpdatePrompt({ onUpdate }: { onUpdate: () => void }) {
  return (
    <div className="update-prompt" role="status">
      <span>Nueva versión disponible</span>
      <button type="button" className="button-primary" onClick={onUpdate}>
        Actualizar
      </button>
    </div>
  )
}
