import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculerStatsExpert, saisonNfl, urlsNflverse } from '@/lib/statsExpert'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Mise à jour hebdomadaire des statistiques du mode expert (données : nflverse).
// Protégée par CRON_SECRET : en-tête "Authorization: Bearer ..." (Vercel) ou ?cle=... (test à la main).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const url = new URL(request.url)
  const autorise =
    !!secret &&
    (request.headers.get('authorization') === `Bearer ${secret}` || url.searchParams.get('cle') === secret)
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

    return NextResponse.json({ ok: true, saison, derniere_semaine: lignes[0].derniere_semaine, equipes: lignes.length })
  } catch (e) {
    // En cas de souci, on ne touche à rien : les chiffres de la semaine précédente restent affichés
    return NextResponse.json({ erreur: e instanceof Error ? e.message : 'Erreur inconnue' }, { status: 500 })
  }
}