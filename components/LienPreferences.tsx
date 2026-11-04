'use client'

import { TbSettings, TbChevronRight } from 'react-icons/tb'

// Ouvre le panneau « Préférences » (le même que la roue dentée en haut de page)
export default function LienPreferences() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('ouvrir-preferences'))}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <TbSettings size={20} color="#9fb0c9" />
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>Préférences</span>
        <span style={{ display: 'block', fontSize: 12, color: '#9fb0c9' }}>Animations · Rappels de pronostics</span>
      </span>
      <TbChevronRight size={18} color="#9fb0c9" />
    </button>
  )
}