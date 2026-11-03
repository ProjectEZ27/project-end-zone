'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function selectPronostic(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const match_id = formData.get('match_id') as string
  const equipe = formData.get('equipe') as string

  // Vérifier que le match n'est pas verrouillé (par statut OU par l'heure du coup d'envoi)
  const { data: match } = await supabase
    .from('matchs')
    .select('statut, coup_envoi')
    .eq('id', match_id)
    .single()

  if (!match || match.statut !== 'a_venir' || new Date() >= new Date(match.coup_envoi)) {
    return
  }

  // Regarder si un pronostic existe déjà pour ce match
  const { data: existant } = await supabase
    .from('pronostics')
    .select('id')
    .eq('utilisateur_id', user.id)
    .eq('match_id', match_id)
    .single()

  if (existant) {
    // Modifier le pronostic existant
    await supabase
      .from('pronostics')
      .update({
        equipe_choisie: equipe,
        derniere_modification: new Date().toISOString(),
      })
      .eq('id', existant.id)
  } else {
    // Créer un nouveau pronostic
    await supabase
      .from('pronostics')
      .insert({
        utilisateur_id: user.id,
        match_id: match_id,
        equipe_choisie: equipe,
      })
  }

  revalidatePath('/pronostics')
}
export async function submitSpecialPick(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const type = formData.get('type') as string
  const saison_id = formData.get('saison_id') as string
  const autre_joueur = formData.get('autre_joueur') as string
  const choix_menu = formData.get('choix') as string
  const choix = autre_joueur?.trim() ? autre_joueur.trim() : choix_menu

  const date_limite = '2026-09-01T00:00:00Z'

  const { data: existant } = await supabase
    .from('pronostics_speciaux')
    .select('id')
    .eq('utilisateur_id', user.id)
    .eq('saison_id', saison_id)
    .eq('type', type)
    .single()

  if (existant) {
    await supabase
      .from('pronostics_speciaux')
      .update({ choix })
      .eq('id', existant.id)
  } else {
    await supabase
      .from('pronostics_speciaux')
      .insert({
        utilisateur_id: user.id,
        saison_id: saison_id,
        type: type,
        choix: choix,
        date_limite: date_limite,
      })
  }

  revalidatePath('/pronostics')
}

// Enregistre que le joueur a lu le récap d'une semaine, puis l'envoie là où il a cliqué.
export async function marquerRecapLu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const semaineId = Number(formData.get('semaine_id'))
  const destination = formData.get('destination')

  if (!Number.isInteger(semaineId)) {
    redirect('/pronostics')
  }

  const { error } = await supabase
    .from('recaps_lus')
    .insert({ utilisateur_id: user.id, semaine_id: semaineId })

  // 23505 = déjà enregistré : pas un problème. Toute autre erreur est affichée.
  if (error && error.code !== '23505') {
    throw new Error('Récap non enregistré : ' + error.message)
  }

  if (destination === 'resultats') {
    redirect(`/pronostics?semaine=${semaineId}`)
  }
  // Récap lu : /pronostics ouvre maintenant directement la semaine suivante
  redirect('/pronostics')
}