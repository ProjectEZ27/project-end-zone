'use client'

import { useState } from 'react'
import { NOMS_EQUIPES } from '@/lib/teamBadge'

export type LigneExpert = {
  equipe: string
  derniere_semaine: number
  mis_a_jour?: string
  valeurs: Record<string, number>
  rangs: Record<string, number>
}

// Mesures du classement expert. haut = true : plus la valeur est haute, meilleure est l'équipe
const CATEGORIES = [
  { cle: 'global', libelle: 'Global' },
  { cle: 'passe_att', libelle: 'Attaque aérienne', unite: 'pts gagnés par passe', format: 'efficacite' },
  { cle: 'course_att', libelle: 'Attaque au sol', unite: 'yards par course', format: 'nombre' },
  { cle: 'passe_def', libelle: 'Défense aérienne', unite: 'pts concédés par passe', format: 'efficacite' },
  { cle: 'course_def', libelle: 'Défense au sol', unite: 'yards concédés par course', format: 'nombre' },
  { cle: 'pression_inf', libelle: 'Pression QB', unite: 'sacks + coups sur le QB par match', format: 'nombre' },
  { cle: 'pression_sub', libelle: 'Protection QB', unite: 'sacks + coups subis par match', format: 'nombre' },
] as const

const MESURES_GLOBAL = ['passe_att', 'course_att', 'passe_def', 'course_def', 'pression_inf', 'pression_sub']
const COLONNES = [
  ['passe_att', 'Att. aérienne'],
  ['course_att', 'Att. au sol'],
  ['passe_def', 'Déf. aérienne'],
  ['course_def', 'Déf. au sol'],
  ['pression_inf', 'Pression'],
  ['pression_sub', 'Protection'],
] as const

function formater(v: number, format?: string) {
  if (format === 'efficacite') return `${v > 0 ? '+' : ''}${v.toFixed(2)}`
  return v.toFixed(1)
}

function couleurRang(r: number) {
  const k = (r - 1) / 31
  const rouge = Math.round(78 + (255 - 78) * k)
  const vert = Math.round(232 + (107 - 232) * k)
  const bleu = Math.round(146 + (95 - 146) * k)
  return `rgba(${rouge},${vert},${bleu},0.22)`
}

const OR = '#f0c040'

export default function ClassementExpert({ lignes }: { lignes: LigneExpert[] }) {
  const [vue, setVue] = useState<'liste' | 'tableau'>('liste')
  const [cat, setCat] = useState<string>('global')
  const [ouverte, setOuverte] = useState<string | null>(null)

  const moyenne = (l: LigneExpert) => MESURES_GLOBAL.reduce((s, m) => s + l.rangs[m], 0) / MESURES_GLOBAL.length
  const parGlobal = [...lignes].sort((a, b) => moyenne(a) - moyenne(b))
  const nom = (c: string) => NOMS_EQUIPES[c] ?? c

  const boutonVue = (cle: 'liste' | 'tableau', texte: string) => (
    <button
      type="button"
      onClick={() => setVue(cle)}
      style={{
        flex: 1,
        padding: '9px 4px',
        borderRadius: 10,
        border: `1px solid ${vue === cle ? '#C8352E' : '#33415a'}`,
        background: vue === cle ? '#C8352E' : '#16233f',
        color: vue === cle ? 'white' : '#9fb0c9',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {texte}
    </button>
  )

  const categorie = CATEGORIES.find((c) => c.cle === cat)!
  const tri =
    cat === 'global'
      ? parGlobal.map((l, i) => ({ l, rang: i + 1, texte: `moy. ${moyenne(l).toFixed(1)}`, p: 100 - i * 3 }))
      : [...lignes]
          .sort((a, b) => a.rangs[cat] - b.rangs[cat])
          .map((l) => ({
            l,
            rang: l.rangs[cat],
            texte: formater(l.valeurs[cat], 'format' in categorie ? categorie.format : undefined),
            p: 100 - (l.rangs[cat] - 1) * 3,
          }))

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {boutonVue('liste', 'Par catégorie')}
        {boutonVue('tableau', 'Tableau complet')}
      </div>

      {vue === 'liste' ? (
        <>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 4 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.cle}
                type="button"
                onClick={() => setCat(c.cle)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 11px',
                  borderRadius: 16,
                  border: `1px solid ${cat === c.cle ? OR : '#33415a'}`,
                  background: cat === c.cle ? OR : '#16233f',
                  color: cat === c.cle ? '#0b1220' : '#9fb0c9',
                  fontWeight: cat === c.cle ? 700 : 400,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {c.libelle}
              </button>
            ))}
          </div>
          {'unite' in categorie && (
            <p style={{ fontSize: 11, color: '#9fb0c9', margin: '0 0 8px', textAlign: 'left' }}>{categorie.unite}</p>
          )}
          {tri.map(({ l, rang, texte, p }) => {
            const ouvert = ouverte === l.equipe
            return (
              <div
                key={l.equipe}
                onClick={() => setOuverte(ouvert ? null : l.equipe)}
                style={{
                  background: '#16233f',
                  border: '1px solid #33415a',
                  borderRadius: 10,
                  padding: '8px 10px',
                  marginBottom: 6,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 26, textAlign: 'center', fontWeight: 800, color: OR }}>{rang}</span>
                  <b style={{ width: 42 }}>{l.equipe}</b>
                  <div style={{ flex: 1, height: 4, borderRadius: 3, background: '#26344f' }}>
                    <div style={{ width: `${Math.max(p, 4)}%`, height: '100%', borderRadius: 3, background: OR }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 12, minWidth: 62, textAlign: 'right' }}>{texte}</span>
                </div>
                {ouvert && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: '#9fb0c9', marginBottom: 6 }}>{nom(l.equipe)} · rang sur 32</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
                      {COLONNES.map(([m, lib]) => (
                        <div key={m} style={{ borderRadius: 8, background: couleurRang(l.rangs[m]), padding: 6, textAlign: 'center', fontSize: 10, color: '#c9d3e4' }}>
                          {lib}
                          <b style={{ display: 'block', fontSize: 14, color: 'white' }}>{l.rangs[m]}e</b>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <p style={{ fontSize: 11, color: '#9fb0c9', lineHeight: 1.5, marginTop: 8, textAlign: 'left' }}>
            Touche une équipe pour voir tous ses rangs. « Points gagnés par passe » = ce que rapporte en moyenne chaque jeu de passe : plus c&apos;est haut, mieux c&apos;est pour l&apos;attaque. Pour la défense et la protection, plus c&apos;est bas, mieux c&apos;est.
          </p>
        </>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 430, borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px 5px', textAlign: 'left', color: OR, fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid #26344f' }}>Équipe</th>
                  {COLONNES.map(([m, lib]) => (
                    <th key={m} style={{ padding: '6px 5px', color: OR, fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid #26344f' }}>{lib}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parGlobal.map((l) => (
                  <tr key={l.equipe}>
                    <td style={{ padding: '6px 5px', borderBottom: '1px solid #26344f', textAlign: 'left' }}><b>{l.equipe}</b></td>
                    {COLONNES.map(([m]) => (
                      <td key={m} style={{ padding: '6px 5px', borderBottom: '1px solid #26344f', textAlign: 'center', background: couleurRang(l.rangs[m]) }}>
                        {l.rangs[m]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: '#9fb0c9', lineHeight: 1.5, marginTop: 8, textAlign: 'left' }}>
            Vert = très fort, rouge = faible. Les équipes sont rangées par moyenne de leurs 6 rangs. Sur mobile, fais défiler le tableau de côté.
          </p>
        </>
      )}
    </div>
  )
}