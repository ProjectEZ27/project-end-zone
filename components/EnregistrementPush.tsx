'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Ce composant ne fait rien sur le site dans un navigateur.
// Dans l'appli iPhone ou Android (l'enveloppe Capacitor), il demande au joueur l'autorisation
// d'envoyer des notifications, puis envoie au site « l'adresse » de son téléphone.

type Ecouteur = { remove: () => Promise<void> }
type PluginPush = {
  checkPermissions: () => Promise<{ receive: string }>
  requestPermissions: () => Promise<{ receive: string }>
  register: () => Promise<void>
  addListener: (nom: string, fn: (donnees: never) => void) => Promise<Ecouteur>
}
type CapacitorGlobal = {
  isNativePlatform?: () => boolean
  getPlatform?: () => string
  Plugins?: { PushNotifications?: PluginPush }
}

export default function EnregistrementPush() {
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor
    if (!cap?.isNativePlatform?.()) return
    const push = cap.Plugins?.PushNotifications
    if (!push) return

    const supabase = createClient()
    const plateforme = cap.getPlatform?.() === 'ios' ? 'ios' : 'android'
    let dernierJoueur: string | null = null

    async function activer(userId: string) {
      if (!push || dernierJoueur === userId) return
      dernierJoueur = userId
      try {
        let permission = await push.checkPermissions()
        if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
          permission = await push.requestPermissions()
        }
        if (permission.receive !== 'granted') return
        await push.register()
      } catch (e) {
        console.error('[push] activation impossible :', e)
      }
    }

    const ecouteurs: Promise<Ecouteur>[] = [
      push.addListener('registration', async (donnees) => {
        const token = (donnees as { value?: string }).value
        if (!token) return
        try {
          await fetch('/api/push/enregistrer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, plateforme }),
          })
        } catch {
          // Pas grave : on réessaiera à la prochaine ouverture de l'appli
        }
      }),
      push.addListener('registrationError', (erreur) => {
        console.error('[push] enregistrement refusé :', erreur)
      }),
      // Un appui sur la notification ouvre la bonne page du site
      push.addListener('pushNotificationActionPerformed', (donnees) => {
        const lien = (donnees as { notification?: { data?: { lien?: string } } }).notification?.data?.lien
        if (lien && lien.startsWith('/') && !lien.startsWith('//')) window.location.href = lien
      }),
    ]

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) activer(user.id)
    })
    const { data: abonnement } = supabase.auth.onAuthStateChange((_evenement, session) => {
      if (session?.user) activer(session.user.id)
      else dernierJoueur = null
    })

    return () => {
      abonnement.subscription.unsubscribe()
      ecouteurs.forEach((p) => p.then((l) => l.remove()).catch(() => {}))
    }
  }, [])

  return null
}