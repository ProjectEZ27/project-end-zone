import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function GET(request: NextRequest) {
  // Sécurité : seul Vercel (avec le bon secret) peut déclencher cette route
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY)

  const maintenant = new Date()
  let rappelsEnvoyes = 0

  // 1. Toutes les ligues actives avec leur config de rappels
  const { data: ligues } = await supabase
    .from('ligues')
    .select('id, nom, config_rappels')

  if (!ligues) {
    return NextResponse.json({ message: 'Aucune ligue trouvée' })
  }

  for (const ligue of ligues) {
    const config = ligue.config_rappels
    if (!config) continue

    // 2. Membres actifs de cette ligue + leur saison
    const { data: adhesions } = await supabase
      .from('adhesions')
      .select('utilisateur_id, saison_id')
      .eq('ligue_id', ligue.id)
      .eq('statut', 'actif')

    if (!adhesions || adhesions.length === 0) continue

    const saisonId = adhesions[0].saison_id

    // 3. Semaine ouverte de cette saison
    const { data: semaines } = await supabase
      .from('semaines')
      .select('id, nom')
      .eq('saison_id', saisonId)
      .eq('statut', 'ouverte')
      .order('id', { ascending: false })
      .limit(1)

    const semaine = semaines?.[0]
    if (!semaine) continue

    // 4. Premier coup d'envoi de la semaine (le plus tôt de tous les matchs)
    const { data: matchs } = await supabase
      .from('matchs')
      .select('coup_envoi')
      .eq('semaine_id', semaine.id)
      .order('coup_envoi', { ascending: true })
      .limit(1)

    const premierCoupEnvoi = matchs?.[0]?.coup_envoi
    if (!premierCoupEnvoi) continue

    const heuresAvant = (new Date(premierCoupEnvoi).getTime() - maintenant.getTime()) / (1000 * 60 * 60)

    // 5. Vérifier chaque rappel configuré (délais_heures est un tableau, ex. [24, 3])
    const delais: number[] = config.delais_heures ?? []
    const actifs: boolean[] = [config.rappel_1_actif, config.rappel_2_actif]

    for (let i = 0; i < delais.length; i++) {
      if (!actifs[i]) continue
      const delai = delais[i]

      // On envoie si on est DANS la fenêtre (entre le délai et le délai - 1h, vu qu'on tourne chaque heure)
      if (heuresAvant > delai || heuresAvant <= delai - 1) continue

      const typeRappel = `rappel_${i + 1}`

      // Vérifier si déjà envoyé
      const { data: dejaEnvoye } = await supabase
        .from('rappels_envoyes')
        .select('id')
        .eq('ligue_id', ligue.id)
        .eq('semaine_id', semaine.id)
        .eq('type_rappel', typeRappel)
        .maybeSingle()

      if (dejaEnvoye) continue

      // 6. Trouver qui n'a pas encore pronostiqué
      const { data: tousLesMatchs } = await supabase
        .from('matchs')
        .select('id')
        .eq('semaine_id', semaine.id)

      const totalMatchs = tousLesMatchs?.length ?? 0
      const matchIds = (tousLesMatchs ?? []).map((m) => m.id)
      const userIds = adhesions.map((a) => a.utilisateur_id)

      const { data: pronostics } = await supabase
        .from('pronostics')
        .select('utilisateur_id, match_id')
        .in('utilisateur_id', userIds)
        .in('match_id', matchIds.length > 0 ? matchIds : [-1])

      const retardataireIds = userIds.filter((uid) => {
        const fait = (pronostics ?? []).filter((p) => p.utilisateur_id === uid).length
        return fait < totalMatchs
      })

      if (retardataireIds.length === 0) {
        // Personne à relancer, mais on marque quand même comme "traité" pour ne pas re-tester en boucle
        await supabase.from('rappels_envoyes').insert({
          ligue_id: ligue.id,
          semaine_id: semaine.id,
          type_rappel: typeRappel,
        })
        continue
      }

      // 7. Envoyer un e-mail à chaque retardataire
      const admin = supabase
      for (const uid of retardataireIds) {
        const { data: userData } = await admin.auth.admin.getUserById(uid)
        const email = userData?.user?.email
        if (email) {
          await resend.emails.send({
            from: 'Project End Zone <onboarding@resend.dev>',
            to: email,
            subject: `⏰ Rappel — ${semaine.nom} commence bientôt !`,
            html: `<p>N'oublie pas de faire tes pronostics de la ${semaine.nom} pour la ligue "${ligue.nom}" avant le coup d'envoi !</p>`,
          })
          rappelsEnvoyes++
        }
      }

      // 8. Marquer comme envoyé
      await supabase.from('rappels_envoyes').insert({
        ligue_id: ligue.id,
        semaine_id: semaine.id,
        type_rappel: typeRappel,
      })
    }
  }

  return NextResponse.json({ message: `Terminé. ${rappelsEnvoyes} rappel(s) envoyé(s).` })
}