import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculerClassementSaison } from '@/lib/scoring'
import Link from 'next/link'
import UserAvatar from '@/components/UserAvatar'
import { TbChevronRight } from 'react-icons/tb'

export default async function Classement() {
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

  if (!saison) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>🏈 Classement général</h1>
        <p>Aucune saison en cours pour le moment.</p>
      </div>
    )
  }

  const classement = await calculerClassementSaison(supabase, saison.id)

  const userIds = classement.map((j) => j.utilisateur_id)
  const { data: profils } = userIds.length > 0
    ? await supabase.from('profiles').select('id, avatar_id').in('id', userIds)
    : { data: [] as any[] }
  const avatarMap = new Map((profils ?? []).map((p) => [p.id, p.avatar_id ?? 1]))

  const top10 = classement.slice(0, 10)
  const monIndex = classement.findIndex((j) => j.utilisateur_id === user.id)
  const monRang = monIndex >= 0 ? monIndex + 1 : null
  const jeSuisHorsTop10 = monRang !== null && monRang > 10

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
          Classement général
        </h1>
        <p style={{ fontSize: 12, color: '#9fb0c9', marginTop: 4, marginBottom: 20 }}>Saison 2026-2027</p>

        {classement.length === 0 ? (
          <p>Aucun résultat pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {top10.map((joueur, index) => (
              <LigneJoueur
                key={joueur.utilisateur_id}
                joueur={joueur}
                rang={index + 1}
                moi={joueur.utilisateur_id === user.id}
              />
            ))}

            {jeSuisHorsTop10 && monRang !== null && (
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
        )}
      </div>
    </div>
  )
}