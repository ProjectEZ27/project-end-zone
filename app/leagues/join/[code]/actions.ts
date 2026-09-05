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

  // Vérifie si une adhésion existe déjà pour cette ligue (en attente OU déjà acceptée)
  const { data: adhesionExistante } = await supabase
    .from('adhesions')
    .select('id, statut')
    .eq('utilisateur_id', user.id)
    .eq('ligue_id', Number(ligue_id))
    .maybeSingle()

  if (adhesionExistante) {
    if (adhesionExistante.statut === 'actif') {
      redirect('/leagues/' + ligue_id + '?error=' + encodeURIComponent('Tu es déjà membre de cette ligue'))
    }
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
    const message = error.code === '23505'
      ? 'Tu es déjà membre ou en attente pour cette ligue'
      : error.message
    redirect('/leagues/' + ligue_id + '?error=' + encodeURIComponent(message))
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