'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinLeagueForm() {
  const [code, setCode] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim()) {
      router.push(`/leagues/join/${code.trim()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        type="text"
        placeholder="Code d'invitation"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ padding: 8, flex: 1 }}
      />
      <button type="submit" style={{ padding: 8 }}>Rejoindre</button>
    </form>
  )
}
