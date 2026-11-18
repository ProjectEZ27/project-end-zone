'use server'
 
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { envoyerEmailAuJoueur } from '@/lib/emails'
import { creerNotification, marquerNotificationLue } from '@/lib/notifications'
 
/**
 * Vérifie que la personne connectée est bien le commissaire de la ligue visée par la demande.
 * Renvoie la demande et la ligue, ou null si ce n'est pas autorisé.
 */
async function demandePourCommissaire(adhesion_id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !adhesion_id) return null

  const { data: adhesion } = await supabase
    .from('adhesions')
    .select('id, ligue_id, utilisateur_id, statut')
    .eq('id', adhesion_id)
    .maybeSingle()
  if (!adhesion) return null

  const { data: ligue } = await supabase
    .from('ligues')
    .select('id, nom, commissaire_id, taille_max')
    .eq('id', adhesion.ligue_id)
    .maybeSingle()

  // Sécurité : seul le commissaire de cette ligue peut répondre à une demande
  if (!ligue || ligue.commissaire_id !== user.id) return null

  return { supabase, user, adhesion, ligue }
}

export async function acceptMembership(formData: FormData) {
  const contexte = await demandePourCommissaire(formData.get('adhesion_id') as string)
  if (!contexte) return
  const { supabase, user, adhesion, ligue } = contexte

  if (adhesion.statut === 'actif') return

  // Taille maximale de la ligue : on compte les membres déjà actifs
  const { count } = await supabase
    .from('adhesions')
    .select('id', { count: 'exact', head: true })
    .eq('ligue_id', ligue.id)
    .eq('statut', 'actif')
  if (ligue.taille_max && (count ?? 0) >= ligue.taille_max) {
    redirect(`/leagues/${ligue.id}?error=${encodeURIComponent(`La ligue est complète (${ligue.taille_max} joueurs maximum)`)}`)
  }

  const { error } = await supabase
    .from('adhesions')
    .update({ statut: 'actif' })
    .eq('id', adhesion.id)
  if (error) {
    redirect(`/leagues/${ligue.id}?error=${encodeURIComponent("La demande n'a pas pu être acceptée, réessaie")}`)
  }

  revalidatePath('/leagues/' + ligue.id)

  await creerNotification({
    userId: adhesion.utilisateur_id,
    type: 'ligue',
    titre: 'Demande acceptée',
    message: `Tu fais maintenant partie de la ligue ${ligue.nom ?? ''}. Bon jeu !`.replace('  ', ' '),
    lien: `/leagues/${ligue.id}`,
    cle: `adhesion-resultat:${ligue.id}:${adhesion.utilisateur_id}`,
  })
  await marquerNotificationLue(user.id, `demande-adhesion:${ligue.id}:${adhesion.utilisateur_id}`)

  await envoyerEmailAuJoueur(
    adhesion.utilisateur_id,
    'Ta demande a été acceptée !',
    `<p>Bonne nouvelle, ta demande pour rejoindre la ligue a été acceptée. Tu peux commencer à faire tes pronostics 🏈</p>`
  )
}

export async function rejectMembership(formData: FormData) {
  const contexte = await demandePourCommissaire(formData.get('adhesion_id') as string)
  if (!contexte) return
  const { supabase, user, adhesion, ligue } = contexte

  const { error } = await supabase
    .from('adhesions')
    .update({ statut: 'refuse' })
    .eq('id', adhesion.id)
  if (error) {
    redirect(`/leagues/${ligue.id}?error=${encodeURIComponent("La demande n'a pas pu être refusée, réessaie")}`)
  }

  revalidatePath('/leagues/' + ligue.id)

  await creerNotification({
    userId: adhesion.utilisateur_id,
    type: 'ligue',
    titre: 'Demande refusée',
    message: `Le commissaire n'a pas retenu ta demande pour la ligue ${ligue.nom ?? ''}.`.replace('  ', ' '),
    lien: '/',
    cle: `adhesion-resultat:${ligue.id}:${adhesion.utilisateur_id}`,
  })
  await marquerNotificationLue(user.id, `demande-adhesion:${ligue.id}:${adhesion.utilisateur_id}`)

  await envoyerEmailAuJoueur(
    adhesion.utilisateur_id,
    "Ta demande n'a pas été retenue",
    `<p>Ta demande pour rejoindre cette ligue n'a pas été acceptée par le commissaire.</p>`
  )
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