// Bandes diagonales aux couleurs de l'équipe favorite (sans logo officiel)
import { Anton } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'] })

type StripeTeam = { c1: string; c2: string; share: number }

export const TEAM_STRIPES: Record<string, StripeTeam> = {
  BUF: { c1: '#2F63D0', c2: '#E0243F', share: 60 },
  MIA: { c1: '#008E97', c2: '#FC4C02', share: 58 },
  NE: { c1: '#2F5AA8', c2: '#C60C30', share: 62 },
  NYJ: { c1: '#1F8A5B', c2: '#E5E5E5', share: 75 },
  BAL: { c1: '#5A3FC0', c2: '#D4A017', share: 80 },
  CIN: { c1: '#FB4F14', c2: '#4A4A4A', share: 70 },
  CLE: { c1: '#FF3C00', c2: '#7A4B2E', share: 65 },
  PIT: { c1: '#FFB612', c2: '#4A4A4A', share: 65 },
  HOU: { c1: '#2E4A8F', c2: '#C8102E', share: 60 },
  IND: { c1: '#2F5FB3', c2: '#E5E5E5', share: 75 },
  JAX: { c1: '#00839B', c2: '#D7A22A', share: 62 },
  TEN: { c1: '#4B92DB', c2: '#C8102E', share: 60 },
  DEN: { c1: '#FB4F14', c2: '#3A5A9A', share: 60 },
  KC: { c1: '#E31837', c2: '#FFB81C', share: 62 },
  LV: { c1: '#A5ACAF', c2: '#4A4A4A', share: 65 },
  LAC: { c1: '#0080C6', c2: '#FFC20E', share: 65 },
  DAL: { c1: '#2F6BDB', c2: '#9AA5A8', share: 70 },
  NYG: { c1: '#2F5AA8', c2: '#A71930', share: 70 },
  PHI: { c1: '#00A58F', c2: '#A5ACAF', share: 68 },
  WAS: { c1: '#9B2335', c2: '#FFB612', share: 65 },
  CHI: { c1: '#2F4A7A', c2: '#E64100', share: 60 },
  DET: { c1: '#0076B6', c2: '#B0B7BC', share: 65 },
  GB: { c1: '#2E8B57', c2: '#FFB612', share: 60 },
  MIN: { c1: '#6B3FA0', c2: '#FFC62F', share: 68 },
  ATL: { c1: '#A71930', c2: '#4A4A4A', share: 68 },
  CAR: { c1: '#0085CA', c2: '#4A4A4A', share: 68 },
  NO: { c1: '#D3BC8D', c2: '#4A4A4A', share: 65 },
  TB: { c1: '#D50A0A', c2: '#8A8D8F', share: 65 },
  ARI: { c1: '#97233F', c2: '#E8E8E8', share: 70 },
  LA: { c1: '#2F5FC0', c2: '#FFA300', share: 65 },
  SF: { c1: '#AA0000', c2: '#B3995D', share: 66 },
  SEA: { c1: '#69BE28', c2: '#3A5A9A', share: 55 },
}

const TOTAL = 34 // largeur totale des bandes (px)
const ANGLE = 31 // degrés
const TAILLE_TEXTE = 14 // px

// Largeur occupée à droite de la ligne (à utiliser pour le padding-right)
export function largeurBandes(rowHeight: number): number {
  const h = rowHeight - 2
  const sh = Math.round(h * Math.tan((ANGLE * Math.PI) / 180))
  return TOTAL + sh
}

export default function TeamStripe({
  team,
  rowHeight = 67,
}: {
  team?: string | null
  rowHeight?: number
}) {
  const t = team ? TEAM_STRIPES[team] : undefined
  if (!t || !team) return null

  const h = rowHeight - 2 // 1 px de bordure en haut et en bas
  const sh = Math.round(h * Math.tan((ANGLE * Math.PI) / 180))
  const w1 = Math.round((TOTAL * t.share) / 100) // couleur dominante (à gauche)
  const w2 = TOTAL - w1 // couleur secondaire (au bord droit)
  const poly = `polygon(${sh}px 0, 100% 0, calc(100% - ${sh}px) 100%, 0 100%)`
  const cxDominante = Math.round(sh / 2 + w2 + w1 / 2)

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute', top: 0, height: h,
          width: w1 + sh, right: w2,
          background: t.c1, clipPath: poly,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', top: 0, height: h,
          width: w2 + sh, right: 0,
          background: t.c2, clipPath: poly,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '50%', right: cxDominante,
          transform: `translate(50%, -50%) rotate(-${90 - ANGLE}deg)`,
          fontFamily: anton.style.fontFamily,
          fontWeight: 400, fontStyle: 'normal',
          fontSize: TAILLE_TEXTE, letterSpacing: 1,
          lineHeight: 1, whiteSpace: 'nowrap',
          color: '#111',
        }}
      >
        {team}
      </div>
    </>
  )
}