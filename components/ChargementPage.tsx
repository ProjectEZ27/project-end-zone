// Écran d'attente affiché dès le clic, pendant que la page se prépare :
// des blocs gris qui « respirent » à la place du titre, des onglets et des cartes.
// Il occupe tout l'écran (y compris la zone sous l'heure et la batterie sur iPhone).
export default function ChargementPage() {
  const bloc = (style: React.CSSProperties) => (
    <div className="pez-squelette" style={{ background: '#1e2a3d', borderRadius: 8, flexShrink: 0, ...style }} />
  )

  return (
    <div style={{ height: '100dvh', overflow: 'hidden' }} aria-busy="true" aria-label="Chargement">
      {/* Fond plein écran, comme sur les vraies pages */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, backgroundColor: '#0d1420' }} />
      <style>{`
        @keyframes pez-respire { 0%, 100% { opacity: .45 } 50% { opacity: .9 } }
        .pez-squelette { animation: pez-respire 1.2s ease-in-out infinite }
      `}</style>
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          height: '100%',
          padding: '40px 16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxSizing: 'border-box',
        }}
      >
        {bloc({ height: 26, width: '60%', marginBottom: 8 })}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexShrink: 0 }}>
          {bloc({ height: 34, flex: 1 })}
          {bloc({ height: 34, flex: 1 })}
          {bloc({ height: 34, flex: 1 })}
          {bloc({ height: 34, flex: 1 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 3, height: 14, background: '#C8352E' }} />
          {bloc({ height: 12, width: '40%' })}
        </div>
        {bloc({ height: 140 })}
        {/* Assez de cartes pour remplir les grands écrans : celles qui dépassent sont simplement cachées */}
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i}>{bloc({ height: 60 })}</div>
        ))}
      </div>
    </div>
  )
}