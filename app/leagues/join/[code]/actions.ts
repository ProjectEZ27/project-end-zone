'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

export async function joinLeague(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const ligue_id = formData.get('ligue_id') as string

  const { data: saison } = await supabase
    .from('saisons')
    .select('id')
    .eq('statut', 'en_cours')
    .single()

  if (!saison) {
    redirect('/leagues/' + ligue_id + '?error=' + encodeURIComponent('Aucune saison en cours'))
  }

  // Vérifie si une demande est déjà en attente pour cette ligue
  const { data: demandeExistante } = await supabase
    .from('adhesions')
    .select('id')
    .eq('utilisateur_id', user.id)
    .eq('ligue_id', Number(ligue_id))
    .eq('statut', 'en_attente')
    .maybeSingle()

  if (demandeExistante) {
    redirect('/?demande=deja_envoyee')
  }

  const { error } = await supabase
    .from('adhesions')
    .insert({
      utilisateur_id: user.id,
      ligue_id: Number(ligue_id),
      saison_id: saison.id,
      statut: 'en_attente',
    })

  if (error) {
    redirect('/leagues/' + ligue_id + '?error=' + encodeURIComponent(error.message))
  }

  // Notifier le commissaire par e-mail
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Project End Zone <onboarding@resend.dev>',
    to: 'projectendzone27@gmail.com', // adresse de test tant que le domaine n'est pas vérifié
    subject: 'Nouvelle demande d\'adhésion',
    html: `<p>Un joueur souhaite rejoindre une de tes ligues. Va sur ton tableau de bord pour valider ou refuser la demande.</p>`,
  })

  redirect('/?demande=envoyee')
}