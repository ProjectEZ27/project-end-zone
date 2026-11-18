import Link from 'next/link'

// Dernière mise à jour du texte : à modifier à chaque changement
const DATE_MAJ = '18/11/2026'

export default function MentionsLegales() {
  const lien: React.CSSProperties = { color: '#E8544C' }
  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
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
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 100px', position: 'relative', lineHeight: 1.6 }}>
      <h1>Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>
        Le site projectendzone.fr est édité par Romain Beaurain.
        {/* À LA CRÉATION DE LA MICRO-ENTREPRISE, remplacer la ligne ci-dessus par :
            Romain Beaurain, entrepreneur individuel (EI) — [ADRESSE DE L'ENTREPRISE] —
            immatriculé sous le numéro [NUMÉRO SIREN] */}
      </p>
      <p>Directeur de la publication : Romain Beaurain</p>
      <p>Contact : projectendzone27@gmail.com</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc.<br />
        [ADRESSE ACTUELLE DE VERCEL À VÉRIFIER]<br />
        Site : vercel.com
      </p>
      <p>
        La base de données et les photos sont stockées par Supabase Inc. (région : [RÉGION SUPABASE]).
      </p>

      <h2>Un jeu gratuit, sans pari</h2>
      <p>
        Project End Zone est un jeu de pronostics gratuit. Aucune mise n&apos;est demandée et aucun gain en
        argent n&apos;est proposé. Ce n&apos;est pas un site de paris sportifs.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le nom, le logo, les textes et les visuels de Project End Zone appartiennent à leur éditeur et ne
        peuvent pas être réutilisés sans accord.
      </p>
      <p>
        Project End Zone est un projet indépendant, sans lien avec la NFL ni avec aucune ligue sportive
        officielle. Les noms des équipes et des compétitions appartiennent à leurs propriétaires respectifs et
        sont cités à titre informatif uniquement, sans utilisation des logos ou marques officielles.
      </p>

      <h2>Sources des résultats et des statistiques</h2>
      <p>
        Les scores et résultats proviennent de fournisseurs de données sportives extérieurs. Les statistiques
        du mode expert proviennent de nflverse (licence CC BY 4.0). Malgré le soin apporté, une erreur ou un
        retard reste possible.
      </p>

      <p style={{ fontSize: 12, color: '#9fb0c9', marginTop: 32 }}>Dernière mise à jour : {DATE_MAJ}</p>
      <p style={{ fontSize: 13, marginTop: 8 }}>
        <Link href="/legal/mentions" style={lien}>Mentions légales</Link>{' · '}
        <Link href="/legal/cgu" style={lien}>Conditions d&apos;utilisation</Link>{' · '}
        <Link href="/legal/confidentialite" style={lien}>Confidentialité</Link>
      </p>
      </div>
    </div>
  )
}