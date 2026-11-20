import Link from 'next/link'
import styles from './LandingPage.module.css'

// Page d'accueil des visiteurs (non connectés).
// Images et vidéo : dossier public/landing/
export default function LandingPage() {
  return (
    <>
      <div className={styles.fond} />
      <div className={styles.page}>
        <header className={styles.nav}>
          <div className={styles.wrap}>
            <img src="/landing/logo.png" alt="Project End Zone" />
          </div>
        </header>

        <div className={styles.hero}>
          <div className={styles.wrap}>
            <div className={styles.txt}>
              <h1>Le jeu de pronostics NFL.<br /><em>Affronte tes potes, match après match.</em></h1>
              <p className={styles.sous}>Chaque semaine, choisis le vainqueur de chaque match et grimpe au classement, seul ou avec ta ligue d&apos;amis. Toute la saison, jusqu&apos;au dernier match.</p>
              <div className={styles.cta}>
                <Link className={`${styles.btn} ${styles.plein}`} href="/signup">Créer mon compte</Link>
                <Link className={`${styles.btn} ${styles.contour}`} href="/login">J&apos;ai déjà un compte</Link>
              </div>
              <ul className={styles.puces}><li>Sans mise d&apos;argent</li><li>Un geste par match</li></ul>
            </div>
            <div className={styles.tel}>
              <img src="/landing/pronos.jpg" alt="" />
              <video src="/landing/teaser.mp4" poster="/landing/pronos.jpg" autoPlay muted loop playsInline aria-label="Présentation du jeu en vidéo" />
            </div>
          </div>
        </div>

        <section className={styles.bloc}>
          <div className={styles.wrap}>
            <p className={styles.sur}>Comment ça marche</p>
            <h2>Trois étapes, et tu joues</h2>
            <div className={styles.etapes}>
              <div className={styles.etape}><span className={styles.n}>1</span><h3>Pronostique</h3><p>Crée ton compte gratuit et, avant chaque match, touche l&apos;équipe que tu vois gagner. Ton choix se verrouille au coup d&apos;envoi.</p><img src="/landing/pronos.jpg" alt="Écran des pronostics" loading="lazy" /></div>
              <div className={styles.etape}><span className={styles.n}>2</span><h3>Grimpe au classement</h3><p>Chaque bon pronostic rapporte des points au classement général, face à tous les joueurs.</p><img src="/landing/classement.jpg" alt="Écran du classement" loading="lazy" /></div>
              <div className={styles.etape}><span className={styles.n}>3</span><h3>Défie tes amis</h3><p>Si tu veux, crée une ligue ou rejoins celle de tes amis avec un simple lien. Ce n&apos;est pas obligatoire pour jouer.</p><img src="/landing/ligues.jpg" alt="Écran des ligues" loading="lazy" /></div>
            </div>
          </div>
        </section>

        <section className={`${styles.bloc} ${styles.bande}`}>
          <div className={styles.wrap}>
            <p className={styles.sur}>Ce qui rend le jeu vivant</p>
            <h2>Bien plus qu&apos;une grille de pronos</h2>
            <div className={styles.atouts}>
              <div className={styles.atout}><p className={styles.jour}>Chaque mardi</p><h3>Le Tribunal</h3><p>Le journal de ta ligue : qui a eu du flair, qui a chuté, et la phrase de la semaine.</p></div>
              <div className={styles.atout}><p className={styles.jour}>Pour les audacieux</p><h3>Seul contre tous</h3><p>Tu es le seul à croire en une équipe et elle gagne ? Toute la ligue le saura.</p></div>
              <div className={styles.atout}><p className={styles.jour}>Après chaque journée</p><h3>Le récap de ta semaine</h3><p>Tes bons pronos, tes points et ta place, résumés en quelques secondes.</p></div>
              <div className={styles.atout}><p className={styles.jour}>Pour aller plus loin</p><h3>Le mode expert</h3><p>Les forces et faiblesses de chaque équipe, pour affiner tes pronostics.</p></div>
            </div>
          </div>
        </section>

        <section className={styles.bloc}>
          <div className={styles.wrap}>
            <p className={styles.sur}>Questions fréquentes</p>
            <h2>Avant de te lancer</h2>
            <div className={styles.faq}>
              <details><summary>C&apos;est vraiment gratuit ?</summary><p>Oui. Créer un compte et pronostiquer toute la saison ne coûte rien, que tu joues seul ou dans une ligue. Aucune carte bancaire n&apos;est demandée pour jouer.</p></details>
              <details><summary>Y a-t-il de l&apos;argent en jeu ?</summary><p>Non. Project End Zone n&apos;est pas un site de paris : on ne mise rien et on ne gagne pas d&apos;argent. On joue pour le classement, l&apos;honneur, et pour chambrer ses amis toute la saison.</p></details>
              <details><summary>Faut-il bien connaître la NFL ?</summary><p>Non. Il suffit de choisir une équipe par match, celle que tu penses voir gagner. Le mode expert et les fiches de chaque équipe aident ceux qui veulent creuser, mais rien de tout ça n&apos;est obligatoire pour jouer.</p></details>
              <details><summary>Peut-on arriver en cours de saison ?</summary><p>Oui. Tu peux créer ton compte à tout moment et pronostiquer dès le prochain match, avec ou sans ligue. Tu ne rattrapes pas les points des semaines passées, mais rien ne t&apos;empêche de viser le haut du classement à partir de ton arrivée.</p></details>
              <details><summary>Qui voit mes pronostics ?</summary><p>Personne, avant le coup d&apos;envoi du match concerné. Une fois le match commencé, les autres joueurs de tes ligues peuvent voir ce que tu as choisi — jamais avant, pour que personne ne puisse copier.</p></details>
              <details><summary>Ça marche sur mobile ?</summary><p>Oui. Le site s&apos;utilise directement depuis le navigateur de ton téléphone, sans rien à installer et sans application à télécharger.</p></details>
              <details><summary>Quel est le lien avec la NFL ?</summary><p>Aucun. Project End Zone est un projet indépendant, créé par un passionné, qui n&apos;est ni affilié ni sponsorisé par la NFL ou l&apos;une de ses équipes.</p></details>
            </div>
          </div>
        </section>

        <section className={`${styles.bloc} ${styles.fin}`}>
          <div className={styles.wrap}>
            <h2>Le prochain match n&apos;attend pas</h2>
            <p>Crée ton compte et fais ton premier pronostic. Tes amis pourront te rejoindre ensuite.</p>
            <Link className={styles.btn} href="/signup">Créer mon compte</Link>
          </div>
        </section>

        <footer className={styles.pied}>
          <div className={styles.wrap}>
            <Link href="/legal/mentions">Mentions légales</Link>
            <Link href="/legal/confidentialite">Confidentialité</Link>
            <Link href="/legal/cgu">CGU</Link>
            <Link href="/contact">Nous contacter</Link>
            <span>Projet indépendant, sans lien avec la NFL. Écrans présentés avec des données de démonstration.</span>
          </div>
        </footer>
      </div>
    </>
  )
}