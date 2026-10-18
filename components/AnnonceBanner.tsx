'use client'

import { useEffect, useState } from 'react'
import { TbSpeakerphone, TbX } from 'react-icons/tb'

export default function AnnonceBanner({
  id,
  titre,
  message,
}: {
  id: number
  titre: string | null
  message: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('annonce_fermee') !== String(id)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [id])

  if (!visible) return null

  const fermer = () => {
    setVisible(false)
    try {
      localStorage.setItem('annonce_fermee', String(id))
    } catch {}
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        textAlign: 'left',
        background: 'rgba(245,180,60,0.15)',
        border: '1px solid rgba(245,180,60,0.45)',
        borderRadius: 10,
        padding: 12,
        margin: '16px 0',
      }}
    >
      <TbSpeakerphone size={20} color="#f5c969" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        {titre && (
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f5c969', marginBottom: 2 }}>{titre}</div>
        )}
        <div style={{ fontSize: 13, lineHeight: 1.45, color: '#e6ebf5' }}>{message}</div>
      </div>
      <button
        onClick={fermer}
        aria-label="Fermer l'annonce"
        style={{ background: 'transparent', border: 'none', color: '#e6ebf5', padding: 0, cursor: 'pointer', flexShrink: 0 }}
      >
        <TbX size={18} />
      </button>
    </div>
  )
}