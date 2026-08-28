export default function CGU() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Bilan.png)',
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
      <h1>Conditions Générales d'Utilisation</h1>

      <h2>Objet</h2>
      <p>
        Project End Zone est un jeu de pronostics sportifs gratuit, sans enjeu financier,
        réservé à un usage entre amis. Aucun pari sportif n'est proposé sur cette plateforme.
      </p>

      <h2>Fair-play</h2>
      <p>
        Chaque joueur s'engage à jouer de bonne foi. Toute tentative de triche ou de manipulation
        du système (comptes multiples, exploitation de failles techniques) est interdite.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Project End Zone est fourni "en l'état", sans garantie de disponibilité continue.
        L'éditeur ne saurait être tenu responsable d'une interruption de service ou d'une perte
        de données, notamment liée aux limitations techniques des services gratuits utilisés
        pour l'hébergement.
      </p>

      <h2>Exclusion d'un joueur</h2>
      <p>
        Le commissaire d'une ligue peut exclure un membre en cas de manquement grave au fair-play,
        avec effet à partir de la saison suivante.
      </p>

      <h2>Modification des CGU</h2>
      <p>
        Ces conditions peuvent évoluer. Les joueurs seront informés de toute modification
        substantielle par e-mail.
      </p>
      </div>
    </div>
  )
}