'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

export async function relancerRetardataires(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const ligue_id = formData.get('ligue_id') as string
  const semaine_id = formData.get('semaine_id') as string

  // Vérifier que l'utilisateur est bien le commissaire
  const { data: league } = await supabase
    .from('ligues')
    .select('commissaire_id, nom')
    .eq('id', ligue_id)
    .single()

  if (!league || league.commissaire_id !== user.id) return

  // Membres actifs
  const { data: adhesions } = await supabase
    .from('adhesions')
    .select('utilisateur_id')
    .eq('ligue_id', ligue_id)
    .eq('statut', 'actif')

  const membresIds = (adhesions ?? []).map((a) => a.utilisateur_id)

  // Matchs de la semaine
  const { data: matchs } = await supabase
    .from('matchs')
    .select('id')
    .eq('semaine_id', semaine_id)

  const nombreMatchs = matchs?.length ?? 0
  const matchIds = (matchs ?? []).map((m) => m.id)

  // Pronostics déjà faits
  const { data: pronostics } = await supabase
    .from('pronostics')
    .select('utilisateur_id')
    .in('match_id', matchIds)
    .in('utilisateur_id', membresIds)

  const nombreParJoueur = new Map<string, number>()
  for (const p of pronostics ?? []) {
    nombreParJoueur.set(p.utilisateur_id, (nombreParJoueur.get(p.utilisateur_id) ?? 0) + 1)
  }

  const retardatairesIds = membresIds.filter((id) => (nombreParJoueur.get(id) ?? 0) < nombreMatchs)

  // Récupérer leurs emails via auth.users (besoin de la clé service_role pour ça)
  // Pour l'instant, en V1 simplifiée : on récupère juste les pseudos, et on envoie un mail groupé au commissaire lui-même en résumé
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, pseudo')
    .in('id', retardatairesIds)

  const noms = (profiles ?? []).map((p) => p.pseudo).join(', ')

  if (retardatairesIds.length > 0) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Project End Zone <onboarding@resend.dev>',
      to: 'projectendzone27@gmail.com', // adresse de test tant que le domaine n'est pas vérifié
      subject: `Relance — ${league.nom}`,
      html: `<p>Joueurs n'ayant pas terminé leurs pronostics : <strong>${noms}</strong></p>`,
    })
  }

  revalidatePath('/leagues/' + ligue_id + '/commissaire')
}