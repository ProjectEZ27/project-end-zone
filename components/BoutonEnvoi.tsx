'use client'

import { useFormStatus } from 'react-dom'

/**
 * Bouton d'envoi de formulaire qui se bloque pendant l'envoi :
 * un double appui ne crée plus deux fois la même chose.
 */
export default function BoutonEnvoi({
  texte,
  texteEnCours,
  style,
}: {
  texte: string
  texteEnCours: string
  style?: React.CSSProperties
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      style={{ ...style, opacity: pending ? 0.6 : 1, cursor: pending ? 'wait' : 'pointer' }}
    >
      {pending ? texteEnCours : texte}
    </button>
  )
}