'use client'

import { useState } from 'react'

export default function ToggleAllInfos() {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    const nextState = !open
    document.querySelectorAll('[data-info-toggle]').forEach((el) => {
      ;(el as HTMLDetailsElement).open = nextState
    })
    setOpen(nextState)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 12,
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 16,
        cursor: 'pointer',
      }}
    >
      {open ? '✕ Masquer toutes les infos équipes' : 'ℹ️ Afficher toutes les infos équipes'}
    </button>
  )
}