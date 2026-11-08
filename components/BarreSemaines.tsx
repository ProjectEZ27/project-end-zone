'use client'

import { useEffect, useRef } from 'react'

/*
 * Barre des semaines qui défile de gauche à droite.
 * À l'ouverture, elle se place toute seule sur la semaine choisie (celle en surbrillance).
 * La semaine à centrer est celle dont le lien porte data-actif="true".
 */
export default function BarreSemaines({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const barre = ref.current
    if (!barre) return
    const actif = barre.querySelector<HTMLElement>('[data-actif="true"]')
    if (!actif) return
    barre.scrollLeft = actif.offsetLeft - (barre.clientWidth - actif.clientWidth) / 2
  }, [])

  return (
    <div ref={ref} style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4, position: 'relative' }}>
      {children}
    </div>
  )
}