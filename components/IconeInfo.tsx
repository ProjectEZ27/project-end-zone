'use client'

import type { ButtonHTMLAttributes } from 'react'

/**
 * Le petit « i » rond, identique partout sur le site
 * (sous les matchs, page Info équipes, pronostics spéciaux).
 * `libelle` : petit texte optionnel affiché à côté (ex. « Infos »).
 */
export default function IconeInfo({
  libelle,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { libelle?: string }) {
  return (
    <button
      type="button"
      {...props}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.85)',
          fontSize: 12,
          fontWeight: 700,
          fontStyle: 'italic',
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        i
      </span>
      {libelle && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{libelle}</span>}
    </button>
  )
}