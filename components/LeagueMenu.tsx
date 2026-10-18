'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { TbChevronDown, TbCheck } from 'react-icons/tb'

type Option = { id: number | string; nom: string }

const COULEURS = ['#3b5b9c', '#9c6b1f', '#2f7a5a', '#8a3b6e', '#a14a3b', '#4a7a8a']

function Pastille({ id, nom }: { id: number | string; nom: string }) {
  const n = Number(id)
  const couleur = COULEURS[(Number.isFinite(n) ? Math.abs(n) : 0) % COULEURS.length]
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: couleur,
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {(nom.trim().charAt(0) || '?').toUpperCase()}
    </span>
  )
}

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
    padding: '10px 12px',
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
  }

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: 260, margin: '0 auto 14px' }}>
      {peutChanger ? (
        <button type="button" onClick={() => setOuvert(!ouvert)} style={{ ...boutonStyle, cursor: 'pointer' }}>
          <Pastille id={actuelle.id} nom={actuelle.nom} />
          <span>{actuelle.nom}</span>
          <TbChevronDown size={18} color="#9fb0c9" />
        </button>
      ) : (
        <div style={boutonStyle}>
          <Pastille id={actuelle.id} nom={actuelle.nom} />
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
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: 14,
                  textDecoration: 'none',
                  borderTop: i === 0 ? 'none' : '0.5px solid #33415a',
                  background: estActuelle ? '#1b2a4a' : 'transparent',
                }}
              >
                <Pastille id={l.id} nom={l.nom} />
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