'use client'

import { useState } from 'react'
import { choisirCouleurLigue } from '@/app/leagues/epingles'
import { COULEURS_LIGUES, COULEUR_PAR_DEFAUT, HAUTEUR_BANDEAU } from '@/lib/couleursLigues'

/*
 * Bandeau de couleur en haut d'une carte de ligue : c'est aussi le bouton.
 * Un clic ouvre les couleurs ; la couleur choisie apparaît ici et dans le menu du Classement.
 */
export default function BoutonCouleurLigue({ ligueId, couleur }: { ligueId: number; couleur: string | null }) {
  const [ouvert, setOuvert] = useState(false)
  const actuelle = couleur ?? COULEUR_PAR_DEFAUT
  const point: React.CSSProperties = { width: 4, height: 4, borderRadius: '50%', background: '#0B1220', opacity: 0.5 }

  return (
    <>
      <button
        type="button"
        aria-label="Choisir la couleur de la ligue"
        title="Couleur de la ligue"
        onClick={() => setOuvert(!ouvert)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: HAUTEUR_BANDEAU,
          padding: 0,
          border: 'none',
          background: actuelle,
          borderRadius: '10px 10px 0 0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          zIndex: 2,
        }}
      >
        <i style={point} />
        <i style={point} />
        <i style={point} />
      </button>
      {ouvert && (
        <div
          style={{
            position: 'absolute',
            top: HAUTEUR_BANDEAU + 6,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            width: 124,
            padding: 8,
            background: '#0B1220',
            border: '1px solid #33415a',
            borderRadius: 10,
          }}
        >
          {COULEURS_LIGUES.map((c) => (
            <form key={c.code} action={choisirCouleurLigue} onSubmit={() => setOuvert(false)}>
              <input type="hidden" name="ligueId" value={ligueId} />
              <input type="hidden" name="couleur" value={c.code} />
              <button
                type="submit"
                aria-label={c.nom}
                title={c.nom}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: c.code,
                  border: c.code === actuelle ? '2px solid #E8544C' : '1px solid rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            </form>
          ))}
        </div>
      )}
    </>
  )
}