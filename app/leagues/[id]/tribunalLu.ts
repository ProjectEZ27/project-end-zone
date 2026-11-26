'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { liguesTribunalLu } from '@/lib/accueil'

/*
 * Mémorise sur le COMPTE du joueur (donc sur téléphone et ordinateur) qu'il a vu le journal
 * d'une ligue cette semaine. On ne garde que la semaine en cours.
 */
export async function marquerTribunalLu(ligueId: number, semaineId: number) {
  if (!Number.isInteger(ligueId) || !Number.isInteger(semaineId)) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const deja = liguesTribunalLu(user.user_metadata, semaineId)
  if (deja.includes(ligueId)) return

  const { error } = await supabase.auth.updateUser({
    data: { tribunal_lu: { semaine: semaineId, ligues: [...deja, ligueId].slice(-50) } },
  })
  if (error) {
    console.error('[marquerTribunalLu]', error.message)
    return
  }
  revalidatePath('/leagues')
}