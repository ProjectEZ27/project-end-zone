'use client'

import { useState } from 'react'
import { submitSpecialPick } from '@/app/pronostics/actions'

const POSTES = ['QB', 'WR', 'RB', 'TE'] as const
type Poste = (typeof POSTES)[number]

const JOUEURS: Record<Poste, string[]> = {
  QB: [
    'Josh Allen', 'Malik Willis', 'Drake Maye', 'Geno Smith',
    'Lamar Jackson', 'Joe Burrow', 'Shedeur Sanders', 'Aaron Rodgers',
    'C.J. Stroud', 'Daniel Jones', 'Trevor Lawrence', 'Cam Ward',
    'Bo Nix', 'Patrick Mahomes', 'Kirk Cousins', 'Justin Herbert',
    'Dak Prescott', 'Jaxson Dart', 'Jalen Hurts', 'Jayden Daniels',
    'Caleb Williams', 'Jared Goff', 'Jordan Love', 'Kyler Murray',
    'Michael Penix Jr.', 'Bryce Young', 'Tyler Shough', 'Baker Mayfield',
    'Jacoby Brissett', 'Matthew Stafford', 'Brock Purdy', 'Sam Darnold',
  ],
  WR: [
    'DJ Moore', 'Jalen Tolbert', 'A.J. Brown', 'Adonai Mitchell',
    'Rashod Bateman', "Ja'Marr Chase", 'Denzel Boston', 'DK Metcalf',
    'Nico Collins', 'Alec Pierce', 'Brian Thomas Jr.', 'Carnell Tate',
    'Courtland Sutton', 'Tyquan Thornton', 'Tre Tucker', 'Quentin Johnston',
    'George Pickens', 'Malik Nabers', 'Dontayvion Wicks', 'Terry McLaurin',
    'Rome Odunze', 'Isaac TeSlaa', 'Christian Watson', 'Matthew Golden',
    'Justin Jefferson', 'Drake London', 'Jahan Dotson', 'Tetairoa McMillan',
    'Jordyn Tyson', 'Chris Olave', 'Emeka Egbuka', 'Jalen McMillan',
    'Marvin Harrison Jr.', 'Michael Wilson', 'Davante Adams', 'Puka Nacua',
    'Mike Evans', 'Deebo Samuel Sr.', 'Jaxon Smith-Njigba', 'Rashid Shaheed',
  ],
  RB: [
    'James Cook III', "De'Von Achane", 'Rhamondre Stevenson', 'Breece Hall',
    'Derrick Henry', 'Chase Brown', 'Quinshon Judkins', 'Jaylen Warren',
    'David Montgomery', 'Jonathan Taylor', 'Bhayshul Tuten', 'Tony Pollard',
    'J.K. Dobbins', 'Kenneth Walker III', 'Ashton Jeanty', 'Omarion Hampton',
    'Javonte Williams', 'Cam Skattebo', 'Saquon Barkley', 'Jacory Croskey-Merritt',
    "D'Andre Swift", 'Jahmyr Gibbs', 'Josh Jacobs', 'Aaron Jones Sr.',
    'Bijan Robinson', 'Chuba Hubbard', 'Alvin Kamara', 'Bucky Irving',
    'Jeremiyah Love', 'Kyren Williams', 'Christian McCaffrey', 'Zach Charbonnet',
  ],
  TE: [
    'Trey McBride', 'Brock Bowers', 'George Kittle', 'Travis Kelce',
    'Sam LaPorta', 'T.J. Hockenson', 'Jake Ferguson', 'Dalton Kincaid',
    'Tyler Warren', 'Colston Loveland', 'Mark Andrews', 'Evan Engram',
  ],
}

function posteDe(nom: string): Poste | null {
  return POSTES.find((p) => JOUEURS[p].includes(nom)) ?? null
}

/*
 * Choix du MVP : un onglet par poste (QB, WR, RB, TE) avec la liste des joueurs,
 * ou un nom écrit à la main. Même enregistrement qu'avant (submitSpecialPick).
 */
export default function ChoixMvp({ saisonId, choixActuel }: { saisonId: string; choixActuel?: string }) {
  const posteInitial = choixActuel ? posteDe(choixActuel) : null
  const [poste, setPoste] = useState<Poste>(posteInitial ?? 'QB')
  const [choisi, setChoisi] = useState<string>(posteInitial ? (choixActuel as string) : '')
  const [saisie, setSaisie] = useState<string>(choixActuel && !posteInitial ? choixActuel : '')

  // Le nom écrit à la main remplace la sélection dans la liste (comme avant)
  const valeur = saisie.trim() || choisi
  const inchange = valeur !== '' && valeur === choixActuel

  return (
    <form action={submitSpecialPick} style={{ marginTop: 10, textAlign: 'left' }}>
      <input type="hidden" name="type" value="mvp" />
      <input type="hidden" name="saison_id" value={saisonId} />
      <input type="hidden" name="choix" value={valeur} />

      <div role="tablist" aria-label="Poste du joueur" style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {POSTES.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={poste === p}
            onClick={() => setPoste(p)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: poste === p ? '#C8352E' : '#0B1426',
              color: poste === p ? '#fff' : '#9fb0c9',
              border: poste === p ? '1px solid #C8352E' : '1px solid #33415a',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 6,
          maxHeight: 220,
          overflowY: 'auto',
          padding: 2,
        }}
      >
        {JOUEURS[poste].map((nom) => {
          const actif = !saisie.trim() && choisi === nom
          return (
            <button
              key={nom}
              type="button"
              aria-pressed={actif}
              onClick={() => {
                setChoisi(nom)
                setSaisie('')
              }}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 13,
                textAlign: 'left',
                cursor: 'pointer',
                background: actif ? 'rgba(200,53,46,0.22)' : '#0B1426',
                color: 'white',
                border: actif ? '1px solid #C8352E' : '1px solid #33415a',
              }}
            >
              {nom}
            </button>
          )
        })}
      </div>

      <label style={{ display: 'block', fontSize: 12, color: '#9fb0c9', margin: '12px 0 4px' }}>
        Ou écris le nom d&apos;un autre joueur
      </label>
      <input
        type="text"
        value={saisie}
        onChange={(e) => setSaisie(e.target.value)}
        maxLength={60}
        placeholder="Nom complet"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: '#0B1426',
          color: 'white',
          border: '1px solid #33415a',
          borderRadius: 8,
          padding: 8,
          fontSize: 14,
        }}
      />

      <p style={{ fontSize: 13, margin: '12px 0 8px', textAlign: 'center', minHeight: 18 }}>
        {valeur ? (
          <>
            Ton choix : <strong>{valeur}</strong>
          </>
        ) : (
          <span style={{ color: '#9fb0c9' }}>Choisis un joueur ou écris un nom</span>
        )}
      </p>

      <div style={{ textAlign: 'center' }}>
        <button
          type="submit"
          disabled={!valeur || inchange}
          style={{
            padding: '9px 24px',
            borderRadius: 8,
            border: 'none',
            background: !valeur || inchange ? '#33415a' : '#C8352E',
            color: !valeur || inchange ? '#9fb0c9' : '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: !valeur || inchange ? 'default' : 'pointer',
          }}
        >
          {inchange ? 'Choix enregistré' : 'Valider'}
        </button>
      </div>
    </form>
  )
}