'use client'

import { useState } from 'react'
import { changerPseudo } from '@/app/profile/actions'

interface PseudoEditorProps {
  currentPseudo: string
}

export default function PseudoEditor({ currentPseudo }: PseudoEditorProps) {
  const [editing, setEditing] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <h1 style={{ margin: 0 }}>{currentPseudo}</h1>
        <button
          onClick={() => setEditing(!editing)}
          aria-label="Modifier le pseudo"
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ✏️
        </button>
      </div>

      {editing && (
        <form action={changerPseudo} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          <input
            type="text"
            name="pseudo"
            placeholder="Nouveau pseudo"
            defaultValue={currentPseudo}
            required
            minLength={2}
            style={{ padding: 8 }}
          />
          <button type="submit" style={{ padding: 8 }}>Valider</button>
        </form>
      )}
    </div>
  )
}