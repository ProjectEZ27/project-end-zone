import Link from 'next/link'

// Dernière mise à jour du texte : à modifier à chaque changement
const DATE_MAJ = '25/11/2026'

export default function CGU() {
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
      <h1>Conditions générales d&apos;utilisation</h1>

      <h2>1. Objet</h2>
      <p>
        Project End Zone est un jeu de pronostics sur les matchs de football américain, gratuit et ouvert à
        tous, accessible sur le site projectendzone.fr et dans les applications mobiles iPhone et Android.
        Aucune mise n&apos;est demandée, aucun achat n&apos;est proposé et aucun gain en argent n&apos;est
        offert : ce n&apos;est pas un site de paris sportifs.
      </p>
      <p>Créer un compte vaut acceptation des présentes conditions.</p>

      <h2>2. Compte</h2>
      <p>
        L&apos;inscription est réservée aux personnes âgées d&apos;au moins 16 ans. Chaque joueur
        ne peut avoir qu&apos;un seul compte, qu&apos;il utilise personnellement. Il est responsable de la
        confidentialité de son mot de passe.
      </p>

      <h2>3. Fair-play</h2>
      <p>
        Chaque joueur s&apos;engage à jouer de bonne foi. Sont interdits : les comptes multiples, l&apos;usage
        de robots ou de programmes automatiques, l&apos;exploitation d&apos;une faille technique et toute
        tentative de fausser un classement.
      </p>

      <h2>4. Pseudos, photos et contenus</h2>
      <p>
        Le pseudo, la photo de profil, le nom et la photo d&apos;une ligue ne doivent rien contenir
        d&apos;injurieux, de haineux, de trompeur ou d&apos;illégal, ni l&apos;image d&apos;une personne sans
        son accord. Le joueur garantit qu&apos;il a le droit d&apos;utiliser les photos qu&apos;il envoie. Les
        photos sont vérifiées avant d&apos;être affichées et peuvent être refusées.
      </p>

      <h2>5. Ligues</h2>
      <p>
        Le commissaire d&apos;une ligue accepte ou refuse les demandes d&apos;adhésion. Il peut exclure un
        membre en cas de manquement grave au fair-play, avec effet à partir de la saison suivante.
      </p>

      <h2>6. Lots</h2>
      <p>
        Lorsque des lots sont mis en jeu, leurs conditions d&apos;attribution sont fixées par le règlement du
        jeu, publié sur le site avant le début de la période concernée. Seul ce règlement fait foi.
        {/* Quand le règlement sera en ligne : ajouter ici un lien vers sa page */}
      </p>

      <h2>7. Suspension ou suppression d&apos;un compte</h2>
      <p>
        En cas de non-respect de ces conditions, l&apos;éditeur peut suspendre ou supprimer un compte, sans
        préavis en cas de triche, et retirer le joueur des classements et de l&apos;attribution des lots.
      </p>
      <p>
        Chaque joueur peut supprimer son compte à tout moment depuis le bas de sa page Profil, ou le demander
        en écrivant à projectendzone27@gmail.com. Toutes les explications sont sur la page{' '}
        <Link href="/legal/supprimer-compte" style={lien}>Supprimer mon compte</Link>.
      </p>

      <h2>8. Résultats et disponibilité</h2>
      <p>
        Les scores proviennent de fournisseurs extérieurs. En cas d&apos;erreur ou de retard, l&apos;éditeur
        peut corriger un résultat après coup ; le classement est alors recalculé.
      </p>
      <p>
        Le site et les applications sont fournis en l&apos;état, sans garantie de disponibilité permanente.
        L&apos;éditeur ne peut pas être tenu responsable d&apos;une interruption du service ou d&apos;une
        perte de données.
      </p>

      <h2>9. Modification des conditions</h2>
      <p>
        Ces conditions peuvent évoluer. Les joueurs sont informés de toute modification importante par e-mail
        ou par une notification sur le site ou dans l&apos;application.
      </p>

      <h2>10. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français.</p>

      <p style={{ fontSize: 12, color: '#9fb0c9', marginTop: 32 }}>Dernière mise à jour : {DATE_MAJ}</p>
      <p style={{ fontSize: 13, marginTop: 8 }}>
        <Link href="/legal/mentions" style={lien}>Mentions légales</Link>{' · '}
        <Link href="/legal/cgu" style={lien}>Conditions d&apos;utilisation</Link>{' · '}
        <Link href="/legal/confidentialite" style={lien}>Confidentialité</Link>{' · '}
        <Link href="/legal/supprimer-compte" style={lien}>Supprimer mon compte</Link>
      </p>
      </div>
    </div>
  )
}