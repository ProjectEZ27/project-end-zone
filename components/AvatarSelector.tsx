import Image from 'next/image'
import { useState } from 'react'

interface AvatarSelectorProps {
  selectedId?: number
  onSelect: (avatarId: number) => void
}

export default function AvatarSelector({ selectedId = 1, onSelect }: AvatarSelectorProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const TOTAL_AVATARS = 16

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F5' }}>
        Choisir un avatar
      </label>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          padding: 16,
          backgroundColor: 'rgba(22, 35, 63, 0.3)',
          borderRadius: 8,
          border: '1px solid rgba(200, 53, 46, 0.2)'
        }}
      >
        {Array.from({ length: TOTAL_AVATARS }, (_, i) => {
          const avatarId = i + 1
          const isSelected = selectedId === avatarId
          const isHovered = hovered === avatarId

          return (
            <button
              key={avatarId}
              onClick={() => onSelect(avatarId)}
              onMouseEnter={() => setHovered(avatarId)}
              onMouseLeave={() => setHovered(null)}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: isSelected ? '3px solid #C8352E' : isHovered ? '2px solid #999' : '2px solid #444',
                borderRadius: '50%',
                padding: 4,
                transition: 'all 0.2s',
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                opacity: isSelected || isHovered ? 1 : 0.8,
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
              title={`Avatar ${avatarId}`}
            >
              <Image
                src={`/avatars/avatar_${avatarId}.png`}
                alt={`Avatar ${avatarId}`}
                width={72}
                height={72}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%'
                }}
              />
            </button>
          )
        })}
      </div>

      {selectedId && (
        <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
          ✓ Avatar {selectedId} sélectionné
        </p>
      )}
    </div>
  )
}