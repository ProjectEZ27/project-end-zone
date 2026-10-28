'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Anton } from 'next/font/google'
import { TEAM_STRIPES } from '@/components/TeamStripe'

const anton = Anton({ weight: '400', subsets: ['latin'] })

// Un tableau par équipe : chaque élément est une ligne affichée en plein écran
export const SLOGANS: Record<string, string[]> = {
  BUF: ['Bills', 'Mafia'],
  MIA: ['Fins', 'Up'],
  NE: ['Patriots', 'Nation'],
  NYJ: ['J-E-T-S', 'Jets Jets Jets'],
  BAL: ['Fly with', 'the Flock'],
  CIN: ['Who', 'Dey'],
  CLE: ['Dawg', 'Pound'],
  PIT: ['Here', 'We Go'],
  HOU: ['Go', 'Texans'],
  IND: ['Horseshoe', 'Nation'],
  JAX: ['Duuuval'],
  TEN: ['Titan', 'Up'],
  DEN: ['Broncos', 'Country'],
  KC: ['Chiefs', 'Kingdom'],
  LV: ['Just Win,', 'Baby'],
  LAC: ['Bolt', 'Up'],
  DAL: ["How 'Bout", 'Them', 'Cowboys'],
  NYG: ['Go Big', 'Blue'],
  PHI: ['Fly,', 'Eagles,', 'Fly'],
  WAS: ['Hail to', 'the Commanders'],
  CHI: ['Bear', 'Down'],
  DET: ['One', 'Pride'],
  GB: ['Go', 'Pack', 'Go'],
  MIN: ['Skol'],
  ATL: ['Rise', 'Up'],
  CAR: ['Keep', 'Pounding'],
  NO: ['Who', 'Dat'],
  TB: ['Raise', 'the Flag'],
  ARI: ['Red', 'Sea'],
  LA: ['Rams', 'House'],
  SF: ['Faithful', 'to the Bay'],
  SEA: ['Go', 'Hawks'],
}

function couleurTexte(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111' : '#fff'
}

type Eclat = { dx: number; dy: number; r: number; w: number; h: number }

const CSS = `
.si-ov{position:fixed;inset:0;z-index:1000;background:rgba(8,13,28,.95);overflow:hidden;cursor:pointer;animation:si-fade 2.5s forwards}
@keyframes si-fade{0%,74%{opacity:1}100%{opacity:0}}
.si-tremble{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;animation:si-shake .45s .15s}
@keyframes si-shake{0%,100%{transform:translate(0,0)}20%{transform:translate(-6px,3px)}40%{transform:translate(5px,-4px)}60%{transform:translate(-4px,-2px)}80%{transform:translate(3px,3px)}}
.si-txt{position:relative;z-index:3;text-align:center;text-transform:uppercase;line-height:.95;color:#fff;-webkit-text-stroke:3px var(--c1);paint-order:stroke fill;text-shadow:0 0 28px var(--c1)}
.si-ln{display:block;margin:2px 0}
.si-slam{display:inline-block;animation:si-slam .7s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes si-slam{0%{transform:scale(4.2) skewX(-12deg);opacity:0}45%{opacity:1}65%{transform:scale(.9) skewX(-12deg)}82%{transform:scale(1.07) skewX(-12deg)}100%{transform:scale(1) skewX(-12deg);opacity:1}}
.si-ring{position:absolute;left:50%;top:50%;width:80px;height:80px;margin:-40px 0 0 -40px;border-radius:50%;border:5px solid var(--c2);opacity:0;animation:si-ring .9s .12s ease-out}
@keyframes si-ring{0%{transform:scale(.2);opacity:1}100%{transform:scale(7);opacity:0}}
.si-flash{position:absolute;inset:0;background:#fff;opacity:0;animation:si-flash .35s .1s}
@keyframes si-flash{0%{opacity:.55}100%{opacity:0}}
.si-pt{position:absolute;left:50%;top:50%;opacity:0;animation:si-burst 1.1s .15s ease-out forwards}
@keyframes si-burst{0%{opacity:1;transform:translate(-50%,-50%) skewX(-20deg) rotate(0)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) skewX(-20deg) rotate(var(--r))}}
`

