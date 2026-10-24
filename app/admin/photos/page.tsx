import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ADMIN_ID } from '@/lib/admin'
import { urlPhoto } from '@/lib/photos'
import { validerPhoto, refuserPhoto } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminPhotos() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.id !== ADMIN_ID) notFound()

  const { data: photos } = await supabase
    .from('photos_perso')
    .select('id, type, cible, chemin, created_at')
    .eq('statut', 'en_attente')
    .order('created_at', { ascending: true })

  const liste = photos ?? []
  const idsProfils = liste.filter((p) => p.type === 'profil').map((p) => p.cible)
  const idsLigues = liste.filter((p) => p.type === 'ligue').map((p) => p.cible)

  const pseudoParId = new Map<string, string>()
  if (idsProfils.length > 0) {
    const { data } = await supabase.from('profiles').select('id, pseudo').in('id', idsProfils)
    for (const p of data ?? []) pseudoParId.set(String(p.id), p.pseudo)
  }
  const nomLigueParId = new Map<string, string>()
  if (idsLigues.length > 0) {
    const { data } = await supabase.from('ligues').select('id, nom').in('id', idsLigues)
    for (const l of data ?? []) nomLigueParId.set(String(l.id), l.nom)
  }

  const bouton: React.CSSProperties = {
    padding: '10px 18px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    color: 'white',
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0b1220', color: 'white' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 24px 100px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Photos à valider</h1>
        <p style={{ color: '#9fb0c9', fontSize: 13, marginBottom: 24 }}>
          {liste.length === 0 ? 'Aucune photo en attente.' : `${liste.length} en attente`}
        </p>

        {liste.map((p) => (
          <div key={p.id} style={{ background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#9fb0c9', marginBottom: 10 }}>
              {p.type === 'profil'
                ? `Photo de profil : ${pseudoParId.get(p.cible) ?? 'Joueur inconnu'}`
                : `Photo de ligue : ${nomLigueParId.get(p.cible) ?? 'Ligue inconnue'}`}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlPhoto(p.chemin)}
              alt="Photo à valider"
              style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: p.type === 'profil' ? '50%' : 16, margin: '0 auto', display: 'block' }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
              <form action={validerPhoto.bind(null, p.id)}>
                <button style={{ ...bouton, backgroundColor: '#2ea866' }}>Valider</button>
              </form>
              <form action={refuserPhoto.bind(null, p.id)}>
                <button style={{ ...bouton, backgroundColor: '#C8352E' }}>Refuser</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}