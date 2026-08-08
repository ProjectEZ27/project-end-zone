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