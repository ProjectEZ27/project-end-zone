'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: 'white' }}>
      <div className="landingBg" style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/images/hero-landing.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, #0F1419 20%, rgba(15,20,25,0.55) 55%, rgba(15,20,25,0.75) 100%)',
        }} />
      </div>

      {/* HERO */}
      <section className={styles.heroContent}>
        <div style={{ maxWidth: 500 }}>
          <img
            src="/logo-officiel.png"
            alt="Project End Zone"
            style={{ height: 150, marginBottom: 8, marginLeft: -10 }}
          />

          <h1 className={styles.heroTitle}>
            PRONOSTIQUE<br />
            DÉFIE TES AMIS<br />
            <span style={{ color: '#C8352E' }}>DEVIENS UNE LÉGENDE</span>
          </h1>

          <p className={styles.heroText}>
            Rejoins des milliers de fans NFL, participe à des ligues, fais tes pronostics chaque semaine et grimpe dans le classement.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
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
            <Link
              href="/login"
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
              CONNEXION
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '40px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          position: 'relative',
        }}
      >
        {[
          { icon: '/images-landing/Icone-prono.png', title: 'PRONOSTICS', text: 'Chaque match compte' },
          { icon: '/images-landing/Icone-Ligue.png', title: 'LIGUES', text: 'Affronte tes amis' },
          { icon: '/images-landing/Icone-Class.png', title: 'CLASSEMENTS', text: 'Grimpe au sommet' },
          { icon: '/images-landing/Icone-Recomp.png', title: 'RÉCOMPENSES', text: 'Collectionne des badges' },
        ].map((f) => (
          <div key={f.title} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 12px' }}>
              <Image src={f.icon} alt={f.title} fill style={{ objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, margin: 0 }}>{f.title}</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{f.text}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Link href="/legal/mentions" style={{ color: 'rgba(255,255,255,0.4)' }}>Mentions légales</Link>
        <Link href="/legal/confidentialite" style={{ color: 'rgba(255,255,255,0.4)' }}>Confidentialité</Link>
        <Link href="/legal/cgu" style={{ color: 'rgba(255,255,255,0.4)' }}>CGU</Link>
        <Link href="/contact" style={{ color: '#666' }}>Nous contacter</Link>
      </footer>

      <style jsx global>{`
        .landingBg {
          background-position: right 30%;
        }
        @media (max-width: 640px) {
          .landingBg {
            background-position: 70% center;
          }
        }
      `}</style>
    </div>
  )
}