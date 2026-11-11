'use client'

import { useEffect, useRef } from 'react'
import { TbArrowUp, TbArrowDown, TbMinus } from 'react-icons/tb'
import { marquerRecapLu, marquerRecapAnime } from '@/app/pronostics/actions'
import type { RecapSemaine as RecapData } from '@/lib/recapSemaine'

function ordinal(n: number) {
  return n === 1 ? '1er' : `${n}e`
}

/**
 * Récap de la semaine terminée : points de la semaine (compteur), puis places gagnées ou perdues
 * au classement général (pastille + confettis si on monte).
 * L'animation ne se joue qu'une seule fois par joueur et par semaine (mémorisé dans le navigateur) ;
 * aux visites suivantes, le récap s'affiche directement dans son état final.
 */
export default function RecapSemaine({
  userId,
  dejaAnime,
  semaineId,
  semaineNom,
  semaineSuivante,
  score,
  rang,
  nombreJoueurs,
  delta,
}: RecapData & { userId: string; dejaAnime: boolean }) {
  const scene = useRef<HTMLDivElement>(null)
  const contenu = useRef<HTMLDivElement>(null)
  const carte = useRef<HTMLDivElement>(null)
  const nombre = useRef<HTMLDivElement>(null)
  const bloc = useRef<HTMLDivElement>(null)

  const points = score ?? 0
  const places = delta ?? 0
  const rangAvant = delta === null ? null : rang + delta
  const couleur = places > 0 ? '78,232,146' : places < 0 ? '255,107,95' : '159,176,201'
  const absPlaces = Math.abs(places)
  const Icone = places > 0 ? TbArrowUp : places < 0 ? TbArrowDown : TbMinus

  function texteNombre(n: number) {
    return points === 0 ? '0' : `+${n}`
  }

  function afficherFinal() {
    if (nombre.current) nombre.current.textContent = texteNombre(points)
    if (bloc.current) {
      bloc.current.style.opacity = '1'
      bloc.current.style.transform = 'scale(1)'
    }
  }

  function particules(quantite: number) {
    const zone = scene.current
    const origine = nombre.current ?? bloc.current
    if (!zone || !origine) return
    const r = origine.getBoundingClientRect()
    const s = zone.getBoundingClientRect()
    const cx = r.left - s.left + r.width / 2
    const cy = r.top - s.top + r.height / 2 + 40
    const couleurs = ['#f0c040', '#c8352e', '#ffffff', '#4ee892']
    for (let i = 0; i < quantite; i++) {
      const d = document.createElement('div')
      d.setAttribute('data-particule', '1')
      d.style.cssText = `position:absolute;z-index:3;width:8px;height:8px;border-radius:2px;pointer-events:none;left:${cx}px;top:${cy}px;background:${couleurs[i % 4]}`
      zone.appendChild(d)
      const angle = Math.random() * Math.PI * 2
      const dist = 70 + Math.random() * 130
      d.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist - 30}px) rotate(${Math.random() * 540}deg)`,
            opacity: 0,
          },
        ],
        { duration: 900 + Math.random() * 700, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards' }
      )
      setTimeout(() => d.remove(), 1700)
    }
  }

  function jouer() {
    const zone = scene.current
    const n = nombre.current
    const b = bloc.current
    const c = carte.current
    if (!zone || !b) return
    zone.querySelectorAll('[data-particule]').forEach((e) => e.remove())
    b.getAnimations().forEach((a) => a.cancel())
    b.style.opacity = '0'
    b.style.transform = 'scale(.6)'

    const reveler = () => {
      b.animate(
        [
          { opacity: 0, transform: 'scale(.6)' },
          { opacity: 1, transform: 'scale(1.12)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: 550, easing: 'cubic-bezier(.2,1.2,.4,1)', fill: 'forwards' }
      )
      if (places < 0 && c) {
        c.animate(
          [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-6px)' },
            { transform: 'translateX(6px)' },
            { transform: 'translateX(0)' },
          ],
          { duration: 300 }
        )
      }
      if (places > 0) particules(Math.min(60, 16 + places * 8))
    }

    if (!n || score === null) {
      reveler()
      return
    }

    n.textContent = texteNombre(0)
    const debut = performance.now()
    const duree = 1000
    const tick = (t: number) => {
      const k = Math.min(1, (t - debut) / duree)
      const e = 1 - Math.pow(1 - k, 3)
      n.textContent = texteNombre(Math.round(points * e))
      if (k < 1) {
        requestAnimationFrame(tick)
        return
      }
      n.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
        { duration: 450, easing: 'ease-out' }
      )
      setTimeout(reveler, 350)
    }
    requestAnimationFrame(tick)
  }

  useEffect(() => {
    const cle = `recap-anime:${userId}:${semaineId}`
    let dejaVu = dejaAnime
    try {
      dejaVu = dejaVu || !!localStorage.getItem(cle)
    } catch {}
    const reduit = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (contenu.current) contenu.current.style.visibility = 'visible'
    if (dejaVu || reduit) {
      afficherFinal()
      return
    }
    try {
      localStorage.setItem(cle, '1')
    } catch {}
    marquerRecapAnime(semaineId).catch(() => {})
    jouer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, semaineId])

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

  return (
    <div ref={scene} style={{ position: 'relative', margin: '0 0 16px' }}>
      <div
        ref={contenu}
        style={{
          position: 'relative',
          textAlign: 'center',
          color: 'white',
          visibility: 'hidden',
        }}
      >
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2 }}>
          Récap de la semaine
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, margin: '4px 0 10px' }}>🏈 {semaineNom} terminée</div>

        <div
          ref={carte}
          style={{
            border: '1px solid #33415a',
            background: 'rgba(22,35,63,0.82)',
            borderRadius: 14,
            padding: '20px 14px 16px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {score === null ? (
            <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Tu n&apos;as pas pronostiqué cette semaine</p>
          ) : (
            <>
              <div ref={nombre} style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.05, color: '#f0c040' }}>
                {texteNombre(points)}
              </div>
              <p style={{ fontSize: 14, color: '#9fb0c9', margin: 0 }}>
                {points > 1 ? 'points cette semaine' : 'point cette semaine'}
              </p>
            </>
          )}

          <div ref={bloc} style={{ marginTop: 16, opacity: 0, transform: 'scale(.6)' }}>
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
        </div>

        <form action={marquerRecapLu} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        </form>
      </div>
    </div>
  )
}