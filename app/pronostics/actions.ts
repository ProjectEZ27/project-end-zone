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

  // Vérifier que le match n'est pas verrouillé
  const { data: match } = await supabase
    .from('matchs')
    .select('statut')
    .eq('id', match_id)
    .single()

  if (!match || match.statut !== 'a_venir') {
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