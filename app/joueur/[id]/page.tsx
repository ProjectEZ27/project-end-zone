import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UserAvatar from '@/components/UserAvatar'
import { NOMS_EQUIPES } from '@/lib/teamBadge'

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [profileResult, saisonResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('saisons').select('*').eq('statut', 'en_cours').single()
  ])
  const profile = profileResult.data
  const saison = saisonResult.data

  if (!profile) {
    notFound()
  }

  let totalPronostics = 0
  let totalCorrects = 0
  let meilleureSemaine = 0
  let semainesParfaites = 0

  if (saison) {
    const { data: semaines } = await supabase
      .from('semaines')
      .select('*')
      .eq('saison_id', saison.id)

    if (semaines && semaines.length > 0) {
      const semaineIds = semaines.map((s) => s.id)

      const { data: matchs } = await supabase
        .from('matchs')
        .select('*')
        .in('semaine_id', semaineIds)

      if (matchs && matchs.length > 0) {
        const matchIds = matchs.map((m) => m.id)

        const { data: pronostics } = await supabase
          .from('pronostics')
          .select('*')
          .eq('utilisateur_id', id)
          .in('match_id', matchIds)

        if (pronostics) {
          const matchMap = new Map(matchs.map((m) => [m.id, m]))

          totalPronostics = pronostics.filter((p) => {
            const match = matchMap.get(p.match_id)
            return match && match.statut === 'termine'
          }).length

          totalCorrects = pronostics.filter((p) => {
            const match = matchMap.get(p.match_id)
            return match && match.statut === 'termine' && p.equipe_choisie === match.equipe_gagnante
          }).length

          for (const semaine of semaines) {
            const matchsDeLaSemaine = matchs.filter((m) => m.semaine_id === semaine.id)
            const matchsTermines = matchsDeLaSemaine.filter((m) => m.statut === 'termine')
            if (matchsTermines.length === matchsDeLaSemaine.length && matchsDeLaSemaine.length > 0) {
              const mesPronosSemaine = pronostics.filter((p) =>
                matchsDeLaSemaine.some((m) => m.id === p.match_id)
              )
              const corrects = mesPronosSemaine.filter((p) => {
                const match = matchMap.get(p.match_id)
                return match && p.equipe_choisie === match.equipe_gagnante
              }).length

              if (corrects > meilleureSemaine) meilleureSemaine = corrects
              if (corrects === matchsDeLaSemaine.length) semainesParfaites++
            }
          }
        }
      }
    }
  }

  const tauxReussite = totalPronostics > 0 ? Math.round((totalCorrects / totalPronostics) * 100) : 0

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        transform: 'translateZ(0)',
        backgroundImage: 'url(/fonds/Fond-Profil.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 24px 100px', textAlign: 'center', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        <UserAvatar avatarId={profile.avatar_id ?? 1} size={80} userName={profile.pseudo} />
        <h1 style={{ margin: 0 }}>{profile.pseudo}</h1>
      </div>

      {profile.equipe_favorite && (
        <p>Équipe favorite : {NOMS_EQUIPES[profile.equipe_favorite] ?? profile.equipe_favorite}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
        <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{tauxReussite}%</p>
          <p style={{ fontSize: 12, color: '#9fb0c9' }}>Taux de réussite</p>
        </div>
        <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{meilleureSemaine}</p>
          <p style={{ fontSize: 12, color: '#9fb0c9' }}>Meilleure semaine</p>
        </div>
        <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{totalPronostics}</p>
          <p style={{ fontSize: 12, color: '#9fb0c9' }}>Pronostics faits</p>
        </div>
        <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{semainesParfaites}</p>
          <p style={{ fontSize: 12, color: '#9fb0c9' }}>Semaines parfaites</p>
        </div>
      </div>
      </div>
    </div>
  )
}