'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DirectRafraichisseur({ actif }: { actif: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!actif) return
    let arrete = false

    async function actualiser() {
      if (document.hidden) return
      try {
        await fetch('/api/direct', { cache: 'no-store' })
        if (!arrete) router.refresh()
      } catch {}
    }

    actualiser()
    const id = setInterval(actualiser, 30000)
    return () => {
      arrete = true
      clearInterval(id)
    }
  }, [actif, router])

  return null
}