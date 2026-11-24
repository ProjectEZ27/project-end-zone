import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as clientService } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * L'appli (iPhone ou Android) envoie ici « l'adresse » de notification du téléphone du joueur connecté.
 * POST : enregistre (ou rattache au joueur connecté si ce téléphone était à quelqu'un d'autre).
 * DELETE : oublie ce téléphone (à appeler à la déconnexion).
 */
async function joueurConnecte() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

function lireToken(corps: unknown) {
  const token = corps && typeof corps === 'object' ? (corps as { token?: unknown }).token : null
  return typeof token === 'string' && token.trim().length > 0 && token.length <= 4096 ? token.trim() : null
}

export async function POST(request: NextRequest) {
  const user = await joueurConnecte()
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  let corps: unknown
  try {
    corps = await request.json()
  } catch {
    return NextResponse.json({ error: 'Demande illisible' }, { status: 400 })
  }
  const token = lireToken(corps)
  const plateforme = (corps as { plateforme?: unknown }).plateforme
  if (!token || (plateforme !== 'android' && plateforme !== 'ios')) {
    return NextResponse.json({ error: 'Demande invalide' }, { status: 400 })
  }

  const service = clientService(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { error } = await service
    .from('appareils_push')
    .upsert({ user_id: user.id, token, plateforme, mis_a_jour: new Date().toISOString() }, { onConflict: 'token' })
  if (error) {
    console.error('[push] enregistrement du téléphone échoué :', error.message)
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const user = await joueurConnecte()
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  let corps: unknown
  try {
    corps = await request.json()
  } catch {
    return NextResponse.json({ error: 'Demande illisible' }, { status: 400 })
  }
  const token = lireToken(corps)
  if (!token) return NextResponse.json({ error: 'Demande invalide' }, { status: 400 })

  const service = clientService(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { error } = await service.from('appareils_push').delete().eq('token', token).eq('user_id', user.id)
  if (error) {
    console.error('[push] suppression du téléphone échouée :', error.message)
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}