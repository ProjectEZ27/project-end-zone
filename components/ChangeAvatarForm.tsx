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
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarId)
  const [isChanged, setIsChanged] = useState(false)

  const handleSelect = (avatarId: number) => {
    setSelectedAvatar(avatarId)
    setIsChanged(avatarId !== currentAvatarId)
  }

  return (
    <div style={{ marginTop: 24, padding: 16, border: '1px solid #33415a', borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Changer ton avatar</h3>
      {errorMessage && (
        <p style={{ color: '#e05252', marginBottom: 12 }}>⚠️ {errorMessage}</p>
      )}

      <AvatarSelector selectedId={selectedAvatar} onSelect={handleSelect} />

      {/* APERÇU AVATAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '12px',
          backgroundColor: 'rgba(200, 53, 46, 0.1)',
          borderRadius: 6,
          margin: '12px 0'
        }}
      >
        <UserAvatar avatarId={selectedAvatar} size={48} />
        <div style={{ fontSize: 12, color: '#999' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Avatar {selectedAvatar}/16</p>
        </div>
      </div>

      {/* FORMULAIRE */}
      <form action={changerAvatar} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <input type="hidden" name="avatar_id" value={selectedAvatar} />
        <button
          type="submit"
          disabled={!isChanged}
          style={{
            padding: '8px 16px',
            backgroundColor: isChanged ? '#C8352E' : '#666',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: isChanged ? 'pointer' : 'not-allowed',
            opacity: isChanged ? 1 : 0.5
          }}
        >
          Sauvegarder
        </button>
      </form>
    </div>
  )
}