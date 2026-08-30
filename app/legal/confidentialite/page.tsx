export default function Confidentialite() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Bilan.webp)',
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
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 100px', position: 'relative' }}>
      <h1>Politique de confidentialité</h1>

      <h2>Données collectées</h2>
      <p>
        Project End Zone collecte uniquement les données nécessaires au fonctionnement du jeu :
        adresse e-mail, pseudo, équipe favorite (facultatif), et l'historique de tes pronostics.
      </p>

      <h2>Utilisation des données</h2>
      <p>
        Ces données servent exclusivement à faire fonctionner le jeu (authentification, classements,
        notifications par e-mail liées à tes ligues). Elles ne sont ni vendues, ni partagées avec
        des tiers à des fins commerciales.
      </p>

      <h2>Conservation</h2>
      <p>
        Tes données sont conservées tant que ton compte existe. Tu peux demander la suppression
        de ton compte à tout moment via les paramètres ou en contactant projectendzone27@gmail.com.
        La suppression entraîne l'anonymisation de tes scores historiques (pour préserver
        l'intégrité des classements passés).
      </p>

      <h2>Aucun tracking</h2>
      <p>
        Project End Zone n'utilise aucun cookie de tracking ni outil publicitaire. Aucun bandeau
        de consentement cookies n'est donc nécessaire.
      </p>
      </div>
    </div>
  )
}