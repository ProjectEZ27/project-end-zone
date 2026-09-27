import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculerClassementSaison } from '@/lib/scoring'
import Link from 'next/link'
import UserAvatar from '@/components/UserAvatar'
import { TbChevronRight } from 'react-icons/tb'

const TAILLE_PAGE = 50

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

  const { data: saison } = await supabase
    .from('saisons')
    .select('*')
    .eq('statut', 'en_cours')
    .single()

  const { data: adhesions } = await supabase
    .from('adhesions')
    .select('ligue_id, ligues(id, nom)')
    .eq('utilisateur_id', user.id)
    .eq('statut', 'actif')

  const liguesBrutes = (adhesions ?? [])
    .map((a: any) => a.ligues)
    .filter(Boolean)

  const mesLigues = Array.from(
    new Map(liguesBrutes.map((l: any) => [l.id, l])).values()
  ) as { id: number; nom: string }[]

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

  const classementComplet = await calculerClassementSaison(supabase, saison.id)

  let classement = classementComplet
  if (ligueSelectionnee) {
    const { data: adhesionsLigue } = await supabase
      .from('adhesions')
      .select('utilisateur_id')
      .eq('ligue_id', ligueSelectionnee.id)
      .eq('statut', 'actif')

    const membresLigueIds = new Set((adhesionsLigue ?? []).map((a) => a.utilisateur_id))
    classement = classementComplet.filter((j) => membresLigueIds.has(j.utilisateur_id))
  }

  const userIds = classement.map((j) => j.utilisateur_id)
  const { data: profils } = userIds.length > 0
    ? await supabase.from('profiles').select('id, avatar_id').in('id', userIds)
    : { data: [] as any[] }
  const avatarMap = new Map((profils ?? []).map((p) => [p.id, p.avatar_id ?? 1]))

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

  const LigneJoueur = ({ joueur, rang, moi }: { joueur: typeof classement[number]; rang: number; moi: boolean }) => (
    <Link
      href={`/joueur/${joueur.utilisateur_id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: moi ? '#22160e' : '#16233F',
        border: `1px solid ${moi ? '#C8352E' : styleBordure(rang)}`,
        borderRadius: 10,
        padding: '10px 12px',
        textDecoration: 'none',
        color: 'white',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: moi ? '#E8544C' : styleChiffre(rang), width: 20 }}>
        {rang}
      </span>
      <UserAvatar avatarId={avatarMap.get(joueur.utilisateur_id) ?? 1} size={45} />
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>
          {joueur.pseudo} {moi && <span style={{ color: '#E8544C', fontSize: 10, fontWeight: 700 }}>(TOI)</span>}
        </div>
        <div style={{ fontSize: 10, color: '#9fb0c9' }}>{joueur.score_saison} pts</div>
      </div>
      <TbChevronRight size={16} color={moi ? '#E8544C' : '#7a8aa5'} />
    </Link>
  )

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

        {mesLigues.length > 0 && (
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
            {mesLigues.map((ligue) => {
              const actif = ligueSelectionnee?.id === ligue.id
              return (
                <Link
                  key={ligue.id}
                  href={`/classement?ligue=${ligue.id}`}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: actif ? 'rgba(200,53,46,0.2)' : 'rgba(255,255,255,0.04)',
                    border: actif ? '1px solid rgba(200,53,46,0.6)' : '1px solid rgba(255,255,255,0.15)',
                    color: actif ? 'white' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {ligue.nom}
                </Link>
              )
            })}
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