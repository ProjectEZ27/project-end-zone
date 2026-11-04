'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TbBell, TbClock, TbTrophy, TbUsers, TbPhoto, TbSpeakerphone, TbFilter, TbChecks, TbCheck } from 'react-icons/tb'

type Notif = {
  id: number
  type: string
  titre: string
  message: string | null
  lien: string | null
  lu: boolean
  created_at: string
}

const COULEUR = '#9fb0c9'
const FOND = 'rgba(255,255,255,0.07)'

const CATEGORIES: Record<string, { label: string; Icon: typeof TbBell; couleur: string; fond: string }> = {
  rappel: { label: 'Rappels', Icon: TbClock, couleur: COULEUR, fond: FOND },
  badge: { label: 'Badges', Icon: TbTrophy, couleur: COULEUR, fond: FOND },
  ligue: { label: 'Ligues', Icon: TbUsers, couleur: COULEUR, fond: FOND },
  photo: { label: 'Photos', Icon: TbPhoto, couleur: COULEUR, fond: FOND },
  site: { label: 'Générale', Icon: TbSpeakerphone, couleur: COULEUR, fond: FOND },
}

function ilYA(dateIso: string) {
  const minutes = Math.floor((Date.now() - new Date(dateIso).getTime()) / 60000)
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  const heures = Math.floor(minutes / 60)
  if (heures < 24) return `Il y a ${heures} h`
  const jours = Math.floor(heures / 24)
  if (jours === 1) return 'Hier'
  return `Il y a ${jours} j`
}

const boutonIcone: React.CSSProperties = {
  background: 'none',
  border: '1px solid #33415a',
  color: '#9fb0c9',
  borderRadius: 8,
  height: 32,
  minWidth: 32,
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  cursor: 'pointer',
  fontSize: 12,
}

export default function NotificationBell() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [ouvert, setOuvert] = useState(false)
  const [filtre, setFiltre] = useState('all')
  const [menuOuvert, setMenuOuvert] = useState(false)

  // Recharge à chaque changement de page, et à l'ouverture du panneau
  useEffect(() => {
    let actif = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!actif) return
      if (!user) {
        setUserId(null)
        setNotifs([])
        return
      }
      const { data } = await supabase
        .from('notifications')
        .select('id, type, titre, message, lien, lu, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      if (!actif) return
      setUserId(user.id)
      setNotifs((data as Notif[]) ?? [])
    })()
    return () => {
      actif = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, ouvert])

  if (!userId) return null

  const nonLues = notifs.filter((n) => !n.lu).length
  const visibles = notifs.filter((n) => filtre === 'all' || n.type === filtre)

  async function ouvrirNotif(n: Notif) {
    if (!n.lu) {
      setNotifs((liste) => liste.map((x) => (x.id === n.id ? { ...x, lu: true } : x)))
      await supabase.from('notifications').update({ lu: true }).eq('id', n.id)
    }
    if (n.lien) {
      setOuvert(false)
      router.push(n.lien)
    }
  }

  async function toutMarquerLu() {
    const ids = notifs.filter((n) => !n.lu).map((n) => n.id)
    if (ids.length === 0) return
    setNotifs((liste) => liste.map((x) => ({ ...x, lu: true })))
    await supabase.from('notifications').update({ lu: true }).in('id', ids)
  }

  return (
    <>
      {ouvert && (
        <div
          onClick={() => setOuvert(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 198, background: 'rgba(0,0,0,0.35)' }}
        />
      )}

      <button
        type="button"
        aria-label={`Notifications${nonLues > 0 ? ` (${nonLues} non lues)` : ''}`}
        onClick={() => setOuvert((o) => !o)}
        style={{
          position: 'absolute',
          top: 12,
          right: 'max(12px, calc(50% - 238px))', // alignée sur la colonne centrale du site, y compris sur grand écran
          zIndex: 200,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid #33415a',
          background: 'rgba(22,35,63,0.92)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <TbBell size={20} />
        {nonLues > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: '#c8352e',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: 'fixed',
            top: 60,
            right: 'max(12px, calc(50% - 238px))',
            left: 12,
            marginLeft: 'auto',
            maxWidth: 380,
            maxHeight: '70vh',
            minHeight: menuOuvert ? 300 : undefined,
            overflowY: 'auto',
            zIndex: 199,
            background: '#16233F',
            border: '1px solid #33415a',
            borderRadius: 12,
            padding: 12,
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                aria-label="Tout marquer comme lu"
                onClick={toutMarquerLu}
                style={{ ...boutonIcone, color: nonLues > 0 ? '#9fb0c9' : '#5b6a85' }}
              >
                <TbChecks size={17} />
              </button>
              <button
                type="button"
                aria-label="Filtrer par catégorie"
                onClick={() => setMenuOuvert((m) => !m)}
                style={{
                  ...boutonIcone,
                  ...(filtre !== 'all'
                    ? { borderColor: '#6fb1ff', color: '#9cc8ff', background: 'rgba(111,177,255,0.15)' }
                    : {}),
                }}
              >
                <TbFilter size={17} />
                {filtre !== 'all' && <span>{CATEGORIES[filtre]?.label}</span>}
              </button>
            </div>
          </div>

          {menuOuvert && (
            <div
              style={{
                position: 'absolute',
                top: 52,
                right: 12,
                zIndex: 5,
                minWidth: 150,
                background: '#1b2b4d',
                border: '1px solid #33415a',
                borderRadius: 10,
                padding: 4,
              }}
            >
              {[['all', 'Toutes'], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])].map(([cle, label]) => (
                <div
                  key={cle}
                  onClick={() => {
                    setFiltre(cle)
                    setMenuOuvert(false)
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: 13,
                    cursor: 'pointer',
                    color: filtre === cle ? '#9cc8ff' : '#d5deee',
                  }}
                >
                  <span>{label}</span>
                  {filtre === cle && <TbCheck size={15} />}
                </div>
              ))}
            </div>
          )}

          {visibles.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9fb0c9', textAlign: 'center', margin: '16px 0' }}>
              Rien de nouveau pour le moment.
            </p>
          ) : (
            visibles.map((n) => {
              const cat = CATEGORIES[n.type] ?? CATEGORIES.site
              const Icone = cat.Icon
              return (
                <div
                  key={n.id}
                  onClick={() => ouvrirNotif(n)}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: 10,
                    marginBottom: 6,
                    borderRadius: 8,
                    border: '1px solid #33415a',
                    background: 'rgba(255,255,255,0.04)',
                    opacity: n.lu ? 0.6 : 1,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: cat.fond,
                      color: cat.couleur,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 'none',
                    }}
                  >
                    <Icone size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{n.titre}</p>
                    {n.message && <p style={{ fontSize: 12, color: '#9fb0c9', margin: '2px 0 0' }}>{n.message}</p>}
                    <p style={{ fontSize: 11, color: '#7a8aa5', margin: '2px 0 0' }}>{ilYA(n.created_at)}</p>
                  </div>
                  {!n.lu && (
                    <span
                      style={{ width: 8, height: 8, borderRadius: '50%', background: '#6fb1ff', flex: 'none', marginTop: 6 }}
                    />
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </>
  )
}