'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  redirect('/')
}