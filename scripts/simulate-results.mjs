import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf-8')
function getEnvVar(name) {
  const match = envContent.match(new RegExp(name + '=(.+)'))
  return match[1].trim()
}

const supabase = createClient(
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
)

// ⚙️ À modifier : l'id de la semaine à simuler (visible dans la table "semaines")
const SEMAINE_ID = Number(process.argv[2]) || 1

async function simulateResults() {
  const { data: matchs } = await supabase
    .from('matchs')
    .select('*')
    .eq('semaine_id', SEMAINE_ID)

  if (!matchs || matchs.length === 0) {
    console.log('Aucun match trouvé pour cette semaine.')
    return
  }

  console.log(`Simulation de ${matchs.length} matchs...`)

  for (const match of matchs) {
    const score_a = Math.floor(Math.random() * 21) + 10 // entre 10 et 30
    const score_b = Math.floor(Math.random() * 21) + 10
    const equipe_gagnante = score_a > score_b ? match.equipe_a : match.equipe_b

    await supabase
      .from('matchs')
      .update({
        statut: 'termine',
        score_a,
        score_b,
        equipe_gagnante,
      })
      .eq('id', match.id)

    console.log(`✅ ${match.equipe_a} ${score_a} - ${score_b} ${match.equipe_b} (${equipe_gagnante} gagne)`)
  }

  console.log('\nSimulation terminée !')
}

simulateResults()