'use client'

import { useEffect, useRef, useState } from 'react'
import { TbArrowUp, TbArrowDown, TbMinus, TbX } from 'react-icons/tb'
import { marquerRecapLu, marquerRecapAnime } from '@/app/pronostics/actions'
import type { RecapSemaine as RecapData } from '@/lib/recapSemaine'

const RAYON = 84
const CIRCONFERENCE = 2 * Math.PI * RAYON
const DUREE_CERCLE = 1500

function ordinal(n: number) {
  return n === 1 ? '1er' : `${n}e`
}

type Phase = 'anim' | 'final' | 'banniere'

/**
 * Récap de la semaine terminée, en plein écran au premier plan de l'accueil :
 * un cercle doré se remplit selon la part de bons pronostics pendant que les points défilent,
 * puis apparaissent les places gagnées ou perdues au classement général (confettis si on monte).
 * L'animation ne se joue qu'une seule fois par joueur et par semaine. Si le joueur ferme le plein écran
 * (« Plus tard ») ou revient plus tard, il reste une petite carte en haut de l'accueil pour rouvrir le récap.
 * Le récap disparaît pour de bon quand le joueur clique sur l'un des deux boutons.
 */
export default function RecapSemaine({
  userId,
  dejaAnime,
  semaineId,
  semaineNom,
  semaineSuivante,
  score,
  corrects,
  total,
  rang,
  nombreJoueurs,
  delta,
}: RecapData & { userId: string; dejaAnime: boolean }) {
  const [phase, setPhase] = useState<Phase>(dejaAnime ? 'banniere' : 'anim')

  const scene = useRef<HTMLDivElement>(null)
  const anneau = useRef<SVGCircleElement>(null)
  const nombre = useRef<HTMLDivElement>(null)
  const bloc = useRef<HTMLDivElement>(null)
  const boutons = useRef<HTMLFormElement>(null)

  const points = score ?? 0
  const part = total > 0 ? Math.min(1, corrects / total) : 0
  const decalageFinal = CIRCONFERENCE * (1 - part)
  const places = delta ?? 0
  const rangAvant = delta === null ? null : rang + delta
  const couleur = places > 0 ? '78,232,146' : places < 0 ? '255,107,95' : '159,176,201'
  const absPlaces = Math.abs(places)
  const Icone = places > 0 ? TbArrowUp : places < 0 ? TbArrowDown : TbMinus

  const texteNombre = (n: number) => (points === 0 ? '0' : `+${n}`)
  const animee = phase === 'anim'

  useEffect(() => {
    if (phase === 'banniere') return

    // Le plein écran bloque le défilement de la page derrière lui
    const ancienOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const fermer = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPhase('banniere')
    }
    window.addEventListener('keydown', fermer)

    const minuteries: ReturnType<typeof setTimeout>[] = []
    let image = 0
    let annule = false

    const afficherFinal = () => {
      if (anneau.current) anneau.current.style.strokeDashoffset = String(decalageFinal)
      if (nombre.current) nombre.current.textContent = texteNombre(points)
      for (const el of [bloc.current, boutons.current]) {
        if (el) {
          el.style.opacity = '1'
          el.style.transform = 'none'
        }
      }
    }

    const particules = (quantite: number) => {
      const zone = scene.current
      const origine = bloc.current
      if (!zone || !origine) return
      const r = origine.getBoundingClientRect()
      const s = zone.getBoundingClientRect()
      const cx = r.left - s.left + r.width / 2
      const cy = r.top - s.top + r.height / 2
      const couleurs = ['#f0c040', '#c8352e', '#ffffff', '#4ee892']
      for (let i = 0; i < quantite; i++) {
        const d = document.createElement('div')
        d.setAttribute('data-particule', '1')
        d.style.cssText = `position:absolute;z-index:3;width:8px;height:8px;border-radius:2px;pointer-events:none;left:${cx}px;top:${cy}px;background:${couleurs[i % 4]}`
        zone.appendChild(d)
        const angle = Math.random() * Math.PI * 2
        const dist = 90 + Math.random() * 170
        d.animate(
          [
            { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
            {
              transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist - 40}px) rotate(${Math.random() * 540}deg)`,
              opacity: 0,
            },
          ],
          { duration: 900 + Math.random() * 700, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards' }
        )
        minuteries.push(setTimeout(() => d.remove(), 1700))
      }
    }

    const jouer = () => {
      const n = nombre.current
      const b = bloc.current
      const bt = boutons.current
      const c = anneau.current

      // 1) Le cercle se remplit pendant que les points défilent
      c?.animate(
        [{ strokeDashoffset: CIRCONFERENCE }, { strokeDashoffset: decalageFinal }],
        { duration: DUREE_CERCLE, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
      )
      if (n && score !== null) {
        n.textContent = texteNombre(0)
        const debut = performance.now()
        const tick = (t: number) => {
          if (annule) return
          const k = Math.min(1, (t - debut) / DUREE_CERCLE)
          const e = 1 - Math.pow(1 - k, 3)
          n.textContent = texteNombre(Math.round(points * e))
          if (k < 1) image = requestAnimationFrame(tick)
          else
            n.animate(
              [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
              { duration: 450, easing: 'ease-out' }
            )
        }
        image = requestAnimationFrame(tick)
      }

      // 2) Les places gagnées ou perdues apparaissent, avec confettis si on monte
      const delaiBloc = score === null ? 200 : DUREE_CERCLE + 250
      b?.animate(
        [
          { opacity: 0, transform: 'scale(.6)' },
          { opacity: 1, transform: 'scale(1.12)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: 550, delay: delaiBloc, easing: 'cubic-bezier(.2,1.2,.4,1)', fill: 'both' }
      )
      minuteries.push(
        setTimeout(() => {
          if (places > 0) particules(Math.min(60, 16 + places * 8))
          if (places < 0) {
            document.getElementById('recap-carte')?.animate(
              [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-6px)' },
                { transform: 'translateX(6px)' },
                { transform: 'translateX(0)' },
              ],
              { duration: 300 }
            )
          }
        }, delaiBloc + 150)
      )

      // 3) Les boutons arrivent en dernier
      bt?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: delaiBloc + 500, fill: 'both' })
    }

    const reduit = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (phase === 'final' || reduit) {
      afficherFinal()
    } else {
      const cle = `recap-anime:${userId}:${semaineId}`
      let dejaVu = false
      try {
        dejaVu = !!localStorage.getItem(cle)
      } catch {}
      if (dejaVu) {
        afficherFinal()
      } else {
        try {
          localStorage.setItem(cle, '1')
        } catch {}
        marquerRecapAnime(semaineId).catch(() => {})
        jouer()
      }
    }

    return () => {
      annule = true
      cancelAnimationFrame(image)
      minuteries.forEach(clearTimeout)
      window.removeEventListener('keydown', fermer)
      document.body.style.overflow = ancienOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, userId, semaineId])

  const boutonBase = {
    display: 'block',
    width: '100%',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center' as const,
  }

  const resumeBanniere =
    score === null
      ? 'Tu n’as pas pronostiqué cette semaine'
      : `${points === 0 ? '0' : `+${points}`} ${points > 1 ? 'points' : 'point'}${
          delta === null ? '' : places === 0 ? ' · place stable' : ` · ${places > 0 ? '↑' : '↓'} ${absPlaces} ${absPlaces > 1 ? 'places' : 'place'}`
        }`

  if (phase === 'banniere') {
    return (
      <button
        type="button"
        onClick={() => setPhase('final')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          width: '100%',
          margin: '0 0 16px',
          padding: '12px 14px',
          background: 'rgba(22,35,63,0.82)',
          border: '1px solid #33415a',
          borderLeft: '3px solid #f0c040',
          borderRadius: 12,
          color: 'white',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span>
          <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Récap de la {semaineNom}
          </span>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, marginTop: 3 }}>{resumeBanniere}</span>
        </span>
        <span style={{ fontSize: 13, color: '#f0c040', whiteSpace: 'nowrap' }}>Voir →</span>
      </button>
    )
  }

  return (
    <div
      ref={scene}
      role="dialog"
      aria-modal="true"
      aria-label={`Récap de la ${semaineNom}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(8,14,26,0.97)',
        color: 'white',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: 'calc(24px + var(--marge-haut)) 20px calc(24px + var(--marge-bas))',
      }}
    >
      <button
        type="button"
        onClick={() => setPhase('banniere')}
        aria-label="Fermer, voir plus tard"
        style={{
          position: 'absolute',
          top: 'calc(16px + var(--marge-haut))',
          right: 16,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid #33415a',
          background: 'rgba(22,35,63,0.92)',
          color: 'white',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TbX size={20} />
      </button>

      <div style={{ width: '100%', maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2 }}>
          Récap de la semaine
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 18px' }}>🏈 {semaineNom} terminée</div>

        <div id="recap-carte">
          {score === null ? (
            <p style={{ fontSize: 18, fontWeight: 700, margin: '24px 0' }}>Tu n&apos;as pas pronostiqué cette semaine</p>
          ) : (
            <>
              <div
                role="img"
                aria-label={`${points} ${points > 1 ? 'points' : 'point'} cette semaine, ${corrects} bons pronostics sur ${total}`}
                style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}
              >
                <svg viewBox="0 0 200 200" width="200" height="200" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
                  <circle cx="100" cy="100" r={RAYON} fill="none" stroke="#33415a" strokeWidth="12" />
                  <circle
                    ref={anneau}
                    cx="100"
                    cy="100"
                    r={RAYON}
                    fill="none"
                    stroke="#f0c040"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={CIRCONFERENCE}
                    strokeDashoffset={animee ? CIRCONFERENCE : decalageFinal}
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div ref={nombre} style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, color: '#f0c040' }}>
                    {texteNombre(animee ? 0 : points)}
                  </div>
                  <div style={{ fontSize: 13, color: '#9fb0c9', marginTop: 4 }}>{points > 1 ? 'points' : 'point'}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#9fb0c9', margin: '10px 0 0' }}>
                {corrects} {corrects > 1 ? 'bons pronos' : 'bon prono'} sur {total}
              </p>
            </>
          )}
        </div>

        <div ref={bloc} style={{ marginTop: 22, opacity: animee ? 0 : 1 }}>
          {rangAvant === null ? (
            <p style={{ fontSize: 15, margin: 0 }}>
              Bienvenue au classement général : {ordinal(rang)} sur {nombreJoueurs}
            </p>
          ) : (
            <>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 24,
                  padding: '8px 18px',
                  fontSize: 22,
                  fontWeight: 700,
                  border: `1px solid rgb(${couleur})`,
                  color: `rgb(${couleur})`,
                  background: places === 0 ? 'transparent' : `rgba(${couleur},0.12)`,
                }}
              >
                <Icone size={22} />
                <span>{places === 0 ? 'Stable' : `${absPlaces} ${absPlaces > 1 ? 'places' : 'place'}`}</span>
              </div>
              <p style={{ fontSize: 13, color: '#9fb0c9', margin: '8px 0 0' }}>
                {places === 0
                  ? `Tu gardes ta ${ordinal(rang)} place · sur ${nombreJoueurs} au classement général`
                  : `${ordinal(rangAvant)} → ${ordinal(rang)} · sur ${nombreJoueurs} au classement général`}
              </p>
            </>
          )}
        </div>

        <form
          ref={boutons}
          action={marquerRecapLu}
          style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10, opacity: animee ? 0 : 1 }}
        >
          <input type="hidden" name="semaine_id" value={semaineId} />
          <button
            type="submit"
            name="destination"
            value="resultats"
            style={{
              ...boutonBase,
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.35)',
            }}
          >
            👀 Revoir mes pronostics de la {semaineNom}
          </button>
          {semaineSuivante && (
            <button
              type="submit"
              name="destination"
              value="suivante"
              style={{ ...boutonBase, background: '#C8352E', color: 'white', border: 'none' }}
            >
              Passer aux pronostics de la {semaineSuivante.nom} →
            </button>
          )}
          <button
            type="button"
            onClick={() => setPhase('banniere')}
            style={{ background: 'transparent', border: 'none', color: '#9fb0c9', fontSize: 13, cursor: 'pointer', padding: 6 }}
          >
            Plus tard
          </button>
        </form>
      </div>
    </div>
  )
}