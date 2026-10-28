'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResultatsRafraichisseur({ actif }: { actif: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!actif) return
    let arrete = false

    async function verifier() {
      if (document.hidden) return
      try {
        const reponse = await fetch('/api/resultats', { cache: 'no-store' })
        const donnees = await reponse.json()
        if (!arrete && donnees.miseAJourTotal > 0) router.refresh()
      } catch {}
    }

    verifier()
    const id = setInterval(verifier, 60000)
    return () => {
      arrete = true
      clearInterval(id)
    }
  }, [actif, router])

  return null
}