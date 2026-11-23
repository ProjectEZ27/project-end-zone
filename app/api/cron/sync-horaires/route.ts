import { BigBallSportsClient } from '@bigballsdata/sdk'
import { createClient } from '@supabase/supabase-js'
import { createClient as clientConnecte } from '@/lib/supabase/server'
import { ADMIN_ID } from '@/lib/admin'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/*
 * Vérification des horaires de coup d'envoi.
 *
 * La NFL décale parfois des matchs (« flex ») : cette tâche compare l'heure de chaque match dans la base
 * avec l'heure officielle donnée par Big Ball Sports, corrige la base si elle est fausse, puis envoie
 * un e-mail pour dire ce qui a été changé.
 *
 * Accès : CRON_SECRET ou RAPPELS_SECRET (tâche planifiée, en-tête Authorization) ou le compte admin connecté (test dans le navigateur).
 *
 * Paramètres utiles :
 *   ?simulation=1   montre ce qui serait changé, sans rien modifier ni envoyer
 *   ?jours=14       nombre de jours à regarder en avance (14 par défaut, 21 maximum ; ?jours=2 pour un contrôle léger)
 *   ?forcer=1       autorise plus de 8 corrections d'un coup (par défaut : rien n'est modifié, une alerte est envoyée)
 */

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

const UNE_MINUTE = 60 * 1000
const UNE_HEURE = 60 * UNE_MINUTE
const UN_JOUR = 24 * UNE_HEURE

// En dessous de 2 minutes d'écart, on considère que l'horaire est bon
const TOLERANCE_MS = 2 * UNE_MINUTE
// Jusqu'à 36 h d'écart : on corrige tout seul (un décalage de la NFL reste dans la même journée ou la suivante)
const CORRECTION_MAX_MS = 36 * UNE_HEURE
// Entre 36 h et 4 jours d'écart : on prévient seulement (c'est inhabituel)
const ALERTE_MAX_MS = 4 * UN_JOUR
// Plus de 8 corrections d'un coup : on ne touche à rien et on prévient (sauf ?forcer=1)
const CORRECTIONS_MAX = 8
// Si la source indique qu'un match est reporté ou annulé, on ne corrige pas : on prévient seulement
const STATUTS_A_SIGNALER = ['postponed', 'cancelled', 'canceled', 'suspended']

type MatchApi = { a: string; b: string; kickoff: number; statut: string }
type LigneMatch = { id: number | string; equipe_a: string; equipe_b: string; coup_envoi: string; statut: string }
type Changement = {
  id: number | string
  match: string
  ancien: number
  nouveau: number
  applique: boolean
  erreur?: string
}

function echapper(texte: string) {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** « dimanche 22 novembre à 22h25 » (heure de Paris) */
function quand(instant: number) {
  const d = new Date(instant)
  const jour = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  }).format(d)
  const parties = new Intl.DateTimeFormat('fr-FR', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).formatToParts(d)
  const hh = parties.find((p) => p.type === 'hour')?.value ?? ''
  const mm = parties.find((p) => p.type === 'minute')?.value ?? '00'
  return `${jour} à ${hh}h${mm === '00' ? '' : mm}`
}

/** Phrase sur l'effet de la correction (verrouillé / rouvert), selon l'heure qu'il est maintenant */
function effet(ancien: number, nouveau: number, maintenant: number) {
  if (ancien > maintenant && nouveau <= maintenant) {
    return ' ⚠️ Ce match a déjà commencé : les pronostics sont maintenant bloqués.'
  }
  if (ancien <= maintenant && nouveau > maintenant) {
    return ' Ce match n’a pas encore commencé : les pronostics sont de nouveau ouverts.'
  }
  return ''
}

async function envoyerAlerte(sujet: string, html: string): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) return false
    const resend = new Resend(process.env.RESEND_API_KEY)
    const expediteur = process.env.RESEND_FROM ?? 'Project End Zone <onboarding@resend.dev>'
    const destinataire = process.env.ALERTE_EMAIL ?? 'projectendzone27@gmail.com'
    const { error } = await resend.emails.send({ from: expediteur, to: destinataire, subject: sujet, html })
    if (error) {
      console.error('[sync-horaires] e-mail non envoyé :', error.message)
      return false
    }
    return true
  } catch (e) {
    console.error('[sync-horaires] e-mail non envoyé :', e)
    return false
  }
}

