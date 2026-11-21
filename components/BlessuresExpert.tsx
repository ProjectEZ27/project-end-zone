'use client'

import { useState } from 'react'
import { NOMS_EQUIPES } from '@/lib/teamBadge'
import type { LigneBlessures, JoueurBlesse } from '@/lib/blessures'

const OR = '#f0c040'

const FILTRES = [
  { cle: 'tous', libelle: 'Tous' },
  { cle: 'nouveau', libelle: 'Nouveaux' },
  { cle: 'reste', libelle: 'Déjà blessés' },
  { cle: 'retour', libelle: 'Retours' },
  { cle: 'incertain', libelle: 'Incertains' },
] as const

const STATUT_TEXTE: Record<JoueurBlesse['statut'], string> = {
  out: 'Écarté',
  doubtful: 'Incertain',
  questionable: 'Incertain',
  retour: 'De retour',
}
const STATUT_COULEUR: Record<JoueurBlesse['statut'], { fond: string; texte: string }> = {
  out: { fond: 'rgba(255,107,95,0.15)', texte: '#ff6b5f' },
  doubtful: { fond: 'rgba(240,192,64,0.15)', texte: '#f0c040' },
  questionable: { fond: 'rgba(240,192,64,0.15)', texte: '#f0c040' },
  retour: { fond: 'rgba(78,232,146,0.15)', texte: '#4ee892' },
}
const INFO_TYPE: Record<JoueurBlesse['type'], string> = {
  nouveau: 'Nouveau cette semaine',
  reste: 'Déjà sur la liste la semaine dernière',
  retour: "N'a plus de statut cette semaine",
}

function garde(j: JoueurBlesse, filtre: string) {
  if (filtre === 'tous') return true
  if (filtre === 'incertain') return j.statut === 'doubtful' || j.statut === 'questionable'
  return j.type === filtre
}

export default function BlessuresExpert({ lignes }: { lignes: LigneBlessures[] }) {
  const [filtre, setFiltre] = useState<string>('tous')
  const [ouvertes, setOuvertes] = useState<Record<string, boolean>>({})
  const nom = (c: string) => NOMS_EQUIPES[c] ?? c

  const equipes = [...lignes]
    .map((l) => ({ ...l, visibles: l.joueurs.filter((j) => garde(j, filtre)) }))
    .filter((l) => l.visibles.length > 0)
    .sort((a, b) => nom(a.equipe).localeCompare(nom(b.equipe), 'fr'))

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {FILTRES.map((f) => {
          const actif = filtre === f.cle
          return (
            <button
              key={f.cle}
              onClick={() => setFiltre(f.cle)}
              aria-pressed={actif}
              style={{
                padding: '7px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: `1px solid ${actif ? OR : '#33415a'}`,
                background: actif ? OR : 'rgba(22,35,63,0.8)',
                color: actif ? '#0b1220' : '#9fb0c9',
              }}
            >
              {f.libelle}
            </button>
          )
        })}
      </div>

      {equipes.length === 0 && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          Aucun joueur dans cette catégorie pour le moment.
        </p>
      )}

      {equipes.map((e) => {
        const ouverte = !!ouvertes[e.equipe]
        return (
          <div
            key={e.equipe}
            style={{
              border: '1px solid #2a3552',
              borderRadius: 12,
              marginBottom: 8,
              background: 'rgba(22,35,63,0.8)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setOuvertes((o) => ({ ...o, [e.equipe]: !o[e.equipe] }))}
              aria-expanded={ouverte}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: 44,
              }}
            >
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{nom(e.equipe)}</span>
              <span style={{ fontSize: 12, color: '#9fb0c9' }}>
                {e.visibles.length} {e.visibles.length > 1 ? 'joueurs' : 'joueur'}
              </span>
              <span aria-hidden="true" style={{ color: '#9fb0c9', fontSize: 12 }}>{ouverte ? '▲' : '▼'}</span>
            </button>
            {ouverte && (
              <div style={{ padding: '0 14px 6px', borderTop: '1px solid #2a3552' }}>
                {e.visibles.map((j, i) => {
                  const c = STATUT_COULEUR[j.statut]
                  return (
                    <div
                      key={`${j.nom}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 0',
                        borderTop: i === 0 ? 'none' : '1px solid #2a3552',
                      }}
                    >
                      <span style={{ minWidth: 30, fontSize: 12, fontWeight: 700, color: '#9fb0c9', paddingTop: 2 }}>{j.poste}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                          {j.nom}
                          {j.type === 'nouveau' && (
                            <span style={{ fontSize: 11, color: OR, marginLeft: 6, fontWeight: 600 }}>nouveau</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#9fb0c9', marginTop: 2, lineHeight: 1.4 }}>
                          {j.blessure}
                          {j.entrainement ? ` · ${j.entrainement}` : ''}
                          <br />
                          {INFO_TYPE[j.type]}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          whiteSpace: 'nowrap',
                          background: c.fond,
                          color: c.texte,
                        }}
                      >
                        {STATUT_TEXTE[j.statut]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}