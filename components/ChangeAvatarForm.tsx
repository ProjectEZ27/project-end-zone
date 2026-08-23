'use client'

import { useState } from 'react'
import { changerAvatar } from '@/app/profile/actions'
import AvatarSelector from './AvatarSelector'
import UserAvatar from './UserAvatar'

interface ChangeAvatarFormProps {
  currentAvatarId: number
  errorMessage?: string
}

export default function ChangeAvatarForm({ currentAvatarId, errorMessage }: ChangeAvatarFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarId)

  if (!open) {
    return (
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        {errorMessage && (
          <p style={{ color: '#e05252', marginBottom: 12 }}>⚠️ {errorMessage}</p>
        )}
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🖼️ Modifier l'avatar
        </button>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 24, padding: 16, border: '1px solid #33415a', borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Changer ton avatar</h3>

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
        <div style={{ fontSize: 12, color: '#999' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Avatar {selectedAvatar}/16</p>
        </div>
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
  )
}