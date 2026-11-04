'use client'

import { useEffect, useRef, useState } from 'react'
import { TbChevronDown } from 'react-icons/tb'
import type { LigneSemaine } from '@/lib/scoresSemaines'

function pts(n: number) {
  return `${n} ${n > 1 ? 'pts' : 'pt'}`
}

export default function SelecteurSemaine({
  lignes,
  semaineActuelle,
}: {
  lignes: LigneSemaine[]
  semaineActuelle: number
}) {
  const [ouvert, setOuvert] = useState(false)
  const liste = useRef<HTMLUListElement>(null)
  const courante = lignes.find((l) => l.id === semaineActuelle)

  // À l'ouverture : la liste défile jusqu'à la semaine en cours (sinon jusqu'à la semaine affichée)
  useEffect(() => {
    if (!ouvert || !liste.current) return
    const cible =
      liste.current.querySelector<HTMLElement>('[data-en-cours="1"]') ??
      liste.current.querySelector<HTMLElement>('[aria-current="page"]')
    if (cible) {
      liste.current.scrollTop = cible.offsetTop - liste.current.clientHeight / 2 + cible.clientHeight / 2
    }
  }, [ouvert])

  useEffect(() => {
    if (!ouvert) return
    const fermerAuClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false)
    }
    window.addEventListener('keydown', fermerAuClavier)
    return () => window.removeEventListener('keydown', fermerAuClavier)
  }, [ouvert])

  return (
    // Même hauteur que la roue des préférences et la cloche (en haut à droite), qui gardent leur place
    <div style={{ position: 'relative', margin: '-26px 88px 16px 0', textAlign: 'left' }}>
      {ouvert && (
        <div onClick={() => setOuvert(false)} style={{ position: 'fixed', inset: 0, zIndex: 140 }} />
      )}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        aria-label="Choisir la semaine"
        onClick={() => setOuvert((o) => !o)}
        style={{
          position: 'relative',
          zIndex: 150,
          width: '100%',
          height: 40,
          padding: '0 12px',
          borderRadius: 10,
          border: '1px solid #33415a',
          background: 'linear-gradient(180deg, #1b2b4d, #16233F)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {courante?.nom ?? 'Semaine'}
          </span>
          {courante?.etat === 'terminee' && courante.score !== null && (
            <span style={{ fontSize: 12, fontWeight: 500, color: '#f0c040' }}>{pts(courante.score)}</span>
          )}
        </span>
        <TbChevronDown
          size={18}
          color="#9fb0c9"
          style={{ flex: 'none', transform: ouvert ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        />
      </button>

      {ouvert && (
        <ul
          ref={liste}
          role="listbox"
          aria-label="Semaines"
          style={{
            position: 'absolute',
            top: 46,
            left: 0,
            right: 0,
            zIndex: 150,
            maxHeight: '55vh',
            overflowY: 'auto',
            margin: 0,
            padding: 6,
            listStyle: 'none',
            background: '#16233F',
            border: '1px solid #33415a',
            borderRadius: 12,
            boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
          }}
        >
          {lignes.map((l) => {
            const selectionnee = l.id === semaineActuelle
            const enCours = l.etat === 'en_cours'
            return (
              <li key={l.id} role="presentation">
                <a
                  href={`/pronostics?semaine=${l.id}`}
                  role="option"
                  aria-selected={selectionnee}
                  aria-current={selectionnee ? 'page' : undefined}
                  data-en-cours={enCours ? '1' : undefined}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 10px',
                    marginBottom: 2,
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: selectionnee ? 700 : 500,
                    border: `1px solid ${selectionnee ? 'rgba(200,53,46,0.6)' : enCours ? 'rgba(240,192,64,0.5)' : 'transparent'}`,
                    background: selectionnee ? 'rgba(200,53,46,0.18)' : 'transparent',
                    opacity: l.etat === 'a_venir' && !selectionnee ? 0.5 : 1,
                  }}
                >
                  <span>{l.nom}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: enCours ? '#f0c040' : l.etat === 'terminee' && l.score !== null ? '#f0c040' : '#9fb0c9',
                    }}
                  >
                    {l.etat === 'terminee' ? (l.score !== null ? pts(l.score) : '—') : enCours ? 'En cours' : 'À venir'}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}