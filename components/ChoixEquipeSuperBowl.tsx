'use client'

import { useState } from 'react'
import { TbCheck } from 'react-icons/tb'
import { submitSpecialPick } from '@/app/pronostics/actions'
import { NOMS_EQUIPES } from '@/lib/teamBadge'
import { getCouleurEquipe, estCouleurClaire } from '@/lib/teamColors'

const EQUIPES_NFL = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LA','LAC','LV','MIA','MIN','NE','NO','NYG','NYJ',
  'PHI','PIT','SEA','SF','TB','TEN','WAS',
]

/*
 * Choix du vainqueur du Super Bowl : les 32 équipes en rectangles aux couleurs de leur équipe.
 * Un clic sélectionne, « Valider » enregistre (même enregistrement qu'avant : submitSpecialPick).
 */
export default function ChoixEquipeSuperBowl({
  saisonId,
  type,
  choixActuel,
}: {
  saisonId: string
  type: 'super_bowl_preseason' | 'super_bowl_avant_playoffs'
  choixActuel?: string
}) {
  const [choisie, setChoisie] = useState<string | null>(
    choixActuel && EQUIPES_NFL.includes(choixActuel) ? choixActuel : null
  )

  const inchange = choisie !== null && choisie === choixActuel

  return (
    <form action={submitSpecialPick} style={{ marginTop: 10 }}>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="saison_id" value={saisonId} />
      <input type="hidden" name="choix" value={choisie ?? ''} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
        {EQUIPES_NFL.map((code) => {
          const { primary, secondary } = getCouleurEquipe(code)
          const claire = estCouleurClaire(primary)
          const active = choisie === code
          return (
            <button
              key={code}
              type="button"
              onClick={() => setChoisie(code)}
              aria-pressed={active}
              aria-label={NOMS_EQUIPES[code] ?? code}
              style={{
                position: 'relative',
                padding: '12px 0',
                borderRadius: 8,
                background: primary,
                color: claire ? '#0B1426' : '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                border: active ? '2px solid #fff' : `1px solid ${secondary}55`,
                boxShadow: active ? '0 0 0 2px rgba(255,255,255,0.25)' : 'none',
                opacity: choisie && !active ? 0.55 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {code}
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    top: -7,
                    right: -7,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    color: '#0B1426',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TbCheck size={12} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p style={{ fontSize: 13, margin: '12px 0 8px', minHeight: 18 }}>
        {choisie ? (
          <>
            Ton choix : <strong>{NOMS_EQUIPES[choisie] ?? choisie}</strong>
          </>
        ) : (
          <span style={{ color: '#9fb0c9' }}>Touche une équipe pour la choisir</span>
        )}
      </p>

      <button
        type="submit"
        disabled={!choisie || inchange}
        style={{
          padding: '9px 24px',
          borderRadius: 8,
          border: 'none',
          background: !choisie || inchange ? '#33415a' : '#C8352E',
          color: !choisie || inchange ? '#9fb0c9' : '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: !choisie || inchange ? 'default' : 'pointer',
        }}
      >
        {inchange ? 'Choix enregistré' : 'Valider'}
      </button>
    </form>
  )
}