import Link from 'next/link'

export default function Nav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: '#16233F',
        borderTop: '1px solid #33415a',
        padding: '10px 0',
        zIndex: 100,
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', fontSize: 13, textAlign: 'center' }}>
        🏠<br />Accueil
      </Link>
      <Link href="/pronostics" style={{ textDecoration: 'none', fontSize: 13, textAlign: 'center' }}>
        🏈<br />Pronostics
      </Link>
      <Link href="/classement" style={{ textDecoration: 'none', fontSize: 13, textAlign: 'center' }}>
        🏆<br />Classement
      </Link>
      <Link href="/profile" style={{ textDecoration: 'none', fontSize: 13, textAlign: 'center' }}>
        👤<br />Profil
      </Link>
    </nav>
  )
}