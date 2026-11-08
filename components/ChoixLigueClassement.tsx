'use client'
 
import { useRouter } from 'next/navigation'
 
/*
 * Menu déroulant « Ligues » de la page Classement.
 * Le bouton « Général » est à part (dans la page) ; ici on ne choisit qu'une ligue.
 */
export default function ChoixLigueClassement({
  ligues,
  ligueActuelleId,
}: {
  ligues: { id: number; nom: string }[]
  ligueActuelleId: number | null
}) {
  const router = useRouter()
  const actif = ligueActuelleId !== null
 
  return (
    <select
      aria-label="Choisir une ligue"
      value={actif ? String(ligueActuelleId) : ''}
      onChange={(e) => {
        if (e.target.value) router.push(`/classement?ligue=${e.target.value}`)
      }}
      style={{
        padding: '7px 14px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        maxWidth: 220,
        background: actif ? 'rgba(200,53,46,0.2)' : 'rgba(255,255,255,0.04)',
        border: actif ? '1px solid rgba(200,53,46,0.6)' : '1px solid rgba(255,255,255,0.15)',
        color: actif ? 'white' : 'rgba(255,255,255,0.7)',
      }}
    >
      <option value="" style={{ background: '#16233F', color: 'white' }}>
        Mes ligues ▾
      </option>
      {ligues.map((l) => (
        <option key={l.id} value={l.id} style={{ background: '#16233F', color: 'white' }}>
          {l.nom}
        </option>
      ))}
    </select>
  )
}
 