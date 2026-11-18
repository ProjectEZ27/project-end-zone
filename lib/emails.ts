import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const ADRESSE_TEST = 'projectendzone27@gmail.com'

/**
 * Envoie un e-mail à un joueur à partir de son identifiant.
 *
 * - Tant que la variable RESEND_FROM n'existe pas chez Vercel (domaine pas encore validé chez Resend),
 *   rien ne change : le message part vers l'adresse du projet, comme avant.
 * - Dès que RESEND_FROM est renseignée (ex. « Project End Zone <bonjour@projectendzone.fr> »),
 *   le message part vraiment vers l'adresse du joueur.
 *
 * Ne lève jamais d'erreur : un e-mail raté ne doit pas bloquer l'action en cours.
 */
export async function envoyerEmailAuJoueur(userId: string, sujet: string, html: string) {
  try {
    if (!process.env.RESEND_API_KEY) return
    const resend = new Resend(process.env.RESEND_API_KEY)
    const expediteur = process.env.RESEND_FROM

    if (!expediteur) {
      await resend.emails.send({
        from: 'Project End Zone <onboarding@resend.dev>',
        to: ADRESSE_TEST,
        subject: sujet,
        html,
      })
      return
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data } = await admin.auth.admin.getUserById(userId)
    const email = data?.user?.email
    if (!email) return

    const { error } = await resend.emails.send({ from: expediteur, to: email, subject: sujet, html })
    if (error) console.error('[emails] envoi échoué :', error.message)
  } catch (e) {
    console.error('[emails] erreur inattendue :', e)
  }
}