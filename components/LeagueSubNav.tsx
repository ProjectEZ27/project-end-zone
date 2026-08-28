import Link from 'next/link'
import {
  TbArrowLeft,
  TbBallAmericanFootball,
  TbTrophy,
  TbUsers,
  TbHistory,
  TbSettings,
} from 'react-icons/tb'

export default function LeagueSubNav({
  ligueId,
  ligueNom,
  actif,
  estCommissaire,
}: {
  ligueId: string
  ligueNom: string
  actif: 'pronostics' | 'classement' | 'membres' | 'historique' | 'parametres'
  estCommissaire?: boolean
}) {
  const pastilles = [
    { key: 'pronostics', href: `/leagues/${ligueId}/pronostics`, label: 'Pronostics', Icon: TbBallAmericanFootball },
    { key: 'classement', href: `/leagues/${ligueId}/classement`, label: 'Classement', Icon: TbTrophy },
    { key: 'membres', href: `/leagues/${ligueId}/membres`, label: 'Membres', Icon: TbUsers },
    { key: 'historique', href: `/leagues/${ligueId}/historique`, label: 'Historique', Icon: TbHistory },
  ]
  if (estCommissaire) {
    pastilles.push({ key: 'parametres', href: `/leagues/${ligueId}/parametres`, label: 'Paramètres', Icon: TbSettings })
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <Link
        href={`/leagues/${ligueId}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: '#9fb0c9',
          textDecoration: 'none',
          fontSize: 12,
          marginBottom: 14,
        }}
      >
        <TbArrowLeft size={14} /> {ligueNom}
      </Link>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
        {pastilles.map(({ key, href, label, Icon }) => {
          const estActif = key === actif
          return (
            <Link
              key={key}
              href={href}
              style={{
                flexShrink: 0,
                background: '#16233F',
                border: estActif ? '1px solid #C8352E' : '0.5px solid #33415a',
                borderRadius: 8,
                padding: '8px 10px',
                textAlign: 'center',
                textDecoration: 'none',
                color: 'white',
              }}
            >
              <Icon size={14} color={estActif ? '#C8352E' : '#9fb0c9'} style={{ display: 'block', margin: '0 auto' }} />
              <div style={{ fontSize: 9, marginTop: 3 }}>{label}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}