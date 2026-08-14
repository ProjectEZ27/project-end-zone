import { demanderReinitialisation } from './actions'

export default async function MotDePasseOublie({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; envoye?: string }>
}) {
  const params = await searchParams

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>Mot de passe oublié</h1>

      {params.envoye ? (
        <p style={{ marginTop: 16 }}>
          ✅ Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé. Vérifie ta boîte mail (et tes spams).
        </p>
      ) : (
        <>
          <p style={{ color: '#999', marginTop: 8 }}>
            Indique ton email, on t'enverra un lien pour choisir un nouveau mot de passe.
          </p>
          {params.error && (
            <p style={{ color: 'red', marginTop: 8 }}>{decodeURIComponent(params.error)}</p>
          )}
          <form style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required style={{ width: '100%', padding: 8 }} />
            </div>
            <button formAction={demanderReinitialisation} style={{ padding: 10, width: '100%' }}>
              Envoyer le lien
            </button>
          </form>
        </>
      )}

      <p style={{ marginTop: 12 }}>
        <a href="/login">Retour à la connexion</a>
      </p>
    </div>
  )
}