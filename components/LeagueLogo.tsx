import Image from 'next/image'
import { urlPhoto } from '@/lib/photos'
import AgrandirAuClic from './AgrandirAuClic'

interface LeagueLogoProps {
  logoId: number
  size?: number
  leagueName?: string
  clickable?: boolean
  onClick?: () => void
  photoChemin?: string | null
  // Un clic agrandit l'image. Désactivé par défaut : seule la page d'une ligue le demande (zoom={true}).
  // Pas de zoom non plus quand l'image sert déjà de bouton, ni sur les petites icônes (moins de 40 px)
  zoom?: boolean
}

export default function LeagueLogo({
  logoId,
  size = 64,
  leagueName = `Ligue ${logoId}`,
  clickable = false,
  onClick,
  photoChemin = null,
  zoom = false,
}: LeagueLogoProps) {
  const validLogoId = Math.max(1, Math.min(15, logoId))
  const peutAgrandir = zoom && !clickable && !onClick && size >= 40

  const logo = (
    <div
      style={{
        cursor: clickable ? 'pointer' : peutAgrandir ? 'pointer' : 'default',
        transition: clickable ? 'transform 0.2s' : 'none',
        display: 'inline-block',
      }}
      onClick={onClick}
    >
      {photoChemin ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlPhoto(photoChemin)}
          alt={`Photo de ${leagueName}`}
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: size * 0.2, display: 'block' }}
        />
      ) : (
        <Image
          src={`/Logos%20ligue/Logo%20${validLogoId}.png`}
          alt={`Logo de ${leagueName}`}
          width={size}
          height={size}
          priority={size > 100}
          style={{
            width: size,
            height: size,
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  )

  if (!peutAgrandir) return logo

  return (
    <AgrandirAuClic
      src={photoChemin ? urlPhoto(photoChemin) : `/Logos%20ligue/Logo%20${validLogoId}.png`}
      alt={photoChemin ? `Photo de ${leagueName}` : `Logo de ${leagueName}`}
    >
      {logo}
    </AgrandirAuClic>
  )
}