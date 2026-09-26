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
        background: 'rgba(255,255,255,0.06)',
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
      <option value={ligueActuelleId}>{ligueActuelleNom} (actuelle)</option>
      {autresLigues.map((l) => (
        <option key={l.id} value={l.id}>
          {l.nom}
        </option>
      ))}
    </select>
  )
}