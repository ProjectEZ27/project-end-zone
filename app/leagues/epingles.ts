'use server'
 
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
 
const MAX = 3
 
async function mesEpingles() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, epingles: [] as { ligue_id: number; epingle: number }[] }
  const { data } = await supabase
    .from('adhesions')
    .select('ligue_id, epingle')
    .eq('utilisateur_id', user.id)
    .eq('statut', 'actif')
    .not('epingle', 'is', null)
    .order('epingle', { ascending: true })
  return { supabase, user, epingles: (data ?? []) as { ligue_id: number; epingle: number }[] }
}
 
async function ecrire(supabase: any, userId: string, ordre: number[]) {
  // ordre = liste des ligues épinglées, de la 1re à la dernière
  for (let i = 0; i < ordre.length; i++) {
    await supabase.from('adhesions').update({ epingle: i + 1 }).eq('utilisateur_id', userId).eq('ligue_id', ordre[i])
  }
}
 
function rafraichir() {
  revalidatePath('/leagues')
  revalidatePath('/')
  revalidatePath('/classement')
}
 
export async function epinglerLigue(formData: FormData) {
  const ligueId = Number(formData.get('ligueId'))
  const { supabase, user, epingles } = await mesEpingles()
  if (!user || !ligueId) return
  const ordre = epingles.map((e) => e.ligue_id)
  if (ordre.includes(ligueId) || ordre.length >= MAX) return
  // Une ligue épinglée ne peut pas rester masquée
  await supabase.from('adhesions').update({ masquee: false }).eq('utilisateur_id', user.id).eq('ligue_id', ligueId)
  await ecrire(supabase, user.id, [...ordre, ligueId])
  rafraichir()
}
 
export async function desepinglerLigue(formData: FormData) {
  const ligueId = Number(formData.get('ligueId'))
  const { supabase, user, epingles } = await mesEpingles()
  if (!user || !ligueId) return
  await supabase.from('adhesions').update({ epingle: null }).eq('utilisateur_id', user.id).eq('ligue_id', ligueId)
  await ecrire(supabase, user.id, epingles.map((e) => e.ligue_id).filter((id) => id !== ligueId))
  rafraichir()
}
 
export async function deplacerEpingle(formData: FormData) {
  const ligueId = Number(formData.get('ligueId'))
  const sens = formData.get('sens') === 'avant' ? -1 : 1
  const { supabase, user, epingles } = await mesEpingles()
  if (!user || !ligueId) return
  const ordre = epingles.map((e) => e.ligue_id)
  const i = ordre.indexOf(ligueId)
  const j = i + sens
  if (i < 0 || j < 0 || j >= ordre.length) return
  ;[ordre[i], ordre[j]] = [ordre[j], ordre[i]]
  await ecrire(supabase, user.id, ordre)
  rafraichir()
}
 
/** Masque une ligue des menus déroulants (on reste membre). Une ligue masquée est aussi désépinglée. */
export async function masquerLigue(formData: FormData) {
  const ligueId = Number(formData.get('ligueId'))
  const { supabase, user, epingles } = await mesEpingles()
  if (!user || !ligueId) return
  await supabase.from('adhesions').update({ masquee: true, epingle: null }).eq('utilisateur_id', user.id).eq('ligue_id', ligueId)
  await ecrire(supabase, user.id, epingles.map((e) => e.ligue_id).filter((id) => id !== ligueId))
  rafraichir()
}
 
export async function afficherLigue(formData: FormData) {
  const ligueId = Number(formData.get('ligueId'))
  const { supabase, user } = await mesEpingles()
  if (!user || !ligueId) return
  await supabase.from('adhesions').update({ masquee: false }).eq('utilisateur_id', user.id).eq('ligue_id', ligueId)
  rafraichir()
}
 