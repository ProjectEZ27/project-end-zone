'use client'

import { useState } from 'react'
import { TbChartBar, TbInfoCircle, TbX } from 'react-icons/tb'
import { MISE_A_JOUR_INFOS } from '@/lib/miseAJourInfos'

const bouton = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  height: 42,
  borderRadius: 10,
  border: '1px solid #33415a',
  background: 'rgba(255,255,255,0.05)',
  color: '#d5deee',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
}

/**
 * Deux petits boutons côte à côte : le power ranking (page dédiée)
 * et l'affichage des infos équipes sous chaque match (si la semaine a des matchs).
 */
export default function BarreActionsSemaine({ avecInfos, modeExpert }: { avecInfos: boolean; modeExpert: boolean }) {
  const [open, setOpen] = useState(false)

  function basculer() {
    const suivant = !open
    // Prévient chaque match (composant DuelsExpert) d'ouvrir ou fermer son petit « i »
    window.dispatchEvent(new CustomEvent('infos-equipes', { detail: suivant }))
    setOpen(suivant)
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: avecInfos ? '1fr 1fr' : '1fr',
        gap: 8,
        margin: '16px 0',
      }}
    >
      <a href="/infos-equipes" style={bouton}>
        <TbChartBar size={17} />
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
          <span>Power ranking</span>
          {modeExpert && <span style={{ fontSize: 11, color: '#f0c040' }}>⚡ Classement expert</span>}
        </span>
      </a>
      {avecInfos && (
        <button
          type="button"
          onClick={basculer}
          aria-pressed={open}
          style={{
            ...bouton,
            ...(open
              ? { borderColor: '#6fb1ff', color: '#9cc8ff', background: 'rgba(111,177,255,0.12)' }
              : {}),
          }}
        >
          {open ? <TbX size={17} /> : <TbInfoCircle size={17} />}
          Infos équipes
        </button>
      )}
      {avecInfos && open && (
        <p
          style={{
            gridColumn: '1 / -1',
            margin: 0,
            fontSize: 11,
            color: '#9fb0c9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ee892' }} />
          {MISE_A_JOUR_INFOS}
        </p>
      )}
    </div>
  )
}