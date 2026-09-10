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
  console.log(`Récupération du calendrier de la Week ${SEMAINE_NFL} (saison ${SAISON_NFL})...`)

  // 1. On récupère le calendrier de la semaine (dates + équipes)
  const schedule = await bbsClient.get('/v1/nfl/games', {
    season: SAISON_NFL,
    week: SEMAINE_NFL,
  })
  const games = schedule.data
  const datesUniques = [...new Set(games.map((g) => g.game_date))]
  console.log(`Dates à vérifier : ${datesUniques.join(', ')}`)

  let miseAJour = 0
  let toujoursEnAttente = 0

  // 2. Pour chaque date, on interroge /v1/matches (scores en direct/finaux)
  for (const date of datesUniques) {
    const liveResult = await bbsClient.matches.list({ sport: 'american_football', league: 'nfl', date })
    const liveMatches = liveResult.data

    for (const match of liveMatches) {
      if (match.status !== 'finished') {
        toujoursEnAttente++
        continue
      }

      const equipeA = match.away.short_name
      const equipeB = match.home.short_name
      const scoreA = match.score.away
      const scoreB = match.score.home
      const equipeGagnante = scoreB > scoreA ? equipeB : scoreA > scoreB ? equipeA : null

      const { error } = await supabase
        .from('matchs')
        .update({
          statut: 'termine',
          score_a: scoreA,
          score_b: scoreB,
          equipe_gagnante: equipeGagnante,
        })
        .eq('equipe_a', equipeA)
        .eq('equipe_b', equipeB)
        .eq('coup_envoi', match.kickoff_utc)

      if (error) {
        console.error(`Erreur mise à jour ${match.id} :`, error.message)
      } else {
        console.log(`✅ ${equipeA} ${scoreA} - ${scoreB} ${equipeB}`)
        miseAJour++
      }
    }
  }

  console.log(`\n${miseAJour} match(s) mis à jour, ${toujoursEnAttente} toujours en attente de résultat.`)
}

updateResults()