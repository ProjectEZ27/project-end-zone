// Score de la semaine terminée : anneau doré qui se remplit selon la part de bons pronostics
export default function AnneauScore({
  score,
  corrects,
  total,
}: {
  score: number
  corrects: number
  total: number
}) {
  const rayon = 50
  const circonference = 2 * Math.PI * rayon
  const part = total > 0 ? Math.min(1, corrects / total) : 0

  return (
    <div style={{ margin: '14px 0 4px' }}>
      <div
        role="img"
        aria-label={`${score} ${score > 1 ? 'points' : 'point'} cette semaine, ${corrects} bons pronostics sur ${total}`}
        style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}
      >
        <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="60" cy="60" r={rayon} fill="none" stroke="#33415a" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={rayon}
            fill="none"
            stroke="#f0c040"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circonference}
            strokeDashoffset={circonference * (1 - part)}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 42, fontWeight: 700, lineHeight: 1, color: '#f0c040' }}>{score}</span>
          <span style={{ fontSize: 12, color: '#9fb0c9', marginTop: 2 }}>{score > 1 ? 'points' : 'point'}</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: '#9fb0c9', marginTop: 8 }}>
        {corrects} {corrects > 1 ? 'bons pronos' : 'bon prono'} sur {total}
      </div>
    </div>
  )
}