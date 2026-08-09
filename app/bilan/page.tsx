import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculerClassementSaison } from '@/lib/scoring'

export default async function Bilan() {
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
        <h1>🏆 Bilan de saison</h1>
        <p>Aucune saison en cours pour le moment.</p>
      </div>
    )
  }

  const classement = await calculerClassementSaison(supabase, saison.id)
  const monClassement = classement.findIndex((j) => j.utilisateur_id === user.id)
  const monResultat = monClassement !== -1 ? classement[monClassement] : null

  if (!monResultat) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🏆 Bilan de saison</h1>
        <p>Aucun résultat pour le moment. Fais tes pronostics pour commencer !</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <h1>🏆 Bilan — Saison {saison.nom}</h1>

      <div style={{ marginTop: 24, padding: 24, border: '2px solid #c00', borderRadius: 8 }}>
        <p style={{ fontSize: 40, fontWeight: 'bold' }}>{monClassement + 1}{monClassement === 0 ? 'er' : 'e'}</p>
        <p style={{ color: '#666' }}>place au classement général</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
        <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{monResultat.score_saison}</p>
          <p style={{ fontSize: 12, color: '#666' }}>Points totaux</p>
        </div>
        <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{monResultat.meilleure_semaine}</p>
          <p style={{ fontSize: 12, color: '#666' }}>Meilleure semaine</p>
        </div>
      </div>

      <p style={{ marginTop: 24, color: '#666' }}>
        {classement.length} joueur{classement.length > 1 ? 's' : ''} au classement général cette saison.
      </p>
    </div>
  )
}