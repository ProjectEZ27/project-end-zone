import Image from 'next/image'
import { urlPhoto } from '@/lib/photos'

interface UserAvatarProps {
  avatarId: number
  size?: number
  userName?: string
  clickable?: boolean
  onClick?: () => void
  photoChemin?: string | null
}

export default function UserAvatar({
  avatarId,
  size = 64,
  userName = `Avatar ${avatarId}`,
  clickable = false,
  onClick,
  photoChemin = null,
}: UserAvatarProps) {
  const validAvatarId = Math.max(1, Math.min(16, avatarId))

  return (
    <div
      style={{
        cursor: clickable ? 'pointer' : 'default',
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
}