import { marquerRecapLu } from '@/app/pronostics/actions'
import type { RecapSemaine as RecapData } from '@/lib/recapSemaine'

// Feux d'artifice : 6 explosions, chacune de 16 étincelles. Positions fixes (pas d'aléatoire)
const EXPLOSIONS = [
  { x: 18, y: 16, delay: 0.0 },
  { x: 80, y: 12, delay: 0.9 },
  { x: 50, y: 26, delay: 1.7 },
  { x: 10, y: 48, delay: 2.4 },
  { x: 90, y: 44, delay: 3.1 },
  { x: 35, y: 8, delay: 3.8 },
]
const ETINCELLES = 16

export default function RecapSemaine({
  semaineId,
  semaineNom,
  semaineSuivante,
  score,
  rang,
  nombreJoueurs,
  delta,
}: RecapData) {
  const monte = delta !== null && delta > 0
  const descend = delta !== null && delta < 0

  // Couleur de fête : vert si on monte, rouge si on descend, doré sinon
  const couleur = monte ? '#4ade80' : descend ? '#ff8f87' : '#fbbf24'
  const couleurDouce = monte ? 'rgba(74,222,128,0.14)' : descend ? 'rgba(255,143,135,0.12)' : 'rgba(251,191,36,0.12)'
  const couleurBord = monte ? 'rgba(74,222,128,0.55)' : descend ? 'rgba(255,143,135,0.45)' : 'rgba(251,191,36,0.5)'
  const palette = monte
    ? ['#4ade80', '#bbf7d0', '#22c55e', '#ffffff']
    : ['#fbbf24', '#ffffff', '#C8352E', '#60a5fa']

  const texteScore =
    score === null
      ? "Tu n'as pas pronostiqué cette semaine"
      : `Tu as fait ${score} ${score > 1 ? 'points' : 'point'} cette semaine`

  let texteDelta: string
  if (delta === null) texteDelta = 'Bienvenue dans le classement général'
  else if (delta > 0) texteDelta = `${delta} ${delta > 1 ? 'places gagnées' : 'place gagnée'} au classement général`
  else if (delta < 0) texteDelta = `${Math.abs(delta)} ${delta < -1 ? 'places perdues' : 'place perdue'} au classement général`
  else texteDelta = 'Tu gardes ta place au classement général'

  const boutonBase = {
    display: 'block',
    width: '100%',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center' as const,
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden' }}>
      <style>{`
        @keyframes ez-etincelle {
          0%   { transform: translate(0,0) scale(1); opacity: 0; }
          8%   { opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
        }
        @keyframes ez-montee {
          from { transform: translateY(24px) scale(0.92); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes ez-pop {
          0%   { transform: scale(0.3); opacity: 0; }
          60%  { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ez-halo {
          0%, 100% { box-shadow: 0 0 22px var(--c-halo); }
          50%      { box-shadow: 0 0 46px var(--c-halo); }
        }
        @keyframes ez-fleche {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ez-anim, .ez-etincelle { animation: none !important; }
          .ez-etincelle { display: none; }
        }
      `}</style>

      {/* Fond */}
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
            background: `radial-gradient(ellipse at 50% 35%, ${couleurDouce} 0%, rgba(11,18,32,0.85) 60%, rgba(11,18,32,0.96) 100%)`,
          }}
        />
      </div>

      {/* Feux d'artifice */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {EXPLOSIONS.map((e, i) =>
          Array.from({ length: ETINCELLES }).map((_, j) => {
            const angle = (j / ETINCELLES) * Math.PI * 2
            const portee = 70 + (j % 3) * 22
            return (
              <span
                key={`${i}-${j}`}
                className="ez-etincelle"
                style={{
                  position: 'absolute',
                  left: `${e.x}%`,
                  top: `${e.y}%`,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: palette[(i + j) % palette.length],
                  boxShadow: `0 0 8px ${palette[(i + j) % palette.length]}`,
                  opacity: 0,
                  ['--dx' as string]: `${Math.round(Math.cos(angle) * portee)}px`,
                  ['--dy' as string]: `${Math.round(Math.sin(angle) * portee)}px`,
                  animation: `ez-etincelle 1.6s ease-out ${e.delay}s infinite`,
                  animationDuration: '1.6s',
                }}
              />
            )
          })
        )}
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 500,
          margin: '0 auto',
          padding: '60px 24px 100px',
          textAlign: 'center',
          color: 'white',
          ['--c-halo' as string]: couleurBord,
        }}
      >
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2 }}>
          Récap de la semaine
        </div>
        <h1 style={{ margin: '8px 0 24px' }}>🏈 {semaineNom} terminée</h1>

        <div
          className="ez-anim"
          style={{
            border: `1px solid ${couleurBord}`,
            background: couleurDouce,
            borderRadius: 14,
            padding: '24px 16px 22px',
            backdropFilter: 'blur(4px)',
            animation: 'ez-montee 0.7s ease-out both, ez-halo 3s ease-in-out 0.7s infinite',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 900 }}>{texteScore}</div>

          {/* Gros rang */}
          <div
            className="ez-anim"
            style={{
              marginTop: 18,
              fontSize: 72,
              lineHeight: 1,
              fontWeight: 900,
              color: couleur,
              textShadow: `0 0 28px ${couleurBord}`,
              animation: 'ez-pop 0.8s cubic-bezier(.2,1.4,.4,1) 0.5s both',
            }}
          >
            {rang === 1 ? '1er' : `${rang}e`}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            sur {nombreJoueurs} au classement général
          </div>

          {/* Places gagnées / perdues */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${couleurBord}`,
              color: couleur,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {monte && (
              <span className="ez-anim" style={{ display: 'inline-block', animation: 'ez-fleche 1.2s ease-in-out infinite' }}>
                ▲
              </span>
            )}
            {descend && <span>▼</span>}
            <span>{texteDelta}</span>
          </div>
        </div>

        <form action={marquerRecapLu} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.35)',
            }}
          >
            Voir les résultats de la {semaineNom}
          </button>
        </form>
      </div>
    </div>
  )
}