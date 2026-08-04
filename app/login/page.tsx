import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>Connexion</h1>
      {params.error && (
        <p style={{ color: 'red' }}>{decodeURIComponent(params.error)}</p>
      )}
      <form>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required style={{ width: '100%', padding: 8 }} />
        </div>
        <button formAction={login} style={{ padding: 10, width: '100%' }}>
          Se connecter
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Pas encore de compte ? <a href="/signup">Inscris-toi</a>
      </p>
    </div>
  )
}