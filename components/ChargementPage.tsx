// Écran d'attente affiché dès le clic, pendant que la page se prépare :
// des blocs gris qui « respirent » à la place du titre, des onglets et des cartes.
export default function ChargementPage() {
  const bloc = (style: React.CSSProperties) => (
    <div className="pez-squelette" style={{ background: '#1e2a3d', borderRadius: 8, ...style }} />
  )

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0d1420' }} aria-busy="true" aria-label="Chargement">
      <style>{`
        @keyframes pez-respire { 0%, 100% { opacity: .45 } 50% { opacity: .9 } }
        .pez-squelette { animation: pez-respire 1.2s ease-in-out infinite }
      `}</style>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px 100px' }}>
        {bloc({ height: 26, width: '60%', marginBottom: 18 })}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {bloc({ height: 34, flex: 1 })}
          {bloc({ height: 34, flex: 1 })}
          {bloc({ height: 34, flex: 1 })}
          {bloc({ height: 34, flex: 1 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <div style={{ width: 3, height: 14, background: '#C8352E' }} />
          {bloc({ height: 12, width: '40%' })}
        </div>
        {bloc({ height: 140, marginBottom: 14 })}
        {bloc({ height: 60, marginBottom: 10 })}
        {bloc({ height: 60, marginBottom: 10 })}
        {bloc({ height: 60 })}
      </div>
    </div>
  )
}
