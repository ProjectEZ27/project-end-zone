import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculerClassementSaison } from '@/lib/scoring'
import { trouverSemaineReference, calculerDeltas } from '@/lib/mouvements'
import Link from 'next/link'
import UserAvatar from '@/components/UserAvatar'
import TeamStripe, { largeurBandes } from '@/components/TeamStripe'
import MouvementFleche from '@/components/MouvementFleche'
import { TbChevronRight } from 'react-icons/tb'
import ChoixLigueClassement from '@/components/ChoixLigueClassement'
import { liguesPourMenu } from '@/lib/accueil'
import { nomRegion } from '@/lib/regions'
 
const TAILLE_PAGE = 50
const HAUTEUR_LIGNE = 67
 
export default async function Classement({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; ligue?: string }>
}) {
  const { page: pageParam, ligue: ligueParam } = await searchParams
  const pageActuelle = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
 
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
 
  if (!user) {
    redirect('/login')
  }
 
  // Lectures sans dépendance : lancées en même temps
  const [{ data: saison }, { data: adhesions }, { data: monProfil }, { data: adhesionsLigue }] = await Promise.all([
    supabase.from('saisons').select('*').eq('statut', 'en_cours').single(),
    supabase
      .from('adhesions')
      .select('ligue_id, epingle, masquee, ligues(id, nom)')
      .eq('utilisateur_id', user.id)
      .eq('statut', 'actif'),
    // Animation du mardi : préférence du joueur
    supabase.from('profiles').select('intro_animation').eq('id', user.id).maybeSingle(),
    // Membres de la ligue demandée (utilisés seulement si le joueur en fait bien partie, vérifié plus bas)
    ligueParam && /^\d+$/.test(ligueParam)
      ? supabase.from('adhesions').select('utilisateur_id').eq('ligue_id', Number(ligueParam)).eq('statut', 'actif')
      : Promise.resolve({ data: null as { utilisateur_id: string }[] | null }),
  ])
 
  const liguesBrutes = (adhesions ?? [])
    .filter((a: any) => a.ligues)
    .map((a: any) => ({ ...a.ligues, epingle: a.epingle ?? null, masquee: a.masquee === true }))
 
  const mesLigues = Array.from(
    new Map(liguesBrutes.map((l: any) => [l.id, l])).values()
  ) as { id: number; nom: string; epingle: number | null; masquee: boolean }[]
 
  const ligueSelectionnee = ligueParam
    ? mesLigues.find((l) => String(l.id) === ligueParam) ?? null
    : null
 
  if (!saison) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🏈 Classement général</h1>
        <p>Aucune saison en cours pour le moment.</p>
      </div>
    )
  }
 
  // Deux fils en parallèle :
  //  - le classement actuel, puis les profils (photos, avatars) des joueurs classés ;
  //  - la semaine de référence, puis le classement d'avant (pour les flèches de progression).
  const classementEtProfilsP = calculerClassementSaison(supabase, saison.id).then(async (classementComplet) => {
    const ids = classementComplet.map((j) => j.utilisateur_id)
    const { data: profils } = ids.length > 0
      ? await supabase.from('profiles').select('id, avatar_id, photo_chemin, equipe_favorite, region').in('id', ids)
      : { data: [] as any[] }
    return { classementComplet, profils }
  })
  const referenceP = trouverSemaineReference(supabase, saison.id).then(async (semaineRef) => ({
    semaineRef,
    avantComplet: semaineRef ? await calculerClassementSaison(supabase, saison.id, { avantSemaineId: semaineRef.id }) : null,
  }))
  const [{ classementComplet, profils }, { semaineRef, avantComplet }] = await Promise.all([classementEtProfilsP, referenceP])
 
  let membresLigueIds: Set<string> | null = null
  let classement = classementComplet
  if (ligueSelectionnee) {
    const membres = new Set((adhesionsLigue ?? []).map((a) => a.utilisateur_id))
    membresLigueIds = membres
    classement = classementComplet.filter((j) => membres.has(j.utilisateur_id))
  }
 
  // Flèches : places gagnées ou perdues depuis le début de la semaine en cours
  const membresFiltre = membresLigueIds
  let deltas = new Map<string, number>()
  if (semaineRef && avantComplet) {
    const avantFiltre = avantComplet.filter((j) => membresFiltre === null || membresFiltre.has(j.utilisateur_id))
    deltas = calculerDeltas(
      classement.map((j) => j.utilisateur_id),
      avantFiltre.map((j) => j.utilisateur_id)
    )
  }
 
  // Animation du mardi : seulement si la semaine est complète et si le joueur n'a pas désactivé les animations
  const animationsActives = monProfil?.intro_animation !== false
  const animer = !!semaineRef?.terminee && animationsActives
  const scope = ligueSelectionnee ? `ligue-${ligueSelectionnee.id}` : 'general'
  const cleAnimation = `pez-mvt-${user.id}-${scope}-${semaineRef?.id ?? 0}`
 
  const avatarMap = new Map((profils ?? []).map((p) => [p.id, p.avatar_id ?? 1]))
  const photoMap = new Map((profils ?? []).map((p) => [p.id, p.photo_chemin ?? null]))
  const equipeMap = new Map((profils ?? []).map((p) => [p.id, p.equipe_favorite ?? null]))
  const regionMap = new Map((profils ?? []).map((p) => [p.id, nomRegion(p.region)]))
 
  const totalPages = Math.max(1, Math.ceil(classement.length / TAILLE_PAGE))
  const pageCorrigee = Math.min(pageActuelle, totalPages)
  const debutPage = (pageCorrigee - 1) * TAILLE_PAGE
  const classementPage = classement.slice(debutPage, debutPage + TAILLE_PAGE)
 
  const monIndex = classement.findIndex((j) => j.utilisateur_id === user.id)
  const monRang = monIndex >= 0 ? monIndex + 1 : null
  const jeSuisSurCettePage = monRang !== null && monRang > debutPage && monRang <= debutPage + TAILLE_PAGE
  const jeSuisHorsPage = monRang !== null && !jeSuisSurCettePage
 
  const construireUrlPage = (p: number) => {
    const params = new URLSearchParams()
    if (ligueSelectionnee) params.set('ligue', String(ligueSelectionnee.id))
    params.set('page', String(p))
    return `/classement?${params.toString()}`
  }
 
  const styleBordure = (rang: number) => {
    if (rang === 1) return '#EF9F27'
    if (rang === 2) return '#B9C1CC'
    if (rang === 3) return '#B5651D'
    return '#33415a'
  }
  const styleChiffre = (rang: number) => {
    if (rang === 1) return '#EF9F27'
    if (rang === 2) return '#B9C1CC'
    if (rang === 3) return '#CD8B5C'
    return '#7a8aa5'
  }
 
  const LigneJoueur = ({ joueur, rang, moi }: { joueur: typeof classement[number]; rang: number; moi: boolean }) => {
    const equipe = equipeMap.get(joueur.utilisateur_id) ?? null
    const paddingDroite = equipe ? largeurBandes(HAUTEUR_LIGNE) + 8 : 12
    const delta = deltas.get(joueur.utilisateur_id) ?? 0
    return (
      <Link
        href={`/joueur/${joueur.utilisateur_id}`}
        prefetch={false}
        style={{
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          height: HAUTEUR_LIGNE,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: moi ? '#22160e' : '#16233F',
          border: `1px solid ${moi ? '#C8352E' : styleBordure(rang)}`,
          borderRadius: 10,
          padding: `0 ${paddingDroite}px 0 12px`,
          textDecoration: 'none',
          color: 'white',
        }}
      >
        <TeamStripe team={equipe} rowHeight={HAUTEUR_LIGNE} />
        <span style={{ fontSize: 13, fontWeight: 700, color: moi ? '#E8544C' : styleChiffre(rang), width: 20 }}>
          {rang}
        </span>
        <UserAvatar avatarId={avatarMap.get(joueur.utilisateur_id) ?? 1} size={45} photoChemin={photoMap.get(joueur.utilisateur_id) ?? null} />
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {joueur.pseudo} {moi && <span style={{ color: '#E8544C', fontSize: 10, fontWeight: 700 }}>(TOI)</span>}
          </div>
          <div style={{ fontSize: 10, color: '#9fb0c9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {joueur.score_saison} pts{regionMap.get(joueur.utilisateur_id) ? ` · ${regionMap.get(joueur.utilisateur_id)}` : ''}
          </div>
        </div>
        {delta !== 0 && (
          <MouvementFleche delta={delta} moi={moi} cleAnimation={cleAnimation} animer={animer} />
        )}
        <TbChevronRight size={16} color={moi ? '#E8544C' : '#7a8aa5'} />
      </Link>
    )
  }
 
  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Classment.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>
 
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center', color: 'white' }}>
        <h1 style={{
          fontSize: 20,
          fontWeight: 700,
          textShadow: '0 0 18px rgba(200,53,46,0.65)',
        }}>
          {ligueSelectionnee ? `Classement — ${ligueSelectionnee.nom}` : 'Classement général'}
        </h1>
        <p style={{ fontSize: 12, color: '#9fb0c9', marginTop: 4, marginBottom: 16 }}>Saison 2026-2027</p>
 
        {(
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <Link
              href="/classement"
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                background: !ligueSelectionnee ? 'rgba(200,53,46,0.2)' : 'rgba(255,255,255,0.04)',
                border: !ligueSelectionnee ? '1px solid rgba(200,53,46,0.6)' : '1px solid rgba(255,255,255,0.15)',
                color: !ligueSelectionnee ? 'white' : 'rgba(255,255,255,0.7)',
              }}
            >
              Général
            </Link>
            {mesLigues.length > 0 && (
              <ChoixLigueClassement
                ligues={liguesPourMenu(mesLigues, ligueSelectionnee?.id ?? null)}
                ligueActuelleId={ligueSelectionnee?.id ?? null}
              />
            )}
            <Link
              href="/classement/regions"
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Régions
            </Link>
          </div>
        )}
 
        {classement.length === 0 ? (
          <p>Aucun résultat pour le moment.</p>
        ) : (
          <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {classementPage.map((joueur, index) => (
              <LigneJoueur
                key={joueur.utilisateur_id}
                joueur={joueur}
                rang={debutPage + index + 1}
                moi={joueur.utilisateur_id === user.id}
              />
            ))}
 
            {jeSuisHorsPage && monRang !== null && (
              <>
                <div style={{ textAlign: 'center', color: '#5a6b85', fontSize: 14, letterSpacing: 3, margin: '4px 0' }}>
                  •••
                </div>
                <LigneJoueur
                  joueur={classement[monIndex]}
                  rang={monRang}
                  moi={true}
                />
              </>
            )}
          </div>
 
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={construireUrlPage(p)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    color: 'white',
                    backgroundColor: p === pageCorrigee ? '#C8352E' : '#16233F',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  )
}