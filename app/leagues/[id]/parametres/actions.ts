'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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