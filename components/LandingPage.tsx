import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#0F1419', color: 'white', minHeight: '100vh' }}>

      {/* HEADER */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          backgroundColor: 'rgba(15, 20, 25, 0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <img src="/logo-officiel.png" alt="Project End Zone" style={{ height: 44 }} />

        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            href="/login"
            style={{
              padding: '10px 18px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.5,
            }}
          >
            CONNEXION
          </Link>
          <Link
            href="/signup"
            style={{
              padding: '10px 18px',
              borderRadius: 6,
              backgroundColor: '#C8352E',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.5,
            }}
          >
            S'INSCRIRE
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', width: '100%', minHeight: '85vh', overflow: 'hidden' }}>
        {/* Image plein format à droite, bord à bord */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '58%',
          }}
        >
          <Image
            src="/images/hero-landing.png"
            alt="Joueur NFL"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          {/* Dégradé de fondu vers le fond sombre côté gauche */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '35%',
              background: 'linear-gradient(90deg, #0F1419, transparent)',
            }}
          />
        </div>

        {/* Texte par-dessus, aligné à gauche */}
        <div
          style={{
            position: 'relative',
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            minHeight: '85vh',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <h1
              style={{
                fontSize: 48,
                lineHeight: 1.1,
                fontWeight: 900,
                margin: 0,
                letterSpacing: -0.5,
              }}
            >
              PRONOSTIQUE.<br />
              DÉFIE TES AMIS.<br />
              <span style={{ color: '#C8352E' }}>DEVIENS UNE LÉGENDE.</span>
            </h1>

            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', marginTop: 20, maxWidth: 480 }}>
              Rejoins des milliers de fans NFL, participe à des ligues, fais tes pronostics chaque semaine et grimpe dans le classement.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <Link
                href="/signup"
                style={{
                  padding: '14px 28px',
                  borderRadius: 6,
                  backgroundColor: '#C8352E',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}
              >
                REJOINDRE
              </Link>
              <a
                href="#features"
                style={{
                  padding: '14px 28px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}
              >
                EN SAVOIR PLUS
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '60px 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
        }}
      >
        {[
          { icon: '/images/landing/Icone prono.png', title: 'PRONOSTICS', text: 'Chaque match compte' },
          { icon: '/images/landing/Icone Ligue.png', title: 'LIGUES', text: 'Affronte tes amis' },
          { icon: '/images/landing/Icone Class.png', title: 'CLASSEMENTS', text: 'Grimpe au sommet' },
          { icon: '/images/landing/Icone Recomp.png', title: 'RÉCOMPENSES', text: 'Collectionne des badges' },
        ].map((f) => (
          <div key={f.title} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 12px' }}>
              <Image src={f.icon} alt={f.title} fill style={{ objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1, margin: 0 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{f.text}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '24px',
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
        }}
      >
        <Link href="/legal/mentions" style={{ color: 'rgba(255,255,255,0.4)' }}>Mentions légales</Link>
        <Link href="/legal/confidentialite" style={{ color: 'rgba(255,255,255,0.4)' }}>Confidentialité</Link>
        <Link href="/legal/cgu" style={{ color: 'rgba(255,255,255,0.4)' }}>CGU</Link>
      </footer>
    </div>
  )
}