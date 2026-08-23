'use client'

import { useState } from 'react'
import { changerAvatar } from '@/app/profile/actions'
import AvatarSelector from './AvatarSelector'
import UserAvatar from './UserAvatar'

interface AvatarEditorProps {
  currentAvatarId: number
  children?: React.ReactNode
}

export default function AvatarEditor({ currentAvatarId, children }: AvatarEditorProps) {
  const [open, setOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarId)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        <UserAvatar
          avatarId={currentAvatarId}
          size={80}
          clickable
          onClick={() => setOpen(!open)}
        />
        {children}
      </div>

      {open && (
        <div style={{ padding: 16, border: '1px solid #33415a', borderRadius: 8, marginBottom: 24, textAlign: 'left' }}>
          <h3 style={{ marginTop: 0, textAlign: 'center' }}>Changer ton avatar</h3>

          <AvatarSelector selectedId={selectedAvatar} onSelect={setSelectedAvatar} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '12px',
              backgroundColor: 'rgba(200, 53, 46, 0.1)',
              borderRadius: 6,
              margin: '12px 0',
            }}
          >
            <UserAvatar avatarId={selectedAvatar} size={48} />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#999' }}>Avatar {selectedAvatar}/16</p>
          </div>

          <form action={changerAvatar} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <input type="hidden" name="avatar_id" value={selectedAvatar} />
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
                setSelectedAvatar(currentAvatarId)
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