'use client'

export default function SelecteurSemaine({
  semaines,
  semaineActuelle,
}: {
  semaines: { id: number; nom: string }[]
  semaineActuelle: number
}) {
  return (
    // Même hauteur que la roue des préférences et la cloche (en haut à droite), qui gardent leur place
    <form action="/pronostics" method="get" style={{ margin: '-26px 88px 16px 0' }}>
      <select
        name="semaine"
        defaultValue={semaineActuelle}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Choisir la semaine"
        style={{
          width: '100%',
          height: 38,
          padding: '0 8px',
          borderRadius: 8,
          border: '1px solid #33415a',
          background: '#16233F',
          color: 'white',
          fontSize: 15,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {semaines.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nom}
          </option>
        ))}
      </select>
    </form>
  )
}