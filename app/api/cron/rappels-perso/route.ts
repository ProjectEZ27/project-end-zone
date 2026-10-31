import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { estSemaineOuverte } from '@/lib/semaineOuverture'

export const dynamic = 'force-dynamic'

const SITE = 'https://projectendzone.fr'

function echapper(texte: string) {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function GET(request: NextRequest) {
  const secret = process.env.RAPPELS_SECRET ?? process.env.CRON_SECRET
  const autorise =
    !!secret &&
    (request.headers.get('authorization') === `Bearer ${secret}` ||
      request.nextUrl.searchParams.get('secret') === secret)
  if (!autorise) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  

  // ?simulation=1 : montre qui recevrait un e-mail, sans rien envoyer
  const simulation = request.nextUrl.searchParams.get('simulation') === '1'

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

  const heuresAvant = (premier - maintenant) / 3600000
  const { data: semaine } = await supabase.from('semaines').select('nom').eq('id', semaineId).maybeSingle()

  // 2. Joueurs qui ont au moins un rappel actif
  const { data: joueurs } = await supabase
    .from('profiles')
    .select('id, pseudo, rappel_1_actif, rappel_1_heures, rappel_2_actif, rappel_2_heures')
    .or('rappel_1_actif.eq.true,rappel_2_actif.eq.true')
    .range(0, 9999)

  const dus: { id: string; pseudo: string; numero: 1 | 2 }[] = []
  for (const j of joueurs ?? []) {
    for (const numero of [1, 2] as const) {
      const actif = numero === 1 ? j.rappel_1_actif : j.rappel_2_actif
      const heures = numero === 1 ? j.rappel_1_heures : j.rappel_2_heures
      if (!actif || !heures) continue
      // fenêtre de 2 h : supporte un passage raté de la tâche planifiée
      if (heuresAvant <= heures && heuresAvant > heures - 2) {
        dus.push({ id: j.id, pseudo: j.pseudo, numero })
      }
    }
  }

  // 3. On enlève ceux qui ont déjà reçu ce rappel
  const { data: deja } = await supabase
    .from('rappels_perso_envoyes')
    .select('utilisateur_id, numero')
    .eq('semaine_id', semaineId)
  const dejaSet = new Set((deja ?? []).map((d) => `${d.utilisateur_id}-${d.numero}`))
  const aTraiter = dus.filter((d) => !dejaSet.has(`${d.id}-${d.numero}`))

  // 4. Nombre de pronostics déjà faits
  const total = liste.length
  const matchIds = liste.map((m) => m.id)
  const ids = [...new Set(aTraiter.map((d) => d.id))]
  const faits = new Map<string, number>()
  if (ids.length > 0) {
    const { data: pronos } = await supabase
      .from('pronostics')
      .select('utilisateur_id, match_id')
      .in('utilisateur_id', ids)
      .in('match_id', matchIds)
      .range(0, 9999)
    for (const p of pronos ?? []) {
      faits.set(p.utilisateur_id, (faits.get(p.utilisateur_id) ?? 0) + 1)
    }
  }

  // 5. Envoi
  const resend = new Resend(process.env.RESEND_API_KEY)
  const expediteur = process.env.RESEND_FROM ?? 'Project End Zone <onboarding@resend.dev>'
  const dateMatch = new Date(premier).toLocaleString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
  })
  const nomSemaine = semaine?.nom ?? 'La semaine'

  const envoyes: string[] = []
  const ignores: string[] = []
  const erreurs: string[] = []

  for (const d of aTraiter) {
    const fait = faits.get(d.id) ?? 0
    if (fait >= total) {
      ignores.push(`${d.pseudo} : déjà tout fait`)
      continue
    }
    if (simulation) {
      envoyes.push(`${d.pseudo} : rappel ${d.numero} (simulation, rien envoyé)`)
      continue
    }

    const { data: utilisateur } = await supabase.auth.admin.getUserById(d.id)
    const email = utilisateur?.user?.email
    if (!email) {
      erreurs.push(`${d.pseudo} : pas d'adresse e-mail`)
      continue
    }

    const reste = total - fait
    const { error } = await resend.emails.send({
      from: expediteur,
      to: email,
      subject: `⏰ ${nomSemaine} : il te reste ${reste} pronostic${reste > 1 ? 's' : ''} à faire`,
      html: `
        <p>Salut ${echapper(d.pseudo)},</p>
        <p>Le premier match de la <strong>${echapper(nomSemaine)}</strong> commence ${dateMatch}.
        Il te reste <strong>${reste} pronostic${reste > 1 ? 's' : ''}</strong> à faire sur ${total}.</p>
        <p><a href="${SITE}/pronostics?semaine=${semaineId}">Faire mes pronostics</a></p>
        <p style="color:#888;font-size:12px">Tu reçois cet e-mail parce que tu as activé un rappel dans ton profil.
        Tu peux le changer à tout moment sur <a href="${SITE}/profile">ton profil</a>.</p>
      `,
    })

    if (error) {
      erreurs.push(`${d.pseudo} : ${error.message}`)
      continue
    }

    const { error: erreurBase } = await supabase
      .from('rappels_perso_envoyes')
      .insert({ utilisateur_id: d.id, semaine_id: semaineId, numero: d.numero })
    if (erreurBase) erreurs.push(`${d.pseudo} : envoyé mais non enregistré (${erreurBase.message})`)

    envoyes.push(`${d.pseudo} : rappel ${d.numero}`)
  }

  return NextResponse.json({
    semaine: nomSemaine,
    heuresAvant: Math.round(heuresAvant * 10) / 10,
    simulation,
    envoyes,
    ignores,
    erreurs,
  })
}