'use client'

import { useState } from 'react'
import { choisirCouleurLigue } from '@/app/leagues/epingles'
import { COULEURS_LIGUES, COULEUR_PAR_DEFAUT } from '@/lib/couleursLigues'

/*
 * Bouton « palette » d'une carte de ligue : ouvre les couleurs au clic.
 * La couleur choisie apparaît sur la carte et dans le menu du Classement.
 */
export default function BoutonCouleurLigue({ ligueId, couleur }: { ligueId: number; couleur: string | null }) {
  const [ouvert, setOuvert] = useState(false)
  const actuelle = couleur ?? COULEUR_PAR_DEFAUT

  return (
    <>
      <button
        type="button"
        aria-label="Choisir la couleur de la ligue"
        title="Couleur de la ligue"
        onClick={() => setOuvert(!ouvert)}
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: `1px solid ${ouvert ? '#fff' : '#33415a'}`,
          background: 'rgba(22,35,63,0.95)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: actuelle, border: '1px solid rgba(255,255,255,0.5)' }} />
      </button>
      {ouvert && (
        <div style={{ flexBasis: '100%', display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 6 }}>
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