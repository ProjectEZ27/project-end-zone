import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { acceptMembership, rejectMembership } from './actions'
import EnTeteLigue from '@/components/EnTeteLigue'
import ShareLeagueBox from '@/components/ShareLeagueBox'
import {
  TbBallAmericanFootball,
  TbTrophy,
  TbUsers,
  TbHistory,
  TbSettings,
  TbCrown,
  TbCheck,
  TbX,
} from 'react-icons/tb'
import { journalSemaineRapide, derniereSemaineTerminee } from '@/lib/journal'
import JournalDuMardi from '@/components/JournalDuMardi'
import LeagueSwitcher from '@/components/LeagueSwitcher'
import { liguesPourMenu } from '@/lib/accueil'

export default async function LeagueDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params
  const { error: errorMessage } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Infos de la ligue, sans ses codes d'invitation (protégés côté base)
  const { data: league, error } = await supabase.rpc('ligue_infos', { p_ligue: Number(id) })

  if (error || !league) {
    notFound()
  }

  const estCommissaire = league.commissaire_id === user.id
  // Ligue ouverte (région, sponsor) : pas de code d'invitation à partager, pas de limite de joueurs affichée
  const ouverte = league.type === 'ouverte'

  // Toutes ces lectures sont indépendantes : on les lance en même temps au lieu d'attendre chacune
  const [
    { data: codes },
    photoAttenteRes,
    { data: mesAdhesions },
    monAdhesionRes,
    adhesionsDataRes,
    { data: adhesionsMembres },
    semaineDuJournal,
  ] = await Promise.all([
    // Codes de partage : la base ne les donne qu'aux membres actifs (et le code de secours au commissaire)
    supabase.rpc('codes_ligue', { p_ligue: Number(id) }),
    // Photo de ligue en attente de validation (visible seulement par la commissaire)
    estCommissaire
      ? supabase.from('photos_perso').select('id').eq('type', 'ligue').eq('cible', id).eq('statut', 'en_attente').limit(1)
      : Promise.resolve({ data: [] as { id: number }[] }),
    supabase
      .from('adhesions')
      .select('ligue_id, epingle, masquee, ligues(id, nom)')
      .eq('utilisateur_id', user.id)
      .eq('statut', 'actif'),
    estCommissaire
      ? Promise.resolve({ data: null })
      : supabase.from('adhesions').select('statut').eq('ligue_id', id).eq('utilisateur_id', user.id).eq('statut', 'actif').maybeSingle(),
    estCommissaire
      ? supabase.from('adhesions').select('id, utilisateur_id').eq('ligue_id', id).eq('statut', 'en_attente')
      : Promise.resolve({ data: [] as { id: number; utilisateur_id: string }[] }),
    supabase.from('adhesions').select('utilisateur_id').eq('ligue_id', id).eq('statut', 'actif'),
    derniereSemaineTerminee(supabase),
  ])

  const codeInvitation: string = codes?.[0]?.code_invitation ?? ''
  const codeSecours: string | undefined = codes?.[0]?.code_secours ?? undefined
  const photoEnAttente = (photoAttenteRes.data ?? []).length > 0

  const mesLiguesBrutes = (mesAdhesions ?? [])
    .filter((a: any) => a.ligues)
    .map((a: any) => ({ ...a.ligues, epingle: a.epingle ?? null, masquee: a.masquee === true }))

  const mesLigues = Array.from(
    new Map(mesLiguesBrutes.map((l: any) => [l.id, l])).values()
  ) as { id: number; nom: string; epingle: number | null; masquee: boolean }[]

  // Menu déroulant : épinglées d'abord, ligues masquées retirées
  const autresLigues = liguesPourMenu(mesLigues).filter((l) => String(l.id) !== id)

  const estMembreActif = estCommissaire || !!monAdhesionRes.data

  const statutLabel: Record<string, { label: string; bg: string; color: string }> = {
    en_cours: { label: 'EN COURS', bg: '#0F6E56', color: '#E1F5EE' },
    a_venir: { label: 'À VENIR', bg: '#854F0B', color: '#FAEEDA' },
    terminee: { label: 'TERMINÉE', bg: '#5F5E5A', color: '#F1EFE8' },
  }
  const badgeStatut = statutLabel[league.statut] ?? { label: league.statut, bg: '#33415a', color: 'white' }

  const membreIdsLigue = Array.from(new Set([
    league.commissaire_id,
    ...(adhesionsMembres ?? []).map((a) => a.utilisateur_id),
  ]))

  // Pseudos des demandes d'adhésion et journal de la semaine : en même temps aussi
  const adhesionsData = adhesionsDataRes.data ?? []
  const [profilesDemandes, journal] = await Promise.all([
    adhesionsData.length > 0
      ? supabase.from('profiles').select('id, pseudo').in('id', adhesionsData.map((a) => a.utilisateur_id)).then((r) => r.data ?? [])
      : Promise.resolve([] as { id: string; pseudo: string }[]),
    semaineDuJournal
      ? journalSemaineRapide(supabase, semaineDuJournal, membreIdsLigue)
      : Promise.resolve({ semaine: '', articles: [], enVedette: false, nomTribunal: 'Tribunal du mardi', exceptionnel: false }),
  ])

  const demandes: any[] = adhesionsData.map((a) => ({
    ...a,
    pseudo: profilesDemandes.find((p) => p.id === a.utilisateur_id)?.pseudo ?? 'Joueur inconnu',
  }))

  const pastilles = [
    { href: `/leagues/${id}/pronostics`, label: 'Résultats', Icon: TbBallAmericanFootball },
    { href: `/leagues/${id}/classement`, label: 'Classement', Icon: TbTrophy },
    { href: `/leagues/${id}/membres`, label: 'Membres', Icon: TbUsers },
    { href: `/leagues/${id}/historique`, label: 'Historique', Icon: TbHistory },
  ]
  if (estCommissaire) {
    pastilles.push({ href: `/leagues/${id}/parametres`, label: 'Paramètres', Icon: TbSettings })
  }

  // Réactions des joueurs sur les articles du journal
  let reactionsJournal: React.ComponentProps<typeof JournalDuMardi>['reactions'] = undefined
  if (semaineDuJournal && journal.articles.length > 0) {
    const [{ data: reacs }, { data: profilsMembres }] = await Promise.all([
      supabase
        .from('journal_reactions')
        .select('article_id, emoji, utilisateur_id')
        .eq('ligue_id', id)
        .eq('semaine_id', semaineDuJournal),
      supabase.from('profiles').select('id, pseudo').in('id', membreIdsLigue),
    ])
    const pseudos = new Map((profilsMembres ?? []).map((p) => [p.id, p.pseudo as string]))
    const parArticle: Record<string, { emoji: string; utilisateur_id: string; pseudo: string }[]> = {}
    for (const r of reacs ?? []) {
      if (!parArticle[r.article_id]) parArticle[r.article_id] = []
      parArticle[r.article_id].push({ emoji: r.emoji, utilisateur_id: r.utilisateur_id, pseudo: pseudos.get(r.utilisateur_id) ?? 'Joueur' })
    }
    reactionsJournal = {
      ligueId: Number(id),
      semaineId: semaineDuJournal,
      monId: user.id,
      monPseudo: pseudos.get(user.id) ?? 'Moi',
      parArticle,
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        
        backgroundImage: 'url(/fonds/Fond-Ligue.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.92) 100%)',
        }} />
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 24px 100px', textAlign: 'center', color: 'white' }}>
        {errorMessage && (
          <p style={{ color: '#e05252', marginBottom: 12 }}>⚠️ {errorMessage}</p>
        )}

        <EnTeteLigue
          ligueId={id}
          nom={league.nom}
          logoId={league.logo_id ?? 1}
          estCommissaire={estCommissaire}
          photoChemin={league.photo_chemin ?? null}
          photoEnAttente={photoEnAttente}
        />
                <div>
          <LeagueSwitcher ligueActuelleId={id} ligueActuelleNom={league.nom} autresLigues={autresLigues} />
        </div>
        <p style={{ fontSize: 13, color: '#9fb0c9', marginTop: 4 }}>
          {ouverte ? 'Ligue ouverte' : `${league.taille_max} joueurs max`}{' '}
          <span style={{ margin: '0 4px' }}>·</span>
          Statut :{' '}
          <span style={{
            display: 'inline-block',
            background: badgeStatut.bg,
            color: badgeStatut.color,
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 10px',
            borderRadius: 20,
            marginLeft: 4,
          }}>
            {badgeStatut.label}
          </span>
        </p>

        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {pastilles.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                flex: '1 1 30%',
                minWidth: 100,
                background: '#16233F',
                border: '0.5px solid #33415a',
                borderRadius: 8,
                padding: '10px 6px',
                textDecoration: 'none',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Icon size={16} style={{ display: 'block', margin: '0 auto 4px' }} />
              <div style={{ fontSize: 11 }}>{label}</div>
            </Link>
          ))}
        </div>

        {journal.articles.length > 0 && (
          <JournalDuMardi
            semaine={journal.semaine}
            nomTribunal={journal.nomTribunal}
            exceptionnel={journal.exceptionnel}
            articles={journal.articles}
            enVedette={journal.enVedette}
            ouvertAuDepart={journal.enVedette}
            reactions={reactionsJournal}
          />
        )}
        {estCommissaire && !ouverte && (
          <div style={{ marginTop: 20, background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, padding: 16 }}>
            <TbCrown size={20} color="#EF9F27" style={{ display: 'block', margin: '0 auto 6px' }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Bienvenue dans la ligue</div>
            <div style={{ fontSize: 11, color: '#7fa8e0', marginBottom: 12 }}>Tu es le commissaire de cette ligue</div>

            <ShareLeagueBox
              codeInvitation={codeInvitation}
              codeSecours={codeSecours}
              leagueName={league.nom}
            />
          </div>
        )}

        {!estCommissaire && estMembreActif && !ouverte && (
          <div style={{ marginTop: 20, background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, padding: 16 }}>
            <ShareLeagueBox
              codeInvitation={codeInvitation}
              leagueName={league.nom}
            />
          </div>
        )}

        {estCommissaire && demandes.length > 0 && (
          <div style={{ marginTop: 20, background: '#16233F', border: '0.5px solid #33415a', borderRadius: 12, padding: 16, textAlign: 'left' }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Demandes en attente ({demandes.length})</p>
            {demandes.map((demande) => (
              <div key={demande.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span>{demande.pseudo}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <form action={acceptMembership}>
                    <input type="hidden" name="adhesion_id" value={demande.id} />
                    <button type="submit" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, background: '#0F6E56', border: 'none', borderRadius: 6, color: 'white' }}>
                      <TbCheck size={14} /> Accepter
                    </button>
                  </form>
                  <form action={rejectMembership}>
                    <input type="hidden" name="adhesion_id" value={demande.id} />
                    <button type="submit" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, background: '#791F1F', border: 'none', borderRadius: 6, color: 'white' }}>
                      <TbX size={14} /> Refuser
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}