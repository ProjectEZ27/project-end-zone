import { BigBallSportsClient } from '@bigballsdata/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

const CORRESPONDANCE_EQUIPES: Record<string, string> = {
  'Arizona Cardinals': 'ARI', 'Atlanta Falcons': 'ATL', 'Baltimore Ravens': 'BAL', 'Buffalo Bills': 'BUF',
  'Carolina Panthers': 'CAR', 'Chicago Bears': 'CHI', 'Cincinnati Bengals': 'CIN', 'Cleveland Browns': 'CLE',
  'Dallas Cowboys': 'DAL', 'Denver Broncos': 'DEN', 'Detroit Lions': 'DET', 'Green Bay Packers': 'GB',
  'Houston Texans': 'HOU', 'Indianapolis Colts': 'IND', 'Jacksonville Jaguars': 'JAX', 'Kansas City Chiefs': 'KC',
  'Los Angeles Rams': 'LA', 'Los Angeles Chargers': 'LAC', 'Las Vegas Raiders': 'LV', 'Miami Dolphins': 'MIA',
  'Minnesota Vikings': 'MIN', 'New England Patriots': 'NE', 'New Orleans Saints': 'NO', 'New York Giants': 'NYG',
  'New York Jets': 'NYJ', 'Philadelphia Eagles': 'PHI', 'Pittsburgh Steelers': 'PIT', 'Seattle Seahawks': 'SEA',
  'San Francisco 49ers': 'SF', 'Tampa Bay Buccaneers': 'TB', 'Tennessee Titans': 'TEN', 'Washington Commanders': 'WAS',
}

// Mémoire de 60 secondes : plusieurs joueurs en même temps = un seul appel
let memoire: { t: number; corps: any } | null = null

export async function GET() {
  if (memoire && Date.now() - memoire.t < 60000) {
    return NextResponse.json(memoire.corps)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const ilYa = (heures: number) => new Date(Date.now() - heures * 3600 * 1000).toISOString()

  // 1. Y a-t-il des matchs commencés depuis plus de 2h30 et pas encore terminés ?
  const { data: enAttente } = await supabase
    .from('matchs')
    .select('id, equipe_a, equipe_b')
    .neq('statut', 'termine')
    .lte('coup_envoi', ilYa(2.5))
    .gte('coup_envoi', ilYa(48))
    .limit(50)

  if (!enAttente || enAttente.length === 0) {
    const corps = { enAttente: 0, miseAJourTotal: 0, resultats: [] as string[] }
    memoire = { t: Date.now(), corps }
    return NextResponse.json(corps)
  }

  // 2. Oui : on interroge Big Ball Sports (3 derniers jours, comme avant)
  const bbsClient = new BigBallSportsClient(process.env.BBS_API_KEY!)
  const resultats: string[] = []
  const termines = new Set<string>()
  let miseAJourTotal = 0

  const dates: string[] = []
  for (let i = 0; i < 3; i++) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }

  for (const date of dates) {
    let liste: any[] = []
    try {
      const r = await bbsClient.matches.list({ sport: 'american_football', league: 'nfl', date })
      liste = r.data as any[]
    } catch (e: any) {
      resultats.push(`ERREUR Big Ball Sports (${date}) : ${e?.message ?? 'inconnue'}`)
      continue
    }

    for (const match of liste) {
      if (match.status !== 'finished') continue

      const equipeA = CORRESPONDANCE_EQUIPES[match.away.name] ?? match.away.short_name
      const equipeB = CORRESPONDANCE_EQUIPES[match.home.name] ?? match.home.short_name
      const scoreA = match.score?.away
      const scoreB = match.score?.home
      if (scoreA == null || scoreB == null) continue

      const equipeGagnante = scoreB > scoreA ? equipeB : scoreA > scoreB ? equipeA : null
      const coup = new Date(match.kickoff_utc).getTime()

      // Tolérance de 6 h sur l'heure du coup d'envoi (avant : heure exacte obligatoire)
      const { error, count } = await supabase
        .from('matchs')
        .update({
          statut: 'termine',
          score_a: scoreA,
          score_b: scoreB,
          equipe_gagnante: equipeGagnante,
        }, { count: 'exact' })
        .eq('equipe_a', equipeA)
        .eq('equipe_b', equipeB)
        .neq('statut', 'termine')
        .gte('coup_envoi', new Date(coup - 6 * 3600 * 1000).toISOString())
        .lte('coup_envoi', new Date(coup + 6 * 3600 * 1000).toISOString())

      if (error) {
        resultats.push(`ERREUR ${equipeA}-${equipeB} : ${error.message}`)
      } else if (count && count > 0) {
        termines.add(`${equipeA}-${equipeB}`)
        miseAJourTotal++
        resultats.push(`OK ${equipeA} ${scoreA} - ${scoreB} ${equipeB}`)
      }
    }
  }

  // 3. Matchs toujours en attente : utile pour comprendre ceux qui seraient ratés
  for (const m of enAttente) {
    if (!termines.has(`${m.equipe_a}-${m.equipe_b}`)) {
      resultats.push(`EN ATTENTE chez Big Ball Sports : ${m.equipe_a} @ ${m.equipe_b}`)
    }
  }

  if (miseAJourTotal > 0) {
    revalidatePath('/pronostics')
    revalidatePath('/classement')
    revalidatePath('/profile')
    revalidatePath('/')
  }

  const corps = { enAttente: enAttente.length, miseAJourTotal, resultats }
  memoire = { t: Date.now(), corps }
  return NextResponse.json(corps)
}