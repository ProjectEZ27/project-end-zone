'use client'

import { usePathname, useRouter } from 'next/navigation'
import { TbArrowLeft } from 'react-icons/tb'

// Pages principales (barre du bas) et connexion : pas de bouton retour
const SANS_RETOUR = ['/', '/pronostics', '/classement', '/profile', '/regles', '/login']

export default function BoutonRetour() {
  const router = useRouter()
  const pathname = usePathname()

  if (SANS_RETOUR.includes(pathname)) return null

  function retour() {
    // Si on arrive directement sur la page (pas d'historique), on retourne à l'accueil
    if (window.history.length > 1) router.back()
    else router.push('/')
  }

  return (
    <button
      type="button"
      aria-label="Retour"
      onClick={retour}
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 200,
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '1px solid #33415a',
        background: 'rgba(22,35,63,0.92)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <TbArrowLeft size={20} />
    </button>
  )
}