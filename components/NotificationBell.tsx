'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TbBell, TbClock, TbTrophy, TbUsers, TbPhoto, TbSpeakerphone } from 'react-icons/tb'

type Notif = {
  id: number
  type: string
  titre: string
  message: string | null
  lien: string | null
  lu: boolean
  created_at: string
}

const CATEGORIES: Record<string, { label: string; Icon: typeof TbBell; couleur: string; fond: string }> = {
  rappel: { label: 'Rappels', Icon: TbClock, couleur: '#f5b942', fond: 'rgba(245,185,66,0.15)' },
  badge: { label: 'Badges', Icon: TbTrophy, couleur: '#6fb1ff', fond: 'rgba(111,177,255,0.15)' },
  ligue: { label: 'Ligues', Icon: TbUsers, couleur: '#5fd08a', fond: 'rgba(95,208,138,0.15)' },
  photo: { label: 'Photos', Icon: TbPhoto, couleur: '#c79bff', fond: 'rgba(199,155,255,0.15)' },
  site: { label: 'Site', Icon: TbSpeakerphone, couleur: '#ff8f87', fond: 'rgba(255,143,135,0.15)' },
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

export default function NotificationBell() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [ouvert, setOuvert] = useState(false)
  const [filtre, setFiltre] = useState('all')

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
          position: 'fixed',
          top: 12,
          right: 12,
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
            right: 12,
            left: 12,
            marginLeft: 'auto',
            maxWidth: 380,
            maxHeight: '70vh',
            overflowY: 'auto',
            zIndex: 199,
            background: '#16233F',
            border: '1px solid #33415a',
            borderRadius: 12,
            padding: 12,
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
            <button
              type="button"
              onClick={toutMarquerLu}
              style={{
                background: 'none',
                border: 'none',
                color: nonLues > 0 ? '#9fb0c9' : '#5b6a85',
                fontSize: 12,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              Tout marquer comme lu
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {[['all', 'Tout'], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])].map(([cle, label]) => (
              <button
                key={cle}
                type="button"
                onClick={() => setFiltre(cle)}
                style={{
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  border: `1px solid ${filtre === cle ? '#6fb1ff' : '#33415a'}`,
                  background: filtre === cle ? 'rgba(111,177,255,0.18)' : 'transparent',
                  color: filtre === cle ? '#9cc8ff' : '#9fb0c9',
                }}
              >
                {label}
              </button>
            ))}
          </div>

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