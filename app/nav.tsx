'use client'
 
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TbHome, TbBallAmericanFootball, TbTrophy, TbUser, TbUsers } from 'react-icons/tb'
 
const items = [
  { href: '/', label: 'Accueil', Icon: TbHome },
  { href: '/pronostics', label: 'Pronostics', Icon: TbBallAmericanFootball },
  { href: '/leagues', label: 'Ligues', Icon: TbUsers },
  { href: '/classement', label: 'Classement', Icon: TbTrophy },
  { href: '/profile', label: 'Profil', Icon: TbUser },
]
 
export default function Nav() {
  const pathname = usePathname()
 
  return (
    <nav
      style={{
        // Barre arrondie qui flotte au-dessus de la barre de geste du téléphone
        position: 'fixed',
        bottom: 'max(10px, min(calc(var(--marge-bas) - 8px), 16px), min(calc(var(--marge-bas) + 4px), calc((var(--marge-bas) - 36px) * 6)))',
        left: 12,
        right: 12,
        maxWidth: 500,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: '#16233F',
        border: '1px solid #33415a',
        borderRadius: 28,
        padding: '9px 8px',
        zIndex: 100,
      }}
    >
      {items.map(({ href, label, Icon }) => {
        // « Ligues » reste allumé sur toutes les pages d'une ligue (/leagues/12, /leagues/12/classement…)
        const isActive = href === '/leagues' ? pathname.startsWith('/leagues') : pathname === href
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
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