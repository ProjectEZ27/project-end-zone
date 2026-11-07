'use client'

import { useState } from 'react'
import { Anton } from 'next/font/google'
import JournalPhrase from '@/components/JournalPhrase'
import type { Article } from '@/lib/journal'

const anton = Anton({ weight: '400', subsets: ['latin'] })

const STYLES = `
@keyframes jdm-pulse { 50% { transform: scale(1.5); opacity: .55 } }
@keyframes jdm-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@keyframes jdm-stamp { from { opacity: 0; transform: rotate(-3deg) scale(2) } 60% { opacity: 1; transform: rotate(-3deg) scale(.92) } to { opacity: 1; transform: rotate(-3deg) scale(1) } }
.jdm-a { animation: jdm-rise .5s ease both; animation-delay: var(--d, 0s) }
.jdm-st { animation: jdm-stamp .45s ease both; animation-delay: .45s }
.jdm-dot { animation: jdm-pulse 1.6s ease-in-out infinite }
.jdm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 10px }
@media (prefers-reduced-motion: reduce) { .jdm-a, .jdm-st, .jdm-dot { animation: none } }
`

function Stats({ stats, petit }: { stats: [string, string][]; petit?: boolean }) {
  if (stats.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: petit ? 10 : 14 }}>
      {stats.map(([valeur, libelle]) => (
        <div key={libelle}>
          <b className={anton.className} style={{ display: 'block', fontWeight: 400, fontSize: petit ? 20 : 26, lineHeight: 1, color: '#F0C040' }}>
            {valeur}
          </b>
          <span style={{ fontSize: 11, color: '#9FB0CF' }}>{libelle}</span>
        </div>
      ))}
    </div>
  )
}

function Vanne({ texte, grand }: { texte: string; grand?: boolean }) {
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start', width: '100%',
      background: 'rgba(255,255,255,0.07)', borderLeft: '3px solid #F0C040',
      padding: '10px 12px', color: '#EEF2FA', boxSizing: 'border-box',
    }}>
      <span aria-hidden style={{ color: '#F0C040', fontSize: 22, lineHeight: 1, flex: 'none' }}>“</span>
      <div style={{ minWidth: 0 }}>
        <JournalPhrase texte={texte} compact taille={grand ? 15.5 : 14} />
      </div>
    </div>
  )
}

export default function JournalDuMardi({
  semaine,
  articles,
  enVedette,
  ouvertAuDepart = false,
}: {
  semaine: string
  articles: Article[]
  enVedette: boolean // mardi et mercredi : barre « le journal est sorti » ; sinon petit bouton discret
  ouvertAuDepart?: boolean
}) {
  const [ouvert, setOuvert] = useState(ouvertAuDepart)

  const principaux = articles.filter((a) => !a.fixe)
  const fixe = articles.find((a) => a.fixe)
  if (principaux.length === 0) return null
  const une = principaux[0]
  const cartes = principaux.slice(1)

  const tampon = (a: Article, taille: number, rotation: boolean) => (
    <span
      className={`${anton.className} ${rotation ? 'jdm-st' : ''}`}
      style={{
        display: 'inline-block', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '.06em',
        color: '#0F1A30', background: a.couleur, borderRadius: 3,
        fontSize: taille, padding: rotation ? '4px 10px' : '3px 8px',
        transform: rotation ? 'rotate(-3deg)' : undefined,
      }}
    >
      {a.etiquette}
    </span>
  )

  return (
    <div style={{ marginTop: 20, textAlign: 'left' }}>
      <style>{STYLES}</style>

      {enVedette ? (
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          aria-expanded={ouvert}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px',
            borderRadius: 12, background: '#16233F', color: '#EEF2FA', border: '0.5px solid #33415a',
            textAlign: 'left', cursor: 'pointer',
          }}
        >
          <span className="jdm-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5483F', flex: 'none' }} />
          <span style={{ minWidth: 0 }}>
            <b className={anton.className} style={{ display: 'block', fontWeight: 400, fontSize: 18, letterSpacing: '.03em', textTransform: 'uppercase' }}>
              Le journal du mardi est sorti
            </b>
            <small style={{ display: 'block', fontSize: 12, color: '#9FB0CF' }}>
              {articles.length} article{articles.length > 1 ? 's' : ''}{semaine ? ` sur la ${semaine.toLowerCase()}` : ''}
            </small>
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 500, color: '#F0C040', whiteSpace: 'nowrap' }}>
            {ouvert ? 'Fermer ✕' : 'Lire →'}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          aria-expanded={ouvert}
          style={{
            display: 'block', margin: '0 auto', padding: '6px 12px', borderRadius: 999,
            background: 'transparent', color: '#9FB0CF', border: '0.5px solid #33415a',
            fontSize: 12, cursor: 'pointer',
          }}
        >
          {ouvert ? 'Fermer le journal ✕' : '📰 Revoir le journal du mardi précédent'}
        </button>
      )}

      {ouvert && (
        <div style={{ marginTop: 12, background: '#16233F', color: '#EEF2FA', borderRadius: 12, padding: 16, boxSizing: 'border-box' }}>
          <div className="jdm-a" style={{ ['--d' as string]: '0s', borderBottom: '3px solid #C8352E', paddingBottom: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F0C040' }}>
              <span>{semaine ? `${semaine} · Bilan` : 'Bilan'}</span>
            </div>
            <div className={anton.className} style={{ fontSize: 'clamp(30px, 8vw, 46px)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '.02em', marginTop: 4 }}>
              Le journal du mardi
            </div>
          </div>

          <div className="jdm-a" style={{ ['--d' as string]: '0.2s', background: '#1F3159', borderRadius: 10, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
              {tampon(une, 15, true)}
              <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9FB0CF' }}>À la une</span>
            </div>
            <h3 className={anton.className} style={{ fontWeight: 400, fontSize: 'clamp(26px, 7vw, 38px)', lineHeight: 1.04, textTransform: 'uppercase', margin: '0 0 12px', color: '#fff' }}>
              {une.titre}
            </h3>
            <Vanne texte={une.texte} grand />
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 }}>
              <Stats stats={une.stats} />
            </div>
          </div>

          {cartes.length > 0 && (
            <div className="jdm-grid">
              {cartes.map((a, k) => (
                <div
                  key={a.id}
                  className="jdm-a"
                  style={{ ['--d' as string]: `${0.55 + (k + 1) * 0.15}s`, background: '#1F3159', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, gap: 8 }}
                >
                  {tampon(a, 12, false)}
                  <h4 className={anton.className} style={{ fontWeight: 400, fontSize: 21, lineHeight: 1.08, textTransform: 'uppercase', margin: 0, color: '#fff' }}>
                    {a.titre}
                  </h4>
                  <Stats stats={a.stats} petit />
                  <Vanne texte={a.texte} />
                </div>
              ))}
            </div>
          )}

          {fixe && (
            <div className="jdm-a" style={{ ['--d' as string]: '1.2s', marginTop: 12, padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,.15)' }}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F0C040', marginBottom: 6 }}>
                La phrase de la semaine
              </div>
              <JournalPhrase texte={fixe.texte} compact taille={15} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}