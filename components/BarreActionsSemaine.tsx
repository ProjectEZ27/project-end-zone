'use client'

import { useState } from 'react'
import { TbChartBar, TbInfoCircle, TbX } from 'react-icons/tb'

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
export default function BarreActionsSemaine({ avecInfos }: { avecInfos: boolean }) {
  const [open, setOpen] = useState(false)

  function basculer() {
    const suivant = !open
    document.querySelectorAll('[data-info-toggle]').forEach((el) => {
      ;(el as HTMLDetailsElement).open = suivant
    })
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
        Power ranking
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
    </div>
  )
}