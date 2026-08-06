'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptMembership(formData: FormData) {
  const supabase = await createClient()
  const adhesion_id = formData.get('adhesion_id') as string

  const { data: adhesion } = await supabase
    .from('adhesions')
    .update({ statut: 'actif' })
    .eq('id', adhesion_id)
    .select('ligue_id')
    .single()

  if (adhesion) {
    revalidatePath('/leagues/' + adhesion.ligue_id)
  }
}

export async function rejectMembership(formData: FormData) {
  const supabase = await createClient()
  const adhesion_id = formData.get('adhesion_id') as string

  const { data: adhesion } = await supabase
    .from('adhesions')
    .update({ statut: 'refuse' })
    .eq('id', adhesion_id)
    .select('ligue_id')
    .single()

  if (adhesion) {
    revalidatePath('/leagues/' + adhesion.ligue_id)
  }
}