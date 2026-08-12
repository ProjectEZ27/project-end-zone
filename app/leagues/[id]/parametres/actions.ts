'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

export async function modifierLigue(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const ligue_id = formData.get('ligue_id') as string
  const nom = formData.get('nom') as string
  const taille_max = Number(formData.get('taille_max'))
  const delai_1 = Number(formData.get('delai_1'))
  const delai_2 = Number(formData.get('delai_2'))
  const rappel_1_actif = formData.get('rappel_1_actif') === 'on'
  const rappel_2_actif = formData.get('rappel_2_actif') === 'on'

  const { data: league } = await supabase
    .from('ligues')
    .select('commissaire_id')
    .eq('id', ligue_id)
    .single()

  if (!league || league.commissaire_id !== user.id) {
    return
  }

  await supabase
    .from('ligues')
    .update({
      nom,
      taille_max,
      config_rappels: {
        rappel_1_actif,
        rappel_2_actif,
        delais_heures: [delai_1, delai_2],
      },
    })
    .eq('id', ligue_id)

  revalidatePath('/leagues/' + ligue_id)
  revalidatePath('/leagues/' + ligue_id + '/parametres')
}

export async function relancerRetardataires(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const ligue_id = formData.get('ligue_id') as string

  const { data: league } = await supabase
    .from('ligues')
    .select('commissaire_id, nom')
    .eq('id', ligue_id)
    .single()

  if (!league || league.commissaire_id !== user.id) {
    return
  }

  // On recalcule les retardataires côté serveur (on ne fait jamais confiance au navigateur)
  const { data: adhesions } = await supabase
    .from('adhesions')
    .select('utilisateur_id, saison_id')
    .eq('ligue_id', ligue_id)
    .eq('statut', 'actif')

  if (!adhesions || adhesions.length === 0) return

  const saisonId = adhesions[0].saison_id

  const { data: semaineOuverte } = await supabase
    .from('semaines')
    .select('id')
    .eq('saison_id', saisonId)
    .eq('statut', 'ouverte')
    .single()

  if (!semaineOuverte) return

  const { data: matchs } = await supabase
    .from('matchs')
    .select('id')
    .eq('semaine_id', semaineOuverte.id)

  const totalMatchs = matchs?.length ?? 0
  const matchIds = (matchs ?? []).map((m) => m.id)

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

  if (retardataireIds.length === 0) return

  // Client admin (seul autorisé à lire les e-mails des autres utilisateurs)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const resend = new Resend(process.env.RESEND_API_KEY)

  for (const uid of retardataireIds) {
    const { data: userData } = await admin.auth.admin.getUserById(uid)
    const email = userData?.user?.email
    if (email) {
      await resend.emails.send({
        from: 'Project End Zone <onboarding@resend.dev>',
        to: email,
        subject: `⏰ Il te reste des pronostics à faire — ${league.nom}`,
        html: `<p>N'oublie pas de faire tes pronostics de la semaine avant le coup d'envoi !</p>`,
      })
    }
  }

  revalidatePath('/leagues/' + ligue_id + '/parametres')
}