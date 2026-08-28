'use client'

import { useEffect, useState } from 'react'

function calculerReste(cibleMs: number) {
  const diff = cibleMs - Date.now()
  if (diff <= 0) return null
  const jours = Math.floor(diff / (1000 * 60 * 60 * 24))
  const heures = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const secondes = Math.floor((diff / 1000) % 60)
  return { jours, heures, minutes, secondes }
}

export default function CountdownBadge({ cible }: { cible: string | null }) {
  const cibleMs = cible ? new Date(cible).getTime() : null
  const [reste, setReste] = useState(() => (cibleMs ? calculerReste(cibleMs) : null))

  useEffect(() => {
    if (!cibleMs) return
    const interval = setInterval(() => {
      setReste(calculerReste(cibleMs))
    }, 1000)
    return () => clearInterval(interval)
  }, [cibleMs])

  if (!cibleMs || !reste) {
    return <span>🔒 Verrouillé</span>
  }

  if (reste.jours > 0) {
    return <span>🕐 Clôture dans {reste.jours}j {reste.heures}h</span>
  }
  if (reste.heures > 0) {
    return <span>🕐 Clôture dans {reste.heures}h {reste.minutes}m</span>
  }
  return <span>🕐 Clôture dans {reste.minutes}m {reste.secondes}s</span>
}