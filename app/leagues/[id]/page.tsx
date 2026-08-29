import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { acceptMembership, rejectMembership } from './actions'
import LeagueLogoEditor from '@/components/LeagueLogoEditor'
import ShareLeagueBox from '@/components/ShareLeagueBox'
import {
  TbBallAmericanFootball,
  TbTrophy,
  TbUsers,
  TbHistory,
  TbSettings,
  TbCrown,
  TbCheck,
  TbX,
} from 'react-icons/tb'


export default async function LeagueDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: league, error } = await supabase
    .from('ligues')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !league) {
    notFound()
  }

  const estCommissaire = league.commissaire_id === user.id

  let estMembreActif = estCommissaire
  if (!estCommissaire) {
    const { data: monAdhesion } = await supabase
      .from('adhesions')
      .select('statut')
      .eq('ligue_id', id)
      .eq('utilisateur_id', user.id)
      .eq('statut', 'actif')
      .single()
    estMembreActif = !!monAdhesion
  }

  let demandes: any[] = []
  if (estCommissaire) {
    const { data: adhesionsData } = await supabase
      .from('adhesions')
      .select('id, utilisateur_id')
      .eq('ligue_id', id)
      .eq('statut', 'en_attente')

    if (adhesionsData && adhesionsData.length > 0) {
      const userIds = adhesionsData.map((a) => a.utilisateur_id)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, pseudo')
        .in('id', userIds)

      demandes = adhesionsData.map((a) => ({
        ...a,
        pseudo: profilesData?.find((p) => p.id === a.utilisateur_id)?.pseudo ?? 'Joueur inconnu',
      }))
    }
  }

  const statutLabel: Record<string, { label: string; bg: string; color: string }> = {
    en_cours: { label: 'EN COURS', bg: '#0F6E56', color: '#E1F5EE' },
    a_venir: { label: 'À VENIR', bg: '#854F0B', color: '#FAEEDA' },
    terminee: { label: 'TERMINÉE', bg: '#5F5E5A', color: '#F1EFE8' },
  }
  const badgeStatut = statutLabel[league.statut] ?? { label: league.statut, bg: '#33415a', color: 'white' }

  const pastilles = [
    { href: `/leagues/${id}/pronostics`, label: 'Pronostics', Icon: TbBallAmericanFootball },
    { href: `/leagues/${id}/classement`, label: 'Classement', Icon: TbTrophy },
    { href: `/leagues/${id}/membres`, label: 'Membres', Icon: TbUsers },
    { href: `/leagues/${id}/historique`, label: 'Historique', Icon: TbHistory },
  ]
  if (estCommissaire) {
    pastilles.push({ href: `/leagues/${id}/parametres`, label: 'Paramètres', Icon: TbSettings })
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        
        backgroundImage: 'url(/fonds/Fond-Ligue.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center', color: 'white' }}>
        <LeagueLogoEditor
          ligueId={id}
          currentLogoId={league.logo_id ?? 1}
          estCommissaire={estCommissaire}
          leagueName={league.nom}
        />
        <h1 style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>{league.nom}</h1>
        <p style={{ fontSize: 13, color: '#9fb0c9', marginTop: 4 }}>
          {league.taille_max} joueurs max{' '}
          <span style={{ margin: '0 4px' }}>·</span>
          Statut :{' '}
          <span style={{
            display: 'inline-block',
            background: badgeStatut.bg,
            color: badgeStatut.color,
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 10px',
            borderRadius: 20,
            marginLeft: 4,
          }}>
            {badgeStatut.label}
          </span>
        </p>

        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {pastilles.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                flex: '1 1 30%',
                minWidth: 100,
                background: '#16233F',
                border: '0.5px solid #33415a',
                borderRadius: 8,
                padding: '10px 6px',
                textDecoration: 'none',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Icon size={16} style={{ display: 'block', margin: '0 auto 4px' }} />
              <div style={{ fontSize: 11 }}>{label}</div>
            </Link>
          ))}
        </div>

        {estCommissaire && (
          <div style={{ marginTop: 20, background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, padding: 16 }}>
            <TbCrown size={20} color="#EF9F27" style={{ display: 'block', margin: '0 auto 6px' }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Bienvenue dans la ligue</div>
            <div style={{ fontSize: 11, color: '#7fa8e0', marginBottom: 12 }}>Tu es le commissaire de cette ligue</div>

            <ShareLeagueBox
              codeInvitation={league.code_invitation}
              codeSecours={league.code_secours}
              leagueName={league.nom}
            />
          </div>
        )}

        {!estCommissaire && estMembreActif && (
          <div style={{ marginTop: 20, background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, padding: 16 }}>
            <ShareLeagueBox
              codeInvitation={league.code_invitation}
              leagueName={league.nom}
            />
          </div>
        )}

        {estCommissaire && demandes.length > 0 && (
          <div style={{ marginTop: 20, background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, padding: 16, textAlign: 'left' }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Demandes en attente ({demandes.length})</p>
            {demandes.map((demande) => (
              <div key={demande.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span>{demande.pseudo}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <form action={acceptMembership}>
                    <input type="hidden" name="adhesion_id" value={demande.id} />
                    <button type="submit" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, background: '#0F6E56', border: 'none', borderRadius: 6, color: 'white' }}>
                      <TbCheck size={14} /> Accepter
                    </button>
                  </form>
                  <form action={rejectMembership}>
                    <input type="hidden" name="adhesion_id" value={demande.id} />
                    <button type="submit" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, background: '#791F1F', border: 'none', borderRadius: 6, color: 'white' }}>
                      <TbX size={14} /> Refuser
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
