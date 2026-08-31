import { NOMS_EQUIPES } from '@/lib/teamBadge'
export const dynamic = 'force-dynamic'
import { getPowerIndexRanking } from '@/lib/powerIndex'
import RulesAccordion from '@/components/RulesAccordion'

// Textes écrits à la main — à compléter/ajuster toi-même au fil de la saison.
// Le classement (le chiffre, l'ordre), lui, reste automatique via l'API.
interface ResumeEquipe {
  texte: string
  forces?: string[]
  faiblesses?: string[]
}

const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  LA: {
    texte: "Une équipe équilibrée, solide des deux côtés du ballon, sans faiblesse évidente pour l'instant.",
    forces: ['Régularité', 'Défense'],
  },
  BUF: {
    texte: "Un quarterback qui peut gagner un match à lui seul, portée par un jeu aérien redoutable.",
    forces: ['Quarterback', 'Jeu aérien'],
    faiblesses: ['Défense sur les gros matchs'],
  },
  BAL: {
    texte: "Une attaque au sol parmi les plus dangereuses de la ligue, sur un jeu très physique.",
    forces: ['Attaque au sol'],
    faiblesses: ['Régularité'],
  },
  SEA: {
    texte: "Une défense qui a fait un vrai bond cette saison, difficile à percer.",
    forces: ['Défense'],
    faiblesses: ['Efficacité offensive'],
  },
  SF: {
    texte: "Un effectif taillé pour les longues saisons, avec de la profondeur à tous les postes.",
    forces: ["Profondeur d'effectif"],
    faiblesses: ['Historique blessures'],
  },
  GB: {
    texte: "Une équipe jeune et prometteuse, en progression constante.",
    forces: ['Progression', 'Jeunesse'],
    faiblesses: ['Fin de match'],
  },
  KC: {
    texte: "Le grand habitué des moments décisifs — personne ne gère mieux les fins de match serrées.",
    forces: ['Fin de match', 'Expérience'],
    faiblesses: ['Ligne offensive'],
  },
  DET: {
    texte: "L'attaque la plus créative de la ligue sur les dernières saisons, portée par un jeu au sol excellent.",
    forces: ['Attaque au sol', 'Créativité offensive'],
    faiblesses: ['Matchs à l\'extérieur'],
  },
  PHI: {
    texte: "Un groupe complet avec du talent à tous les postes, capable de dominer sur un seul gros match.",
    forces: ['Ligne offensive', 'Talent individuel'],
    faiblesses: ['Régularité défensive'],
  },
  DAL: {
    texte: "Une attaque explosive et spectaculaire, mais une défense qui manque encore de constance.",
    forces: ['Attaque explosive'],
    faiblesses: ['Défense'],
  },
  CIN: {
    texte: "Un duo quarterback-receveur parmi les plus dangereux de la ligue quand tout le monde est en bonne santé.",
    forces: ['Jeu aérien'],
    faiblesses: ['Fragilité (blessures)'],
  },
  MIA: {
    texte: "Une attaque rapide et verticale, redoutable quand les conditions météo sont clémentes.",
    forces: ['Vitesse', 'Jeu vertical'],
    faiblesses: ['Jeu par mauvais temps/froid'],
  },
  HOU: {
    texte: "Un jeune noyau en pleine ascension, avec un quarterback capable de rattraper les matchs à lui seul.",
    forces: ['Quarterback', 'Progression'],
    faiblesses: ['Expérience en playoffs'],
  },
  PIT: {
    texte: "Une défense solide et disciplinée comme toujours, sur une attaque plus limitée.",
    forces: ['Défense', 'Discipline'],
    faiblesses: ['Créativité offensive'],
  },
  LAC: {
    texte: "Un jeu équilibré avec un vrai potentiel, encore un cran en dessous des toutes meilleures équipes.",
    forces: ['Équilibre'],
    faiblesses: ['Manque de régularité'],
  },
  MIN: {
    texte: "Une défense agressive qui crée beaucoup de turnovers, sur une attaque parfois inconsistante.",
    forces: ['Défense agressive'],
    faiblesses: ['Régularité offensive'],
  },
  DEN: {
    texte: "Une défense en net progrès, portée par une ligne défensive très physique.",
    forces: ['Ligne défensive'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  ARI: {
    texte: "Une attaque qui peut surprendre par séquences, encore irrégulière sur l'ensemble d'un match.",
    forces: ['Coups d\'éclat offensifs'],
    faiblesses: ['Régularité'],
  },
  TB: {
    texte: "Un jeu aérien précis et bien rodé, sur une défense qui reste à confirmer sur la durée.",
    forces: ['Jeu aérien précis'],
    faiblesses: ['Défense'],
  },
  ATL: {
    texte: "Une attaque au sol costaude, avec un jeune quarterback encore en phase d'apprentissage.",
    forces: ['Attaque au sol'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  IND: {
    texte: "Une équipe rapide et dynamique, qui manque encore de constance sur l'ensemble d'une saison.",
    forces: ['Vitesse'],
    faiblesses: ['Constance'],
  },
  CHI: {
    texte: "Un jeune quarterback prometteur, entouré d'une défense encore en reconstruction.",
    forces: ['Potentiel au poste de quarterback'],
    faiblesses: ['Défense'],
  },
  NYJ: {
    texte: "Une défense qui peut faire mal sur son jour, une attaque qui cherche encore sa régularité.",
    forces: ['Ligne défensive'],
    faiblesses: ['Régularité offensive'],
  },
  WAS: {
    texte: "Un collectif jeune et audacieux, qui n'a pas peur de prendre des risques offensifs.",
    forces: ['Audace offensive'],
    faiblesses: ['Expérience défensive'],
  },
  NO: {
    texte: "Une équipe disciplinée sur le plan tactique, avec un effectif offensif plus limité que la moyenne.",
    forces: ['Discipline tactique'],
    faiblesses: ['Profondeur offensive'],
  },
  NYG: {
    texte: "Une ligne défensive qui peut poser des problèmes à n'importe qui, sur une attaque en reconstruction.",
    forces: ['Ligne défensive'],
    faiblesses: ['Attaque'],
  },
  NE: {
    texte: "Un groupe en reconstruction, avec une base défensive solide sur laquelle s'appuyer.",
    forces: ['Défense'],
    faiblesses: ['Expérience offensive globale'],
  },
  CAR: {
    texte: "Une attaque en progrès avec un jeune quarterback qui gagne en assurance semaine après semaine.",
    forces: ['Progression offensive'],
    faiblesses: ['Défense'],
  },
  JAX: {
    texte: "Du talent individuel réel, encore desservi par un manque de régularité collective.",
    forces: ['Talent individuel'],
    faiblesses: ['Régularité collective'],
  },
  LV: {
    texte: "Une équipe en reconstruction, qui cherche encore son identité de jeu cette saison.",
    forces: ['Renouveau'],
    faiblesses: ["Manque d'identité de jeu"],
  },
  TEN: {
    texte: "Un jeu au sol qui reste une base solide, sur une attaque aérienne encore limitée.",
    forces: ['Attaque au sol'],
    faiblesses: ['Jeu aérien'],
  },
  CLE: {
    texte: "Une défense qui a longtemps fait sa réputation, sur une attaque en pleine reconstruction.",
    forces: ['Historique défensif'],
    faiblesses: ['Attaque'],
  },
}

export default async function InfosEquipes() {
  const annee = new Date().getFullYear()
  const classement = await getPowerIndexRanking(annee)

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Regles.webp)',
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
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px 100px', position: 'relative' }}>
        <h1 style={{ fontSize: 26, textAlign: 'center', marginBottom: 4 }}>🏈 Infos équipes</h1>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 32 }}>
          Le classement des 32 équipes, pour t'aider à pronostiquer
        </p>

        {classement.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
            Classement momentanément indisponible, réessaie plus tard.
          </p>
        ) : (
          classement.map((equipe) => {
            const resume = RESUMES_EQUIPES[equipe.code]
            return (
              <RulesAccordion
                key={equipe.code}
                title={`${equipe.rang}. ${NOMS_EQUIPES[equipe.code] ?? equipe.code}`}
              >
                <p>{resume?.texte ?? 'Résumé à venir pour cette équipe.'}</p>
                {(resume?.forces?.length || resume?.faiblesses?.length) ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {resume.forces?.map((f) => (
                      <span key={f} style={{
                        fontSize: 11,
                        padding: '4px 9px',
                        borderRadius: 20,
                        background: 'rgba(78,232,146,0.12)',
                        color: '#4ee892',
                      }}>✓ {f}</span>
                    ))}
                    {resume.faiblesses?.map((f) => (
                      <span key={f} style={{
                        fontSize: 11,
                        padding: '4px 9px',
                        borderRadius: 20,
                        background: 'rgba(255,107,95,0.12)',
                        color: '#ff6b5f',
                      }}>✕ {f}</span>
                    ))}
                  </div>
                ) : null}
              </RulesAccordion>
            )
          })
        )}
      </div>
    </div>
  )
}