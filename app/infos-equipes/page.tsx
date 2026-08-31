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
    texte: "Le favori du power ranking cette saison. Une équipe équilibrée, solide des deux côtés du ballon, qui ne montre pas de vraie faiblesse évidente pour l'instant.",
    forces: ['Régularité', 'Défense'],
  },
  BUF: {
    texte: "Un quarterback qui peut gagner un match à lui seul, portée par un jeu aérien redoutable. La défense reste le point à surveiller sur les gros matchs.",
    forces: ['Quarterback', 'Jeu aérien'],
    faiblesses: ['Défense sur les gros matchs'],
  },
  BAL: {
    texte: "Une attaque au sol parmi les plus dangereuses de la ligue, portée par un jeu très physique. Peut être irrégulière face aux défenses les plus organisées.",
    forces: ['Attaque au sol'],
    faiblesses: ['Régularité'],
  },
  SEA: {
    texte: "Une défense qui a fait un vrai bond cette saison, difficile à percer. L'attaque reste encore un cran en dessous des toutes meilleures équipes.",
    forces: ['Défense'],
    faiblesses: ['Efficacité offensive'],
  },
  SF: {
    texte: "Un effectif taillé pour les longues saisons, avec de la profondeur à tous les postes. L'historique blessures reste le principal point d'interrogation.",
    forces: ['Profondeur d\'effectif'],
    faiblesses: ['Historique blessures'],
  },
  GB: {
    texte: "Une équipe jeune et prometteuse, en progression constante. Manque encore un peu d'expérience dans les moments décisifs de fin de match.",
    forces: ['Progression', 'Jeunesse'],
    faiblesses: ['Fin de match'],
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