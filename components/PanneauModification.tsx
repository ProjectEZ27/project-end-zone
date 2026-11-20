'use client'

import { TbAdjustmentsHorizontal, TbChevronRight, TbX } from 'react-icons/tb'

/*
 * Petites briques communes aux écrans « Modifier mon profil » et « Modifier la ligue » :
 * le bouton arrondi, le cadre du panneau, et une ligne de choix (libellé + valeur actuelle).
 */

export function BoutonModifier({ libelle, onClick, ouvert }: { libelle: string; onClick: () => void; ouvert: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ouvert}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: ouvert ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: 'white',
        border: '1px solid #4a5a78',
        borderRadius: 20,
        padding: '6px 14px',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      <TbAdjustmentsHorizontal size={16} />
      {libelle}
    </button>
  )
}

export function PanneauModification({
  titre,
  onFermer,
  children,
}: {
  titre: string
  onFermer: () => void
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        marginTop: 14,
        background: '#16233F',
        border: '0.5px solid #33415a',
        borderRadius: 12,
        padding: 12,
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{titre}</span>
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            padding: 0,
            background: 'none',
            border: '0.5px solid #33415a',
            color: '#9fb0c9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TbX size={15} />
        </button>
      </div>
      {children}
    </div>
  )
}

export function LigneChoix({
  icone,
  libelle,
  valeur,
  onClick,
}: {
  icone: React.ReactNode
  libelle: string
  valeur?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#0B1426',
        border: '0.5px solid #33415a',
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 6,
        color: 'white',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', color: '#9fb0c9' }}>{icone}</span>
      <span style={{ flex: 1, fontSize: 14 }}>{libelle}</span>
      {valeur && (
        <span
          style={{
            fontSize: 12,
            color: '#9fb0c9',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {valeur}
        </span>
      )}
      <TbChevronRight size={16} color="#9fb0c9" />
    </button>
  )
}

export const styleBoutonValider: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#C8352E',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
}

export const styleBoutonRetour: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: 'transparent',
  color: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
}

export const styleChamp: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#0B1426',
  color: 'white',
  border: '0.5px solid #33415a',
  borderRadius: 8,
  padding: 8,
  fontSize: 14,
}