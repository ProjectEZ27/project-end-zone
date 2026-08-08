import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { relancerRetardataires } from './actions'

export default async function TableauCommissaire({ params }: { params: Promise<{ id: string }> }) {
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

  if (league.commissaire_id !== user.id) {
    redirect('/leagues/' + id)
  }

  const { data: saison } = await supabase
    .from('saisons')
    .select('*')
    .eq('statut', 'en_cours')
    .single()

  const { data: semaine } = await supabase
    .from('semaines')
    .select('*')
    .eq('statut', 'ouverte')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  if (!saison || !semaine) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>📋 Tableau de bord — {league.nom}</h1>
        <p>Aucune saison ou semaine ouverte pour le moment.</p>
      </div>
    )
  }

  // Membres actifs de la ligue
  const { data: adhesions } = await supabase
    .from('adhesions')
    .select('utilisateur_id')
    .eq('ligue_id', id)
    .eq('saison_id', saison.id)
    .eq('statut', 'actif')

  const membresIds = (adhesions ?? []).map((a) => a.utilisateur_id)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, pseudo')
    .in('id', membresIds)

  // Matchs de la semaine ouverte
  const { data: matchs } = await supabase
    .from('matchs')
    .select('id')
    .eq('semaine_id', semaine.id)

  const nombreMatchs = matchs?.length ?? 0
  const matchIds = (matchs ?? []).map((m) => m.id)

  // Pronostics faits par chaque membre sur ces matchs
  const { data: pronostics } = await supabase
    .from('pronostics')
    .select('utilisateur_id, match_id')
    .in('match_id', matchIds)
    .in('utilisateur_id', membresIds)

  const nombreParJoueur = new Map<string, number>()
  for (const p of pronostics ?? []) {
    nombreParJoueur.set(p.utilisateur_id, (nombreParJoueur.get(p.utilisateur_id) ?? 0) + 1)
  }

  const membres = (profiles ?? []).map((profile) => ({
    id: profile.id,
    pseudo: profile.pseudo,
    fait: nombreParJoueur.get(profile.id) ?? 0,
  })).sort((a, b) => a.fait - b.fait) // les retardataires en premier

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <h1>📋 Tableau de bord — {league.nom}</h1>
      <p>{semaine.nom} · {nombreMatchs} matchs</p>

      <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>Joueur</th>
            <th style={{ padding: 8, textAlign: 'right' }}>Pronostics faits</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {membres.map((membre) => {
            const complet = membre.fait === nombreMatchs
            return (
              <tr key={membre.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8, textAlign: 'left' }}>{membre.pseudo}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{membre.fait}/{nombreMatchs}</td>
                <td style={{ padding: 8 }}>{complet ? '✅' : '⏳'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <form action={relancerRetardataires} style={{ marginTop: 24 }}>
        <input type="hidden" name="ligue_id" value={id} />
        <input type="hidden" name="semaine_id" value={semaine.id} />
        <button type="submit" style={{ padding: 10 }}>
          📧 Relancer les retardataires
        </button>
      </form>
      </div>
  )
}