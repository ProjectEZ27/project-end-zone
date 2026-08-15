'use client'

export default function BoutonPartage({
  place,
  points,
  saison,
}: {
  place: number
  points: number
  saison: string
}) {
  async function partager() {
    const texte = `🏆 Je termine ${place}${place === 1 ? 'er' : 'e'} au classement Project End Zone (saison ${saison}) avec ${points} points ! Rejoins-moi la saison prochaine 🏈`

    if (navigator.share) {
      try {
        await navigator.share({ text: texte })
      } catch {
        // L'utilisateur a annulé le partage, rien à faire
      }
    } else {
      await navigator.clipboard.writeText(texte)
      alert('Texte copié dans le presse-papier !')
    }
  }

  return (
    <button
      onClick={partager}
      style={{
        padding: '10px 20px',
        marginTop: 16,
        backgroundColor: '#C8352E',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      📤 Partager mon bilan
    </button>
  )
}