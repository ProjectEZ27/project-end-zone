'use client'

import { useState } from 'react'
import { changerAvatar } from '@/app/profile/actions'
import { retirerPhotoProfil } from '@/app/photos/actions'
import AvatarSelector from './AvatarSelector'
import UserAvatar from './UserAvatar'
import PhotoUploader from './PhotoUploader'

interface AvatarEditorProps {
  currentAvatarId: number
  photoChemin?: string | null
  photoEnAttente?: boolean
  userId?: string
  children?: React.ReactNode
}

export default function AvatarEditor({
  currentAvatarId,
  photoChemin = null,
  photoEnAttente = false,
  userId,
  children,
}: AvatarEditorProps) {
  const [open, setOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarId)
  const [montrerPhoto, setMontrerPhoto] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        <UserAvatar
          avatarId={currentAvatarId}
          photoChemin={photoChemin}
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
                setMontrerPhoto(false)
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

          {userId && (
            <div style={{ borderTop: '1px solid #33415a', marginTop: 16, paddingTop: 14, textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#9fb0c9' }}>Ou utilise ta propre photo</p>

              {photoEnAttente && (
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#f5c969' }}>
                  Une photo est en attente de validation. Ton avatar actuel reste affiché en attendant.
                </p>
              )}

              {!montrerPhoto ? (
                <button
                  type="button"
                  onClick={() => setMontrerPhoto(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '1px dashed #C8352E',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {photoChemin ? 'Changer ma photo' : 'Ajouter ma photo'}
                </button>
              ) : (
                <PhotoUploader type="profil" cible={userId} onTermine={() => setMontrerPhoto(false)} />
              )}

              {photoChemin && (
                <form action={retirerPhotoProfil} style={{ marginTop: 12 }}>
                  <button
                    type="submit"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#9fb0c9',
                      fontSize: 12,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Retirer ma photo et revenir à l'avatar
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}