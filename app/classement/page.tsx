import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculerClassementSaison } from '@/lib/scoring'

export default async function Classement() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: saison } = await supabase
    .from('saisons')
    .select('*')
    .eq('statut', 'en_cours')
    .single()

  if (!saison) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🏈 Classement général</h1>
        <p>Aucune saison en cours pour le moment.</p>
      </div>
    )
  }

  const classement = await calculerClassementSaison(supabase, saison.id)

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <h1>🏆 Classement général</h1>
      <p>Saison {saison.nom}</p>

      {classement.length === 0 ? (
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
            {classement.map((joueur, index) => {
              const medaille = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
              return (
              <tr key={joueur.utilisateur_id} style={{ borderBottom: '1px solid #eee', fontWeight: joueur.utilisateur_id === user.id ? 'bold' : 'normal' }}>
                <td style={{ padding: 8 }}>{index + 1} {medaille ?? ''}</td>
                <td style={{ padding: 8 }}>{joueur.pseudo}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{joueur.score_saison}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{joueur.meilleure_semaine}</td>
              </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}