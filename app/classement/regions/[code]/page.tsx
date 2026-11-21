import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { TbChevronRight } from 'react-icons/tb'
import UserAvatar from '@/components/UserAvatar'
import { REGIONS } from '@/lib/regions'
import { chargerClassementRegions, formaterMoyenne } from '@/lib/classementRegions'

export const dynamic = 'force-dynamic'

const TAILLE_MAX = 50

export default async function ClassementUneRegion({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const region = REGIONS.find((r) => r.code === code)
  if (!region) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Il faut avoir choisi sa région pour voir les classements des régions
  const { data: monProfil } = await supabase.from('profiles').select('region').eq('id', user.id).maybeSingle()
  if (!monProfil?.region) redirect('/classement/regions')

  const { data: saison } = await supabase.from('saisons').select('id').eq('statut', 'en_cours').single()
  const donnees = saison ? await chargerClassementRegions(supabase, saison.id) : null
  const stat = donnees?.regions.find((r) => r.code === code)
  const actifs = stat?.actifs ?? []
  const liste = actifs.slice(0, TAILLE_MAX)

  const couleurRang = (rang: number) => (rang === 1 ? '#EF9F27' : rang === 2 ? '#B9C1CC' : rang === 3 ? '#B5651D' : '#33415a')

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
        <div style={{ textAlign: 'left' }}>
          <Link href="/classement/regions" style={{ color: '#9fb0c9', fontSize: 14, textDecoration: 'none' }}>← Régions</Link>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/badges-regions/${region.code}.png`} alt={`Écusson ${region.nom}`} width={96} height={96} style={{ display: 'block', margin: '8px auto 6px' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{region.nom}</h1>
        <p style={{ fontSize: 12, color: '#9fb0c9', marginTop: 4, marginBottom: 18 }}>
          {actifs.length} joueur{actifs.length > 1 ? 's' : ''} actif{actifs.length > 1 ? 's' : ''}
          {actifs.length > 0 && stat ? ` · ${formaterMoyenne(stat.moyenne)} pts en moyenne` : ''}
        </p>

        {liste.length === 0 ? (
          <p style={{ color: '#9fb0c9', fontSize: 14 }}>Aucun joueur actif dans cette région pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {liste.map((j, i) => {
              const moi = j.utilisateur_id === user.id
              return (
                <Link
                  key={j.utilisateur_id}
                  href={`/joueur/${j.utilisateur_id}`}
                  prefetch={false}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    height: 62,
                    boxSizing: 'border-box',
                    background: moi ? '#22160e' : '#16233F',
                    border: `1px solid ${moi ? '#C8352E' : couleurRang(i + 1)}`,
                    borderRadius: 10,
                    padding: '0 12px',
                    textDecoration: 'none',
                    color: 'white',
                  }}
                >
                  <span style={{ width: 20, fontSize: 13, fontWeight: 700, color: moi ? '#E8544C' : couleurRang(i + 1) === '#33415a' ? '#7a8aa5' : couleurRang(i + 1) }}>{i + 1}</span>
                  <UserAvatar avatarId={j.avatar_id} size={42} photoChemin={j.photo_chemin} />
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {j.pseudo} {moi && <span style={{ color: '#E8544C', fontSize: 10, fontWeight: 700 }}>(TOI)</span>}
                    </div>
                    <div style={{ fontSize: 10, color: '#9fb0c9' }}>{j.score_saison} pts</div>
                  </div>
                  <TbChevronRight size={16} color="#7a8aa5" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}