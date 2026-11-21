import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as clientConnecte } from '@/lib/supabase/server'
import { ADMIN_ID } from '@/lib/admin'
import { calculerStatsExpert, saisonNfl, urlsNflverse } from '@/lib/statsExpert'
import { calculerBlessures, urlBlessuresNflverse } from '@/lib/blessures'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Mise à jour hebdomadaire des statistiques du mode expert (données : nflverse).
// Accès : CRON_SECRET (tâche planifiée) ou le compte admin connecté (test à la main depuis le navigateur).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  let autorise =
    !!secret &&
    request.headers.get('authorization') === `Bearer ${secret}`
  if (!autorise) {
    const sb = await clientConnecte()
    const { data: { user } } = await sb.auth.getUser()
    autorise = user?.id === ADMIN_ID
  }
  if (!autorise) return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 })

  const saison = saisonNfl()
  const urls = urlsNflverse(saison)

  try {
    const [repEquipes, repJoueurs] = await Promise.all([fetch(urls.equipes, { cache: 'no-store' }), fetch(urls.joueurs, { cache: 'no-store' })])
    if (!repEquipes.ok || !repJoueurs.ok) {
      return NextResponse.json(
        { erreur: 'Téléchargement impossible, anciennes données conservées', equipes: repEquipes.status, joueurs: repJoueurs.status },
        { status: 502 }
      )
    }
    const lignes = calculerStatsExpert(await repEquipes.text(), await repJoueurs.text(), saison)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { error } = await supabase
      .from('stats_expert_equipes')
      .upsert(lignes.map((l) => ({ ...l, mis_a_jour: new Date().toISOString() })), { onConflict: 'equipe' })
    if (error) return NextResponse.json({ erreur: error.message }, { status: 500 })

    // Blessures : à part, pour qu'un souci ici ne bloque jamais les statistiques ci-dessus
    let blessures: { ok: boolean; equipes?: number; erreur?: string } = { ok: false }
    try {
      const repBlessures = await fetch(urlBlessuresNflverse(saison), { cache: 'no-store' })
      if (!repBlessures.ok) {
        blessures = { ok: false, erreur: `Téléchargement impossible (${repBlessures.status}), anciennes données conservées` }
      } else {
        const lignesBlessures = calculerBlessures(await repBlessures.text(), saison)
        if (lignesBlessures.length === 0) {
          blessures = { ok: false, erreur: 'Fichier vide, anciennes données conservées' }
        } else {
          const { error: erreurBlessures } = await supabase
            .from('blessures_expert')
            .upsert(lignesBlessures.map((l) => ({ ...l, mis_a_jour: new Date().toISOString() })), { onConflict: 'equipe' })
          blessures = erreurBlessures
            ? { ok: false, erreur: erreurBlessures.message }
            : { ok: true, equipes: lignesBlessures.length }
        }
      }
    } catch (e) {
      blessures = { ok: false, erreur: e instanceof Error ? e.message : 'Erreur inconnue' }
    }

    return NextResponse.json({ ok: true, saison, derniere_semaine: lignes[0].derniere_semaine, equipes: lignes.length, blessures })
  } catch (e) {
    // En cas de souci, on ne touche à rien : les chiffres de la semaine précédente restent affichés
    return NextResponse.json({ erreur: e instanceof Error ? e.message : 'Erreur inconnue' }, { status: 500 })
  }
}