'use client'

import { useState } from 'react'
import { supprimerLigue } from '@/app/leagues/[id]/actions'

export default function DeleteLeagueButton({ ligueId, ligueNom }: { ligueId: string; ligueNom: string }) {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  return (
    <div style={{ marginTop: 32 }}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            width: '100%',
            padding: 10,
            background: 'transparent',
            border: '0.5px solid #791F1F',
            borderRadius: 8,
            color: '#e05252',
            cursor: 'pointer',
          }}
        >
          🗑️ Supprimer la ligue
        </button>
      ) : (
        <div style={{ background: '#22160e', border: '1px solid #791F1F', borderRadius: 10, padding: 16, textAlign: 'left' }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>⚠️ Cette action est irréversible</p>
          <p style={{ fontSize: 13, color: '#9fb0c9', marginBottom: 12 }}>
            Tous les membres seront retirés et l'historique de cette ligue sera définitivement perdu.
            Tape <strong>{ligueNom}</strong> pour confirmer.
          </p>
          <form action={supprimerLigue}>
            <input type="hidden" name="ligue_id" value={ligueId} />
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={ligueNom}
              style={{ width: '100%', padding: 8, marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={confirmation !== ligueNom}
                style={{
                  flex: 1,
                  padding: 10,
                  background: confirmation === ligueNom ? '#791F1F' : '#3a2a2a',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: confirmation === ligueNom ? 'pointer' : 'not-allowed',
                }}
              >
                Confirmer la suppression
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setConfirmation('') }}
                style={{ flex: 1, padding: 10, background: 'transparent', border: '0.5px solid #33415a', borderRadius: 8, color: 'white', cursor: 'pointer' }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}