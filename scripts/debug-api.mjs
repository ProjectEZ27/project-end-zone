import { BigBallSportsClient } from '@bigballsdata/sdk'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf-8')
function getEnvVar(name) {
  const match = envContent.match(new RegExp(name + '=(.+)'))
  return match[1].trim()
}

const bbsClient = new BigBallSportsClient(getEnvVar('BBS_API_KEY'))

const SEMAINE_NFL = Number(process.argv[2]) || 5

async function debug() {
  const result = await bbsClient.get('/v1/nfl/games', {
    season: 2026,
    week: SEMAINE_NFL,
  })
  console.log(JSON.stringify(result.data[0], null, 2))
}

debug()