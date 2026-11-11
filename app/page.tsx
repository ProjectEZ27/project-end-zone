import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AuthRecoveryListener from './AuthRecoveryListener'
import LandingPage from '@/components/LandingPage'
import { calculerClassementSaison } from '@/lib/scoring'
import CountdownBadge from './CountdownBadge'
import AnnonceBanner from '@/components/AnnonceBanner'
import CarteEquipe from '@/components/CarteEquipe'
import CarteLigue from '@/components/CarteLigue'
import RecapSemaine from '@/components/RecapSemaine'
import { trouverRecapAAfficher } from '@/lib/recapSemaine'
import { cookies } from 'next/headers'
import { tribunalActuel, notifierTribunal, maDerniereSemaine, infosMonEquipe, chargerMesLigues } from '@/lib/accueil'

export const dynamic = 'force-dynamic'
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ demande?: string }>
}) {
  const params = await searchParams
  // Les anciens liens « ?demande=… » arrivaient ici : ils sont maintenant gérés par la page Ligues
  if (params.demande) redirect(`/leagues?demande=${encodeURIComponent(params.demande)}`)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LandingPage />
  }

  const [profileResult, saisonResult, prochainMatchGlobalResult, annoncesResult, tribunal, derniereSemaine] = await Promise.all([
    supabase.from('profiles').select('pseudo, equipe_favorite').eq('id', user.id).maybeSingle(),
    supabase.from('saisons').select('id').eq('statut', 'en_cours').single(),
    supabase.from('matchs').select('semaine_id').neq('statut', 'termine').order('coup_envoi', { ascending: true }).limit(1).maybeSingle(),
    supabase.from('annonces').select('id, titre, message, date_fin').eq('actif', true).order('id', { ascending: false }).limit(5),
    tribunalActuel(supabase),
    maDerniereSemaine(supabase, user.id),
  ])

  const annonceActive = (annoncesResult.data ?? []).find(
    (a) => !a.date_fin || new Date(a.date_fin) > new Date()
  ) ?? null

  const profile = profileResult.data
  const vedette = tribunal?.enVedette === true
  if (tribunal?.enVedette) await notifierTribunal(supabase, user.id, tribunal)
  if (!profile) {
    redirect('/onboarding')
  }

  const infosEquipe = profile.equipe_favorite
    ? await infosMonEquipe(supabase, profile.equipe_favorite)
    : { prochain: null, dernier: null }

  const saisonActuelleId = saisonResult.data?.id

  const classementSaison = saisonActuelleId
    ? await calculerClassementSaison(supabase, saisonActuelleId)
    : []

  // Récap animé de la semaine terminée (jusqu'à 24 h avant la semaine suivante, tant qu'un bouton n'a pas été cliqué)
  let recap: Awaited<ReturnType<typeof trouverRecapAAfficher>> = null
  if (saisonActuelleId) {
    const jar = await cookies()
    const idsLusParCookie = jar
      .getAll()
      .map((c) => c.name.match(/^recap_lu_(\d+)_(.+)$/))
      .filter((m): m is RegExpMatchArray => m !== null && m[2] === user.id)
      .map((m) => Number(m[1]))
    recap = await trouverRecapAAfficher(supabase, user.id, saisonActuelleId, idsLusParCookie)
  }
  const animes: number[] = Array.isArray(user.user_metadata?.recaps_animes) ? user.user_metadata.recaps_animes : []

  // Ligues affichées sur l'accueil : les 3 épinglées, sinon les 3 premières
  const mesLigues = await chargerMesLigues(supabase, user.id, classementSaison)
  const epinglees = mesLigues.filter((l) => l.epingle !== null).sort((a, b) => a.epingle! - b.epingle!)
  const liguesAccueil = (epinglees.length > 0 ? epinglees : mesLigues.filter((l) => !l.masquee)).slice(0, 3)


  // Classement général (toutes ligues confondues, ou sans ligue = tous les joueurs de la saison)
  const totalJoueursClassement = classementSaison.length
  const monIndexClassement = classementSaison.findIndex(j => j.utilisateur_id === user.id)
  const monRangGeneral = monIndexClassement >= 0 ? monIndexClassement + 1 : null
  const mesPointsSaison = monIndexClassement >= 0 ? classementSaison[monIndexClassement].score_saison : 0

  // Taux de réussite global de la saison (même logique que profile/page.tsx)
  let totalPronostics = 0
  let totalCorrects = 0
  if (saisonActuelleId) {
    const { data: semainesSaison } = await supabase
      .from('semaines')
      .select('id')
      .eq('saison_id', saisonActuelleId)

    const semaineIds = (semainesSaison ?? []).map((s) => s.id)
    if (semaineIds.length > 0) {
      const { data: matchsSaison } = await supabase
        .from('matchs')
        .select('id, statut, equipe_gagnante')
        .in('semaine_id', semaineIds)

      const matchIds = (matchsSaison ?? []).map((m) => m.id)
      const matchMap = new Map((matchsSaison ?? []).map((m) => [m.id, m]))

      if (matchIds.length > 0) {
        const { data: mesPronostics } = await supabase
          .from('pronostics')
          .select('match_id, equipe_choisie')
          .eq('utilisateur_id', user.id)
          .in('match_id', matchIds)

        totalPronostics = (mesPronostics ?? []).filter((p) => matchMap.get(p.match_id)?.statut === 'termine').length
        totalCorrects = (mesPronostics ?? []).filter((p) => {
          const m = matchMap.get(p.match_id)
          return m && m.statut === 'termine' && p.equipe_choisie === m.equipe_gagnante
        }).length
      }
    }
  }
  const tauxReussite = totalPronostics > 0 ? Math.round((totalCorrects / totalPronostics) * 100) : 0

  // Bandeau "Pronostics de la semaine" — semaine dérivée du prochain match non terminé (même logique que Pronostics/Profil)
  let semaineActuelle: { id: number; nom: string } | null = null
  if (prochainMatchGlobalResult.data) {
    const { data } = await supabase.from('semaines').select('id, nom').eq('id', prochainMatchGlobalResult.data.semaine_id).single()
    semaineActuelle = data
  } else {
    const { data } = await supabase.from('semaines').select('id, nom').order('id', { ascending: false }).limit(1).single()
    semaineActuelle = data
  }

  let nombreMatchsSemaine = 0
  let mesPronosFaits = 0
  let prochainVerrouillage: string | null = null
  if (semaineActuelle) {
    const { count } = await supabase
      .from('matchs')
      .select('id', { count: 'exact', head: true })
      .eq('semaine_id', semaineActuelle.id)
    nombreMatchsSemaine = count ?? 0

    const { data: matchsSemaineActuelle } = await supabase
      .from('matchs')
      .select('id')
      .eq('semaine_id', semaineActuelle.id)
    const idsMatchsSemaine = (matchsSemaineActuelle ?? []).map((m) => m.id)

    if (idsMatchsSemaine.length > 0) {
      const { count: countFaits } = await supabase
        .from('pronostics')
        .select('id', { count: 'exact', head: true })
        .eq('utilisateur_id', user.id)
        .in('match_id', idsMatchsSemaine)
      mesPronosFaits = countFaits ?? 0
    }

    const { data: prochainMatchSemaine } = await supabase
      .from('matchs')
      .select('coup_envoi')
      .eq('semaine_id', semaineActuelle.id)
      .eq('statut', 'a_venir')
      .order('coup_envoi', { ascending: true })
      .limit(1)
      .maybeSingle()

    prochainVerrouillage = prochainMatchSemaine?.coup_envoi ?? null
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Acceuil.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center' }}>
        <img src="/logo-officiel.png" alt="Project End Zone" style={{ width: 160, margin: '0 auto', display: 'block' }} />

        <p style={{ color: 'white', marginTop: 12 }}>Connecté en tant que {profile.pseudo}</p>

        {vedette && (
          <Link
            href="/leagues"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'linear-gradient(135deg, #3a0f0c, #7a1a15)',
              border: '1px solid #ff6b5f',
              borderRadius: 12,
              padding: '12px 14px',
              marginTop: 16,
              textAlign: 'left',
              textDecoration: 'none',
              color: 'white',
              boxShadow: '0 0 20px rgba(200,53,46,0.35)',
            }}
          >
            <span style={{ fontSize: 26 }}>⚖️</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#ffd9d5' }}>À la une</span>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>Le {tribunal?.nom ?? 'Tribunal du mardi'} est ouvert</span>
              <span style={{ display: 'block', fontSize: 12, color: '#ffd9d5' }}>Viens voir qui a été jugé dans tes ligues →</span>
            </span>
          </Link>
        )}

        {semaineActuelle && (() => {
          const style = mesPronosFaits === 0
            ? { degrade: 'linear-gradient(135deg, #7a1a15, #C8352E)', bordure: '#ff6b5f', ombre: 'rgba(200,53,46,0.35)', texteHaut: '#ffd9d5', texteBouton: '#C8352E', libelle: 'Faire mes pronostics →' }
            : mesPronosFaits < nombreMatchsSemaine
            ? { degrade: 'linear-gradient(135deg, #6b4a0f, #d68f1f)', bordure: '#f0b84a', ombre: 'rgba(214,143,31,0.35)', texteHaut: '#ffedcf', texteBouton: '#a86b0f', libelle: '⏳ Finalise tes pronostics →' }
            : { degrade: 'linear-gradient(135deg, #0c4a3a, #2ea866)', bordure: '#6fe0a0', ombre: 'rgba(46,168,102,0.35)', texteHaut: '#d7f5e4', texteBouton: '#0F6E56', libelle: '✅ Pronostics faits — modifier' }

          return (
            <Link
              href={`/pronostics?semaine=${semaineActuelle.id}`}
              style={{
                display: 'block',
                background: style.degrade,
                border: `1px solid ${style.bordure}`,
                borderRadius: 12,
                padding: 16,
                textDecoration: 'none',
                color: 'white',
                margin: '20px 0',
                textAlign: 'left',
                boxShadow: `0 0 20px ${style.ombre}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 3, height: 12, background: 'white' }} />
                <span style={{ fontSize: 10, letterSpacing: 1, color: style.texteHaut, textTransform: 'uppercase' }}>
                  {semaineActuelle.nom}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Pronostics de la semaine</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: style.texteHaut }}>
                <span>📅 {mesPronosFaits}/{nombreMatchsSemaine} faits</span>
                <CountdownBadge cible={prochainVerrouillage} />
              </div>
              <div style={{
                marginTop: 12,
                background: 'white',
                color: style.texteBouton,
                fontSize: 13,
                fontWeight: 700,
                padding: 10,
                borderRadius: 8,
                textAlign: 'center',
              }}>
                {style.libelle}
              </div>
            </Link>
          )
        })()}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#7a8aa5', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Classement général</div>
            <div style={{ fontSize: 18 }}>🏆</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginTop: 2 }}>
              {monRangGeneral ? `${monRangGeneral}e` : '—'}
            </div>
            <div style={{ fontSize: 9, color: '#9fb0c9' }}>
              {totalJoueursClassement > 0 ? `sur ${totalJoueursClassement} joueurs` : 'classement'}
            </div>
          </div>
          <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#7a8aa5', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Points cette saison</div>
            <div style={{ fontSize: 18 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginTop: 2 }}>{mesPointsSaison} pts</div>
            <div style={{ fontSize: 9, color: '#9fb0c9' }}>{tauxReussite}% réussite</div>
          </div>
        </div>


        {recap && <RecapSemaine {...recap} userId={user.id} dejaAnime={animes.includes(recap.semaineId)} />}

        {!recap && derniereSemaine && (
          <div style={{
            background: '#16233F',
            border: '0.5px solid #33415a',
            borderRadius: 12,
            padding: '12px 14px',
            margin: '0 0 16px',
            textAlign: 'left',
            color: 'white',
          }}>
            <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#9fb0c9' }}>
              Ta dernière semaine · {derniereSemaine.nom}
            </div>
            {derniereSemaine.aPronostique ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
                  {derniereSemaine.bons} bon{derniereSemaine.bons > 1 ? 's' : ''} prono{derniereSemaine.bons > 1 ? 's' : ''} sur {derniereSemaine.total}
                  {derniereSemaine.points !== null && (
                    <span style={{ color: '#F0C040' }}> · +{derniereSemaine.points} pt{derniereSemaine.points > 1 ? 's' : ''}</span>
                  )}
                </div>
                {derniereSemaine.rang !== null && derniereSemaine.joueurs > 1 && (
                  <div style={{ fontSize: 12, color: '#9fb0c9', marginTop: 2 }}>
                    {derniereSemaine.rang === 1 ? '1er' : `${derniereSemaine.rang}e`} sur {derniereSemaine.joueurs} joueurs cette semaine
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 14, color: '#9fb0c9', marginTop: 2 }}>Tu n'avais pas pronostiqué cette semaine.</div>
            )}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8, fontSize: 12 }}>
              <Link href={`/pronostics?semaine=${derniereSemaine.id}`} style={{ color: '#F0C040', textDecoration: 'none' }}>👀 Revoir mes pronostics</Link>
              <Link href="/pronostics" style={{ color: '#F0C040', textDecoration: 'none' }}>Pronostiquer la suite →</Link>
            </div>
          </div>
        )}

        <CarteEquipe equipe={profile.equipe_favorite ?? null} infos={infosEquipe} />

        {annonceActive && (
          <AnnonceBanner id={annonceActive.id} titre={annonceActive.titre} message={annonceActive.message} />
        )}


        {liguesAccueil.length > 0 && (
          <div style={{ marginTop: 8, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 3, height: 14, background: '#C8352E' }} />
                <span style={{ fontSize: 13, color: '#9fb0c9', textTransform: 'uppercase', letterSpacing: 0.5 }}>Mes ligues</span>
              </div>
              <Link href="/leagues" style={{ fontSize: 12, color: '#9fb0c9', textDecoration: 'none' }}>Toutes mes ligues →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {liguesAccueil.map((l) => (
                <CarteLigue key={l.id} ligue={l} vedette={vedette} />
              ))}
            </div>
          </div>
        )}

        <form action="/auth/logout" method="post" style={{ marginTop: 32 }}>
          <button style={{ padding: 10 }}>Se déconnecter</button>
        </form>

        <div style={{ marginTop: 40, fontSize: 12, color: '#666', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/regles" style={{ color: '#9fb0c9' }}>📖 Rappel des règles</Link>
          <Link href="/legal/mentions" style={{ color: '#666' }}>Mentions légales</Link>
          <Link href="/legal/confidentialite" style={{ color: '#666' }}>Confidentialité</Link>
          <Link href="/legal/cgu" style={{ color: '#666' }}>CGU</Link>
          <Link href="/contact" style={{ color: '#666' }}>Nous contacter</Link>
        </div>
      </div>
    </div>
  )
}