const BANNER_CSS = `
@keyframes si-banin{0%{transform:translateX(30px);opacity:0}100%{transform:translateX(0);opacity:1}}
.si-ban-anime{animation:si-banin .5s 2.1s cubic-bezier(.2,1.2,.4,1) both}
@media (prefers-reduced-motion: reduce){.si-ban-anime{animation:none}}
`

// Animation plein écran à l'arrivée sur un profil.
// À utiliser avec key={id du profil} pour qu'elle se rejoue à chaque profil visité.
export default function SloganIntro({
  team,
  enabled = true,
}: {
  team?: string | null
  enabled?: boolean
}) {
  const slogan = team ? SLOGANS[team] : undefined
  const couleurs = team ? TEAM_STRIPES[team] : undefined

  const [visible, setVisible] = useState(Boolean(enabled && slogan && couleurs))
  const [eclats, setEclats] = useState<Eclat[]>([])

  useEffect(() => {
    if (!visible) return
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduit) {
      setVisible(false)
      return
    }
    setEclats(
      Array.from({ length: 34 }, () => {
        const angle = Math.random() * Math.PI * 2
        const distance = 110 + Math.random() * 190
        return {
          dx: Math.round(Math.cos(angle) * distance),
          dy: Math.round(Math.sin(angle) * distance),
          r: Math.round(Math.random() * 540 - 270),
          w: 6 + Math.round(Math.random() * 8),
          h: 12 + Math.round(Math.random() * 14),
        }
      })
    )
    const minuteur = setTimeout(() => setVisible(false), 2500)
    return () => clearTimeout(minuteur)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible || !slogan || !couleurs) return null

  const plusLongue = Math.max(...slogan.map((l) => l.length))
  const taille = Math.min(76, Math.floor(300 / (plusLongue * 0.5)))
  const teintes = [couleurs.c1, couleurs.c2, '#fff']

  return (
    <>
      <style>{CSS}</style>
      <div
        className="si-ov"
        onClick={() => setVisible(false)}
        style={{ ['--c1' as string]: couleurs.c1, ['--c2' as string]: couleurs.c2 } as CSSProperties}
      >
        <div className="si-tremble">
          <div className="si-flash" />
          <div className="si-ring" />
          {eclats.map((e, i) => (
            <div
              key={i}
              className="si-pt"
              style={{
                width: e.w,
                height: e.h,
                background: teintes[i % 3],
                ['--dx' as string]: `${e.dx}px`,
                ['--dy' as string]: `${e.dy}px`,
                ['--r' as string]: `${e.r}deg`,
              } as CSSProperties}
            />
          ))}
          <div className="si-txt" style={{ fontSize: taille, fontFamily: anton.style.fontFamily }}>
            {slogan.map((ligne, k) => (
              <span key={k} className="si-ln">
                <span className="si-slam" style={{ animationDelay: `${0.12 + k * 0.12}s` }}>
                  {ligne}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// Bandeau permanent du slogan sur le profil.
// anime = true : il apparaît après l'explosion (à 2,1 s) ; sinon il est là tout de suite.
export function SloganBanner({ team, anime = false }: { team?: string | null; anime?: boolean }) {
  const slogan = team ? SLOGANS[team] : undefined
  const couleurs = team ? TEAM_STRIPES[team] : undefined
  if (!team || !slogan || !couleurs) return null

  return (
    <>
      <style>{BANNER_CSS}</style>
      <div
        className={anime ? 'si-ban-anime' : undefined}
        style={{
          height: 46,
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px 0 30px',
          background: couleurs.c1,
          color: couleurTexte(couleurs.c1),
          clipPath: 'polygon(14px 0, 100% 0, 100% 100%, 0 100%)',
          fontFamily: anton.style.fontFamily,
          fontStyle: 'italic',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: 18,
        }}
      >
        {`${slogan.join(' ')} (${team})`}
      </div>
    </>
  )
}