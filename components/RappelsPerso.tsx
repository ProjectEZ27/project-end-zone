'use client'

import { useRef, useState, useTransition } from 'react'
import { enregistrerRappels } from '@/app/profile/actions'

const HEURES = [36, 24, 12, 6, 3, 1]

export default function RappelsPerso({
  r1Actif,
  r1Heures,
  r2Actif,
  r2Heures,
}: {
  r1Actif: boolean
  r1Heures: number
  r2Actif: boolean
  r2Heures: number
}) {
  const [a1, setA1] = useState(r1Actif)
  const [h1, setH1] = useState(r1Heures)
  const [a2, setA2] = useState(r2Actif)
  const [h2, setH2] = useState(r2Heures)
  const [message, setMessage] = useState<{ texte: string; ok: boolean } | null>(null)
  const [, startTransition] = useTransition()
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null)

  function enregistrer(na1: boolean, nh1: number, na2: boolean, nh2: number) {
    startTransition(async () => {
      const res = await enregistrerRappels(na1, nh1, na2, nh2)
      setMessage(res.ok ? { texte: 'Enregistré ✓', ok: true } : { texte: res.message ?? 'Erreur', ok: false })
      if (minuteur.current) clearTimeout(minuteur.current)
      minuteur.current = setTimeout(() => setMessage(null), 2500)
    })
  }

  const selectStyle: React.CSSProperties = {
    background: '#0b1220',
    color: 'white',
    border: '1px solid #33415a',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 14,
    minWidth: 120,
  }
  const ligne: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Mes rappels par e-mail</div>
      <div style={{ fontSize: 11, color: '#9fb0c9', marginBottom: 14, lineHeight: 1.5 }}>
        Un e-mail avant le premier match de la semaine, seulement si tu n'as pas encore fini tes pronostics.
      </div>

      <div style={ligne}>
        <input
          type="checkbox"
          id="rappel1"
          checked={a1}
          onChange={(e) => { setA1(e.target.checked); enregistrer(e.target.checked, h1, a2, h2) }}
          style={{ width: 18, height: 18 }}
        />
        <label htmlFor="rappel1" style={{ flex: 1, fontSize: 14 }}>Premier rappel</label>
        <select
          value={h1}
          disabled={!a1}
          onChange={(e) => { const v = Number(e.target.value); setH1(v); enregistrer(a1, v, a2, h2) }}
          style={{ ...selectStyle, opacity: a1 ? 1 : 0.4 }}
        >
          {HEURES.map((h) => (
            <option key={h} value={h} disabled={h === h2} style={{ background: '#0b1220', color: 'white' }}>
              {h}h avant
            </option>
          ))}
        </select>
      </div>

      <div style={ligne}>
        <input
          type="checkbox"
          id="rappel2"
          checked={a2}
          onChange={(e) => { setA2(e.target.checked); enregistrer(a1, h1, e.target.checked, h2) }}
          style={{ width: 18, height: 18 }}
        />
        <label htmlFor="rappel2" style={{ flex: 1, fontSize: 14 }}>Second rappel</label>
        <select
          value={h2}
          disabled={!a2}
          onChange={(e) => { const v = Number(e.target.value); setH2(v); enregistrer(a1, h1, a2, v) }}
          style={{ ...selectStyle, opacity: a2 ? 1 : 0.4 }}
        >
          {HEURES.map((h) => (
            <option key={h} value={h} disabled={h === h1} style={{ background: '#0b1220', color: 'white' }}>
              {h}h avant
            </option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: 12, minHeight: 16, color: message?.ok === false ? '#ff8f87' : '#4ee892' }}>
        {message?.texte ?? '\u00A0'}
      </div>
    </div>
  )
}