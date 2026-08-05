import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('pseudo')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <h1>🏈 Project End Zone</h1>
      <p>Connecté en tant que : {user.email}</p>
      <p>Bienvenue, {profile.pseudo} !</p>
      <form action="/auth/logout" method="post">
        <button style={{ padding: 10, marginTop: 20 }}>Se déconnecter</button>
      </form>
    </div>
  )
}