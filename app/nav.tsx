'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TbHome, TbBallAmericanFootball, TbTrophy, TbUser, TbBook } from 'react-icons/tb'

const items = [
  { href: '/', label: 'Accueil', Icon: TbHome },
  { href: '/pronostics', label: 'Pronostics', Icon: TbBallAmericanFootball },
  { href: '/classement', label: 'Classement', Icon: TbTrophy },
  { href: '/profile', label: 'Profil', Icon: TbUser },
  { href: '/regles', label: 'Règles', Icon: TbBook },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        backgroundImage: 'linear-gradient(rgba(5,10,20,0.78), rgba(5,10,20,0.78)), url(/image.navbar/Fond-Nav.webp)',
        backgroundSize: '100% 100%, 100% 100%',
        backgroundPosition: 'center',
        borderTop: '1px solid #33415a',
        padding: '10px 0',
        zIndex: 100,
      }}
    >
      {items.map(({ href, label, Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            style={{
              textDecoration: 'none',
              textAlign: 'center',
              color: isActive ? '#f0c040' : 'rgba(255,255,255,0.65)',
            }}
          >
              <Icon size={20} style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }} />
            <div
              style={{
                fontSize: 10,
                marginTop: 2,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {label}
            </div>
            {isActive && (
              <div
                style={{
                  width: 20,
                  height: 2,
                  background: '#f0c040',
                  borderRadius: 2,
                  margin: '4px auto 0',
                }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}