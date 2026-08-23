'use client'

import { useState } from 'react'
import LeagueLogo from './LeagueLogo'
import LeagueLogoSelector from './LeagueLogoSelector'

export default function LeagueLogoField() {
  const [open, setOpen] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState(1)

  return (
    <div style={{ textAlign: 'center' }}>
      <input type="hidden" name="logo_id" value={selectedLogo} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <LeagueLogo logoId={selectedLogo} size={72} clickable onClick={() => setOpen(!open)} />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          🏆 Choisir un logo
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <LeagueLogoSelector
            selectedId={selectedLogo}
            onSelect={(id) => {
              setSelectedLogo(id)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}