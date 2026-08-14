import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RappelPerso from './RappelPerso'
import { changerPseudo } from './actions'
import { NOMS_EQUIPES } from '@/lib/teamBadge'

export default async function Profile({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: errorMessage } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: saison } = await supabase
    .from('saisons')
    .select('*')
    .eq('statut', 'en_cours')
    .single()

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
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <h1>👤 {profile?.pseudo ?? 'Profil'}</h1>
      {errorMessage && (
        <p style={{ color: '#e05252', marginTop: 8 }}>⚠️ {errorMessage}</p>
      )}
      {profile?.equipe_favorite && (
        <p>Équipe favorite : {NOMS_EQUIPES[profile.equipe_favorite] ?? profile.equipe_favorite}</p>
      )}

      <form action={changerPseudo} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <input
          type="text"
          name="pseudo"
          placeholder="Nouveau pseudo"
          defaultValue={profile?.pseudo ?? ''}
          required
          minLength={2}
          style={{ padding: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>Changer</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
        <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{tauxReussite}%</p>
          <p style={{ fontSize: 12, color: '#666' }}>Taux de réussite</p>
        </div>
        <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{meilleureSemaine}</p>
          <p style={{ fontSize: 12, color: '#666' }}>Meilleure semaine</p>
        </div>
        <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{totalPronostics}</p>
          <p style={{ fontSize: 12, color: '#666' }}>Pronostics faits</p>
        </div>
        <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{semainesParfaites}</p>
          <p style={{ fontSize: 12, color: '#666' }}>Semaines parfaites</p>
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 16, border: '1px solid #33415a', borderRadius: 8, textAlign: 'left' }}>
        <RappelPerso actif={profile?.rappel_perso_actif ?? false} />
      </div>
    </div>
  )
}