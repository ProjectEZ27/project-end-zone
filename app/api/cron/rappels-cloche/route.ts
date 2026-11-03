import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { estSemaineOuverte } from '@/lib/semaineOuverture'

export const dynamic = 'force-dynamic'

// Heure (Paris) à partir de laquelle les rappels du jeudi et du dimanche partent
const HEURE_DEBUT = 8

type Creneau = 'jeudi' | 'dimanche'

function momentParis() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const jour = parts.find((p) => p.type === 'weekday')?.value ?? ''
  const heure = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  return { jour, heure }
}

function creneauActuel(): Creneau | null {
  const { jour, heure } = momentParis()
  if (heure < HEURE_DEBUT) return null
  if (jour === 'Thu') return 'jeudi'
  if (jour === 'Sun') return 'dimanche'
  return null
}

/**
 * Rappels dans la cloche : le jeudi matin et le dimanche matin, une notification pour chaque
 * joueur qui n'a pas encore pronostiqué tous les matchs restants de la semaine.
 * Un joueur ne reçoit chaque rappel qu'une seule fois par semaine (clé de la notification).
 *
 * Paramètres utiles pour tester :
 *   ?simulation=1        montre qui serait prévenu, sans rien créer
 *   ?creneau=jeudi       force le créneau (jeudi ou dimanche), quel que soit le jour
 */
export async function GET(request: NextRequest) {
  const secret = process.env.RAPPELS_SECRET ?? process.env.CRON_SECRET
  const autorise =
    !!secret &&
    (request.headers.get('authorization') === `Bearer ${secret}` ||
      request.nextUrl.searchParams.get('secret') === secret)
  if (!autorise) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const simulation = request.nextUrl.searchParams.get('simulation') === '1'
  const force = request.nextUrl.searchParams.get('creneau')
  const creneau: Creneau | null =
    force === 'jeudi' || force === 'dimanche' ? force : creneauActuel()

  if (!creneau) {
    return NextResponse.json({ message: "Pas de rappel à cette heure (c'est le jeudi et le dimanche matin)." })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const maintenant = new Date().toISOString()

  // 1. Semaine du prochain match à venir
  const { data: prochain } = await supabase
    .from('matchs')
    .select('semaine_id')
    .eq('statut', 'a_venir')
    .gt('coup_envoi', maintenant)
    .order('coup_envoi', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!prochain) return NextResponse.json({ message: 'Aucun match à venir.' })

  const semaineId = prochain.semaine_id
  const { data: matchs } = await supabase
    .from('matchs')
    .select('id, coup_envoi, statut')
    .eq('semaine_id', semaineId)
  const liste = matchs ?? []
  if (liste.length === 0) return NextResponse.json({ message: 'Aucun match dans la semaine.' })

  // 2. La semaine doit être ouverte (règle du mardi), calculée sur son tout premier match
  const premier = [...liste].sort((a, b) => new Date(a.coup_envoi).getTime() - new Date(b.coup_envoi).getTime())[0]
  if (!estSemaineOuverte(premier.coup_envoi)) {
    return NextResponse.json({ message: 'Les pronostics de la semaine ne sont pas encore ouverts.' })
  }

  // 3. Matchs encore pronostiquables (pas encore commencés)
  const restants = liste.filter((m) => m.statut === 'a_venir' && m.coup_envoi > maintenant)
  if (restants.length === 0) return NextResponse.json({ message: 'Plus aucun match à pronostiquer.' })
  const idsRestants = restants.map((m) => m.id)

  const { data: semaine } = await supabase.from('semaines').select('nom').eq('id', semaineId).maybeSingle()
  const nomSemaine = semaine?.nom ?? 'La semaine'
  const cle = `rappel-${creneau}:${semaineId}`

  // 4. Joueurs, pronostics déjà faits, rappels déjà envoyés
  const { data: joueurs } = await supabase.from('profiles').select('id, pseudo').range(0, 9999)
  const { data: pronos } = await supabase
    .from('pronostics')
    .select('utilisateur_id, match_id')
    .in('match_id', idsRestants)
    .range(0, 9999)
  const { data: deja } = await supabase.from('notifications').select('user_id').eq('cle', cle).range(0, 9999)

  const dejaSet = new Set((deja ?? []).map((d) => String(d.user_id)))
  const faits = new Map<string, number>()
  for (const p of pronos ?? []) {
    const id = String(p.utilisateur_id)
    faits.set(id, (faits.get(id) ?? 0) + 1)
  }

  // 5. Qui prévenir
  const aCreer: {
    user_id: string
    type: string
    titre: string
    message: string
    lien: string
    cle: string
  }[] = []
  const prevenus: string[] = []
  const ignores: string[] = []

  for (const j of joueurs ?? []) {
    const id = String(j.id)
    if (dejaSet.has(id)) {
      ignores.push(`${j.pseudo} : déjà prévenu`)
      continue
    }
    const reste = restants.length - (faits.get(id) ?? 0)
    if (reste <= 0) {
      ignores.push(`${j.pseudo} : a déjà tout pronostiqué`)
      continue
    }
    const s = reste > 1 ? 's' : ''
    aCreer.push({
      user_id: id,
      type: 'rappel',
      titre: creneau === 'jeudi' ? 'Pronostics à faire' : 'Dernier rappel',
      message:
        creneau === 'jeudi'
          ? `${nomSemaine} : il te reste ${reste} match${s} à pronostiquer.`
          : `${nomSemaine} : plus que ${reste} match${s} à pronostiquer avant le coup d'envoi.`,
      lien: `/pronostics?semaine=${semaineId}`,
      cle,
    })
    prevenus.push(`${j.pseudo} : ${reste} match${s}`)
  }

  let erreur: string | null = null
  if (!simulation && aCreer.length > 0) {
    const { error } = await supabase.from('notifications').insert(aCreer)
    if (error) {
      erreur = error.message
      console.error('[rappels-cloche] création échouée :', error.message)
    }
  }

  return NextResponse.json({
    semaine: nomSemaine,
    creneau,
    simulation,
    prevenus,
    ignores,
    erreur,
  })
}