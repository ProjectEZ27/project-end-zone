import { signup } from '../login/actions'
import PasswordInput from '../PasswordInput'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>Créer un compte</h1>
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
          <PasswordInput id="password" name="password" required minLength={6} />
        </div>
        <button formAction={signup} style={{ padding: 10, width: '100%' }}>
          Créer mon compte
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Déjà un compte ? <a href="/login">Connecte-toi</a>
      </p>
    </div>
  )
}