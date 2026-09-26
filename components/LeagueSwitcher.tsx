'use client'

interface LeagueOption {
  id: number
  nom: string
}

export default function LeagueSwitcher({
  ligueActuelleId,
  ligueActuelleNom,
  autresLigues,
}: {
  ligueActuelleId: string
  ligueActuelleNom: string
  autresLigues: LeagueOption[]
}) {
  if (autresLigues.length === 0) return null

  return (
    <select
      defaultValue={ligueActuelleId}
      onChange={(e) => {
        window.location.href = `/leagues/${e.target.value}`
      }}
      style={{
        background: '#16233F',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'white',
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 14px',
        borderRadius: 20,
        marginTop: 4,
        marginBottom: 8,
      }}
    >
      <option style={{ background: '#16233F', color: 'white' }} value={ligueActuelleId}>
        {ligueActuelleNom} (actuelle)
      </option>
      {autresLigues.map((l) => (
        <option key={l.id} style={{ background: '#16233F', color: 'white' }} value={l.id}>
          {l.nom}
        </option>
      ))}
    </select>
  )
}