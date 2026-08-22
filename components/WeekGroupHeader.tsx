'use client'

import { useEffect, useState } from 'react'

interface WeekGroupHeaderProps {
  coupEnvoi: string
  nombreMatchs: number
  estActif: boolean
  estVerrouille: boolean
}

function formatCreneau(dateStr: string) {
  const date = new Date(dateStr)
  const jour = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
  const jourCapitalise = jour.charAt(0).toUpperCase() + jour.slice(1)
  const heure = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
  return `${jourCapitalise} — ${heure}`
}

function formatDecompte(msRestant: number) {
  if (msRestant <= 0) return 'en cours...'

  const totalMinutes = Math.floor(msRestant / 60000)
  const jours = Math.floor(totalMinutes / (60 * 24))
  const heures = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (jours > 0) return `${jours}j ${heures}h ${minutes}min`
  if (heures > 0) return `${heures}h ${minutes}min`
  return `${minutes}min`
}

export default function WeekGroupHeader({ coupEnvoi, nombreMatchs, estActif, estVerrouille }: WeekGroupHeaderProps) {
  const [maintenant, setMaintenant] = useState(() => Date.now())

  useEffect(() => {
    if (!estActif) return
    const interval = setInterval(() => setMaintenant(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [estActif])

  const label = formatCreneau(coupEnvoi)
  const suffixeMatchs = nombreMatchs > 1 ? `${nombreMatchs} matchs` : 'Match unique'

  if (estActif) {
    const msRestant = new Date(coupEnvoi).getTime() - maintenant

    return (
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 12,
          marginTop: 20,
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15)), #0d1220',
          border: '1.5px solid rgba(255,55,40,0.5)',
          boxShadow: 'inset 0 0 25px rgba(255,40,30,0.06), 0 0 10px rgba(255,50,40,0.35), 0 0 30px rgba(255,40,30,0.15)',
        }}
      >
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
          Prochain coup d'envoi
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 1.5,
            color: 'white',
            textShadow: '0 3px 8px rgba(0,0,0,0.7), 0 0 14px rgba(255,55,40,0.5)',
          }}
        >
          {formatDecompte(msRestant)}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          {label} · {suffixeMatchs}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '10px 12px',
        marginBottom: 12,
        marginTop: 20,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: estVerrouille ? 0.5 : 1,
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: estVerrouille ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)',
        }}
      >
        {label}{estVerrouille ? ' · Verrouillé' : ''}
      </span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{suffixeMatchs}</span>
    </div>
  )
}