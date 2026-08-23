'use client'

import { useState } from 'react'
import { changerLogoLigue } from '@/app/leagues/[id]/actions'
import LeagueLogo from './LeagueLogo'
import LeagueLogoSelector from './LeagueLogoSelector'

interface LeagueLogoEditorProps {
  ligueId: string
  currentLogoId: number
  estCommissaire: boolean
  leagueName: string
}

export default function LeagueLogoEditor({ ligueId, currentLogoId, estCommissaire, leagueName }: LeagueLogoEditorProps) {
  const [open, setOpen] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState(currentLogoId)

  if (!estCommissaire) {
    return (
      <div style={{ marginBottom: 12 }}>
        <LeagueLogo logoId={currentLogoId} size={110} leagueName={leagueName} />
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <LeagueLogo
          logoId={currentLogoId}
          size={110}
          leagueName={leagueName}
          clickable
          onClick={() => setOpen(!open)}
        />
        <div
          onClick={() => setOpen(!open)}
          style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: '#C8352E',
            border: '2px solid #0F1419',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ✏️
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 16, padding: 16, border: '1px solid #33415a', borderRadius: 8, textAlign: 'left' }}>
          <h3 style={{ marginTop: 0, textAlign: 'center' }}>Changer le logo</h3>

          <LeagueLogoSelector selectedId={selectedLogo} onSelect={setSelectedLogo} />

          <form action={changerLogoLigue} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <input type="hidden" name="ligue_id" value={ligueId} />
            <input type="hidden" name="logo_id" value={selectedLogo} />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#C8352E',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Valider
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setSelectedLogo(currentLogoId)
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
          </form>
        </div>
      )}
    </div>
  )
}