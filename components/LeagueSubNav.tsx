import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LeagueMenu from './LeagueMenu'
import {
  TbBallAmericanFootball,
  TbTrophy,
  TbUsers,
  TbHistory,
  TbSettings,
} from 'react-icons/tb'

export default async function LeagueSubNav({
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const parId = new Map<string, { id: number | string; nom: string; logo_id?: number | null; photo_chemin?: string | null }>()
  if (user) {
    const { data: adhesions } = await supabase
      .from('adhesions')
      .select('ligues(id, nom, logo_id, photo_chemin)')
      .eq('utilisateur_id', user.id)
      .eq('statut', 'actif')

    for (const a of (adhesions ?? []) as any[]) {
      const l = Array.isArray(a.ligues) ? a.ligues[0] : a.ligues
      if (l) parId.set(String(l.id), { id: l.id, nom: l.nom, logo_id: l.logo_id, photo_chemin: l.photo_chemin })
    }
  }
  if (!parId.has(String(ligueId))) {
    parId.set(String(ligueId), { id: ligueId, nom: ligueNom })
  }
  const ligues = [...parId.values()].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

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
      <LeagueMenu ligueActuelleId={String(ligueId)} ligues={ligues} actif={actif} />

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
        {pastilles.map(({ key, href, label, Icon }) => {
          const estActif = key === actif
          return (
            <Link
              key={key}
              href={href}
              style={{
                flex: 1,
                background: '#16233F',
                border: estActif ? '1px solid #C8352E' : '0.5px solid #33415a',
                borderRadius: 8,
                padding: '10px 8px',
                textAlign: 'center',
                textDecoration: 'none',
                color: 'white',
              }}
            >
              <Icon size={24} color={estActif ? '#C8352E' : '#9fb0c9'} style={{ display: 'block', margin: '0 auto' }} />
              <div style={{ fontSize: 9, marginTop: 4 }}>{label}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}