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

  // Lecture des cookies du récap (sans attente de la base)
  const jar = await cookies()
  const idsLusParCookie = jar
    .getAll()
    .map((c) => c.name.match(/^recap_lu_(\d+)_(.+)$/))
    .filter((m): m is RegExpMatchArray => m !== null && m[2] === user.id)
    .map((m) => Number(m[1]))

  // Toutes les informations de la page sont lancées EN MÊME TEMPS, en plusieurs « fils » indépendants.
  // Chaque fil n'attend que ce dont il a vraiment besoin (ex. le classement attend la saison, pas le profil).
  const profileP = supabase.from('profiles').select('pseudo, equipe_favorite').eq('id', user.id).maybeSingle()
  const saisonIdP = supabase.from('saisons').select('id').eq('statut', 'en_cours').single().then((r) => r.data?.id as number | undefined)

  // Fil « équipe favorite »
  const infosEquipeP = profileP.then((r) =>
    r.data?.equipe_favorite ? infosMonEquipe(supabase, r.data.equipe_favorite) : { prochain: null, dernier: null }
  )

  // Fil « classement général » puis « mes ligues » (qui a besoin du classement pour mon rang)
  const classementP = saisonIdP.then((id) => (id ? calculerClassementSaison(supabase, id) : []))
  const mesLiguesP = chargerMesLigues(supabase, user.id, classementP)

  // Fil « récap animé de la semaine terminée »
  const recapP = saisonIdP.then((id) => (id ? trouverRecapAAfficher(supabase, user.id, id, idsLusParCookie) : null))

  // Fil « taux de réussite de la saison » (même logique que profile/page.tsx)
  const tauxP = saisonIdP.then(async (id) => {
    if (!id) return 0
    const { data: semainesSaison } = await supabase.from('semaines').select('id').eq('saison_id', id)
    const semaineIds = (semainesSaison ?? []).map((s) => s.id)
    if (semaineIds.length === 0) return 0
    const { data: matchsSaison } = await supabase
      .from('matchs')
      .select('id, statut, equipe_gagnante')
      .in('semaine_id', semaineIds)
    const matchIds = (matchsSaison ?? []).map((m) => m.id)
    const matchMap = new Map((matchsSaison ?? []).map((m) => [m.id, m]))
    if (matchIds.length === 0) return 0
    const { data: mesPronostics } = await supabase
      .from('pronostics')
      .select('match_id, equipe_choisie')
      .eq('utilisateur_id', user.id)
      .in('match_id', matchIds)
    const totalPronostics = (mesPronostics ?? []).filter((p) => matchMap.get(p.match_id)?.statut === 'termine').length
    const totalCorrects = (mesPronostics ?? []).filter((p) => {
      const m = matchMap.get(p.match_id)
      return m && m.statut === 'termine' && p.equipe_choisie === m.equipe_gagnante
    }).length
    return totalPronostics > 0 ? Math.round((totalCorrects / totalPronostics) * 100) : 0
  })

  // Fil « bandeau Pronostics de la semaine » — semaine dérivée du prochain match non terminé (même logique que Pronostics/Profil)
  const bandeauP = (async () => {
    const { data: prochainMatchGlobal } = await supabase
      .from('matchs')
      .select('semaine_id')
      .neq('statut', 'termine')
      .order('coup_envoi', { ascending: true })
      .limit(1)
      .maybeSingle()
    const { data: semaineActuelle } = prochainMatchGlobal
      ? await supabase.from('semaines').select('id, nom').eq('id', prochainMatchGlobal.semaine_id).single()
      : await supabase.from('semaines').select('id, nom').order('id', { ascending: false }).limit(1).single()
    if (!semaineActuelle) {
      return { semaineActuelle: null, nombreMatchsSemaine: 0, mesPronosFaits: 0, prochainVerrouillage: null as string | null }
    }
    // Une seule lecture des matchs de la semaine : nombre, identifiants et prochain coup d'envoi
    const { data: matchsSemaine } = await supabase
      .from('matchs')
      .select('id, statut, coup_envoi')
      .eq('semaine_id', semaineActuelle.id)
    const liste = matchsSemaine ?? []
    const aVenir = liste
      .filter((m) => m.statut === 'a_venir')
      .map((m) => m.coup_envoi as string)
      .sort()
    let mesPronosFaits = 0
    if (liste.length > 0) {
      const { count } = await supabase
        .from('pronostics')
        .select('id', { count: 'exact', head: true })
        .eq('utilisateur_id', user.id)
        .in('match_id', liste.map((m) => m.id))
      mesPronosFaits = count ?? 0
    }
    return {
      semaineActuelle: semaineActuelle as { id: number; nom: string },
      nombreMatchsSemaine: liste.length,
      mesPronosFaits,
      prochainVerrouillage: aVenir[0] ?? null,
    }
  })()

  // Fil « Tribunal » : notification si le tribunal est mis en avant
  const tribunalP = tribunalActuel(supabase).then(async (t) => {
    if (t?.enVedette) await notifierTribunal(supabase, user.id, t)
    return t
  })

  const [
    profileResult,
    annoncesResult,
    tribunal,
    derniereSemaine,
    infosEquipe,
    saisonActuelleId,
    classementSaison,
    mesLigues,
    recap,
    tauxReussite,
    bandeau,
  ] = await Promise.all([
    profileP,
    supabase.from('annonces').select('id, titre, message, date_fin').eq('actif', true).order('id', { ascending: false }).limit(5),
    tribunalP,
    maDerniereSemaine(supabase, user.id),
    infosEquipeP,
    saisonIdP,
    classementP,
    mesLiguesP,
    recapP,
    tauxP,
    bandeauP,
  ])

  const profile = profileResult.data
  if (!profile) {
    redirect('/onboarding')
  }

  const annonceActive = (annoncesResult.data ?? []).find(
    (a) => !a.date_fin || new Date(a.date_fin) > new Date()
  ) ?? null

  const vedette = tribunal?.enVedette === true
  const animes: number[] = Array.isArray(user.user_metadata?.recaps_animes) ? user.user_metadata.recaps_animes : []

  // Ligues affichées sur l'accueil : les 3 épinglées, sinon les 3 premières
  const epinglees = mesLigues.filter((l) => l.epingle !== null).sort((a, b) => a.epingle! - b.epingle!)
  const liguesAccueil = (epinglees.length > 0 ? epinglees : mesLigues.filter((l) => !l.masquee)).slice(0, 3)

  // Classement général (toutes ligues confondues, ou sans ligue = tous les joueurs de la saison)
  const totalJoueursClassement = classementSaison.length
  const monIndexClassement = classementSaison.findIndex(j => j.utilisateur_id === user.id)
  const monRangGeneral = monIndexClassement >= 0 ? monIndexClassement + 1 : null
  const mesPointsSaison = monIndexClassement >= 0 ? classementSaison[monIndexClassement].score_saison : 0

  const { semaineActuelle, nombreMatchsSemaine, mesPronosFaits, prochainVerrouillage } = bandeau

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