'use server'
 
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { verifierNomLigue, MESSAGE_NOM_PRIS } from '@/lib/nomLigue'
import { revalidatePath } from 'next/cache'
 
export async function modifierLigue(formData: FormData) {
  const supabase = await createClient()
 
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
 
  const ligue_id = formData.get('ligue_id') as string
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

  const verification = verifierNomLigue(formData.get('nom'))
  if (!verification.ok) {
    redirect(`/leagues/${ligue_id}/parametres?error=${encodeURIComponent(verification.message)}`)
  }
  const nom = verification.nom
 
  const { error } = await supabase
    .from('ligues')
    .update({
      nom,
      config_rappels: {
        rappel_1_actif,
        rappel_2_actif,
        delais_heures: [delai_1, delai_2],
      },
    })
    .eq('id', ligue_id)

  if (error) {
    const message = error.code === '23505' ? MESSAGE_NOM_PRIS : "Les modifications n'ont pas pu être enregistrées, réessaie"
    if (error.code !== '23505') console.error('[modifierLigue]', error.message)
    redirect(`/leagues/${ligue_id}/parametres?error=${encodeURIComponent(message)}`)
  }
 
  revalidatePath('/leagues/' + ligue_id)
  revalidatePath('/leagues/' + ligue_id + '/parametres')
}