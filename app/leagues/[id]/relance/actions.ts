'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function lancerSaisonSuivante(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const ligue_id = formData.get('ligue_id') as string
  const saison_suivante_id = formData.get('saison_suivante_id') as string
  const membresGardes = formData.getAll('garder') as string[]

  const { data: league } = await supabase
    .from('ligues')
    .select('commissaire_id')
    .eq('id', ligue_id)
    .single()

  if (!league || league.commissaire_id !== user.id) {
    return
  }

  for (const utilisateur_id of membresGardes) {
    await supabase.from('adhesions').insert({
      utilisateur_id,
      ligue_id: Number(ligue_id),
      saison_id: Number(saison_suivante_id),
      statut: 'actif',
    })
  }

  redirect('/leagues/' + ligue_id)
}