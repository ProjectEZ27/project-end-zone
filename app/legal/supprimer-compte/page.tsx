import Link from 'next/link'

// Dernière mise à jour du texte : à modifier à chaque changement
const DATE_MAJ = '25/11/2026'

export default function SupprimerCompte() {
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
        <h1>Supprimer mon compte</h1>
        <p>
          Cette page explique comment supprimer ton compte Project End Zone (site et appli iPhone ou Android)
          et ce qui est effacé.
        </p>

        <h2>Depuis l&apos;appli ou le site</h2>
        <ol>
          <li>Connecte-toi à ton compte.</li>
          <li>Ouvre l&apos;onglet <strong>Profil</strong>.</li>
          <li>Tout en bas de la page, appuie sur <strong>« Supprimer mon compte »</strong>.</li>
          <li>Écris <strong>SUPPRIMER</strong> pour confirmer. Ton compte est effacé immédiatement.</li>
        </ol>

        <h2>Par e-mail</h2>
        <p>
          Si tu ne peux plus te connecter, écris à projectendzone27@gmail.com depuis l&apos;adresse de ton
          compte, en indiquant ton pseudo. La suppression est faite dans un délai d&apos;un mois.
        </p>

        <h2>Ce qui est supprimé</h2>
        <ul>
          <li>Ton compte de connexion (adresse e-mail et mot de passe) et ton profil (pseudo, avatar, photo)</li>
          <li>Tes pronostics, tes pronostics spéciaux, tes scores et ta place dans les classements</li>
          <li>Tes adhésions aux ligues, tes réactions et tes notifications</li>
          <li>Les appareils enregistrés pour recevoir les notifications</li>
        </ul>
        <p>
          Si tu es commissaire d&apos;une ligue, le membre le plus ancien reprend ce rôle. Une ligue dont tu es
          le seul membre est supprimée avec sa photo. Rien n&apos;est conservé après la suppression.
        </p>

        <h2>In English</h2>
        <p>
          To delete your Project End Zone account: sign in, open the Profile tab, scroll to the bottom and tap
          &quot;Supprimer mon compte&quot;, then type SUPPRIMER to confirm. Your account and all associated data
          (profile, predictions, leagues, photos, notification tokens) are deleted immediately. You can also
          request deletion by email at projectendzone27@gmail.com.
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