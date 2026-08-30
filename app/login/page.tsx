import { login } from './actions'
import PasswordInput from '../PasswordInput'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams

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
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '80px 24px 100px', position: 'relative', color: 'white' }}>
      <h1>Connexion</h1>
      {params.error && (
        <p style={{ color: 'red' }}>{decodeURIComponent(params.error)}</p>
      )}
      <form>
        {params.next && <input type="hidden" name="next" value={params.next} />}
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Mot de passe</label>
          <PasswordInput id="password" name="password" required />
        </div>
        <button formAction={login} style={{ padding: 10, width: '100%' }}>
          Se connecter
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Pas encore de compte ? <a href={params.next ? `/signup?next=${encodeURIComponent(params.next)}` : '/signup'}>Inscris-toi</a>
      </p>
      <p style={{ marginTop: 8 }}>
        <a href="/mot-de-passe-oublie">Mot de passe oublié ?</a>
      </p>
      </div>
    </div>
  )
}