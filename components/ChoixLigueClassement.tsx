'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { COULEUR_PAR_DEFAUT } from '@/lib/couleursLigues'

type LigueMenu = { id: number; nom: string; couleur?: string | null }

/*
 * Menu déroulant « Ligues » de la page Classement.
 * Chaque ligue porte sa couleur (blanche par défaut). Le bouton « Général » est à part (dans la page).
 */
export default function ChoixLigueClassement({
  ligues,
  ligueActuelleId,
}: {
  ligues: LigueMenu[]
  ligueActuelleId: number | null
}) {
  const router = useRouter()
  const [ouvert, setOuvert] = useState(false)
  const boite = useRef<HTMLDivElement>(null)
  const actif = ligueActuelleId !== null
  const courante = ligues.find((l) => l.id === ligueActuelleId)

  // Ferme le menu quand on touche ailleurs
  useEffect(() => {
    if (!ouvert) return
    const fermer = (e: Event) => {
      if (boite.current && !boite.current.contains(e.target as Node)) setOuvert(false)
    }
    document.addEventListener('mousedown', fermer)
    document.addEventListener('touchstart', fermer)
    return () => {
      document.removeEventListener('mousedown', fermer)
      document.removeEventListener('touchstart', fermer)
    }
  }, [ouvert])

  return (
    <div ref={boite} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Choisir une ligue"
        aria-expanded={ouvert}
        onClick={() => setOuvert(!ouvert)}
        style={{
          padding: '7px 14px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          maxWidth: 220,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          background: actif ? 'rgba(200,53,46,0.2)' : 'rgba(255,255,255,0.04)',
          border: actif ? '1px solid rgba(200,53,46,0.6)' : '1px solid rgba(255,255,255,0.15)',
          color: actif ? 'white' : 'rgba(255,255,255,0.7)',
        }}
      >
        {courante && (
          <span style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: courante.couleur ?? COULEUR_PAR_DEFAUT }} />
        )}
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {courante ? courante.nom : 'Mes ligues'}
        </span>
        <span>▾</span>
      </button>

      {ouvert && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            minWidth: 200,
            maxWidth: 280,
            maxHeight: 320,
            overflowY: 'auto',
            background: '#16233F',
            border: '1px solid #33415a',
            borderRadius: 10,
            textAlign: 'left',
          }}
        >
          {ligues.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setOuvert(false)
                router.push(`/classement?ligue=${l.id}`)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                background: l.id === ligueActuelleId ? 'rgba(200,53,46,0.18)' : 'transparent',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                borderLeft: `4px solid ${l.couleur ?? COULEUR_PAR_DEFAUT}`,
                borderBottom: '1px solid #22304d',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, background: l.couleur ?? COULEUR_PAR_DEFAUT, border: '1px solid rgba(255,255,255,0.4)' }} />
              <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.nom}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}