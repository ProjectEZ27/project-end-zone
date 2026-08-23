interface Pick {
  pseudo: string
  correct: boolean
}

interface PicksColumnsProps {
  picksGauche: Pick[]
  picksDroite: Pick[]
  nOntPasPronostique: string[]
}

export default function PicksColumns({ picksGauche, picksDroite, nOntPasPronostique }: PicksColumnsProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 4px 0' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
          {picksGauche.map((p, i) => (
            <div
              key={i}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: p.correct ? '#4ee892' : 'rgba(255,255,255,0.75)',
              }}
            >
              {p.pseudo}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          {picksDroite.map((p, i) => (
            <div
              key={i}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: p.correct ? '#4ee892' : 'rgba(255,255,255,0.75)',
              }}
            >
              {p.pseudo}
            </div>
          ))}
        </div>
      </div>

      {nOntPasPronostique.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px dashed rgba(255,255,255,0.1)',
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7, marginRight: 6 }}>
            N'ont pas pronostiqué
          </span>
          {nOntPasPronostique.join(', ')}
        </div>
      )}
    </div>
  )
}