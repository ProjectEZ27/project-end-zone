'use client'

export default function SelecteurSemaine({
  semaines,
  semaineActuelle,
}: {
  semaines: { id: number; nom: string }[]
  semaineActuelle: number
}) {
  return (
    <form action="/pronostics" method="get" style={{ marginBottom: 16 }}>
      <select
        name="semaine"
        defaultValue={semaineActuelle}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        style={{ padding: 8 }}
      >
        {semaines.map((s) => (
          <option key={s.id} value={s.id}>{s.nom}</option>
        ))}
      </select>
    </form>
  )
}