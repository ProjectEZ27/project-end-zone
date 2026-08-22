'use client'

import { useState } from 'react'

interface InfoToggleProps {
  label: string
  children: React.ReactNode
}

export default function InfoToggle({ label, children }: InfoToggleProps) {
  const [open, setOpen] = useState(false)

  return (
    <span style={{ display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={label}
        style={{
          all: 'unset',
          cursor: 'pointer',
          fontSize: 14,
          marginLeft: 6,
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        ℹ️
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            marginBottom: 4,
            padding: 14,
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 13,
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.6,
            textAlign: 'left',
          }}
        >
          {children}
        </div>
      )}
    </span>
  )
}