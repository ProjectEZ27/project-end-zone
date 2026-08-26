import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RappelPerso from './RappelPerso'
import AvatarEditor from '@/components/AvatarEditor'
import PseudoEditor from '@/components/PseudoEditor'
import { NOMS_EQUIPES } from '@/lib/teamBadge'
import { TbTargetArrow, TbTrendingUp, TbBallAmericanFootball, TbCalendarCheck } from 'react-icons/tb'

export default async function Profile({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: errorMessage } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profileResult, saisonResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('saisons').select('*').eq('statut', 'en_cours').single()
  ])
  const profile = profileResult.data
  const saison = saisonResult.data

  let totalPronostics = 0
  let totalCorrects = 0
  let meilleureSemaine = 0
  let semainesParfaites = 0

  if (saison) {
    const { data: semaines } = await supabase
      .from('semaines')
      .select('*')
      .eq('saison_id', saison.id)
      .order('id', { ascending: true })

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
          .eq('utilisateur_id', user.id)
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

          // Résultat par semaine close (nombre de bons pronos vs total), dans l'ordre chronologique
          const resultatsParSemaine: { corrects: number; total: number }[] = []

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

              resultatsParSemaine.push({ corrects, total: matchsDeLaSemaine.length })
            }
          }


        }
      }
    }
  }

  const tauxReussite = totalPronostics > 0 ? Math.round((totalCorrects / totalPronostics) * 100) : 0

  const stats = [
    { icon: <TbTargetArrow size={18} />, valeur: `${tauxReussite}%`, label: 'Taux de réussite' },
    { icon: <TbTrendingUp size={18} />, valeur: meilleureSemaine, label: 'Meilleure semaine' },
    { icon: <TbBallAmericanFootball size={18} />, valeur: totalPronostics, label: 'Pronostics faits' },
    { icon: <TbCalendarCheck size={18} />, valeur: semainesParfaites, label: 'Semaines parfaites' },
  ]

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
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

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center', color: 'white' }}>
        <AvatarEditor currentAvatarId={profile?.avatar_id ?? 1}>
          <PseudoEditor currentPseudo={profile?.pseudo ?? 'Profil'} />
        </AvatarEditor>

        {errorMessage && (
          <p style={{ color: '#e05252', marginTop: 8 }}>⚠️ {errorMessage}</p>
        )}
        {profile?.equipe_favorite && (
          <p style={{ fontSize: 12, color: '#9fb0c9', marginTop: 4 }}>
            Équipe favorite :{' '}
            <span style={{ color: '#C8352E', fontWeight: 600 }}>
              {NOMS_EQUIPES[profile.equipe_favorite] ?? profile.equipe_favorite}
            </span>
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#16233F',
              border: '0.5px solid #33415a',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'left',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#2a1418', color: '#E8544C',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700 }}>{s.valeur}</div>
                <div style={{ fontSize: 10, color: '#9fb0c9' }}>{s.label}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#C8352E' }} />
            </div>
          ))}
        </div>



        <div style={{ marginTop: 16, padding: 16, background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, textAlign: 'left' }}>
          <RappelPerso actif={profile?.rappel_perso_actif ?? false} />
        </div>
      </div>
    </div>
  )
}