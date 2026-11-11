import { NOMS_EQUIPES } from '@/lib/teamBadge'
export const dynamic = 'force-dynamic'
import { getPowerIndexRanking } from '@/lib/powerIndex'
import RulesAccordion from '@/components/RulesAccordion'
import { RESUMES_EQUIPES } from '@/lib/resumesEquipes'
import InfoToggle from '@/components/InfoToggle'
import { GLOSSAIRE } from '@/lib/glossaire'
import { MISE_A_JOUR_INFOS } from '@/lib/miseAJourInfos'
import Link from 'next/link'
import { formaterMajExpert } from '@/lib/majExpert'
import { createClient } from '@/lib/supabase/server'
import ClassementExpert, { type LigneExpert } from '@/components/ClassementExpert'

export default async function InfosEquipes({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const { vue } = await searchParams
  const vueExpert = vue === 'expert'
  const annee = new Date().getFullYear()
  const classement = await getPowerIndexRanking(annee)

  // Mode expert : réglage du joueur + statistiques des équipes
  let modeExpert = false
  let lignesExpert: LigneExpert[] = []
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profil } = await supabase.from('profiles').select('mode_expert').eq('id', user.id).maybeSingle()
    modeExpert = profil?.mode_expert ?? true
  }
  if (vueExpert && modeExpert) {
    const { data } = await supabase.from('stats_expert_equipes').select('equipe, derniere_semaine, mis_a_jour, valeurs, rangs')
    lignesExpert = (data ?? []) as LigneExpert[]
  }
  const onglet = (actif: boolean) => ({
    flex: 1,
    textAlign: 'center' as const,
    padding: '10px 4px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
    border: `1px solid ${actif ? '#f0c040' : '#33415a'}`,
    background: actif ? '#f0c040' : 'rgba(22,35,63,0.8)',
    color: actif ? '#0b1220' : '#9fb0c9',
  })

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url(/fonds/Fond-Regles.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px 100px', position: 'relative' }}>
        <h1 style={{ fontSize: 26, textAlign: 'center', marginBottom: 4 }}>🏈 Infos équipes</h1>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 32 }}>
          Le power ranking des 32 équipes, pour t'aider à pronostiquer
          <InfoToggle label="Qu'est-ce que le power ranking ?">
            {GLOSSAIRE['power ranking']}
          </InfoToggle>
        </p>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 11,
            fontWeight: 600,
            color: '#c9cdd6',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ee892', display: 'inline-block' }} />
            {MISE_A_JOUR_INFOS}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Link href="/infos-equipes" style={onglet(!vueExpert)}>Power Ranking</Link>
          <Link
            href="/infos-equipes?vue=expert"
            style={{ ...onglet(vueExpert), ...(modeExpert ? {} : { opacity: 0.45 }) }}
          >
            {modeExpert ? '⚡' : '🔒'} Classement expert
          </Link>
        </div>

        {vueExpert ? (
          !modeExpert ? (
            <div style={{ border: '1px dashed #f0c040', borderRadius: 12, padding: 18, textAlign: 'center', fontSize: 13, color: '#9fb0c9', lineHeight: 1.7 }}>
              🔒 <b style={{ color: '#f0c040' }}>Classement expert</b>
              <br />
              Classements par passe, course, défense et pression, et tableau complet des 32 équipes.
              <br />
              Active le mode expert dans ⚙️ Préférences.
            </div>
          ) : lignesExpert.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              Statistiques momentanément indisponibles, réessaie plus tard.
            </p>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(240,192,64,0.5)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#c9cdd6',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f0c040', display: 'inline-block' }} />
                  {formaterMajExpert(lignesExpert[0].mis_a_jour)
                    ? `Mis à jour le ${formaterMajExpert(lignesExpert[0].mis_a_jour)}`
                    : 'Mise à jour récente'}
                  {` · données jusqu'à la semaine ${lignesExpert[0].derniere_semaine} · prochaine mise à jour mercredi, 19h`}
                </span>
              </div>
              <ClassementExpert lignes={lignesExpert} />
              <p style={{ fontSize: 10, color: '#7a8aa5', textAlign: 'center', marginTop: 14 }}>Données : nflverse</p>
            </>
          )
        ) : classement.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
            Classement momentanément indisponible, réessaie plus tard.
          </p>
        ) : (
          classement.map((equipe) => {
            const resume = RESUMES_EQUIPES[equipe.code]
            return (
              <RulesAccordion
                key={equipe.code}
                title={`${equipe.rang}. ${NOMS_EQUIPES[equipe.code] ?? equipe.code}`}
              >
                <p>{resume?.texte ?? 'Résumé à venir pour cette équipe.'}</p>
                {resume?.historique && (
                  <p style={{ marginTop: 8, fontSize: 13, color: '#ffd9d5', fontWeight: 600 }}>
                    {resume.historique}
                  </p>
                )}
                {(resume?.forces?.length || resume?.faiblesses?.length) ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {resume.forces?.map((f) => (
                      <span key={f} style={{
                        fontSize: 11,
                        padding: '4px 9px',
                        borderRadius: 20,
                        background: 'rgba(78,232,146,0.12)',
                        color: '#4ee892',
                      }}>✓ {f}</span>
                    ))}
                    {resume.faiblesses?.map((f) => (
                      <span key={f} style={{
                        fontSize: 11,
                        padding: '4px 9px',
                        borderRadius: 20,
                        background: 'rgba(255,107,95,0.12)',
                        color: '#ff6b5f',
                      }}>✕ {f}</span>
                    ))}
                  </div>
                ) : null}
              </RulesAccordion>
            )
          })
        )}
      </div>
    </div>
  )
}