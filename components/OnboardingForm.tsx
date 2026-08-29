'use client'

import { useState } from 'react'
import { saveOnboarding } from '@/app/onboarding/actions'
import AvatarSelector from './AvatarSelector'
import UserAvatar from './UserAvatar'

interface OnboardingFormProps {
  equipes: [string, string][]
  errorMessage?: string
}

export default function OnboardingForm({ equipes, errorMessage }: OnboardingFormProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(1)

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        
        backgroundImage: 'url(/fonds/Fond-Acceuil.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '80px 24px 100px', textAlign: 'center', color: 'white' }}>
      <h1>🏈 Bienvenue !</h1>
      <p>Choisis ton pseudo, ton équipe et ton avatar pour commencer</p>
      {errorMessage && (
        <p style={{ color: '#e05252' }}>⚠️ {errorMessage}</p>
      )}

      <form action={saveOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        {/* PSEUDO */}
        <input
          type="text"
          name="pseudo"
          placeholder="Ton pseudo"
          required
          style={{ padding: 10 }}
        />

        {/* ÉQUIPE FAVORITE */}
        <select name="equipe_favorite" defaultValue="" style={{ padding: 10 }}>
          <option value="">Ton équipe NFL favorite (facultatif)</option>
          {equipes.map(([code, nom]) => (
            <option key={code} value={code}>{nom}</option>
          ))}
        </select>

        {/* SÉLECTEUR D'AVATAR */}
        <div style={{ marginTop: 16 }}>
          <AvatarSelector selectedId={selectedAvatar} onSelect={setSelectedAvatar} />
        </div>

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
            marginBottom: 12
          }}
        >
          <UserAvatar avatarId={selectedAvatar} size={48} />
          <div style={{ fontSize: 12, color: '#999' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Avatar {selectedAvatar}/16</p>
          </div>
        </div>

        {/* INPUT CACHÉ POUR L'AVATAR */}
        <input type="hidden" name="avatar_id" value={selectedAvatar} />

        {/* BOUTON */}
        <button type="submit" style={{ padding: 10, marginTop: 8 }}>
          C'est parti
        </button>
      </form>
      </div>
    </div>
  )
}