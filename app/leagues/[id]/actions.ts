'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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