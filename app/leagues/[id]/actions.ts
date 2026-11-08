'use server'
 
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import { creerNotification, marquerNotificationLue } from '@/lib/notifications'
 
export async function acceptMembership(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adhesion_id = formData.get('adhesion_id') as string
 
  const { data: adhesion } = await supabase
    .from('adhesions')
    .update({ statut: 'actif' })
    .eq('id', adhesion_id)
    .select('ligue_id, utilisateur_id')
    .single()
 
  if (adhesion) {
    revalidatePath('/leagues/' + adhesion.ligue_id)
 
    const { data: ligue } = await supabase.from('ligues').select('nom').eq('id', adhesion.ligue_id).maybeSingle()
    await creerNotification({
      userId: adhesion.utilisateur_id,
      type: 'ligue',
      titre: 'Demande acceptée',
      message: `Tu fais maintenant partie de la ligue ${ligue?.nom ?? ''}. Bon jeu !`.replace('  ', ' '),
      lien: `/leagues/${adhesion.ligue_id}`,
      cle: `adhesion-resultat:${adhesion.ligue_id}:${adhesion.utilisateur_id}`,
    })
    if (user) {
      await marquerNotificationLue(user.id, `demande-adhesion:${adhesion.ligue_id}:${adhesion.utilisateur_id}`)
    }
 
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Project End Zone <onboarding@resend.dev>',
      to: 'projectendzone27@gmail.com', // adresse de test tant que le domaine n'est pas vérifié
      subject: 'Ta demande a été acceptée !',
      html: `<p>Bonne nouvelle, ta demande pour rejoindre la ligue a été acceptée. Tu peux commencer à faire tes pronostics 🏈</p>`,
    })
  }
}
 
export async function rejectMembership(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adhesion_id = formData.get('adhesion_id') as string
 
  const { data: adhesion } = await supabase
    .from('adhesions')
    .update({ statut: 'refuse' })
    .eq('id', adhesion_id)
    .select('ligue_id, utilisateur_id')
    .single()
 
  if (adhesion) {
    revalidatePath('/leagues/' + adhesion.ligue_id)
 
    const { data: ligue } = await supabase.from('ligues').select('nom').eq('id', adhesion.ligue_id).maybeSingle()
    await creerNotification({
      userId: adhesion.utilisateur_id,
      type: 'ligue',
      titre: 'Demande refusée',
      message: `Le commissaire n'a pas retenu ta demande pour la ligue ${ligue?.nom ?? ''}.`.replace('  ', ' '),
      lien: '/',
      cle: `adhesion-resultat:${adhesion.ligue_id}:${adhesion.utilisateur_id}`,
    })
    if (user) {
      await marquerNotificationLue(user.id, `demande-adhesion:${adhesion.ligue_id}:${adhesion.utilisateur_id}`)
    }
 
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Project End Zone <onboarding@resend.dev>',
      to: 'projectendzone27@gmail.com', // adresse de test tant que le domaine n'est pas vérifié
      subject: 'Ta demande n\'a pas été retenue',
      html: `<p>Ta demande pour rejoindre cette ligue n'a pas été acceptée par le commissaire.</p>`,
    })
  }
}
export async function changerLogoLigue(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
 
  if (!user) {
    redirect('/login')
  }
 
  const ligue_id = formData.get('ligue_id') as string
  const logo_id = parseInt(formData.get('logo_id') as string) || 1
 
  if (logo_id < 1 || logo_id > 15) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent('Logo invalide')}`)
  }
 
  // Vérification côté serveur : seul le commissaire peut modifier le logo
  const { data: league } = await supabase
    .from('ligues')
    .select('commissaire_id')
    .eq('id', ligue_id)
    .single()
 
  if (!league || league.commissaire_id !== user.id) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent('Seul le commissaire peut modifier le logo')}`)
  }
 
  const { error } = await supabase
    .from('ligues')
    .update({ logo_id })
    .eq('id', ligue_id)
 
  if (error) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent(error.message)}`)
  }
 
  revalidatePath('/leagues/' + ligue_id)
  revalidatePath('/leagues')
  redirect('/leagues/' + ligue_id)
}
 
export async function supprimerLigue(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
 
  if (!user) {
    redirect('/login')
  }
 
  const ligue_id = formData.get('ligue_id') as string
 
  // Vérification côté serveur : seul le commissaire peut supprimer la ligue
  const { data: league } = await supabase
    .from('ligues')
    .select('commissaire_id')
    .eq('id', ligue_id)
    .single()
 
  if (!league || league.commissaire_id !== user.id) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent('Seul le commissaire peut supprimer la ligue')}`)
  }
 
  // Nettoyage des adhésions liées avant de supprimer la ligue elle-même
  await supabase.from('adhesions').delete().eq('ligue_id', ligue_id)
 
  const { error } = await supabase.from('ligues').delete().eq('id', ligue_id)
 
  if (error) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent(error.message)}`)
  }
 
  revalidatePath('/leagues')
  redirect('/leagues')
}