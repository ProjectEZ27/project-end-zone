'use client'

import Image from 'next/image'

interface LeagueLogoSelectorProps {
  selectedId?: number
  onSelect: (logoId: number) => void
}

export default function LeagueLogoSelector({ selectedId = 1, onSelect }: LeagueLogoSelectorProps) {
  const TOTAL_LOGOS = 15

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F5' }}>
        Choisir un logo
      </label>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 12,
          padding: 16,
          backgroundColor: 'rgba(22, 35, 63, 0.3)',
          borderRadius: 8,
          border: '1px solid rgba(200, 53, 46, 0.2)',
          boxSizing: 'border-box',
        }}
      >
        {Array.from({ length: TOTAL_LOGOS }, (_, i) => {
          const logoId = i + 1
          const isSelected = selectedId === logoId

          return (
            <button
              key={logoId}
              type="button"
              onClick={() => onSelect(logoId)}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: isSelected ? '3px solid #C8352E' : '2px solid #444',
                borderRadius: 8,
                padding: 4,
                transition: 'all 0.2s',
                opacity: isSelected ? 1 : 0.8,
                width: '100%',
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
              title={`Logo ${logoId}`}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                  src={`/Logos%20ligue/Logo%20${logoId}.png`}
                  alt={`Logo ${logoId}`}
                  fill
                  sizes="80px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {selectedId && (
        <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
          ✓ Logo {selectedId} sélectionné
        </p>
      )}
    </div>
  )
}