export async function GET(request: Request) {
  // Deux secrets acceptés : celui de Vercel (CRON_SECRET) et celui de cron-job.org (RAPPELS_SECRET)
  const secrets = [process.env.CRON_SECRET, process.env.RAPPELS_SECRET].filter((s): s is string => !!s)
  const recu = request.headers.get('authorization')
  let autorise = secrets.some((s) => recu === `Bearer ${s}`)
  if (!autorise) {
    const sb = await clientConnecte()
    const {
      data: { user },
    } = await sb.auth.getUser()
    autorise = user?.id === ADMIN_ID
  }
  if (!autorise) return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 })

  const url = new URL(request.url)
  const simulation = url.searchParams.get('simulation') === '1'
  const forcer = url.searchParams.get('forcer') === '1'
  const joursDemandes = Number(url.searchParams.get('jours') ?? 14)
  const jours = Number.isFinite(joursDemandes) ? Math.min(Math.max(Math.round(joursDemandes), 1), 21) : 14
  const maintenant = Date.now()

  // 1. Horaires officiels : un appel à Big Ball Sports par date, d'hier à dans « jours » jours
  const dates: string[] = []
  for (let i = -1; i <= jours; i++) {
    const d = new Date(maintenant)
    d.setUTCDate(d.getUTCDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }

  const bbs = new BigBallSportsClient(process.env.BBS_API_KEY!)
  const apiMatchs: MatchApi[] = []
  const vus = new Set<string>()
  const erreurs: string[] = []
  let appelsReussis = 0

  for (const date of dates) {
    try {
      const reponse = await bbs.matches.list({ sport: 'american_football', league: 'nfl', date })
      appelsReussis++
      for (const m of reponse.data as any[]) {
        const a = CORRESPONDANCE_EQUIPES[m.away?.name] ?? m.away?.short_name
        const b = CORRESPONDANCE_EQUIPES[m.home?.name] ?? m.home?.short_name
        const kickoff = new Date(m.kickoff_utc).getTime()
        if (!a || !b || !Number.isFinite(kickoff)) continue
        const cle = `${a}-${b}-${kickoff}`
        if (vus.has(cle)) continue
        vus.add(cle)
        apiMatchs.push({ a, b, kickoff, statut: String(m.status ?? '') })
      }
    } catch (e: any) {
      erreurs.push(`${date} : ${e?.message ?? 'erreur inconnue'}`)
    }
  }

  // Si la source ne répond pas du tout, on le dit (sinon la vérification échouerait en silence)
  if (appelsReussis === 0) {
    let emailEnvoye = false
    if (!simulation) {
      emailEnvoye = await envoyerAlerte(
        'PEZ : vérification des horaires impossible',
        `<p>La vérification automatique des horaires n’a pas pu interroger Big Ball Sports.</p><p>${echapper(erreurs.slice(0, 3).join(' | '))}</p><p>Les horaires de la base n’ont pas été touchés.</p>`
      )
    }
    return NextResponse.json({ erreur: 'Source indisponible', erreurs, emailEnvoye }, { status: 502 })
  }

  // 2. Horaires de la base (matchs pas encore terminés, autour de la période regardée)
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: lignes, error: erreurLecture } = await supabase
    .from('matchs')
    .select('id, equipe_a, equipe_b, coup_envoi, statut')
    .neq('statut', 'termine')
    .gte('coup_envoi', new Date(maintenant - 3 * UN_JOUR).toISOString())
    .lte('coup_envoi', new Date(maintenant + (jours + 4) * UN_JOUR).toISOString())
    .limit(500)
  if (erreurLecture) {
    return NextResponse.json({ erreur: `Lecture de la base impossible : ${erreurLecture.message}` }, { status: 500 })
  }
  const base = (lignes ?? []) as LigneMatch[]

  // 3. Comparaison match par match (on prend la ligne de la base la plus proche de l'horaire officiel,
  //    car deux équipes peuvent se rencontrer deux fois dans la saison)
  const aCorriger: Changement[] = []
  const aSignaler: string[] = []
  const sansLigne: string[] = []
  const dejaPris = new Set<string>()

  for (const m of apiMatchs) {
    const candidats = base
      .filter((l) => l.equipe_a === m.a && l.equipe_b === m.b && !dejaPris.has(String(l.id)))
      .map((l) => ({ ligne: l, ancien: new Date(l.coup_envoi).getTime() }))
      .map((c) => ({ ...c, ecart: Math.abs(c.ancien - m.kickoff) }))
      .sort((x, y) => x.ecart - y.ecart)

    const meilleur = candidats[0]
    if (!meilleur || meilleur.ecart > ALERTE_MAX_MS) {
      // Un match à venir que la base ne connaît pas : à vérifier
      if (m.kickoff > maintenant) sansLigne.push(`${m.a} @ ${m.b} (${quand(m.kickoff)})`)
      continue
    }
    dejaPris.add(String(meilleur.ligne.id))
    if (meilleur.ecart <= TOLERANCE_MS) continue

    const nom = `${m.a}-${m.b}`
    const statutSource = m.statut.toLowerCase()
    if (STATUTS_A_SIGNALER.includes(statutSource) || meilleur.ecart > CORRECTION_MAX_MS) {
      aSignaler.push(
        `${nom} : la base dit ${quand(meilleur.ancien)}, la source dit ${quand(m.kickoff)} (statut « ${statutSource || 'inconnu'} ») — pas corrigé automatiquement`
      )
      continue
    }
    aCorriger.push({
      id: meilleur.ligne.id,
      match: nom,
      ancien: meilleur.ancien,
      nouveau: m.kickoff,
      applique: false,
    })
  }

  // 4. Corrections (sauf simulation, ou trop de changements d'un coup)
  const tropDeChangements = aCorriger.length > CORRECTIONS_MAX && !forcer
  if (!simulation && !tropDeChangements) {
    for (const c of aCorriger) {
      const { error } = await supabase
        .from('matchs')
        .update({ coup_envoi: new Date(c.nouveau).toISOString() })
        .eq('id', c.id)
      if (error) c.erreur = error.message
      else c.applique = true
    }
    if (aCorriger.some((c) => c.applique)) {
      revalidatePath('/pronostics')
      revalidatePath('/')
    }
  }

  // 5. E-mail (seulement s'il y a quelque chose à dire)
  const corriges = aCorriger.filter((c) => c.applique)
  const echoues = aCorriger.filter((c) => c.erreur)
  let emailEnvoye = false
  const quelqueChose = corriges.length > 0 || echoues.length > 0 || aSignaler.length > 0 || sansLigne.length > 0 || tropDeChangements
  if (!simulation && quelqueChose) {
    const blocs: string[] = []
    if (corriges.length > 0) {
      blocs.push(
        `<h3>Horaires corrigés</h3><ul>${corriges
          .map(
            (c) =>
              `<li><b>${echapper(c.match)}</b> : ${quand(c.ancien)} → <b>${quand(c.nouveau)}</b>${effet(c.ancien, c.nouveau, maintenant)}</li>`
          )
          .join('')}</ul>`
      )
    }
    if (tropDeChangements) {
      blocs.push(
        `<h3>Rien n’a été modifié</h3><p>${aCorriger.length} horaires devraient changer d’un coup, c’est inhabituel. Vérifie avant d’appliquer :</p><ul>${aCorriger
          .map((c) => `<li><b>${echapper(c.match)}</b> : ${quand(c.ancien)} → ${quand(c.nouveau)}</li>`)
          .join('')}</ul>`
      )
    }
    if (echoues.length > 0) {
      blocs.push(
        `<h3>Corrections qui ont échoué</h3><ul>${echoues
          .map((c) => `<li><b>${echapper(c.match)}</b> : ${echapper(c.erreur ?? '')}</li>`)
          .join('')}</ul>`
      )
    }
    if (aSignaler.length > 0) {
      blocs.push(`<h3>À vérifier à la main</h3><ul>${aSignaler.map((t) => `<li>${echapper(t)}</li>`).join('')}</ul>`)
    }
    if (sansLigne.length > 0) {
      blocs.push(
        `<h3>Matchs absents de la base</h3><ul>${sansLigne.map((t) => `<li>${echapper(t)}</li>`).join('')}</ul>`
      )
    }
    const sujet =
      corriges.length > 0
        ? `PEZ : ${corriges.length} horaire${corriges.length > 1 ? 's' : ''} de match corrigé${corriges.length > 1 ? 's' : ''}`
        : 'PEZ : horaires de match à vérifier'
    emailEnvoye = await envoyerAlerte(sujet, blocs.join(''))
  }

  return NextResponse.json({
    simulation,
    joursRegardes: jours,
    matchsSource: apiMatchs.length,
    appelsReussis,
    corrections: aCorriger.map((c) => ({
      match: c.match,
      avant: quand(c.ancien),
      apres: quand(c.nouveau),
      applique: c.applique,
      erreur: c.erreur ?? null,
    })),
    tropDeChangements,
    aVerifier: aSignaler,
    absentsDeLaBase: sansLigne,
    erreursSource: erreurs,
    emailEnvoye,
  })
}