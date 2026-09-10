import { BigBallSportsClient } from '@bigballsdata/sdk'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf-8')
function getEnvVar(name) {
  const match = envContent.match(new RegExp(name + '=(.+)'))
  return match[1].trim()
}

const bbsClient = new BigBallSportsClient(getEnvVar('BBS_API_KEY'))

async function testLive() {
  const today = new Date().toISOString().split('T')[0]
  console.log(`Recherche des matchs NFL du ${today}...`)

  const result = await bbsClient.matches.list({ sport: 'american_football', league: 'nfl', date: today })
  console.log('Nombre de matchs trouvés :', result.data.length)
  console.log(JSON.stringify(result.data, null, 2))
}

testLive().catch((err) => {
  console.error('Erreur :', err.message)
  console.error('Cause :', err.cause)
  console.error('Stack complète :', err.stack)
})