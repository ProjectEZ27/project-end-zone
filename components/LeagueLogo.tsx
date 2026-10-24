import Image from 'next/image'
import { urlPhoto } from '@/lib/photos'

interface LeagueLogoProps {
  logoId: number
  size?: number
  leagueName?: string
  clickable?: boolean
  onClick?: () => void
  photoChemin?: string | null
}

export default function LeagueLogo({
  logoId,
  size = 64,
  leagueName = `Ligue ${logoId}`,
  clickable = false,
  onClick,
  photoChemin = null,
}: LeagueLogoProps) {
  const validLogoId = Math.max(1, Math.min(15, logoId))

  return (
    <div
      style={{
        cursor: clickable ? 'pointer' : 'default',
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
}