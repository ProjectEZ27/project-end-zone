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
  historique?: string
}

const RESUMES_EQUIPES: Record<string, ResumeEquipe> = {
  SEA: {
    texte: "Une défense qui a fait un vrai bond, difficile à percer sur l'ensemble d'une saison. L'attaque a gagné en efficacité dans les moments clés.",
    forces: ['Défense', 'Fin de saison'],
    faiblesses: ['Régularité en début de saison'],
    historique: "🏆 Vainqueur du Super Bowl LX (saison 2025), leur 2e titre après celui de 2013.",
  },
  LA: {
    texte: "Une équipe équilibrée, solide des deux côtés du ballon, portée par un quarterback d'expérience en pleine forme.",
    forces: ['Régularité', 'Défense', 'Expérience au poste de quarterback'],
    historique: "⭐ Matthew Stafford, élu MVP de la ligue pour la saison 2025.",
  },
  BUF: {
    texte: "Un quarterback capable de gagner un match à lui seul, portée par un jeu aérien redoutable et une grosse capacité à marquer vite.",
    forces: ['Quarterback', 'Jeu aérien', 'Rythme offensif'],
    faiblesses: ['Défense sur les gros matchs'],
    historique: "⭐ Josh Allen, élu MVP de la ligue pour la saison 2024.",
  },
  BAL: {
    texte: "Une attaque au sol parmi les plus dangereuses de la ligue, portée par un quarterback capable de casser les défenses à lui seul dans la course.",
    forces: ['Attaque au sol', 'Quarterback mobile'],
    faiblesses: ['Régularité en playoffs'],
    historique: "⭐ Lamar Jackson, élu MVP de la ligue pour la saison 2023 (son 2e titre de MVP).",
  },
  KC: {
    texte: "Le grand habitué des moments décisifs — personne ne gère mieux les fins de match serrées, saison après saison.",
    forces: ['Fin de match', 'Expérience', 'Régularité en playoffs'],
    faiblesses: ['Ligne offensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2023, l'une des équipes les plus titrées de la décennie.",
  },
  PHI: {
    texte: "Un groupe complet avec du talent à tous les postes, une ligne offensive dominante et une capacité à hausser le niveau sur les gros matchs.",
    forces: ['Ligne offensive', 'Talent individuel'],
    faiblesses: ['Régularité défensive'],
    historique: "🏆 Vainqueur du Super Bowl à l'issue de la saison 2024, leur 2e titre après celui de 2017.",
  },
  NE: {
    texte: "Un collectif retrouvé au sommet, avec une défense solide et un jeu plus mature qu'il y a quelques saisons.",
    forces: ['Défense', 'Expérience collective'],
    faiblesses: ['Fin de match sur les tout gros matchs'],
    historique: "🥈 Finaliste du Super Bowl LX à l'issue de la saison 2025, battus par les Seahawks.",
  },
  DET: {
    texte: "L'attaque la plus créative de la ligue ces dernières saisons, portée par un jeu au sol excellent et une ligne offensive de premier plan.",
    forces: ['Attaque au sol', 'Créativité offensive', 'Ligne offensive'],
    faiblesses: ["Matchs à l'extérieur"],
  },
  DAL: {
    texte: "Une attaque explosive et spectaculaire capable de scorer vite, mais une défense qui manque encore de constance sur la durée d'une saison.",
    forces: ['Attaque explosive'],
    faiblesses: ['Défense', 'Constance'],
  },
  CIN: {
    texte: "Un duo quarterback-receveur parmi les plus dangereux de la ligue quand tout le monde est en bonne santé, capable de rattraper n'importe quel retard.",
    forces: ['Jeu aérien', 'Capacité à revenir au score'],
    faiblesses: ['Fragilité (blessures récurrentes)'],
  },
  MIA: {
    texte: "Une attaque rapide et verticale, redoutable dans de bonnes conditions, mais qui perd en efficacité par temps froid ou humide.",
    forces: ['Vitesse', 'Jeu vertical'],
    faiblesses: ['Jeu par mauvais temps/froid'],
  },
  HOU: {
    texte: "Un jeune noyau en pleine ascension, avec un quarterback athlétique capable de créer des points en dehors du plan de jeu initial.",
    forces: ['Quarterback', 'Progression rapide'],
    faiblesses: ['Expérience en playoffs'],
  },
  PIT: {
    texte: "Une défense solide et disciplinée comme toujours sous cette organisation, avec une attaque plus limitée mais efficace dans les moments importants.",
    forces: ['Défense', 'Discipline tactique'],
    faiblesses: ['Créativité offensive'],
  },
  LAC: {
    texte: "Un jeu équilibré avec un vrai potentiel des deux côtés du ballon, encore un cran en dessous des toutes meilleures équipes sur la régularité.",
    forces: ['Équilibre offense/défense'],
    faiblesses: ['Manque de régularité'],
  },
  MIN: {
    texte: "Une défense agressive qui crée beaucoup de turnovers et change le cours des matchs, sur une attaque parfois inconsistante d'une semaine à l'autre.",
    forces: ['Défense agressive', 'Turnovers créés'],
    faiblesses: ['Régularité offensive'],
  },
  DEN: {
    texte: "Une défense en net progrès ces dernières saisons, portée par une ligne défensive très physique qui perturbe les attaques adverses.",
    forces: ['Ligne défensive'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  ARI: {
    texte: "Une attaque qui peut surprendre par séquences grâce à des joueurs athlétiques, encore irrégulière sur l'ensemble d'un match complet.",
    forces: ["Coups d'éclat offensifs"],
    faiblesses: ['Régularité'],
  },
  TB: {
    texte: "Un jeu aérien précis et bien rodé avec un quarterback expérimenté, sur une défense qui reste à confirmer sur la durée d'une saison.",
    forces: ['Jeu aérien précis'],
    faiblesses: ['Défense'],
  },
  ATL: {
    texte: "Une attaque au sol costaude qui use les défenses adverses, avec un jeune quarterback encore en phase d'apprentissage à ce niveau.",
    forces: ['Attaque au sol'],
    faiblesses: ['Expérience au poste de quarterback'],
  },
  IND: {
    texte: "Une équipe rapide et dynamique capable de belles séquences, qui manque encore de constance sur l'ensemble d'une saison complète.",
    forces: ['Vitesse'],
    faiblesses: ['Constance'],
  },
  CHI: {
    texte: "Un jeune quarterback prometteur qui monte en puissance, entouré d'une défense encore en reconstruction après plusieurs saisons difficiles.",
    forces: ['Potentiel au poste de quarterback'],
    faiblesses: ['Défense'],
  },
  NYJ: {
    texte: "Une défense qui peut faire mal à n'importe qui sur son jour, une attaque qui cherche encore sa régularité d'une semaine à l'autre.",
    forces: ['Ligne défensive'],
    faiblesses: ['Régularité offensive'],
  },
  WAS: {
    texte: "Un collectif jeune et audacieux qui n'a pas peur de prendre des risques offensifs, en pleine progression depuis deux saisons.",
    forces: ['Audace offensive', 'Progression'],
    faiblesses: ['Expérience défensive'],
  },
  NO: {
    texte: "Une équipe disciplinée sur le plan tactique qui ne se met pas en danger, avec un effectif offensif plus limité que la moyenne de la ligue.",
    forces: ['Discipline tactique'],
    faiblesses: ['Profondeur offensive'],
  },
  NYG: {
    texte: "Une ligne défensive qui peut poser des problèmes à n'importe qui grâce à sa pression sur le quarterback adverse, sur une attaque en reconstruction.",
    forces: ['Ligne défensive', 'Pression sur le QB'],
    faiblesses: ['Attaque'],
  },
  CAR: {
    texte: "Une attaque en progrès avec un jeune quarterback qui gagne en assurance semaine après semaine, sur une défense encore perfectible.",
    forces: ['Progression offensive'],
    faiblesses: ['Défense'],
  },
  JAX: {
    texte: "Du talent individuel réel à plusieurs postes clés, encore desservi par un manque de régularité collective sur l'ensemble d'une saison.",
    forces: ['Talent individuel'],
    faiblesses: ['Régularité collective'],
  },
  LV: {
    texte: "Une équipe en reconstruction qui cherche encore son identité de jeu cette saison, avec quelques individualités intéressantes à suivre.",
    forces: ['Renouveau'],
    faiblesses: ["Manque d'identité de jeu"],
  },
  TEN: {
    texte: "Un jeu au sol qui reste une base solide sur laquelle s'appuyer, sur une attaque aérienne encore limitée et prévisible.",
    forces: ['Attaque au sol'],
    faiblesses: ['Jeu aérien'],
  },
  CLE: {
    texte: "Une défense qui a longtemps fait la réputation de cette franchise, sur une attaque en pleine reconstruction après plusieurs changements.",
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
                {resume?.historique && (
                  <p style={{ marginTop: 8, fontSize: 13, color: '#ffd9d5', fontWeight: 600 }}>
                    {resume.historique}
                  </p>
                )}
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