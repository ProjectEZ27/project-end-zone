'use client'

import { useState } from 'react'
import { GLOSSAIRE } from '@/lib/glossaire'

function construireRegex() {
  const termes = Object.keys(GLOSSAIRE).sort((a, b) => b.length - a.length)
  const echappes = termes.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`(${echappes.join('|')})`, 'gi')
}

export default function JournalPhrase({ texte }: { texte: string }) {
  const [termeActif, setTermeActif] = useState<string | null>(null)
  const morceaux = texte.split(construireRegex())

  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: 0, lineHeight: 1.6, fontSize: 14, color: 'white' }}>
        {morceaux.map((morceau, i) => {
          const cle = morceau.toLowerCase()
          if (GLOSSAIRE[cle]) {
            const estActif = termeActif === cle
            return (
              <span
                key={i}
                onClick={() => setTermeActif(estActif ? null : cle)}
                style={{
                  textDecoration: 'underline dotted',
                  textUnderlineOffset: 3,
                  cursor: 'pointer',
                  color: estActif ? '#C8352E' : 'white',
                  fontWeight: 600,
                }}
              >
                {morceau}
                <span style={{ fontSize: 11, marginLeft: 2, color: '#7fa8e0' }}>ⓘ</span>
              </span>
            )
          }
          return <span key={i}>{morceau}</span>
        })}
      </p>
      {termeActif && (
        <div style={{
          marginTop: 8,
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)',
          borderLeft: '3px solid #C8352E',
          fontSize: 13,
          color: '#cdd8ea',
          textAlign: 'left',
        }}>
          {GLOSSAIRE[termeActif]}
        </div>
      )}
    </div>
  )
}