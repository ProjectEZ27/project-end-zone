import { definirNouveauMotDePasse } from './actions'
import PasswordInput from '../PasswordInput'

export default async function NouveauMotDePasse({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>Nouveau mot de passe</h1>
      <p style={{ color: '#999', marginTop: 8 }}>
        Choisis ton nouveau mot de passe.
      </p>
      {params.error && (
        <p style={{ color: 'red', marginTop: 8 }}>{decodeURIComponent(params.error)}</p>
      )}
      <form style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Nouveau mot de passe</label>
          <PasswordInput id="password" name="password" required minLength={6} />
        </div>
        <button formAction={definirNouveauMotDePasse} style={{ padding: 10, width: '100%' }}>
          Valider
        </button>
      </form>
    </div>
  )
}