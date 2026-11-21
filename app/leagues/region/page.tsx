import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChoixRegion from '@/components/ChoixRegion'

export const dynamic = 'force-dynamic'

export default async function PageChoixRegion({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>
}) {
  const { erreur } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Région déjà choisie : on ne peut plus la changer
  const { data: profil } = await supabase.from('profiles').select('region').eq('id', user.id).maybeSingle()
  if (profil?.region) redirect('/leagues')

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
          background: 'linear-gradient(180deg, rgba(11,18,32,0.80) 0%, rgba(11,18,32,0.95) 100%)',
        }} />
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '64px 24px 100px', color: 'white' }}>
        <Link href="/leagues" style={{ color: '#9fb0c9', fontSize: 14, textDecoration: 'none' }}>← Mes ligues</Link>
        <h1 style={{ fontSize: 22, margin: '12px 0 16px', textAlign: 'center' }}>Ma région</h1>
        <ChoixRegion erreurServeur={erreur} />
      </div>
    </div>
  )
}