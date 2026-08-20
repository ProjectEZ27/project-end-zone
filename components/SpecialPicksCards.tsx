import { submitSpecialPick } from '@/app/pronostics/actions'

const EQUIPES_NFL = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LA','LAC','LV','MIA','MIN','NE','NO','NYG','NYJ',
  'PHI','PIT','SEA','SF','TB','TEN','WAS',
]

const JOUEURS_MVP = [
  'Josh Allen', 'Malik Willis', 'Drake Maye', 'Geno Smith',
  'Lamar Jackson', 'Joe Burrow', 'Shedeur Sanders', 'Aaron Rodgers',
  'C.J. Stroud', 'Daniel Jones', 'Trevor Lawrence', 'Cam Ward',
  'Bo Nix', 'Patrick Mahomes', 'Kirk Cousins', 'Justin Herbert',
  'Dak Prescott', 'Jaxson Dart', 'Jalen Hurts', 'Jayden Daniels',
  'Caleb Williams', 'Jared Goff', 'Jordan Love', 'Kyler Murray',
  'Michael Penix Jr.', 'Bryce Young', 'Tyler Shough', 'Baker Mayfield',
  'Jacoby Brissett', 'Matthew Stafford', 'Brock Purdy', 'Sam Darnold',
  'James Cook III', "De'Von Achane", 'Rhamondre Stevenson', 'Breece Hall',
  'Derrick Henry', 'Chase Brown', 'Quinshon Judkins', 'Jaylen Warren',
  'David Montgomery', 'Jonathan Taylor', 'Bhayshul Tuten', 'Tony Pollard',
  'J.K. Dobbins', 'Kenneth Walker III', 'Ashton Jeanty', 'Omarion Hampton',
  'Javonte Williams', 'Cam Skattebo', 'Saquon Barkley', 'Jacory Croskey-Merritt',
  "D'Andre Swift", 'Jahmyr Gibbs', 'Josh Jacobs', 'Aaron Jones Sr.',
  'Bijan Robinson', 'Chuba Hubbard', 'Alvin Kamara', 'Bucky Irving',
  'Jeremiyah Love', 'Kyren Williams', 'Christian McCaffrey', 'Zach Charbonnet',
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

interface SpecialPick {
  type: string
  choix: string
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  textAlign: 'center',
  backgroundColor: 'rgba(22, 35, 63, 0.4)',
}

export function SpecialPicksPreseason({ saisonId, mesPronosSpeciaux }: { saisonId: string; mesPronosSpeciaux: SpecialPick[] }) {
  const trouve = (type: string) => mesPronosSpeciaux?.find((p) => p.type === type)
  const superBowlPreseason = trouve('super_bowl_preseason')
  const mvp = trouve('mvp')

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16 }}>🏆 Vainqueur du Super Bowl</h2>
        <p style={{ fontSize: 12, color: '#999' }}>+8 points si bon pronostic · à faire avant le début de la saison</p>
        {superBowlPreseason && (
          <p style={{ fontSize: 13 }}><strong>Ton choix actuel : {superBowlPreseason.choix}</strong></p>
        )}
        <form action={submitSpecialPick} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <input type="hidden" name="type" value="super_bowl_preseason" />
          <input type="hidden" name="saison_id" value={saisonId} />
          <select key={superBowlPreseason?.choix ?? 'vide'} name="choix" required defaultValue={superBowlPreseason?.choix ?? ''} style={{ padding: 8 }}>
            <option value="" disabled>Choisir une équipe</option>
            {EQUIPES_NFL.map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
          <button type="submit" style={{ padding: 8 }}>Valider</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 16 }}>⭐ MVP de la saison</h2>
        <p style={{ fontSize: 12, color: '#999' }}>+8 points si bon pronostic · à faire avant le début de la saison</p>
        {mvp && (
          <p style={{ fontSize: 13 }}><strong>Ton choix actuel : {mvp.choix}</strong></p>
        )}
        <form action={submitSpecialPick} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <input type="hidden" name="type" value="mvp" />
          <input type="hidden" name="saison_id" value={saisonId} />
          <select key={mvp?.choix ?? 'vide'} name="choix" defaultValue={mvp?.choix ?? ''} style={{ padding: 8 }}>
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
        <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
          Si tu remplis le champ "Autre joueur", il sera pris en compte à la place du menu déroulant.
        </p>
      </div>
    </div>
  )
}

export function SpecialPicksAvantPlayoffs({ saisonId, mesPronosSpeciaux }: { saisonId: string; mesPronosSpeciaux: SpecialPick[] }) {
  const trouve = (type: string) => mesPronosSpeciaux?.find((p) => p.type === type)
  const avantPlayoffs = trouve('super_bowl_avant_playoffs')

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16 }}>🏆 Vainqueur du Super Bowl — avant playoffs</h2>
        <p style={{ fontSize: 12, color: '#999' }}>+5 points si bon pronostic · à faire avant le début du Wild Card</p>
        {avantPlayoffs && (
          <p style={{ fontSize: 13 }}><strong>Ton choix actuel : {avantPlayoffs.choix}</strong></p>
        )}
        <form action={submitSpecialPick} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <input type="hidden" name="type" value="super_bowl_avant_playoffs" />
          <input type="hidden" name="saison_id" value={saisonId} />
          <select key={avantPlayoffs?.choix ?? 'vide'} name="choix" required defaultValue={avantPlayoffs?.choix ?? ''} style={{ padding: 8 }}>
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