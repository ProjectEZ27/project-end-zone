export default function MentionsLegales() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
         zIndex: -1,
        transform: 'translateZ(0)',
        transform: 'translateZ(0)',
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
      <h1>Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>
        Project End Zone est un site édité à titre personnel, sans activité commerciale,
        destiné à un usage entre amis dans le cadre d'un jeu de pronostics NFL.
      </p>
      <p>Contact : projectendzone27@gmail.com</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc.<br />
        340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Project End Zone n'est affilié à aucune ligue sportive officielle. Toute référence
        aux équipes ou compétitions est faite à titre informatif uniquement, sans utilisation
        des logos ou marques officielles.
      </p>
      </div>
    </div>
  )
}