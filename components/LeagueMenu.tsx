'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { TbChevronDown, TbCheck } from 'react-icons/tb'
import LeagueLogo from '@/components/LeagueLogo'

type Option = { id: number | string; nom: string; logo_id?: number | null }

export default function LeagueMenu({
  ligueActuelleId,
  ligues,
  actif,
}: {
  ligueActuelleId: string
  ligues: Option[]
  actif: string
}) {
  const [ouvert, setOuvert] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fermerSiDehors(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false)
    }
    document.addEventListener('mousedown', fermerSiDehors)
    document.addEventListener('touchstart', fermerSiDehors)
    return () => {
      document.removeEventListener('mousedown', fermerSiDehors)
      document.removeEventListener('touchstart', fermerSiDehors)
    }
  }, [])

  const actuelle = ligues.find((l) => String(l.id) === String(ligueActuelleId)) ?? ligues[0]
  if (!actuelle) return null

  const peutChanger = ligues.length > 1
  const section = actif === 'parametres' ? 'pronostics' : actif

  const boutonStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#16233F',
    border: '1px solid #33415a',
    borderRadius: 10,
    padding: '8px 12px',
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
  }

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: 260, margin: '0 auto 14px' }}>
      {peutChanger ? (
        <button type="button" onClick={() => setOuvert(!ouvert)} style={{ ...boutonStyle, cursor: 'pointer' }}>
          <LeagueLogo logoId={actuelle.logo_id ?? 1} size={32} leagueName={actuelle.nom} />
          <span>{actuelle.nom}</span>
          <TbChevronDown size={18} color="#9fb0c9" />
        </button>
      ) : (
        <div style={boutonStyle}>
          <LeagueLogo logoId={actuelle.logo_id ?? 1} size={32} leagueName={actuelle.nom} />
          <span>{actuelle.nom}</span>
        </div>
      )}

      {ouvert && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 'calc(100% + 4px)',
            background: '#16233F',
            border: '1px solid #33415a',
            borderRadius: 10,
            overflow: 'hidden',
            zIndex: 20,
            textAlign: 'left',
          }}
        >
          {ligues.map((l, i) => {
            const estActuelle = String(l.id) === String(actuelle.id)
            return (
              <Link
                key={l.id}
                href={`/leagues/${l.id}/${section}`}
                onClick={() => setOuvert(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: 14,
                  textDecoration: 'none',
                  borderTop: i === 0 ? 'none' : '0.5px solid #33415a',
                  background: estActuelle ? '#1b2a4a' : 'transparent',
                }}
              >
                <LeagueLogo logoId={l.logo_id ?? 1} size={32} leagueName={l.nom} />
                <span style={{ flex: 1 }}>{l.nom}</span>
                {estActuelle && <TbCheck size={16} color="#9fb0c9" />}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}