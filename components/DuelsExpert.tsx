'use client'

import { useEffect, useState, type ReactNode } from 'react'
import IconeInfo from '@/components/IconeInfo'
import { formaterMajExpert } from '@/lib/majExpert'

export type StatsEquipe = {
  equipe: string
  derniere_semaine: number
  mis_a_jour?: string
  valeurs: Record<string, number>
  rangs: Record<string, number>
}

type Duel = {
  titre: (att: string, def: string) => string
  sousTitre: string
  cleAtt: string
  cleDef: string
  libelleAtt: string
  libelleDef: string
  court: string
}

const DUELS: Duel[] = [
  { titre: (a, d) => `🏈 Passe ${a} contre défense aérienne ${d}`, sousTitre: 'Efficacité des passes', cleAtt: 'passe_att', cleDef: 'passe_def', libelleAtt: 'attaque', libelleDef: 'défense', court: 'la passe' },
  { titre: (a, d) => `🏃 Course ${a} contre défense de course ${d}`, sousTitre: 'Yards par course', cleAtt: 'course_att', cleDef: 'course_def', libelleAtt: 'attaque', libelleDef: 'défense', court: 'la course' },
  { titre: (a, d) => `🛡️ Protection du QB de ${a} contre pression de ${d}`, sousTitre: 'Sacks et coups sur le QB subis / infligés', cleAtt: 'pression_sub', cleDef: 'pression_inf', libelleAtt: 'protection', libelleDef: 'pression', court: 'la protection du QB' },
  { titre: (a, d) => `🎯 Receveurs de ${a} contre secondaire de ${d}`, sousTitre: 'Yards par cible', cleAtt: 'wr_off', cleDef: 'wr_conc', libelleAtt: 'receveurs', libelleDef: 'secondaire', court: 'les receveurs' },
]

const rang = (n: number) => (n === 1 ? '1er' : `${n}e`)
const SEUIL = 4 // écart de rang à partir duquel on parle d'avantage

type Resultat = {
  titre: string
  sousTitre: string
  rangAtt: number
  rangDef: number
  libelleAtt: string
  libelleDef: string
  codeAtt: string
  codeDef: string
  ecart: number // positif = avantage pour l'équipe qui attaque
  court: string
}

function calculer(att: StatsEquipe, def: StatsEquipe): Resultat[] {
  return DUELS.map((d) => {
    const rAtt = att.rangs[d.cleAtt]
    const rDef = def.rangs[d.cleDef]
    return {
      titre: d.titre(att.equipe, def.equipe),
      sousTitre: d.sousTitre,
      rangAtt: rAtt,
      rangDef: rDef,
      libelleAtt: d.libelleAtt,
      libelleDef: d.libelleDef,
      codeAtt: att.equipe,
      codeDef: def.equipe,
      ecart: rDef - rAtt, // rang 1 = meilleur : un rang plus petit que l'adversaire = avantage
      court: d.court,
    }
  })
}

function resume(duels: Resultat[], s1: StatsEquipe, s2: StatsEquipe): string {
  const phrases: string[] = []
  const plusNet = [...duels].sort((a, b) => Math.abs(b.ecart) - Math.abs(a.ecart))[0]
  if (plusNet && Math.abs(plusNet.ecart) >= SEUIL) {
    const gagnant = plusNet.ecart > 0 ? plusNet.codeAtt : plusNet.codeDef
    phrases.push(`Le duel le plus déséquilibré : ${plusNet.court}, avec un net avantage pour ${gagnant} (${rang(plusNet.rangAtt)} contre ${rang(plusNet.rangDef)}).`)
  } else {
    phrases.push('Duels très équilibrés : aucun avantage net d\'un côté.')
  }
  for (const s of [s1, s2]) {
    const f = s.rangs.forme_passe_3
    if (f <= 8) phrases.push(`${s.equipe} est en forme à la passe sur ses 3 derniers matchs (${rang(f)} de la ligue).`)
    else if (f >= 25) phrases.push(`${s.equipe} peine à la passe sur ses 3 derniers matchs (${rang(f)} de la ligue).`)
  }
  return phrases.join(' ')
}

// Couleurs identiques pour toutes les équipes (lisibles sur le fond sombre)
const CLAIR = '#E4ECFA' // partie de celui qui attaque
const SOMBRE = '#4A5A82' // partie de celui qui défend
const OR = '#f0c040' // même doré que le bouton « Duels expert »

const rond = (couleur: string, cote: 'gauche' | 'droite') => (
  <span
    style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: couleur,
      [cote === 'gauche' ? 'marginRight' : 'marginLeft']: 5,
    }}
  />
)

