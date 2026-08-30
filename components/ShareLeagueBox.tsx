'use client'

import { useState } from 'react'
import { TbLink, TbShieldCheck, TbCopy, TbCheck, TbShare } from 'react-icons/tb'

function CodeRow({ icon, label, code }: { icon: React.ReactNode; label: string; code: string }) {
  const [copie, setCopie] = useState(false)

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopie(true)
      setTimeout(() => setCopie(false), 1500)
    } catch {
      // navigateur sans clipboard : on ignore silencieusement
    }
  }

  return (
    <div
      onClick={copier}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0b1220',
        border: '0.5px solid #33415a',
        borderRadius: 8,
        padding: '8px 10px',
        marginBottom: 8,
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9fb0c9', fontSize: 12 }}>
        {icon} {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, letterSpacing: 1 }}>{code}</span>
        {copie ? <TbCheck size={14} color="#5DCAA5" /> : <TbCopy size={14} color="#9fb0c9" />}
      </div>
    </div>
  )
}

export default function ShareLeagueBox({
  codeInvitation,
  codeSecours,
  leagueName,
}: {
  codeInvitation: string
  codeSecours?: string
  leagueName: string
}) {
  const lienInvitation = `https://projectendzone.fr/leagues/join/${codeInvitation}`

  const partager = async () => {
    const texte = `Rejoins ma ligue "${leagueName}" sur Project End Zone !\nCode d'invitation : ${codeInvitation}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Project End Zone', text: texte, url: lienInvitation })
      } catch {
        // l'utilisateur a annulé le partage, rien à faire
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${texte}\n${lienInvitation}`)
        alert('Message de partage copié dans le presse-papier !')
      } catch {
        // navigateur sans clipboard : on ignore silencieusement
      }
    }
  }

  return (
    <div>
      <CodeRow icon={<TbLink size={15} />} label="Code d'invitation" code={codeInvitation} />
      {codeSecours && (
        <CodeRow icon={<TbShieldCheck size={15} />} label="Code de secours" code={codeSecours} />
      )}

      <button
        onClick={partager}
        style={{
          width: '100%',
          background: 'transparent',
          color: 'white',
          border: '0.5px solid #33415a',
          padding: 10,
          borderRadius: 8,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          cursor: 'pointer',
        }}
      >
        <TbShare size={15} /> Partager la ligue
      </button>
    </div>
  )
}