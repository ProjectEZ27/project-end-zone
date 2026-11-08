'use client'
 
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { TbSettings, TbX, TbBook, TbChevronRight } from 'react-icons/tb'
import { lirePreferences, changerPreferenceRappel, type Preferences } from '@/app/preferences/actions'
import { changerIntroAnimation } from '@/app/profile/introActions'
 
const ALIGNE = 'max(12px, calc(50% - 238px))'
 
function Interrupteur({ actif, onChange, label }: { actif: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      onClick={() => onChange(!actif)}
      style={{
        position: 'relative',
        width: 40,
        height: 23,
        borderRadius: 12,
        border: 'none',
        padding: 0,
        flex: 'none',
        cursor: 'pointer',
        background: actif ? '#2e8b57' : '#33415a',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: actif ? 20 : 3,
          width: 17,
          height: 17,
          borderRadius: '50%',
          background: 'white',
          transition: 'left .15s',
        }}
      />
    </button>
  )
}
 
function Ligne({ titre, detail, children }: { titre: string; detail: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '9px 0' }}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 14 }}>{titre}</div>
        <div style={{ fontSize: 12, color: '#9fb0c9', marginTop: 1 }}>{detail}</div>
      </div>
      {children}
    </div>
  )
}
 
const titreSection: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '#9fb0c9',
  textAlign: 'left',
  margin: '14px 0 4px',
  paddingTop: 12,
  borderTop: '1px solid #33415a',
}
 
/**
 * Bouton « Préférences » (roue dentée, à côté de la cloche) et son panneau.
 * Le panneau peut aussi être ouvert depuis le profil (événement « ouvrir-preferences »).
 */
export default function BoutonPreferences() {
  const supabase = createClient()
  const pathname = usePathname()
  const [connecte, setConnecte] = useState(false)
  const [ouvert, setOuvert] = useState(false)
  const [prefs, setPrefs] = useState<Preferences | null>(null)
 
  useEffect(() => {
    let actif = true
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (actif) setConnecte(!!user)
    })
    return () => {
      actif = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
 
  useEffect(() => {
    const ouvrir = () => setOuvert(true)
    window.addEventListener('ouvrir-preferences', ouvrir)
    return () => window.removeEventListener('ouvrir-preferences', ouvrir)
  }, [])
 
  // Un seul panneau à la fois : ouvrir les préférences ferme la cloche, et inversement
  useEffect(() => {
    if (ouvert) window.dispatchEvent(new Event('panneau-ouvert-preferences'))
  }, [ouvert])
  useEffect(() => {
    const fermer = () => setOuvert(false)
    window.addEventListener('panneau-ouvert-cloche', fermer)
    return () => window.removeEventListener('panneau-ouvert-cloche', fermer)
  }, [])
 
  // Recharge les choix à chaque ouverture
  useEffect(() => {
    if (!ouvert) return
    let actif = true
    lirePreferences().then((p) => {
      if (actif && p) setPrefs(p)
    })
    return () => {
      actif = false
    }
  }, [ouvert])
 
  if (!connecte) return null
 
  function changerAnimation(valeur: boolean) {
    setPrefs((p) => (p ? { ...p, intro_animation: valeur } : p))
    changerIntroAnimation(valeur)
  }
  function changerNotification(valeur: boolean) {
    setPrefs((p) => (p ? { ...p, notif_rappel_actif: valeur } : p))
    changerPreferenceRappel('notification', valeur)
  }
  function changerEmail(valeur: boolean) {
    setPrefs((p) => (p ? { ...p, email_rappel_actif: valeur } : p))
    changerPreferenceRappel('email', valeur)
  }
 
  return (
    <>
      {ouvert && (
        <div
          onClick={() => setOuvert(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 198, background: 'rgba(0,0,0,0.35)' }}
        />
      )}
 
      <button
        type="button"
        aria-label="Préférences"
        onClick={() => setOuvert((o) => !o)}
        style={{
          position: 'absolute',
          top: 12,
          right: `calc(${ALIGNE} + 48px)`,
          zIndex: 200,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid #33415a',
          background: 'rgba(22,35,63,0.92)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <TbSettings size={20} />
      </button>
 
      {ouvert && (
        <div
          role="dialog"
          aria-label="Préférences"
          style={{
            position: 'fixed',
            top: 60,
            right: ALIGNE,
            left: 12,
            marginLeft: 'auto',
            maxWidth: 380,
            maxHeight: '75vh',
            overflowY: 'auto',
            zIndex: 199,
            background: '#16233F',
            border: '1px solid #33415a',
            borderRadius: 12,
            padding: 14,
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Préférences</span>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setOuvert(false)}
              style={{
                background: 'none',
                border: '1px solid #33415a',
                color: '#9fb0c9',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <TbX size={17} />
            </button>
          </div>
 
          {!prefs ? (
            <p style={{ fontSize: 13, color: '#9fb0c9', textAlign: 'center', margin: '16px 0' }}>Chargement…</p>
          ) : (
            <>
              <div style={{ ...titreSection, marginTop: 6, paddingTop: 0, borderTop: 'none' }}>Animations</div>
              <Ligne titre="Arrivée sur les profils" detail="Slogan de l'équipe favorite à l'ouverture">
                <Interrupteur actif={prefs.intro_animation} onChange={changerAnimation} label="Animation d'arrivée sur les profils" />
              </Ligne>
 
              <div style={titreSection}>Rappels de pronostics</div>
              <p style={{ fontSize: 12, color: '#9fb0c9', margin: '0 0 2px', lineHeight: 1.4, textAlign: 'left' }}>
                Le matin du premier match de la semaine, si tes pronostics ne sont pas terminés :
              </p>
              <Ligne titre="Notification" detail="Une alerte dans tes notifications">
                <Interrupteur actif={prefs.notif_rappel_actif} onChange={changerNotification} label="Rappel par notification" />
              </Ligne>
              <Ligne titre="E-mail" detail="Un e-mail de relance">
                <Interrupteur actif={prefs.email_rappel_actif} onChange={changerEmail} label="Rappel par e-mail" />
              </Ligne>
            </>
          )}
 
          <div style={titreSection}>Aide</div>
          <Link
            href="/regles"
            onClick={() => setOuvert(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '9px 0',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TbBook size={20} color="#9fb0c9" />
              <span style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: 14 }}>Règles du jeu</span>
                <span style={{ display: 'block', fontSize: 12, color: '#9fb0c9', marginTop: 1 }}>Points, bonus, classements</span>
              </span>
            </span>
            <TbChevronRight size={18} color="#9fb0c9" />
          </Link>
        </div>
      )}
    </>
  )
}