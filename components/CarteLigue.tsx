import Link from 'next/link'
import { TbPin, TbPinFilled, TbChevronLeft, TbChevronRight, TbEye, TbEyeOff } from 'react-icons/tb'
import LeagueLogo from '@/components/LeagueLogo'
import BoutonCouleurLigue, { HAUTEUR_BANDEAU } from '@/components/BoutonCouleurLigue'
import { epinglerLigue, desepinglerLigue, deplacerEpingle, masquerLigue, afficherLigue } from '@/app/leagues/epingles'
import type { MaLigue } from '@/lib/accueil'

const pastille: React.CSSProperties = {
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  border: 'none',
  background: 'none',
  color: 'white',
  cursor: 'pointer',
  padding: 0,
  fontSize: 11,
}

const coque: React.CSSProperties = {
  display: 'flex',
  border: '1px solid #33415a',
  borderRadius: 20,
  overflow: 'hidden',
  background: '#16233F',
}

/*
 * Carte d'une ligue.
 *  - controles="aucun"    : accueil (juste le lien)
 *  - controles="epinglee" : bandeau couleur + épingle dans la carte, flèches en dessous pour réordonner
 *  - controles="autre"    : bandeau couleur + épingle dans la carte (désactivée si déjà 3 épinglées), « Masquer » en dessous
 *  - controles="masquee"  : bouton « Réafficher » en dessous
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

  // Sur les pages avec réglages, un bandeau de couleur occupe le haut de la carte
  const avecReglages = controles === 'epinglee' || controles === 'autre'
  const couleur = ligue.couleur ?? '#ffffff'
  const haut = avecReglages ? HAUTEUR_BANDEAU + 6 : 6

  return (
    <div style={{ position: 'relative', minWidth: 0 }}>
      <div style={{ position: 'relative' }}>
        <Link
          href={`/leagues/${ligue.id}`}
          style={{
            aspectRatio: '1 / 1',
            backgroundColor: '#16233F',
            border: vedette ? '1px solid #C8352E' : '0.5px solid #33415a',
            borderTop: avecReglages ? 'none' : undefined,
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
            <div style={{ position: 'absolute', top: haut, right: 6, background: badge.bg, color: badge.color, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20 }}>
              {badge.label}
            </div>
          )}
          {ligue.demandes > 0 && (
            <div style={{
              position: 'absolute', bottom: vedette ? 24 : 6, left: 6, background: '#C8352E', color: 'white', fontSize: 10, fontWeight: 700,
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
              ⚖️ Tribunal ouvert
            </div>
          )}
        </Link>

        {avecReglages && <BoutonCouleurLigue ligueId={ligue.id} couleur={ligue.couleur} />}

        {controles === 'epinglee' && (
          <form action={desepinglerLigue} style={{ position: 'absolute', top: haut, left: 6, zIndex: 3 }}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <button
              type="submit"
              aria-label="Retirer des épinglées"
              title="Retirer des épinglées"
              style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#EF9F27', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <TbPinFilled size={15} />
            </button>
          </form>
        )}

        {controles === 'autre' && (
          <form action={epinglerLigue} style={{ position: 'absolute', top: haut, left: 6, zIndex: 3 }}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <button
              type="submit"
              aria-label="Épingler cette ligue"
              disabled={pleine}
              title={pleine ? 'Tu as déjà 3 ligues épinglées' : 'Épingler'}
              style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#9fb0c9', cursor: pleine ? 'default' : 'pointer', opacity: pleine ? 0.3 : 1, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <TbPin size={15} />
            </button>
          </form>
        )}
      </div>

      {controles === 'epinglee' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <div style={coque}>
            <form action={deplacerEpingle}>
              <input type="hidden" name="ligueId" value={ligue.id} />
              <input type="hidden" name="sens" value="avant" />
              <button type="submit" aria-label="Déplacer vers la gauche" disabled={position === 0} style={{ ...pastille, width: 44, opacity: position === 0 ? 0.25 : 1, cursor: position === 0 ? 'default' : 'pointer' }}>
                <TbChevronLeft size={18} />
              </button>
            </form>
            <span style={{ width: 1, background: '#33415a' }} />
            <form action={deplacerEpingle}>
              <input type="hidden" name="ligueId" value={ligue.id} />
              <input type="hidden" name="sens" value="apres" />
              <button type="submit" aria-label="Déplacer vers la droite" disabled={position >= total - 1} style={{ ...pastille, width: 44, opacity: position >= total - 1 ? 0.25 : 1, cursor: position >= total - 1 ? 'default' : 'pointer' }}>
                <TbChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {controles === 'autre' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <form action={masquerLigue}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <button type="submit" aria-label="Masquer des menus" title="Masquer des menus déroulants" style={{ ...pastille, ...coque, padding: '0 12px', color: '#9fb0c9' }}>
              <TbEyeOff size={15} /> Masquer
            </button>
          </form>
        </div>
      )}

      {controles === 'masquee' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <form action={afficherLigue}>
            <input type="hidden" name="ligueId" value={ligue.id} />
            <button type="submit" style={{ ...pastille, ...coque, padding: '0 12px', color: '#9fb0c9' }}>
              <TbEye size={15} /> Réafficher
            </button>
          </form>
        </div>
      )}
    </div>
  )
}