'use server'

import { createClient } from '@/lib/supabase/server'
import { ADMIN_ID } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

async function changerStatut(id: number, statut: 'validee' | 'refusee') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_ID) return
  await supabase.from('photos_perso').update({ statut }).eq('id', id)
  revalidatePath('/admin/photos')
  revalidatePath('/')
}

export async function validerPhoto(id: number) {
  await changerStatut(id, 'validee')
}

export async function refuserPhoto(id: number) {
  await changerStatut(id, 'refusee')
}