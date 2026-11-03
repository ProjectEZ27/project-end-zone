'use client'

type Semaine = { id: number; nom: string }

// "Week 8" devient "W8" ; les autres noms (Wild Card, Super Bowl...) restent tels quels
function nomCourt(nom: string) {
  return nom.replace(/^week\s*/i, 'W')
}

const boutonNav = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  height: 38,
  padding: '0 10px',
  borderRadius: 8,
  border: '1px solid #33415a',
  color: '#d5deee',
  fontSize: 13,
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
  maxWidth: 110,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

export default function SelecteurSemaine({
  semaines,
  semaineActuelle,
  precedente,
  suivante,
}: {
  semaines: Semaine[]
  semaineActuelle: number
  precedente: Semaine | null
  suivante: Semaine | null
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.6fr 1fr',
        gap: 8,
        alignItems: 'center',
        marginTop: 28, // laisse la place à la cloche de notification (en haut à droite)
        marginBottom: 16,
      }}
    >
      {precedente ? (
        <a href={`/pronostics?semaine=${precedente.id}`} style={{ ...boutonNav, justifySelf: 'start' }}>
          ← {nomCourt(precedente.nom)}
        </a>
      ) : (
        <span />
      )}

      <form action="/pronostics" method="get" style={{ margin: 0 }}>
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

      {suivante ? (
        <a href={`/pronostics?semaine=${suivante.id}`} style={{ ...boutonNav, justifySelf: 'end' }}>
          {nomCourt(suivante.nom)} →
        </a>
      ) : (
        <span />
      )}
    </div>
  )
}