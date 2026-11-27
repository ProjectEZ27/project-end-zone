'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/*
 * Voile sombre sous l'heure et la batterie du téléphone.
 * Invisible en haut de page (la photo de fond va jusqu'au bord), il apparaît quand on fait défiler.
 * Sur ordinateur la marge du haut vaut 0 : rien ne s'affiche.
 */
export default function BandeauHaut() {
  const pathname = usePathname()
  const voile = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ajuster = () => {
      if (voile.current) voile.current.style.opacity = String(Math.min(1, Math.max(0, window.scrollY / 40)))
    }
    ajuster()
    window.addEventListener('scroll', ajuster, { passive: true })
    return () => window.removeEventListener('scroll', ajuster)
  }, [pathname])

  return (
    <div
      ref={voile}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'calc(var(--marge-haut) * 1.38)',
        background: 'linear-gradient(180deg, rgba(11,18,32,0.85) 0%, rgba(11,18,32,0.85) 62%, rgba(11,18,32,0) 100%)',
        opacity: 0,
        zIndex: 210,
        pointerEvents: 'none',
      }}
    />
  )
}