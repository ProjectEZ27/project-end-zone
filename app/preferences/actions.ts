'use server'

import { createClient } from '@/lib/supabase/server'

export type Preferences = {
  intro_animation: boolean
  notif_rappel_actif: boolean
  email_rappel_actif: boolean
}

// Valeurs par défaut si le joueur n'a encore rien choisi
const DEFAUT: Preferences = { intro_animation: true, notif_rappel_actif: true, email_rappel_actif: false }

export async function lirePreferences(): Promise<Preferences | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('intro_animation, notif_rappel_actif, email_rappel_actif')
    .eq('id', user.id)
    .maybeSingle()
  if (error) {
    console.error('[lirePreferences]', error.message)
    return DEFAUT
  }
  return {
    intro_animation: data?.intro_animation ?? DEFAUT.intro_animation,
    notif_rappel_actif: data?.notif_rappel_actif ?? DEFAUT.notif_rappel_actif,
    email_rappel_actif: data?.email_rappel_actif ?? DEFAUT.email_rappel_actif,
  }
}

export async function changerPreferenceRappel(canal: 'notification' | 'email', actif: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const colonne = canal === 'notification' ? 'notif_rappel_actif' : 'email_rappel_actif'
  const { error } = await supabase.from('profiles').update({ [colonne]: actif }).eq('id', user.id)
  if (error) console.error('[changerPreferenceRappel]', error.message)
}