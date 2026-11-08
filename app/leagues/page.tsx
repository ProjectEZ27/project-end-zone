import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinLeagueForm from '../JoinLeagueForm'
import CarteLigue from '@/components/CarteLigue'
import { calculerClassementSaison } from '@/lib/scoring'
import { journalEnVedette, chargerMesLigues } from '@/lib/accueil'

export const dynamic = 'force-dynamic'

const titreSection = (texte: string) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
    <div style={{ width: 3, height: 14, background: '#C8352E' }} />
    <span style={{ fontSize: 13, color: '#9fb0c9', textTransform: 'uppercase', letterSpacing: 0.5 }}>{texte}</span>
  </div>
)

export default async function PageLigues({
  searchParams,
}: {
  searchParams: Promise<{ demande?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [saisonResult, vedette] = await Promise.all([
    supabase.from('saisons').select('id').eq('statut', 'en_cours').single(),
    journalEnVedette(supabase),
  ])
  const saisonId = saisonResult.data?.id
  const classementSaison = saisonId ? await calculerClassementSaison(supabase, saisonId) : []
  const mesLigues = await chargerMesLigues(supabase, user.id, classementSaison)

  const epinglees = mesLigues.filter((l) => l.epingle !== null).sort((a, b) => a.epingle! - b.epingle!)
  const autres = mesLigues.filter((l) => l.epingle === null && !l.masquee)
  const masquees = mesLigues.filter((l) => l.masquee)
  const pleine = epinglees.length >= 3

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Acceuil.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.80) 0%, rgba(11,18,32,0.95) 100%)',
        }} />
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '64px 24px 100px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, color: 'white', margin: '0 0 16px' }}>Mes ligues</h1>

        {params.demande === 'envoyee' && (
          <div style={{
            background: 'rgba(78,232,146,0.15)',
            border: '1px solid rgba(78,232,146,0.4)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            fontSize: 14,
            color: '#4ee892',
          }}>
            ✅ Ta demande a bien été envoyée ! Elle est en attente de validation du commissaire.
          </div>
        )}
        {params.demande === 'deja_envoyee' && (
          <div style={{
            background: 'rgba(255,193,7,0.15)',
            border: '1px solid rgba(255,193,7,0.4)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            fontSize: 14,
            color: '#ffc107',
          }}>
            ⏳ Tu as déjà une demande en attente pour cette ligue — pas besoin de la refaire.
          </div>
        )}

        <div style={{ textAlign: 'left' }}>
          {mesLigues.length === 0 ? (
            <p style={{ color: '#9fb0c9' }}>Tu ne fais partie d'aucune ligue pour le moment. Rejoins-en une avec un code, ou crées-en une !</p>
          ) : (
            <>
              {titreSection(`Épinglées (${epinglees.length}/3) · affichées sur l'accueil`)}
              {epinglees.length === 0 ? (
                <p style={{ color: '#7a8aa5', fontSize: 13, margin: '0 0 8px' }}>
                  Appuie sur ☆ sous une ligue pour l'épingler : elle apparaîtra sur ton accueil.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                  {epinglees.map((l, i) => (
                    <CarteLigue key={l.id} ligue={l} vedette={vedette} controles="epinglee" position={i} total={epinglees.length} />
                  ))}
                </div>
              )}

              {autres.length > 0 && (
                <div style={{ marginTop: 28 }}>
                  {titreSection(`Mes autres ligues (${autres.length})`)}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                    {autres.map((l) => (
                      <CarteLigue key={l.id} ligue={l} vedette={vedette} controles="autre" pleine={pleine} />
                    ))}
                  </div>
                </div>
              )}

              {masquees.length > 0 && (
                <details style={{ marginTop: 28 }}>
                  <summary style={{ cursor: 'pointer', fontSize: 13, color: '#9fb0c9', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                    Ligues masquées ({masquees.length})
                  </summary>
                  <p style={{ color: '#7a8aa5', fontSize: 12, margin: '8px 0 12px' }}>
                    Elles n'apparaissent plus dans les menus déroulants. Tu en restes membre.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                    {masquees.map((l) => (
                      <CarteLigue key={l.id} ligue={l} vedette={vedette} controles="masquee" />
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </div>

        <div style={{ marginTop: 32, textAlign: 'left' }}>
          {titreSection('Rejoindre une ligue')}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid #33415a', borderRadius: 12, padding: 14 }}>
            <JoinLeagueForm />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
              <div style={{ flex: 1, height: 0.5, background: '#33415a' }} />
              <span style={{ fontSize: 11, color: '#7a8aa5' }}>ou</span>
              <div style={{ flex: 1, height: 0.5, background: '#33415a' }} />
            </div>
            <Link href="/leagues/create" style={{ padding: 12, display: 'block', textAlign: 'center', border: '0.5px solid #33415a', borderRadius: 8, textDecoration: 'none', color: 'white' }}>
              ➕ Créer une nouvelle ligue
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}