import Link from 'next/link'
import LeagueLogo from '@/components/LeagueLogo'
import { epinglerLigue, desepinglerLigue, deplacerEpingle, masquerLigue, afficherLigue } from '@/app/leagues/epingles'
import type { MaLigue } from '@/lib/accueil'
 
const petitBouton: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: '50%',
  border: '1px solid #33415a',
  background: 'rgba(22,35,63,0.95)',
  color: 'white',
  fontSize: 12,
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
}
 
/*
 * Carte d'une ligue.
 *  - controles="aucun"    : accueil (juste le lien)
 *  - controles="epinglee" : flèches pour réordonner + bouton « retirer des épinglées »
 *  - controles="autre"    : bouton « épingler » (désactivé si déjà 3 épinglées) + bouton « masquer des menus »
 *  - controles="masquee"  : bouton « réafficher dans les menus »
 */
export default function CarteLigue({
  ligue,
  vedette = false,
  controles = 'aucun',
  position = 0,
  total = 0,
  pleine = false,
}: {
  ligue: MaLigue
  vedette?: boolean
  controles?: 'aucun' | 'epinglee' | 'autre' | 'masquee'
  position?: number
  total?: number
  pleine?: boolean
}) {
  const rang = ligue.rang
  const badge =
    rang === 1 ? { bg: '#EF9F27', color: '#412402', label: '1er' } :
    rang === 2 ? { bg: '#B9C1CC', color: '#1c1c1c', label: '2e' } :
    rang === 3 ? { bg: '#B5651D', color: '#2c1608', label: '3e' } :
    rang ? { bg: '#33415a', color: 'white', label: `${rang}e` } :
    null
 
  return (
    <div style={{ position: 'relative', minWidth: 0 }}>
      <Link
        href={`/leagues/${ligue.id}`}
        style={{
          aspectRatio: '1 / 1',
          backgroundColor: '#16233F',
          border: vedette ? '1px solid #C8352E' : '0.5px solid #33415a',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: 10,
          textDecoration: 'none',
          color: 'white',
          position: 'relative',
        }}
      >
        {badge && (
          <div style={{ position: 'absolute', top: 6, right: 6, background: badge.bg, color: badge.color, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20 }}>
            {badge.label}
          </div>
        )}
        {ligue.demandes > 0 && (
          <div style={{
            position: 'absolute', top: 6, left: 6, background: '#C8352E', color: 'white', fontSize: 10, fontWeight: 700,
            width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 6px rgba(200,53,46,0.6)',
          }}>
            {ligue.demandes}
          </div>
        )}
        <LeagueLogo logoId={ligue.logo_id ?? 1} size={52} leagueName={ligue.nom} photoChemin={ligue.photo_chemin ?? null} />
        <div style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{ligue.nom}</div>
        <div style={{ fontSize: 10, color: '#9fb0c9' }}>{ligue.nombreJoueurs} joueurs</div>
        {vedette && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, background: '#C8352E', color: 'white', fontSize: 8, fontWeight: 700,
            letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'center', padding: '2px 0', borderRadius: '0 0 9px 9px',
          }}>
            📰 Journal du mardi
          </div>
        )}
      </Link>
 
      {controles === 'epinglee' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 6 }}>
          <form action={deplacerEpingle}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <input type="hidden" name="sens" value="avant" />
            <button type="submit" aria-label="Déplacer vers la gauche" disabled={position === 0} style={{ ...petitBouton, opacity: position === 0 ? 0.3 : 1 }}>◀</button>
          </form>
          <form action={desepinglerLigue}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <button type="submit" aria-label="Retirer des épinglées" style={{ ...petitBouton, color: '#EF9F27' }}>★</button>
          </form>
          <form action={deplacerEpingle}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <input type="hidden" name="sens" value="apres" />
            <button type="submit" aria-label="Déplacer vers la droite" disabled={position >= total - 1} style={{ ...petitBouton, opacity: position >= total - 1 ? 0.3 : 1 }}>▶</button>
          </form>
        </div>
      )}
 
      {controles === 'autre' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 6 }}>
          <form action={epinglerLigue}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <button
              type="submit"
              aria-label="Épingler cette ligue"
              disabled={pleine}
              title={pleine ? 'Tu as déjà 3 ligues épinglées' : 'Épingler'}
              style={{ ...petitBouton, opacity: pleine ? 0.3 : 1 }}
            >
              ☆
            </button>
          </form>
          <form action={masquerLigue}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <button type="submit" aria-label="Masquer des menus" title="Masquer des menus déroulants" style={petitBouton}>🙈</button>
          </form>
        </div>
      )}
 
      {controles === 'masquee' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <form action={afficherLigue}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <button type="submit" style={{ ...petitBouton, width: 'auto', padding: '0 10px', height: 26, fontSize: 11 }}>
              👁 Réafficher
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
 