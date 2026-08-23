import Link from 'next/link'

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
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
  )
}