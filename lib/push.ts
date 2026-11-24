import { createClient } from '@supabase/supabase-js'
import { createSign } from 'crypto'

/**
 * Envoi de notifications sur les téléphones (appli iPhone et appli Android) via Firebase Cloud Messaging.
 * - Ne lève jamais d'erreur : une notification ratée ne doit pas bloquer l'action en cours.
 * - Ne fait rien tant que la variable FIREBASE_SERVICE_ACCOUNT n'est pas renseignée chez Vercel.
 * - Aucune bibliothèque à installer : on parle directement à Google.
 */

export type PushA = {
  userId: string
  titre: string
  message?: string | null
  lien?: string | null
}

type CleService = { project_id: string; client_email: string; private_key: string }

let cleMemo: CleService | null | undefined
let jetonMemo: { valeur: string; expire: number } | null = null

function clientService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function lireCle(): CleService | null {
  if (cleMemo !== undefined) return cleMemo
  cleMemo = null
  const brut = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!brut) return null
  try {
    // Le contenu du fichier .json collé tel quel, ou ce même contenu encodé en base64
    const texte = brut.trim().startsWith('{') ? brut : Buffer.from(brut.trim(), 'base64').toString('utf8')
    const j = JSON.parse(texte)
    if (j.project_id && j.client_email && j.private_key) {
      cleMemo = {
        project_id: String(j.project_id),
        client_email: String(j.client_email),
        private_key: String(j.private_key).replace(/\\n/g, '\n'),
      }
    } else {
      console.error('[push] FIREBASE_SERVICE_ACCOUNT incomplète')
    }
  } catch {
    console.error('[push] FIREBASE_SERVICE_ACCOUNT illisible')
  }
  return cleMemo
}

function base64url(texte: string) {
  return Buffer.from(texte).toString('base64url')
}

async function jetonAcces(cle: CleService): Promise<string | null> {
  const maintenant = Math.floor(Date.now() / 1000)
  if (jetonMemo && jetonMemo.expire - 60 > maintenant) return jetonMemo.valeur

  const enTete = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const corps = base64url(
    JSON.stringify({
      iss: cle.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: maintenant,
      exp: maintenant + 3600,
    })
  )
  const signature = createSign('RSA-SHA256').update(`${enTete}.${corps}`).sign(cle.private_key).toString('base64url')

  const rep = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${enTete}.${corps}.${signature}`,
    }),
  })
  if (!rep.ok) {
    console.error('[push] connexion à Google refusée :', rep.status, (await rep.text()).slice(0, 300))
    return null
  }
  const j = await rep.json()
  jetonMemo = { valeur: String(j.access_token), expire: maintenant + Number(j.expires_in ?? 3600) }
  return jetonMemo.valeur
}

async function envoyerUn(cle: CleService, acces: string, token: string, n: PushA): Promise<'ok' | 'invalide' | 'erreur'> {
  const rep = await fetch(`https://fcm.googleapis.com/v1/projects/${cle.project_id}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${acces}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: n.titre, body: n.message ?? '' },
        data: n.lien ? { lien: n.lien } : undefined,
        android: { priority: 'HIGH' },
        apns: { payload: { aps: { sound: 'default' } } },
      },
    }),
  })
  if (rep.ok) return 'ok'
  const texte = await rep.text()
  // Téléphone désinstallé ou « adresse » périmée : on l'oublie
  if (rep.status === 404 || texte.includes('UNREGISTERED') || texte.includes('not a valid FCM registration token')) {
    return 'invalide'
  }
  console.error('[push] envoi refusé :', rep.status, texte.slice(0, 300))
  return 'erreur'
}

/** Envoie plusieurs notifications (une ou plusieurs par joueur) sur tous les téléphones des joueurs concernés. */
export async function envoyerPushGroupe(liste: PushA[]) {
  try {
    if (liste.length === 0) return
    const cle = lireCle()
    if (!cle) return

    const parJoueur = new Map<string, PushA[]>()
    for (const n of liste) {
      const id = String(n.userId)
      parJoueur.set(id, [...(parJoueur.get(id) ?? []), n])
    }

    const supabase = clientService()
    const ids = [...parJoueur.keys()]
    const envois: { token: string; n: PushA }[] = []
    for (let i = 0; i < ids.length; i += 100) {
      const { data, error } = await supabase
        .from('appareils_push')
        .select('user_id, token')
        .in('user_id', ids.slice(i, i + 100))
        .range(0, 4999)
      if (error) {
        console.error('[push] lecture des téléphones échouée :', error.message)
        return
      }
      for (const a of data ?? []) {
        for (const n of parJoueur.get(String(a.user_id)) ?? []) envois.push({ token: String(a.token), n })
      }
    }
    if (envois.length === 0) return

    const acces = await jetonAcces(cle)
    if (!acces) return

    const invalides = new Set<string>()
    for (let i = 0; i < envois.length; i += 10) {
      await Promise.all(
        envois.slice(i, i + 10).map(async (e) => {
          try {
            if ((await envoyerUn(cle, acces, e.token, e.n)) === 'invalide') invalides.add(e.token)
          } catch (err) {
            console.error('[push] erreur d\'envoi :', err)
          }
        })
      )
    }

    if (invalides.size > 0) {
      const { error } = await supabase.from('appareils_push').delete().in('token', [...invalides])
      if (error) console.error('[push] nettoyage des téléphones périmés échoué :', error.message)
    }
  } catch (e) {
    console.error('[push] erreur inattendue :', e)
  }
}

/** Envoie une notification sur tous les téléphones d'un joueur. */
export async function envoyerPush(n: PushA) {
  await envoyerPushGroupe([n])
}