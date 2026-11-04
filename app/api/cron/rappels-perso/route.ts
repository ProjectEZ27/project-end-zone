import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { estSemaineOuverte } from '@/lib/semaineOuverture'

export const dynamic = 'force-dynamic'

const SITE = 'https://projectendzone.fr'

// Heure (Paris) à partir de laquelle part le rappel, le jour du premier match
const HEURE_RAPPEL = 10
// Un match qui commence avant cette heure (la nuit) compte comme un match de la veille
const HEURE_MATCH_DE_NUIT = 6

function echapper(texte: string) {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Date (AAAA-MM-JJ) et heure à Paris pour un instant donné */
function parisDateHeure(instant: number) {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(instant))
  const heure = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: 'numeric', hourCycle: 'h23' }).format(
      new Date(instant)
    )
  )
  return { date, heure }
}

function veille(date: string) {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Rappel du matin : le jour du premier match de la semaine, à partir de 10 h (Paris),
 * chaque joueur dont les pronostics ne sont pas terminés reçoit, selon ses préférences,
 * une notification et/ou un e-mail. Un seul rappel par joueur et par semaine.
 * Cette URL est appelée toutes les heures par cron-job.org.
 *
 * Paramètres utiles pour tester :
 *   ?simulation=1   montre qui serait prévenu, sans rien envoyer
 *   ?forcer=1       ignore l'heure du rappel (le premier match ne doit pas avoir commencé)
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
  const forcer = request.nextUrl.searchParams.get('forcer') === '1'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const maintenant = Date.now()

  // 1. Semaine du prochain match à venir
  const { data: prochain } = await supabase
    .from('matchs')
    .select('semaine_id')
    .eq('statut', 'a_venir')
    .gt('coup_envoi', new Date().toISOString())
    .order('coup_envoi', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!prochain) return NextResponse.json({ message: 'Aucun match à venir.' })

  const semaineId = prochain.semaine_id
  const { data: matchs } = await supabase
    .from('matchs')
    .select('id, coup_envoi')
    .eq('semaine_id', semaineId)

  const liste = matchs ?? []
  if (liste.length === 0) return NextResponse.json({ message: 'Aucun match dans la semaine.' })

  const tries = [...liste].sort((a, b) => new Date(a.coup_envoi).getTime() - new Date(b.coup_envoi).getTime())
  const premierStr = tries[0].coup_envoi
  const premier = new Date(premierStr).getTime()

  if (premier <= maintenant) {
    return NextResponse.json({ message: 'La semaine a déjà commencé : pas de rappel.' })
  }
  if (!estSemaineOuverte(premierStr)) {
    return NextResponse.json({ message: 'Les pronostics de la semaine ne sont pas encore ouverts.' })
  }

  // 2. Est-ce le moment ? Jour du premier match (la veille s'il a lieu la nuit), à partir de 10 h
  const kickoff = parisDateHeure(premier)
  const jourRappel = kickoff.heure < HEURE_MATCH_DE_NUIT ? veille(kickoff.date) : kickoff.date
  const actuel = parisDateHeure(maintenant)
  const momentAtteint =
    actuel.date > jourRappel || (actuel.date === jourRappel && actuel.heure >= HEURE_RAPPEL)
  if (!momentAtteint && !forcer) {
    return NextResponse.json({
      message: `Pas encore l'heure : le rappel part le ${jourRappel} à partir de ${HEURE_RAPPEL} h (Paris).`,
    })
  }

  const { data: semaine } = await supabase.from('semaines').select('nom').eq('id', semaineId).maybeSingle()
  const nomSemaine = semaine?.nom ?? 'La semaine'

  // 3. Joueurs, préférences, pronostics déjà faits, rappels déjà envoyés
  const { data: joueurs } = await supabase
    .from('profiles')
    .select('id, pseudo, notif_rappel_actif, email_rappel_actif')
    .range(0, 9999)

  const total = liste.length
  const matchIds = liste.map((m) => m.id)
  const { data: pronos } = await supabase
    .from('pronostics')
    .select('utilisateur_id, match_id')
    .in('match_id', matchIds)
    .range(0, 9999)
  const faits = new Map<string, number>()
  for (const p of pronos ?? []) {
    const id = String(p.utilisateur_id)
    faits.set(id, (faits.get(id) ?? 0) + 1)
  }

  const cleNotif = `rappel-matin:${semaineId}`
  const { data: dejaNotif } = await supabase.from('notifications').select('user_id').eq('cle', cleNotif).range(0, 9999)
  const notifSet = new Set((dejaNotif ?? []).map((d) => String(d.user_id)))

  const { data: dejaEmail } = await supabase
    .from('rappels_perso_envoyes')
    .select('utilisateur_id')
    .eq('semaine_id', semaineId)
    .eq('numero', 1)
  const emailSet = new Set((dejaEmail ?? []).map((d) => String(d.utilisateur_id)))

  // 4. Notifications
  const notifications: {
    user_id: string
    type: string
    titre: string
    message: string
    lien: string
    cle: string
  }[] = []
  const notifies: string[] = []
  const ignores: string[] = []
  const erreurs: string[] = []

  for (const j of joueurs ?? []) {
    const id = String(j.id)
    const reste = total - (faits.get(id) ?? 0)
    if (reste <= 0) {
      ignores.push(`${j.pseudo} : a déjà tout pronostiqué`)
      continue
    }
    const veutNotif = j.notif_rappel_actif ?? true
    if (veutNotif && !notifSet.has(id)) {
      const s = reste > 1 ? 's' : ''
      notifications.push({
        user_id: id,
        type: 'rappel',
        titre: 'Pronostics à faire',
        message: `${nomSemaine} : il te reste ${reste} match${s} à pronostiquer.`,
        lien: `/pronostics?semaine=${semaineId}`,
        cle: cleNotif,
      })
      notifies.push(`${j.pseudo} : ${reste} match${s}`)
    }
  }

  if (!simulation && notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications)
    if (error) {
      erreurs.push(`notifications : ${error.message}`)
      console.error('[rappels] création des notifications échouée :', error.message)
    }
  }

  // 5. E-mails
  const resend = new Resend(process.env.RESEND_API_KEY)
  const expediteur = process.env.RESEND_FROM ?? 'Project End Zone <onboarding@resend.dev>'
  const dateMatch = new Date(premier).toLocaleString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
  })

  const envoyes: string[] = []

  for (const j of joueurs ?? []) {
    const id = String(j.id)
    if (!(j.email_rappel_actif ?? false) || emailSet.has(id)) continue
    const fait = faits.get(id) ?? 0
    if (fait >= total) continue

    if (simulation) {
      envoyes.push(`${j.pseudo} : e-mail (simulation, rien envoyé)`)
      continue
    }

    const { data: utilisateur } = await supabase.auth.admin.getUserById(id)
    const email = utilisateur?.user?.email
    if (!email) {
      erreurs.push(`${j.pseudo} : pas d'adresse e-mail`)
      continue
    }

    const reste = total - fait
    const { error } = await resend.emails.send({
      from: expediteur,
      to: email,
      subject: `⏰ ${nomSemaine} : il te reste ${reste} pronostic${reste > 1 ? 's' : ''} à faire`,
      html: `
        <p>Salut ${echapper(j.pseudo ?? '')},</p>
        <p>Le premier match de la <strong>${echapper(nomSemaine)}</strong> commence ${dateMatch}.
        Il te reste <strong>${reste} pronostic${reste > 1 ? 's' : ''}</strong> à faire sur ${total}.</p>
        <p><a href="${SITE}/pronostics?semaine=${semaineId}">Faire mes pronostics</a></p>
        <p style="color:#888;font-size:12px">Tu reçois cet e-mail parce que le rappel par e-mail est activé dans tes préférences.
        Tu peux le désactiver à tout moment avec la roue dentée en haut de n'importe quelle page du site.</p>
      `,
    })

    if (error) {
      erreurs.push(`${j.pseudo} : ${error.message}`)
      continue
    }

    const { error: erreurBase } = await supabase
      .from('rappels_perso_envoyes')
      .insert({ utilisateur_id: id, semaine_id: semaineId, numero: 1 })
    if (erreurBase) erreurs.push(`${j.pseudo} : envoyé mais non enregistré (${erreurBase.message})`)

    envoyes.push(`${j.pseudo} : e-mail`)
  }

  return NextResponse.json({
    semaine: nomSemaine,
    jourRappel,
    simulation,
    notifies,
    envoyes,
    ignores,
    erreurs,
  })
}