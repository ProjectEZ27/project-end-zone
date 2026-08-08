import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { calculerClassementSaison } from '@/lib/scoring'

export default async function ClassementLigue({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: saison } = await supabase
    .from('saisons')
    .select('*')
    .eq('statut', 'en_cours')
    .single()

  if (!saison) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🏆 Classement — {league.nom}</h1>
        <p>Aucune saison en cours pour le moment.</p>
      </div>
    )
  }

  // Membres actifs de cette ligue pour cette saison
  const { data: adhesions } = await supabase
    .from('adhesions')
    .select('utilisateur_id')
    .eq('ligue_id', id)
    .eq('saison_id', saison.id)
    .eq('statut', 'actif')

  const membresIds = new Set((adhesions ?? []).map((a) => a.utilisateur_id))

  // Classement complet de la saison, puis filtré aux membres de cette ligue
  const classementComplet = await calculerClassementSaison(supabase, saison.id)
  const classementLigue = classementComplet.filter((j) => membresIds.has(j.utilisateur_id))

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <h1>🏆 Classement — {league.nom}</h1>
      <p>Saison {saison.nom}</p>

      {classementLigue.length === 0 ? (
        <p>Aucun résultat pour le moment.</p>
      ) : (
        <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>#</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Joueur</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Points</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Meilleure semaine</th>
            </tr>
          </thead>
          <tbody>
            {classementLigue.map((joueur, index) => (
              <tr key={joueur.utilisateur_id} style={{ borderBottom: '1px solid #eee', fontWeight: joueur.utilisateur_id === user.id ? 'bold' : 'normal' }}>
                <td style={{ padding: 8 }}>{index + 1}</td>
                <td style={{ padding: 8 }}>{joueur.pseudo}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{joueur.score_saison}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{joueur.meilleure_semaine}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}