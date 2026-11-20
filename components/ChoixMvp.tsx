'use client'

import { useState } from 'react'
import { submitSpecialPick } from '@/app/pronostics/actions'
import { POSTES, JOUEURS, type Poste } from '@/lib/joueursMvp'
import { getCouleurEquipe, estCouleurClaire } from '@/lib/teamColors'

function posteDe(nom: string): Poste | null {
  return POSTES.find((p) => JOUEURS[p].some((j) => j.nom === nom)) ?? null
}

/*
 * Choix du MVP : un onglet par poste (QB, WR, RB, TE) avec la liste des joueurs,
 * ou un nom écrit à la main. Même enregistrement qu'avant (submitSpecialPick).
 */
export default function ChoixMvp({ saisonId, choixActuel }: { saisonId: string; choixActuel?: string }) {
  const posteInitial = choixActuel ? posteDe(choixActuel) : null
  const [poste, setPoste] = useState<Poste>(posteInitial ?? 'QB')
  const [choisi, setChoisi] = useState<string>(posteInitial ? (choixActuel as string) : '')
  const [saisie, setSaisie] = useState<string>(choixActuel && !posteInitial ? choixActuel : '')

  // Le nom écrit à la main remplace la sélection dans la liste (comme avant)
  const valeur = saisie.trim() || choisi
  const inchange = valeur !== '' && valeur === choixActuel

  return (
    <form action={submitSpecialPick} style={{ marginTop: 10, textAlign: 'left' }}>
      <input type="hidden" name="type" value="mvp" />
      <input type="hidden" name="saison_id" value={saisonId} />
      <input type="hidden" name="choix" value={valeur} />

      <div role="tablist" aria-label="Poste du joueur" style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {POSTES.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={poste === p}
            onClick={() => setPoste(p)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: poste === p ? '#C8352E' : '#0B1426',
              color: poste === p ? '#fff' : '#9fb0c9',
              border: poste === p ? '1px solid #C8352E' : '1px solid #33415a',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          maxHeight: 280,
          overflowY: 'auto',
          padding: 2,
        }}
      >
        {JOUEURS[poste].map(({ nom, equipe }) => {
          const actif = !saisie.trim() && choisi === nom
          const { primary } = getCouleurEquipe(equipe)
          return (
            <button
              key={nom}
              type="button"
              aria-pressed={actif}
              onClick={() => {
                setChoisi(nom)
                setSaisie('')
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 14,
                textAlign: 'left',
                cursor: 'pointer',
                background: actif ? 'rgba(200,53,46,0.22)' : '#16233F',
                color: 'white',
                border: actif ? '1px solid #C8352E' : '1px solid #33415a',
              }}
            >
              <span
                aria-label={equipe ? `Équipe : ${equipe}` : undefined}
                style={{
                  minWidth: 46,
                  padding: '6px 0',
                  borderRadius: 6,
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  background: equipe ? primary : 'transparent',
                  color: equipe && estCouleurClaire(primary) ? '#0B1426' : '#fff',
                  border: equipe ? 'none' : '1px dashed #33415a',
                }}
              >
                {equipe || '—'}
              </span>
              <span style={{ flex: 1, fontWeight: 600 }}>{nom}</span>
              <span style={{ fontSize: 12, color: '#9fb0c9' }}>{poste}</span>
            </button>
          )
        })}
      </div>

      <label style={{ display: 'block', fontSize: 12, color: '#9fb0c9', margin: '12px 0 4px' }}>
        Ou écris le nom d&apos;un autre joueur
      </label>
      <input
        type="text"
        value={saisie}
        onChange={(e) => setSaisie(e.target.value)}
        maxLength={60}
        placeholder="Nom complet"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: '#0B1426',
          color: 'white',
          border: '1px solid #33415a',
          borderRadius: 8,
          padding: 8,
          fontSize: 14,
        }}
      />

      <p style={{ fontSize: 13, margin: '12px 0 8px', textAlign: 'center', minHeight: 18 }}>
        {valeur ? (
          <>
            Ton choix : <strong>{valeur}</strong>
          </>
        ) : (
          <span style={{ color: '#9fb0c9' }}>Choisis un joueur ou écris un nom</span>
        )}
      </p>

      <div style={{ textAlign: 'center' }}>
        <button
          type="submit"
          disabled={!valeur || inchange}
          style={{
            padding: '9px 24px',
            borderRadius: 8,
            border: 'none',
            background: !valeur || inchange ? '#33415a' : '#C8352E',
            color: !valeur || inchange ? '#9fb0c9' : '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: !valeur || inchange ? 'default' : 'pointer',
          }}
        >
          {inchange ? 'Choix enregistré' : 'Valider'}
        </button>
      </div>
    </form>
  )
}