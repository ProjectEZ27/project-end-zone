import { BigBallSportsClient } from '@bigballsdata/sdk'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf-8')
function getEnvVar(name) {
  const match = envContent.match(new RegExp(name + '=(.+)'))
  return match[1].trim()
}

const bbsClient = new BigBallSportsClient(getEnvVar('BBS_API_KEY'))
const supabase = createClient(
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
)

// ⚙️ À modifier selon la semaine à mettre à jour
const SAISON_NFL = 2026
const SEMAINE_NFL = Number(process.argv[2]) || 1

async function updateResults() {
  console.log(`Récupération des résultats de la Week ${SEMAINE_NFL} (saison ${SAISON_NFL})...`)

  const result = await bbsClient.get('/v1/nfl/games', {
    season: SAISON_NFL,
    week: SEMAINE_NFL,
  })
  const games = result.data

  let miseAJour = 0
  let toujoursEnAttente = 0

  for (const game of games) {
    // Si le match n'a pas encore de score, on ne fait rien
    if (game.home_score === null || game.away_score === null) {
      toujoursEnAttente++
      continue
    }

    const equipeGagnante = game.home_score > game.away_score
      ? game.home_team
      : game.away_score > game.home_score
        ? game.away_team
        : null // match nul (rare en NFL, mais possible)

    const { error } = await supabase
      .from('matchs')
      .update({
        statut: 'termine',
        score_a: game.away_score,
        score_b: game.home_score,
        equipe_gagnante: equipeGagnante,
      })
      .eq('equipe_a', game.away_team)
      .eq('equipe_b', game.home_team)
      .eq('coup_envoi', game.game_date)

    if (error) {
      console.error(`Erreur mise à jour ${game.game_id} :`, error.message)
    } else {
      console.log(`✅ ${game.away_team} ${game.away_score} - ${game.home_score} ${game.home_team}`)
      miseAJour++
    }
  }

  console.log(`\n${miseAJour} match(s) mis à jour, ${toujoursEnAttente} toujours en attente de résultat.`)
}

updateResults()