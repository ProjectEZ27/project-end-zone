import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { submitSpecialPick } from './actions'

const EQUIPES_NFL = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LA','LAC','LV','MIA','MIN','NE','NO','NYG','NYJ',
  'PHI','PIT','SEA','SF','TB','TEN','WAS',
]

export default async function SpecialPicks() {
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
        <h1>🏈 Pronostics spéciaux</h1>
        <p>Aucune saison en cours pour le moment.</p>
      </div>
    )
  }

  const { data: mesPronosSpeciaux } = await supabase
    .from('pronostics_speciaux')
    .select('*')
    .eq('utilisateur_id', user.id)
    .eq('saison_id', saison.id)

  const trouve = (type: string) => mesPronosSpeciaux?.find((p) => p.type === type)

  const superBowlPreseason = trouve('super_bowl_preseason')
  const mvp = trouve('mvp')
  const avantPlayoffs = trouve('super_bowl_avant_playoffs')

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center' }}>
      <h1>🏈 Pronostics spéciaux</h1>
      <p>Saison {saison.nom}</p>

      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>🏆 Vainqueur du Super Bowl</h2>
        <p style={{ fontSize: 13, color: '#666' }}>+8 points si bon pronostic · à faire avant le début de la saison</p>
        {superBowlPreseason && (
          <p><strong>Ton choix actuel : {superBowlPreseason.choix}</strong></p>
        )}
        <form action={submitSpecialPick} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <input type="hidden" name="type" value="super_bowl_preseason" />
          <input type="hidden" name="saison_id" value={saison.id} />
          <select name="choix" required defaultValue={superBowlPreseason?.choix ?? ''} style={{ padding: 8 }}>
            <option value="" disabled>Choisir une équipe</option>
            {EQUIPES_NFL.map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
          <button type="submit" style={{ padding: 8 }}>Valider</button>
        </form>
      </div>

      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h2 style={{ fontSize: 18 }}>⭐ MVP de la saison</h2>
        <p style={{ fontSize: 13, color: '#666' }}>+8 points si bon pronostic · à faire avant le début de la saison</p>
        {mvp && (
          <p><strong>Ton choix actuel : {mvp.choix}</strong></p>
        )}
        <form action={submitSpecialPick} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <input type="hidden" name="type" value="mvp" />
          <input type="hidden" name="saison_id" value={saison.id} />
          <input type="text" name="choix" placeholder="Nom du joueur" required defaultValue={mvp?.choix ?? ''} style={{ padding: 8 }} />
          <button type="submit" style={{ padding: 8 }}>Valider</button>
        </form>
      </div>

      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h2 style={{ fontSize: 18 }}>🏆 Vainqueur du Super Bowl — avant playoffs</h2>
        <p style={{ fontSize: 13, color: '#666' }}>+5 points si bon pronostic · à faire avant le début du Wild Card</p>
        {avantPlayoffs && (
          <p><strong>Ton choix actuel : {avantPlayoffs.choix}</strong></p>
        )}
        <form action={submitSpecialPick} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <input type="hidden" name="type" value="super_bowl_avant_playoffs" />
          <input type="hidden" name="saison_id" value={saison.id} />
          <select name="choix" required defaultValue={avantPlayoffs?.choix ?? ''} style={{ padding: 8 }}>
            <option value="" disabled>Choisir une équipe</option>
            {EQUIPES_NFL.map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
          <button type="submit" style={{ padding: 8 }}>Valider</button>
        </form>
      </div>
    </div>
  )
}