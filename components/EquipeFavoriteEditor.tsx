'use client'

import { useState } from 'react'
import { changerEquipeFavorite } from '@/app/profile/actions'
import { NOMS_EQUIPES } from '@/lib/teamBadge'

const EQUIPES_NFL = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LA','LAC','LV','MIA','MIN','NE','NO','NYG','NYJ',
  'PHI','PIT','SEA','SF','TB','TEN','WAS',
]

interface EquipeFavoriteEditorProps {
  currentEquipe: string | null
}

export default function EquipeFavoriteEditor({ currentEquipe }: EquipeFavoriteEditorProps) {
  const [editing, setEditing] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <p style={{ fontSize: 12, color: '#9fb0c9', margin: 0 }}>
          Équipe favorite :{' '}
          <span style={{ color: '#C8352E', fontWeight: 600 }}>
            {currentEquipe ? (NOMS_EQUIPES[currentEquipe] ?? currentEquipe) : 'aucune'}
          </span>
        </p>
        <button
          onClick={() => setEditing(!editing)}
          aria-label="Modifier l'équipe favorite"
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.1)',
            color: '#9fb0c9',
            fontSize: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          ✎
        </button>
      </div>

      {editing && (
        <form
          action={changerEquipeFavorite}
          style={{
            marginTop: 12,
            background: '#16233F',
            border: '1px solid #33415a',
            borderRadius: 10,
            padding: 12,
            textAlign: 'left',
            maxWidth: 280,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <div style={{ fontSize: 11, color: '#9fb0c9', marginBottom: 8 }}>
            Choisir une nouvelle équipe favorite
          </div>
          <select
            name="equipe_favorite"
            defaultValue={currentEquipe ?? ''}
            required
            style={{
              width: '100%',
              background: '#0b1220',
              color: 'white',
              border: '1px solid #33415a',
              borderRadius: 8,
              padding: 8,
              fontSize: 13,
            }}
          >
            {EQUIPES_NFL.map((code) => (
              <option key={code} value={code}>
                {NOMS_EQUIPES[code] ?? code}
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              width: '100%',
              marginTop: 8,
              background: '#C8352E',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Enregistrer
          </button>
        </form>
      )}
    </div>
  )
}