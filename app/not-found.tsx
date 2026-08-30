import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Acceuil.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '120px 24px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 64 }}>🏈</div>
        <h1 style={{ marginTop: 16 }}>Hors-jeu !</h1>
        <p style={{ color: '#9fb0c9', marginTop: 8 }}>
          Cette page n'existe pas, ou plus.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: 24,
            padding: '10px 20px',
            backgroundColor: '#C8352E',
            borderRadius: 6,
            textDecoration: 'none',
            color: 'white',
          }}
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}