import Link from 'next/link'

export default function CompteSupprime() {
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0b1220', color: 'white' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Ton compte a été supprimé</h1>
        <p style={{ color: '#9fb0c9', lineHeight: 1.6 }}>
          Ton compte et toutes tes données ont été effacés. Merci d&apos;avoir joué à Project End Zone.
          Tu peux revenir quand tu veux en créant un nouveau compte.
        </p>
        <Link
          href="/"
          style={{ display: 'inline-block', marginTop: 24, padding: '10px 20px', backgroundColor: '#C8352E', borderRadius: 6, textDecoration: 'none', color: 'white' }}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}