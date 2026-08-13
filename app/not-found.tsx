import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ maxWidth: 500, margin: '120px auto', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 64 }}>🏈</div>
      <h1 style={{ marginTop: 16 }}>Hors-jeu !</h1>
      <p style={{ color: '#999', marginTop: 8 }}>
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
  )
}