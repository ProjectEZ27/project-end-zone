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
        backgroundColor: '#16233F',
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
            style={{
              textDecoration: 'none',
              textAlign: 'center',
              color: isActive ? 'white' : '#9fb0c9',
            }}
          >
            <Icon size={20} />
            <div
              style={{
                fontSize: 10,
                marginTop: 2,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                textDecoration: isActive ? 'underline' : 'none',
                textUnderlineOffset: 4,
              }}
            >
              {label}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}