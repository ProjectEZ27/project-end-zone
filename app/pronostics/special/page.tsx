import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { submitSpecialPick } from './actions'

const EQUIPES_NFL = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LA','LAC','LV','MIA','MIN','NE','NO','NYG','NYJ',
  'PHI','PIT','SEA','SF','TB','TEN','WAS',
]

const JOUEURS_MVP = [
  // Quarterbacks
  'Josh Allen', 'Malik Willis', 'Drake Maye', 'Geno Smith',
  'Lamar Jackson', 'Joe Burrow', 'Shedeur Sanders', 'Aaron Rodgers',
  'C.J. Stroud', 'Daniel Jones', 'Trevor Lawrence', 'Cam Ward',
  'Bo Nix', 'Patrick Mahomes', 'Kirk Cousins', 'Justin Herbert',
  'Dak Prescott', 'Jaxson Dart', 'Jalen Hurts', 'Jayden Daniels',
  'Caleb Williams', 'Jared Goff', 'Jordan Love', 'Kyler Murray',
  'Michael Penix Jr.', 'Bryce Young', 'Tyler Shough', 'Baker Mayfield',
  'Jacoby Brissett', 'Matthew Stafford', 'Brock Purdy', 'Sam Darnold',
  // Running backs
  'James Cook III', "De'Von Achane", 'Rhamondre Stevenson', 'Breece Hall',
  'Derrick Henry', 'Chase Brown', 'Quinshon Judkins', 'Jaylen Warren',
  'David Montgomery', 'Jonathan Taylor', 'Bhayshul Tuten', 'Tony Pollard',
  'J.K. Dobbins', 'Kenneth Walker III', 'Ashton Jeanty', 'Omarion Hampton',
  'Javonte Williams', 'Cam Skattebo', 'Saquon Barkley', 'Jacory Croskey-Merritt',
  "D'Andre Swift", 'Jahmyr Gibbs', 'Josh Jacobs', 'Aaron Jones Sr.',
  'Bijan Robinson', 'Chuba Hubbard', 'Alvin Kamara', 'Bucky Irving',
  'Jeremiyah Love', 'Kyren Williams', 'Christian McCaffrey', 'Zach Charbonnet',
  // Wide receivers
  'DJ Moore', 'Jalen Tolbert', 'A.J. Brown', 'Adonai Mitchell',
  'Rashod Bateman', "Ja'Marr Chase", 'Denzel Boston', 'DK Metcalf',
  'Nico Collins', 'Alec Pierce', 'Brian Thomas Jr.', 'Carnell Tate',
  'Courtland Sutton', 'Tyquan Thornton', 'Tre Tucker', 'Quentin Johnston',
  'George Pickens', 'Malik Nabers', 'Dontayvion Wicks', 'Terry McLaurin',
  'Rome Odunze', 'Isaac TeSlaa', 'Christian Watson', 'Matthew Golden',
  'Justin Jefferson', 'Drake London', 'Jahan Dotson', 'Tetairoa McMillan',
  'Jordyn Tyson', 'Chris Olave', 'Emeka Egbuka', 'Jalen McMillan',
  'Marvin Harrison Jr.', 'Michael Wilson', 'Davante Adams', 'Puka Nacua',
  'Mike Evans', "Deebo Samuel Sr.", 'Jaxon Smith-Njigba', 'Rashid Shaheed',
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
          <select name="choix" defaultValue={mvp?.choix ?? ''} style={{ padding: 8 }}>
            <option value="" disabled>Choisir un joueur</option>
            {JOUEURS_MVP.map((joueur) => (
              <option key={joueur} value={joueur}>{joueur}</option>
            ))}
          </select>
          <input
            type="text"
            name="autre_joueur"
            placeholder="Ou un autre joueur (nom complet)"
            style={{ padding: 8 }}
          />
          <button type="submit" style={{ padding: 8 }}>Valider</button>
        </form>
        <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          Si tu remplis le champ "Autre joueur", il sera pris en compte à la place du menu déroulant.
        </p>
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