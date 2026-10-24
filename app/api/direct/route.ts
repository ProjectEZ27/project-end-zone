import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ESPN n'écrit pas toujours les équipes comme toi (WSH au lieu de WAS, LAR au lieu de LA)
const CODES_ESPN: Record<string, string> = { WSH: 'WAS', LAR: 'LA' }
const versTonCode = (abreviation: string) => CODES_ESPN[abreviation] ?? abreviation

// Mémoire de 25 secondes : si plusieurs joueurs demandent en même temps, ESPN n'est interrogé qu'une fois
let memoire: { t: number; corps: any } | null = null

export async function GET() {
  if (memoire && Date.now() - memoire.t < 25000) {
    return NextResponse.json(memoire.corps)
  }

  let donnees: any
  try {
    const reponse = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
      { cache: 'no-store' }
    )
    if (!reponse.ok) throw new Error('ESPN a répondu ' + reponse.status)
    donnees = await reponse.json()
  } catch (e: any) {
    return NextResponse.json({ erreur: e?.message ?? 'ESPN inaccessible' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const debut = new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  const fin = new Date(Date.now() + 36 * 3600 * 1000).toISOString()

  const resultats: string[] = []
  let enCours = 0

  for (const ev of donnees.events ?? []) {
    const comp = ev.competitions?.[0]
    const away = comp?.competitors?.find((c: any) => c.homeAway === 'away')
    const home = comp?.competitors?.find((c: any) => c.homeAway === 'home')
    if (!away || !home) continue

    const etat = ev.status?.type?.state // 'pre' = pas commencé, 'in' = en cours, 'post' = fini
    if (etat === 'pre') continue

    const equipeA = versTonCode(away.team.abbreviation)
    const equipeB = versTonCode(home.team.abbreviation)

    let champs: Record<string, any>
    if (etat === 'in') {
      enCours++
      const miTemps = ev.status?.type?.name === 'STATUS_HALFTIME'
      champs = {
        score_a_direct: Number(away.score),
        score_b_direct: Number(home.score),
        quart_temps: miTemps ? 2 : ev.status?.period ?? null,
        temps_restant: miTemps ? 'Mi-temps' : ev.status?.displayClock ?? null,
      }
    } else {
      // match fini côté ESPN : on efface l'affichage en direct (les points restent gérés par Big Ball Sports)
      champs = { score_a_direct: null, score_b_direct: null, quart_temps: null, temps_restant: null }
    }

    const { error, count } = await supabase
      .from('matchs')
      .update(champs, { count: 'exact' })
      .eq('equipe_a', equipeA)
      .eq('equipe_b', equipeB)
      .neq('statut', 'termine')
      .gte('coup_envoi', debut)
      .lte('coup_envoi', fin)

    if (error) {
      resultats.push(`ERREUR ${equipeA}-${equipeB} : ${error.message}`)
    } else if (etat === 'in' && (!count || count === 0)) {
      resultats.push(`AUCUN MATCH TROUVÉ pour ${equipeA} @ ${equipeB}`)
    } else if (etat === 'in') {
      resultats.push(`OK ${equipeA} ${away.score} - ${home.score} ${equipeB}`)
    }
  }

  const corps = { enCours, resultats }
  memoire = { t: Date.now(), corps }
  return NextResponse.json(corps)
}