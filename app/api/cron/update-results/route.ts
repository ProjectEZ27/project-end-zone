import { BigBallSportsClient } from '@bigballsdata/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Non autorisé', { status: 401 })
  }

  const bbsClient = new BigBallSportsClient(process.env.BBS_API_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const SAISON_NFL = 2026

  // On récupère toutes les semaines pour connaître les dates à vérifier
  const { data: semaines } = await supabase.from('semaines').select('id')
  const resultats: string[] = []
  let miseAJourTotal = 0

  // On limite la recherche aux dates des 3 derniers jours (suffisant pour couvrir un week-end de matchs)
  const dates: string[] = []
  for (let i = 0; i < 3; i++) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }

  for (const date of dates) {
    const liveResult = await bbsClient.matches.list({ sport: 'american_football', league: 'nfl', date })
    const liveMatches = liveResult.data as any[]

    for (const match of liveMatches) {
      const equipeA = match.away.short_name
      const equipeB = match.home.short_name

      if (match.status === 'finished') {
        const scoreA = match.score.away
        const scoreB = match.score.home
        const equipeGagnante = scoreB > scoreA ? equipeB : scoreA > scoreB ? equipeA : null

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
          .eq('coup_envoi', match.kickoff_utc)
          .neq('statut', 'termine')

        if (!error && count && count > 0) {
          resultats.push(`${equipeA} ${scoreA} - ${scoreB} ${equipeB}`)
          miseAJourTotal++
        }
      } else if (match.status === 'in_progress' || match.status === 'live') {
        await supabase
          .from('matchs')
          .update({
            score_a_direct: match.score?.away ?? null,
            score_b_direct: match.score?.home ?? null,
            quart_temps: match.period ?? null,
            temps_restant: match.clock ?? null,
          })
          .eq('equipe_a', equipeA)
          .eq('equipe_b', equipeB)
          .eq('coup_envoi', match.kickoff_utc)
      }
    }
  }

  return NextResponse.json({ miseAJourTotal, resultats })
}