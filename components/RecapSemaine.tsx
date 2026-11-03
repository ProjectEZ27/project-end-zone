import { marquerRecapLu } from '@/app/pronostics/actions'
import type { RecapSemaine as RecapData } from '@/lib/recapSemaine'

export default function RecapSemaine({
  semaineId,
  semaineNom,
  semaineSuivante,
  score,
  rang,
  nombreJoueurs,
  delta,
}: RecapData) {
  const texteScore =
    score === null
      ? "Tu n'as pas pronostiqué cette semaine"
      : `Tu as fait ${score} ${score > 1 ? 'points' : 'point'} cette semaine`

  let texteDelta: string
  let couleurDelta = 'rgba(255,255,255,0.75)'
  if (delta === null) {
    texteDelta = 'Bienvenue dans le classement général'
  } else if (delta > 0) {
    texteDelta = `+${delta} ${delta > 1 ? 'places gagnées' : 'place gagnée'} au classement général`
    couleurDelta = '#6fe0a0'
  } else if (delta < 0) {
    texteDelta = `${delta} ${delta < -1 ? 'places perdues' : 'place perdue'} au classement général`
    couleurDelta = '#ff8f87'
  } else {
    texteDelta = 'Tu gardes ta place au classement général'
  }

  const boutonBase = {
    display: 'block',
    width: '100%',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center' as const,
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          backgroundImage: 'url(/fonds/Fond-Pronostics.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
          }}
        />
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '60px 24px 100px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2 }}>
          Récap de la semaine
        </div>
        <h1 style={{ margin: '8px 0 24px' }}>🏈 {semaineNom} terminée</h1>

        <div
          style={{
            border: '1px solid rgba(200,53,46,0.4)',
            background: 'rgba(200,53,46,0.12)',
            borderRadius: 10,
            padding: '20px 16px',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 900 }}>{texteScore}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: couleurDelta, marginTop: 12 }}>{texteDelta}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
            {rang === 1 ? '1er' : `${rang}e`} sur {nombreJoueurs} au classement général
          </div>
        </div>

        <form action={marquerRecapLu} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="hidden" name="semaine_id" value={semaineId} />
          {semaineSuivante && (
            <button
              type="submit"
              name="destination"
              value="suivante"
              style={{ ...boutonBase, background: '#C8352E', color: 'white', border: 'none' }}
            >
              Passer aux pronostics de la {semaineSuivante.nom} →
            </button>
          )}
          <button
            type="submit"
            name="destination"
            value="resultats"
            style={{
              ...boutonBase,
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            Voir les résultats de la {semaineNom}
          </button>
        </form>
      </div>
    </div>
  )
}