'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

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

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Project End Zone <onboarding@resend.dev>',
      to: 'projectendzone27@gmail.com', // adresse de test tant que le domaine n'est pas vérifié
      subject: 'Ta demande a été acceptée !',
      html: `<p>Bonne nouvelle, ta demande pour rejoindre la ligue a été acceptée. Tu peux commencer à faire tes pronostics 🏈</p>`,
    })
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

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Project End Zone <onboarding@resend.dev>',
      to: 'projectendzone27@gmail.com', // adresse de test tant que le domaine n'est pas vérifié
      subject: 'Ta demande n\'a pas été retenue',
      html: `<p>Ta demande pour rejoindre cette ligue n'a pas été acceptée par le commissaire.</p>`,
    })
  }
}
export async function changerLogoLigue(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const ligue_id = formData.get('ligue_id') as string
  const logo_id = parseInt(formData.get('logo_id') as string) || 1

  if (logo_id < 1 || logo_id > 15) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent('Logo invalide')}`)
  }

  // Vérification côté serveur : seul le commissaire peut modifier le logo
  const { data: league } = await supabase
    .from('ligues')
    .select('commissaire_id')
    .eq('id', ligue_id)
    .single()

  if (!league || league.commissaire_id !== user.id) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent('Seul le commissaire peut modifier le logo')}`)
  }

  const { error } = await supabase
    .from('ligues')
    .update({ logo_id })
    .eq('id', ligue_id)

  if (error) {
    redirect(`/leagues/${ligue_id}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/leagues/' + ligue_id)
  revalidatePath('/')
  redirect('/leagues/' + ligue_id)
}