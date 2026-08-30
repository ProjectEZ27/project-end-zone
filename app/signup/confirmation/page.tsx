export default function ConfirmationPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
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
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '80px 24px 24px', textAlign: 'center', color: 'white' }}>
        <h1>Vérifie ta boîte mail 📬</h1>
        <p>On vient de t'envoyer un lien de confirmation. Clique dessus pour activer ton compte.</p>
      </div>
    </div>
  )
}