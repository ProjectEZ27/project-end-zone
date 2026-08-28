import Link from 'next/link'

export default function ContactPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Bilan.png)',
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
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '80px 24px 100px', textAlign: 'center', color: 'white' }}>
      <h1>📬 Nous contacter</h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 16, marginBottom: 24 }}>
        Une question, un bug, une suggestion ? Écris-nous directement, on te répondra dès que possible.
      </p>

      <a
        href="mailto:projectendzone27@gmail.com"
        style={{
          display: 'inline-block',
          padding: '14px 28px',
          borderRadius: 6,
          backgroundColor: '#C8352E',
          color: 'white',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        ✉️ projectendzone27@gmail.com
      </a>

      <div style={{ marginTop: 32 }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          ← Retour à l'accueil
        </Link>
      </div>
      </div>
    </div>
  )
}