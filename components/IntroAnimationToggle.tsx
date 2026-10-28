'use client'

import { useState, useTransition } from 'react'
import { changerIntroAnimation } from '@/app/profile/introActions'

export default function IntroAnimationToggle({ actif }: { actif: boolean }) {
  const [coche, setCoche] = useState(actif)
  const [, startTransition] = useTransition()

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
        fontSize: 12,
        color: '#9fb0c9',
        cursor: 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={coche}
        onChange={(e) => {
          const valeur = e.target.checked
          setCoche(valeur)
          startTransition(() => {
            changerIntroAnimation(valeur)
          })
        }}
      />
      Animation d'arrivée sur les profils
    </label>
  )
}