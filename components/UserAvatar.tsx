import Image from 'next/image'
import { urlPhoto } from '@/lib/photos'
import AgrandirAuClic from './AgrandirAuClic'

interface UserAvatarProps {
  avatarId: number
  size?: number
  userName?: string
  clickable?: boolean
  onClick?: () => void
  photoChemin?: string | null
  // Un clic agrandit l'image. Pas de zoom quand l'image sert déjà de bouton, ni sur les petites icônes (moins de 40 px)
  zoom?: boolean
}

export default function UserAvatar({
  avatarId,
  size = 64,
  userName = `Avatar ${avatarId}`,
  clickable = false,
  onClick,
  photoChemin = null,
  zoom = true,
}: UserAvatarProps) {
  const validAvatarId = Math.max(1, Math.min(16, avatarId))
  const peutAgrandir = zoom && !clickable && !onClick && size >= 40

  const avatar = (
    <div
      style={{
        cursor: clickable ? 'pointer' : peutAgrandir ? 'pointer' : 'default',
        transition: clickable ? 'transform 0.2s, box-shadow 0.2s' : 'none',
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-block',
      }}
      onClick={onClick}
    >
      {photoChemin ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlPhoto(photoChemin)}
          alt={`Photo de ${userName}`}
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Image
          src={`/avatars/avatar_${validAvatarId}.png`}
          alt={`Avatar de ${userName}`}
          width={size}
          height={size}
          priority={size > 100}
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  )

  if (!peutAgrandir) return avatar

  return (
    <AgrandirAuClic
      src={photoChemin ? urlPhoto(photoChemin) : `/avatars/avatar_${validAvatarId}.png`}
      alt={photoChemin ? `Photo de ${userName}` : `Avatar de ${userName}`}
      rond={!photoChemin}
    >
      {avatar}
    </AgrandirAuClic>
  )
}