'use client'

import { useState } from 'react'
import { REGIONS } from '@/lib/regions'
import { choisirRegion } from '@/app/leagues/region/actions'

const carte: React.CSSProperties = {
  background: '#16233F',
  border: '0.5px solid #33415a',
  borderRadius: 12,
  padding: 18,
  textAlign: 'left',
}
const champ: React.CSSProperties = {
  width: '100%',
  padding: 10,
  fontSize: 15,
  borderRadius: 8,
  border: '1px solid #33415a',
  background: '#0f1a30',
  color: 'white',
  boxSizing: 'border-box',
}
const boutonPlein: React.CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 8,
  border: 'none',
  background: '#C8352E',
  color: 'white',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}
const boutonVide: React.CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 8,
  border: '1px solid #33415a',
  background: 'transparent',
  color: 'white',
  fontSize: 15,
  cursor: 'pointer',
}

export default function ChoixRegion({ erreurServeur }: { erreurServeur?: string }) {
  const [etape, setEtape] = useState<'choix' | 'confirmation'>('choix')
  const [region, setRegion] = useState('')
  const [pays, setPays] = useState('')
  const [erreur, setErreur] = useState(erreurServeur ?? '')

  const nom = REGIONS.find((r) => r.code === region)?.nom ?? ''
  const horsFrance = region === 'hors-france'

  function continuer() {
    if (!region) {
      setErreur('Choisis une région')
      return
    }
    if (horsFrance && !pays.trim()) {
      setErreur('Indique ton pays')
      return
    }
    setErreur('')
    setEtape('confirmation')
  }

  if (etape === 'confirmation') {
    return (
      <div style={{ ...carte, textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/badges-regions/${region}.png`} alt={`Écusson ${nom}`} width={110} height={110} style={{ display: 'block', margin: '0 auto 10px' }} />
        <p style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>
          Valider {horsFrance ? `Hors France (${pays.trim()})` : nom} ?
        </p>
        <p style={{ fontSize: 14, color: '#9fb0c9', margin: '0 0 16px', lineHeight: 1.5 }}>
          Tu ne pourras plus changer de région cette saison.
        </p>
        <form action={choisirRegion} style={{ display: 'flex', gap: 8 }}>
          <input type="hidden" name="region" value={region} />
          <input type="hidden" name="pays" value={pays.trim()} />
          <button type="button" style={boutonVide} onClick={() => setEtape('choix')}>Modifier</button>
          <button type="submit" style={boutonPlein}>Valider</button>
        </form>
      </div>
    )
  }

  return (
    <div style={carte}>
      <p style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>Choisis ta région</p>
      <p style={{ fontSize: 14, color: '#9fb0c9', margin: '0 0 14px', lineHeight: 1.5 }}>
        Tu rejoins la ligue de ta région et tu entres dans le classement des régions. Tu pourras voir le classement des autres régions.
      </p>
      <select
        value={region}
        onChange={(e) => { setRegion(e.target.value); setErreur('') }}
        style={champ}
        aria-label="Région"
      >
        <option value="">Sélectionne une région</option>
        {REGIONS.map((r) => (
          <option key={r.code} value={r.code}>{r.nom}</option>
        ))}
      </select>

      {horsFrance && (
        <>
          <input
            type="text"
            value={pays}
            maxLength={60}
            onChange={(e) => { setPays(e.target.value); setErreur('') }}
            placeholder="Belgique"
            aria-label="Pays"
            style={{ ...champ, marginTop: 8 }}
          />
          <p style={{ fontSize: 12, color: '#7a8aa5', margin: '4px 0 0' }}>
            Indique ton pays. Seul l&apos;organisateur du jeu le voit.
          </p>
        </>
      )}

      {erreur && <p style={{ fontSize: 13, color: '#ff8a8a', margin: '10px 0 0' }}>{erreur}</p>}

      <button type="button" style={{ ...boutonPlein, width: '100%', marginTop: 14 }} onClick={continuer}>
        Continuer
      </button>
    </div>
  )
}