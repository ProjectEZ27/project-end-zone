import Image from 'next/image'

interface UserAvatarProps {
  avatarId: number
  size?: number
  userName?: string
  clickable?: boolean
  onClick?: () => void
}

export default function UserAvatar({
  avatarId,
  size = 64,
  userName = `Avatar ${avatarId}`,
  clickable = false,
  onClick
}: UserAvatarProps) {
  const validAvatarId = Math.max(1, Math.min(16, avatarId))

  return (
    <div
      style={{
        cursor: clickable ? 'pointer' : 'default',
        transition: clickable ? 'transform 0.2s, box-shadow 0.2s' : 'none',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1px solid rgba(200, 53, 46, 0.2)',
        display: 'inline-block'
      }}
      onClick={onClick}
    >
      <Image
        src={`/avatars/avatar_${validAvatarId}.png`}
        alt={`Avatar de ${userName}`}
        width={size}
        height={size}
        priority={size > 100}
        style={{
          width: size,
          height: size,
          objectFit: 'cover'
        }}
      />
    </div>
  )
}