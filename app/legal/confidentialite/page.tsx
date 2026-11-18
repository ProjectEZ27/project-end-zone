import Link from 'next/link'

// Dernière mise à jour du texte : à modifier à chaque changement
const DATE_MAJ = '18/11/2026'

export default function Confidentialite() {
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
      <h1>Politique de confidentialité</h1>

      <h2>Qui est responsable de tes données</h2>
      <p>
        Romain Beaurain, éditeur de Project End Zone. Pour toute question ou demande :
        projectendzone27@gmail.com.
      </p>

      <h2>Les données collectées</h2>
      <ul>
        <li>Ton adresse e-mail et ton mot de passe (conservé sous forme chiffrée, illisible pour nous)</li>
        <li>Ton pseudo, ton avatar, ton équipe favorite et ta photo de profil si tu en envoies une</li>
        <li>Tes pronostics, tes scores, tes ligues et tes réactions</li>
        <li>Tes préférences (rappels, notifications, animations)</li>
        <li>Des données techniques de connexion, nécessaires à la sécurité du site</li>
      </ul>
      <p>
        Si tu gagnes un lot, nous te demanderons ton nom et une adresse postale, uniquement pour te
        l&apos;envoyer. Ces informations sont supprimées une fois le lot remis.
      </p>

      <h2>À quoi elles servent</h2>
      <p>
        Uniquement à faire fonctionner le jeu : connexion, pronostics, classements, ligues, notifications.
        Ces traitements sont nécessaires pour te fournir le service que tu as demandé en créant ton compte.
        Les e-mails de rappel ne sont envoyés que si tu les as activés dans tes préférences ; tu peux les
        couper à tout moment.
      </p>
      <p>Tes données ne sont ni vendues, ni utilisées pour de la publicité ciblée.</p>

      <h2>Ce que voient les autres joueurs</h2>
      <p>
        Ton pseudo, ton avatar ou ta photo, ton équipe favorite, tes scores et ton classement sont visibles
        par les autres joueurs. Tes pronostics ne sont visibles par les autres qu&apos;une fois le match
        commencé. Ton adresse e-mail n&apos;est jamais affichée.
      </p>

      <h2>Les prestataires techniques</h2>
      <p>Tes données sont hébergées et traitées, pour notre compte, par :</p>
      <ul>
        <li>Vercel Inc. (États-Unis) : hébergement du site et mesure d&apos;audience anonyme</li>
        <li>Supabase Inc. (États-Unis) : base de données et photos, stockées dans l&apos;Union européenne (Irlande)</li>
        <li>Resend (États-Unis) : envoi des e-mails</li>
      </ul>
      <p>
        Ces sociétés étant américaines, certaines données peuvent être transférées hors de l&apos;Union
        européenne. Ces transferts sont encadrés par les garanties prévues par la réglementation européenne
        (clauses contractuelles types ou cadre de protection des données UE–États-Unis).
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Tes données sont conservées tant que ton compte existe. Tu peux le supprimer toi-même à tout moment
        avec le lien « Supprimer mon compte » en bas de ta page Profil : ton compte et toutes tes données
        (pronostics, ligues, réactions, photo) sont alors effacés immédiatement. Tu peux aussi le demander en
        écrivant à projectendzone27@gmail.com : nous le faisons dans un délai d&apos;un mois.
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu peux à tout moment demander à consulter tes données, les faire corriger, les faire effacer, en
        obtenir une copie, ou t&apos;opposer à leur utilisation. Il suffit d&apos;écrire à
        projectendzone27@gmail.com : nous répondons dans un délai d&apos;un mois.
      </p>
      <p>
        Si tu estimes que tes droits ne sont pas respectés, tu peux adresser une réclamation à la CNIL
        (cnil.fr).
      </p>

      <h2>Âge minimum</h2>
      <p>Le site est réservé aux personnes âgées d&apos;au moins 15 ans.</p>

      <h2>Cookies</h2>
      <p>
        Project End Zone utilise uniquement les cookies indispensables à son fonctionnement (rester connecté,
        mémoriser tes réglages). Il n&apos;y a aucun cookie publicitaire. L&apos;audience du site (pages vues,
        pays, type d&apos;appareil) est mesurée avec Vercel Web Analytics, qui ne dépose aucun cookie et ne
        permet pas de t&apos;identifier.
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