// Bandeau doré qui ouvre chaque série de 4 duels. Avant la 2e série : un trait doré épais en plus.
function EnTeteSerie({ att, def, premier }: { att: string; def: string; premier: boolean }) {
  return (
    <>
      {!premier && <div style={{ height: 4, borderRadius: 2, background: OR, margin: '22px 0 12px' }} />}
      <div
        style={{
          marginTop: premier ? 10 : 0,
          background: OR,
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#2e2200' }}>{att} attaque</span>
        <span style={{ fontSize: 10, color: '#4a3800' }}>face à la défense de {def}</span>
      </div>
    </>
  )
}

function DuelLigne({ d, premier }: { d: Resultat; premier: boolean }) {
  const fAtt = 33 - d.rangAtt
  const fDef = 33 - d.rangDef
  // Limité entre 6 et 94 % pour que les deux parties restent toujours visibles
  const pctAtt = Math.min(94, Math.max(6, Math.round((fAtt / (fAtt + fDef)) * 100)))
  const equilibre = Math.abs(d.ecart) < SEUIL
  const gagnant = d.ecart > 0 ? d.codeAtt : d.codeDef
  return (
    <div style={{ padding: '9px 0', borderTop: premier ? 'none' : '1px solid #26344f' }}>
      <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'left' }}>{d.titre}</div>
      <div style={{ fontSize: 10, color: '#9fb0c9', margin: '2px 0 6px', textAlign: 'left' }}>{d.sousTitre}</div>
      <div style={{ position: 'relative', height: 14 }}>
        <div style={{ position: 'absolute', top: 3, left: 0, right: 0, height: 8, display: 'flex', gap: 3 }}>
          <div style={{ width: `${pctAtt}%`, background: CLAIR, borderRadius: '5px 0 0 5px' }} />
          <div style={{ flex: 1, background: SOMBRE, borderRadius: '0 5px 5px 0' }} />
        </div>
        <div style={{ position: 'absolute', top: 0, left: `calc(${pctAtt}% - 1px)`, width: 2, height: 14, background: '#fff', borderRadius: 1 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 10, color: '#9fb0c9', marginTop: 3 }}>
        <span>{rond(CLAIR, 'gauche')}{d.codeAtt} {d.libelleAtt} : {rang(d.rangAtt)}</span>
        <span>{d.codeDef} {d.libelleDef} : {rang(d.rangDef)}{rond(SOMBRE, 'droite')}</span>
      </div>
      <div style={{ marginTop: 6, textAlign: 'left' }}>
        {equilibre ? (
          <span style={{ border: `1px solid ${SOMBRE}`, color: '#9fb0c9', fontSize: 11, borderRadius: 6, padding: '1px 8px' }}>Équilibré</span>
        ) : (
          <span style={{ background: CLAIR, color: '#14203d', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 9px' }}>
            Avantage {gagnant}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Ligne fine sous un match : le petit « i » (infos équipes) et, si le mode expert est activé,
 * la pastille « ⚡ Duels expert » (8 duels force contre force, données : nflverse).
 * Sans mode expert (ou sans statistiques), seul le « i » reste, centré.
 * `infos` : le contenu du panneau du « i », construit par MatchLine.
 */
export default function DuelsExpert({
  stats1,
  stats2,
  actif,
  infos,
}: {
  code1: string
  code2: string
  stats1?: StatsEquipe | null
  stats2?: StatsEquipe | null
  actif: boolean
  infos?: ReactNode
}) {
  const [ouvert, setOuvert] = useState(false)
  const [infoOuverte, setInfoOuverte] = useState(false)

  // Le bouton « Infos équipes » de la page ouvre / ferme le « i » de tous les matchs d'un coup
  useEffect(() => {
    const ecouter = (e: Event) => setInfoOuverte(Boolean((e as CustomEvent<boolean>).detail))
    window.addEventListener('infos-equipes', ecouter)
    return () => window.removeEventListener('infos-equipes', ecouter)
  }, [])

  const afficherDuel = actif && !!stats1 && !!stats2
  const afficherInfo = !!infos
  if (!afficherDuel && !afficherInfo) return null

  const duels = actif && stats1 && stats2 ? [...calculer(stats1, stats2), ...calculer(stats2, stats1)] : []

  return (
    <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: afficherDuel && afficherInfo ? 'space-between' : 'center',
        }}
      >
        {afficherInfo && (
          <IconeInfo
            libelle="Infos"
            aria-label="Infos équipes"
            aria-expanded={infoOuverte}
            onClick={() => setInfoOuverte((o) => !o)}
          />
        )}
        {afficherDuel && (
          <button
            type="button"
            onClick={() => setOuvert((o) => !o)}
            aria-expanded={ouvert}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              border: '1px solid #f0c040',
              color: '#f0c040',
              background: 'rgba(240,192,64,0.08)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ⚡ Duels expert
          </button>
        )}
      </div>

      {infoOuverte && infos && <div style={{ display: 'flex', justifyContent: 'center' }}>{infos}</div>}

      {ouvert && stats1 && stats2 && (
        <div
          style={{
            marginTop: 8,
            background: '#101b30',
            border: '1px solid rgba(240,192,64,0.5)',
            borderRadius: 12,
            padding: '12px 12px 8px',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#f0c040', fontWeight: 700 }}>
            ⚡ Force contre force
          </div>
          <div style={{ fontSize: 10, color: '#9fb0c9', margin: '2px 0 4px', textAlign: 'left' }}>
            Rangs sur 32 équipes (1er = meilleur) · saison en cours, jusqu&apos;à la semaine {Math.max(stats1.derniere_semaine, stats2.derniere_semaine)}
          </div>
          {duels.map((d, i) => (
            <div key={i}>
              {i % 4 === 0 && <EnTeteSerie att={d.codeAtt} def={d.codeDef} premier={i === 0} />}
              <DuelLigne d={d} premier={i % 4 === 0} />
            </div>
          ))}
          <div style={{ marginTop: 6, padding: 10, borderRadius: 10, background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.4)', fontSize: 12, lineHeight: 1.5, textAlign: 'left' }}>
            <b>📌 L&apos;essentiel :</b> {resume(duels, stats1, stats2)}
          </div>
          {formaterMajExpert(stats1.mis_a_jour) ? (
            <div style={{ fontSize: 10, color: '#7a8aa5', marginTop: 8, textAlign: 'center' }}>
              Mis à jour le {formaterMajExpert(stats1.mis_a_jour)}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}