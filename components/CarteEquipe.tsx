import Link from 'next/link'
import { NOMS_EQUIPES, TeamBadge } from '@/lib/teamBadge'
import { getCouleurAccent } from '@/lib/teamColors'
import type { InfosEquipe, MatchEquipe } from '@/lib/accueil'
 
/*
 * Carte « Ton équipe » de l'Accueil. Le texte change selon le moment :
 *  - le jour du match : « C'est le grand jour ! »
 *  - pendant le match : « Match en cours »
 *  - dans les 3 jours après : le résultat (victoire / défaite / nul) avec le score
 *  - sinon : le prochain match
 */
 
const nomEquipe = (code: string) => `les ${NOMS_EQUIPES[code] ?? code}`
 
function jourParis(d: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d)
}
 
function heure(d: Date) {
  const h = new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', minute: '2-digit', timeZone: 'Europe/Paris' })
    .formatToParts(d)
  const hh = h.find((p) => p.type === 'hour')?.value ?? ''
  const mm = h.find((p) => p.type === 'minute')?.value ?? '00'
  return mm === '00' ? `${hh}h` : `${hh}h${mm}`
}
 
function quand(d: Date) {
  const jour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', timeZone: 'Europe/Paris' }).format(d)
  return `${jour} à ${heure(d)}`
}
 
function Ligne({ m, equipe }: { m: MatchEquipe; equipe: string }) {
  return (
    <span>
      {nomEquipe(equipe)} {m.domicile ? 'reçoivent' : 'se déplacent chez'} {nomEquipe(m.adversaire)}
    </span>
  )
}
 
export default function CarteEquipe({ equipe, infos }: { equipe: string | null; infos: InfosEquipe }) {
  if (!equipe) {
    return (
      <Link
        href="/profile"
        style={{
          display: 'block',
          background: '#16233F',
          border: '0.5px dashed #33415a',
          borderRadius: 12,
          padding: 14,
          margin: '0 0 16px',
          textAlign: 'left',
          textDecoration: 'none',
          color: '#9fb0c9',
          fontSize: 13,
        }}
      >
        🏈 Choisis ton équipe favorite pour suivre ses matchs ici →
      </Link>
    )
  }
 
  const maintenant = new Date()
  const { prochain, dernier } = infos
  const accent = getCouleurAccent(equipe)
 
  let etiquette = 'Ton équipe'
  let titre = ''
  let detail: React.ReactNode = null
  let pastille: { texte: string; fond: string } | null = null
 
  const coupProchain = prochain ? new Date(prochain.coupEnvoi) : null
  const joursDepuisDernier = dernier ? (maintenant.getTime() - new Date(dernier.coupEnvoi).getTime()) / 86400000 : null
 
  if (prochain && coupProchain && coupProchain <= maintenant) {
    etiquette = 'En direct'
    titre = 'Match en cours !'
    detail = <Ligne m={prochain} equipe={equipe} />
  } else if (prochain && coupProchain && jourParis(coupProchain) === jourParis(maintenant)) {
    etiquette = 'Aujourd’hui'
    titre = `C'est le grand jour ! Coup d'envoi à ${heure(coupProchain)}`
    detail = <Ligne m={prochain} equipe={equipe} />
  } else if (dernier && joursDepuisDernier !== null && joursDepuisDernier < 3.5 && dernier.scoreEquipe !== null && dernier.scoreAdversaire !== null) {
    const gagne = dernier.scoreEquipe > dernier.scoreAdversaire
    const nul = dernier.scoreEquipe === dernier.scoreAdversaire
    etiquette = 'Dernier match'
    titre = `${nomEquipe(equipe).replace(/^les/, 'Les')} ${gagne ? 'ont gagné' : nul ? 'ont fait match nul' : 'ont perdu'} ${dernier.scoreEquipe}-${dernier.scoreAdversaire}`
    pastille = {
      texte: gagne ? 'Victoire' : nul ? 'Nul' : 'Défaite',
      fond: gagne ? '#2e8b57' : nul ? '#7a8aa5' : '#C8352E',
    }
    detail = (
      <span>
        contre {nomEquipe(dernier.adversaire)}
        {prochain && coupProchain ? ` · prochain match ${quand(coupProchain)}` : ''}
      </span>
    )
  } else if (prochain && coupProchain) {
    etiquette = 'Prochain match'
    titre = `${nomEquipe(equipe).replace(/^les/, 'Les')} jouent ${quand(coupProchain)}`
    detail = <span>contre {nomEquipe(prochain.adversaire)} {prochain.domicile ? '(à domicile)' : '(à l’extérieur)'}</span>
  } else if (dernier && dernier.scoreEquipe !== null && dernier.scoreAdversaire !== null) {
    etiquette = 'Dernier match'
    titre = `${dernier.scoreEquipe}-${dernier.scoreAdversaire} contre ${nomEquipe(dernier.adversaire)}`
  } else {
    return null
  }
 
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#16233F',
        border: '0.5px solid #33415a',
        borderLeft: `4px solid ${accent}`,
        borderRadius: 12,
        padding: '12px 14px',
        margin: '0 0 16px',
        textAlign: 'left',
        color: 'white',
      }}
    >
      <TeamBadge code={equipe} size={44} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0c9' }}>{etiquette}</span>
          {pastille && (
            <span style={{ fontSize: 9, fontWeight: 700, background: pastille.fond, color: 'white', borderRadius: 20, padding: '1px 7px' }}>
              {pastille.texte}
            </span>
          )}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, lineHeight: 1.25 }}>{titre}</div>
        {detail && <div style={{ fontSize: 12, color: '#9fb0c9', marginTop: 2 }}>{detail}</div>}
      </div>
    </div>
  )
}
 