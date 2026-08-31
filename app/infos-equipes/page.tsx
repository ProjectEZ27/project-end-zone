import { NOMS_EQUIPES } from '@/lib/teamBadge'
import { getPowerIndexRanking } from '@/lib/powerIndex'
import RulesAccordion from '@/components/RulesAccordion'

// Textes écrits à la main — à compléter/ajuster toi-même au fil de la saison.
// Le classement (le chiffre, l'ordre), lui, reste automatique via l'API.
const RESUMES_EQUIPES: Record<string, string> = {
  // KC: "Le favori habituel. Défense renforcée cette saison, très solides en fin de match.",
  // DET: "Attaque explosive, mais moins solides à l'extérieur.",
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
          classement.map((equipe) => (
            <RulesAccordion
              key={equipe.code}
              title={`${equipe.rang}. ${NOMS_EQUIPES[equipe.code] ?? equipe.code}`}
            >
              <p>{RESUMES_EQUIPES[equipe.code] ?? 'Résumé à venir pour cette équipe.'}</p>
            </RulesAccordion>
          ))
        )}
      </div>
    </div>
  )
}