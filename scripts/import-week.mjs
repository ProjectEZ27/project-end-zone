import { BigBallSportsClient } from '@bigballsdata/sdk'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { Resend } from 'resend'

// Lecture des clés depuis .env.local
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

// ⚙️ À modifier selon la semaine à importer
const SAISON_NFL = 2026
const SEMAINE_NFL = Number(process.argv[2]) || 1
const SAISON_ID_SUPABASE = 1 // l'id de la ligne dans votre table "saisons"

async function importWeek() {
  console.log(`Récupération de la Week ${SEMAINE_NFL} (saison ${SAISON_NFL})...`)

  const result = await bbsClient.get('/v1/nfl/games', {
    season: SAISON_NFL,
    week: SEMAINE_NFL,
  })
  const games = result.data

  console.log(`${games.length} matchs trouvés.`)

  // Calcul du barème (règle de proportion, cf. 02_REGLES_DU_JEU)
  const nombreMatchs = games.length
  const seuilBonus1 = Math.ceil(nombreMatchs / 2) - 2
  const seuilBonus2 = nombreMatchs - 4
  const bonusPerfect = Math.floor(nombreMatchs / 3)

  // Création de la semaine dans Supabase
  const { data: semaine, error: semaineError } = await supabase
    .from('semaines')
    .insert({
      saison_id: SAISON_ID_SUPABASE,
      nom: `Week ${SEMAINE_NFL}`,
      nombre_matchs: nombreMatchs,
      points_par_pronostic: 1,
      seuil_bonus_1: seuilBonus1,
      bonus_1: 1,
      seuil_bonus_2: seuilBonus2,
      bonus_2: 2,
      bonus_perfect: bonusPerfect,
      statut: 'ouverte',
    })
    .select()
    .single()

  if (semaineError) {
    console.error('Erreur création semaine :', semaineError.message)
    return
  }

  console.log(`Semaine créée (id ${semaine.id}), barème : +1 dès ${seuilBonus1}, +2 dès ${seuilBonus2}, perfect +${bonusPerfect}`)

  // Création des matchs
  for (const game of games) {
    const { error } = await supabase.from('matchs').insert({
      semaine_id: semaine.id,
      equipe_a: game.away_team,
      equipe_b: game.home_team,
      coup_envoi: game.game_date,
      statut: 'a_venir',
    })

    if (error) {
      console.error(`Erreur match ${game.game_id} :`, error.message)
    } else {
      console.log(`✅ ${game.away_team} @ ${game.home_team}`)
    }
  }

  console.log('Import terminé !')

  // Notification d'ouverture de semaine
  const resend = new Resend(getEnvVar('RESEND_API_KEY'))
  await resend.emails.send({
    from: 'Project End Zone <onboarding@resend.dev>',
    to: 'projectendzone27@gmail.com', // adresse de test tant que le domaine n'est pas vérifié
    subject: `${semaine.nom} est ouverte !`,
    html: `<p>La ${semaine.nom} est maintenant ouverte avec ${nombreMatchs} matchs. Va faire tes pronostics 🏈</p>`,
  })
  console.log('E-mail de notification envoyé.')
}

importWeek()