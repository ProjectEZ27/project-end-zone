import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TbChevronRight, TbLock } from 'react-icons/tb'
import { chargerClassementRegions, formaterMoyenne, raisonNonActif, MAX_PRONOS_RATES } from '@/lib/classementRegions'

export const dynamic = 'force-dynamic'

const fond = (
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
)

const pastille = (actif: boolean): React.CSSProperties => ({
  padding: '7px 16px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 700,
  textDecoration: 'none',
  background: actif ? 'rgba(200,53,46,0.2)' : 'rgba(255,255,255,0.04)',
  border: actif ? '1px solid rgba(200,53,46,0.6)' : '1px solid rgba(255,255,255,0.15)',
  color: actif ? 'white' : 'rgba(255,255,255,0.7)',
})

export default async function ClassementRegions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: monProfil } = await supabase.from('profiles').select('region').eq('id', user.id).maybeSingle()
  const maRegion = monProfil?.region ?? null

  const entete = (
    <>
      <h1 style={{ fontSize: 20, fontWeight: 700, textShadow: '0 0 18px rgba(200,53,46,0.65)' }}>Classement des régions</h1>
      <p style={{ fontSize: 12, color: '#9fb0c9', marginTop: 4, marginBottom: 16 }}>Saison 2026-2027</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        <Link href="/classement" style={pastille(false)}>Général</Link>
        <Link href="/classement/regions" style={pastille(true)}>Régions</Link>
      </div>
    </>
  )

  // Verrouillé tant que le joueur n'a pas choisi sa région (sinon on changerait de région pour rejoindre la gagnante)
  if (!maRegion) {
    return (
      <div style={{ position: 'relative', minHeight: '100dvh' }}>
        {fond}
        <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center', color: 'white' }}>
          {entete}
          <div style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, padding: '28px 18px' }}>
            <TbLock size={26} color="#9fb0c9" />
            <p style={{ fontSize: 16, fontWeight: 600, margin: '10px 0 6px' }}>Classement des régions verrouillé</p>
            <p style={{ fontSize: 14, color: '#9fb0c9', margin: '0 0 16px', lineHeight: 1.5 }}>
              Choisis ta région pour y accéder. Ce choix est définitif pour la saison.
            </p>
            <Link
              href="/leagues/region"
              style={{ display: 'inline-block', padding: '11px 20px', borderRadius: 8, background: '#C8352E', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
            >
              Choisir ma région
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { data: saison } = await supabase.from('saisons').select('id').eq('statut', 'en_cours').single()
  if (!saison) {
    return (
      <div style={{ position: 'relative', minHeight: '100dvh' }}>
        {fond}
        <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center', color: 'white' }}>
          {entete}
          <p>Aucune saison en cours pour le moment.</p>
        </div>
      </div>
    )
  }

  const { regions, statuts } = await chargerClassementRegions(supabase, saison.id)
  const moi = statuts.get(user.id)
  const raison = moi && !moi.actif ? raisonNonActif(moi) : ''

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      {fond}
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center', color: 'white' }}>
        {entete}

        {moi && (
          <div style={{
            textAlign: 'left',
            fontSize: 13,
            lineHeight: 1.5,
            padding: 12,
            borderRadius: 8,
            marginBottom: 14,
            background: moi.actif ? 'rgba(78,232,146,0.12)' : 'rgba(255,193,7,0.12)',
            border: moi.actif ? '1px solid rgba(78,232,146,0.4)' : '1px solid rgba(255,193,7,0.4)',
            color: moi.actif ? '#4ee892' : '#ffc107',
          }}>
            {moi.actif
              ? 'Tu comptes dans la moyenne de ta région.'
              : `Tu ne comptes pas dans la moyenne de ta région${raison ? ` : ${raison}` : ''}. Tu restes dans ta ligue.`}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {regions.map((r, i) => {
            const classee = r.actifs.length > 0
            const rang = classee ? regions.filter((x) => x.actifs.length > 0).indexOf(r) + 1 : null
            const mienne = r.code === maRegion
            return (
              <Link
                key={r.code}
                href={`/classement/regions/${r.code}`}
                prefetch={false}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: mienne ? '#22160e' : '#16233F',
                  border: `1px solid ${mienne ? '#C8352E' : '#33415a'}`,
                  borderRadius: 10,
                  padding: '8px 12px',
                  textDecoration: 'none',
                  color: 'white',
                  opacity: classee ? 1 : 0.6,
                }}
              >
                <span style={{ width: 20, fontSize: 13, fontWeight: 700, color: '#7a8aa5' }}>{rang ?? '–'}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/badges-regions/${r.code}.png`} alt="" width={44} height={44} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.nom} {mienne && <span style={{ color: '#E8544C', fontSize: 10, fontWeight: 700 }}>(MA RÉGION)</span>}
                  </div>
                  <div style={{ fontSize: 10, color: '#9fb0c9' }}>
                    {r.actifs.length} joueur{r.actifs.length > 1 ? 's' : ''} actif{r.actifs.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{classee ? formaterMoyenne(r.moyenne) : '–'}</div>
                  <div style={{ fontSize: 10, color: '#9fb0c9' }}>pts moy.</div>
                </div>
                <TbChevronRight size={16} color="#7a8aa5" />
              </Link>
            )
          })}
        </div>

        <p style={{ fontSize: 11, color: '#7a8aa5', marginTop: 16, lineHeight: 1.6, textAlign: 'left' }}>
          Classement à la moyenne de points par joueur actif. Un joueur est actif s'il a pronostiqué dès la Week 1,
          n'a pas raté plus de {MAX_PRONOS_RATES} pronostics et n'en a raté aucun en playoffs.
        </p>
      </div>
    </div>
  )
}