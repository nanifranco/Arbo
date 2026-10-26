import { useState } from 'react'
import { allCommunityReviews, allCommunityUsers, allProductions, currentSeason, getProduction, popularity, ratingStats } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import { Icon } from '../components/Icon'
import { HalftonePortrait } from '../components/deco'
import { Poster } from '../components/Poster'
import { Button, CommunityScore, DemoBadge, EmptyState, SectionTitle } from '../components/ui'
import { ReviewCard } from './ProductionDetail'

type Tab = 'siguiendo' | 'populares' | 'personas'

export function Community() {
  const store = useStore()
  const nav = useNav()
  const [tab, setTab] = useState<Tab>('siguiendo')
  const reviews = allCommunityReviews()
  const feed = reviews.filter((r) => store.follows.includes(r.userId)).sort((a, b) => b.date.localeCompare(a.date))

  // Recomendaciones: lo que calificaron alto las personas que sigues y tú no has visto
  const recs = [
    ...new Set(
      feed
        .filter((r) => r.rating >= 4 && !store.isSeen(r.productionId) && currentSeason(getProduction(r.productionId)!).status !== 'archivo')
        .map((r) => r.productionId),
    ),
  ].slice(0, 4)

  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="wall relative -mx-4 overflow-hidden px-5 pb-6 pt-6 md:mx-0 md:rounded-2xl md:p-8">
        <div className="relative z-10 max-w-[70%]">
          <h1 className="font-display text-[48px] uppercase leading-[0.88] md:text-[64px]">Comunidad</h1>
          <p className="mt-2 text-[15px] text-grafito">Lo que la gente está viendo, sintiendo y recomendando en los teatros de la ciudad.</p>
          <div className="mt-3">
            <DemoBadge label="Personas demo" />
          </div>
        </div>
        <div className="absolute -right-2 top-3 flex w-[34%] max-w-[220px] flex-wrap justify-end gap-1" aria-hidden="true">
          {allCommunityUsers().map((u, i) => (
            <span key={u.id} className="w-[30%] bg-papel p-1 shadow-md" style={{ rotate: `${((i * 5) % 7) - 3}deg` }}>
              <HalftonePortrait seed={u.handle} bg={u.color} ink={u.color === '#E9B321' || u.color === '#E76F91' ? '#191919' : '#F6E3A8'} />
            </span>
          ))}
        </div>
      </header>

      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b-2 border-tinta" role="tablist">
        {(
          [
            ['siguiendo', 'Siguiendo'],
            ['populares', 'Populares'],
            ['personas', 'Personas'],
          ] as [Tab, string][]
        ).map(([t, l]) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-[2px] shrink-0 rounded-t-md px-4 py-2.5 font-display text-[16px] uppercase tracking-wide ${tab === t ? 'bg-tinta text-papel' : 'text-grafito hover:text-tinta'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'siguiendo' &&
        (store.follows.length === 0 ? (
          <EmptyState icon="community" title="Aún no sigues a nadie" text="Sigue a personas con gustos parecidos a los tuyos para ver aquí sus funciones y reseñas." action="Encontrar personas" onAction={() => setTab('personas')} />
        ) : (
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col gap-4">
              {feed.map((r) => (
                <ReviewCard key={r.id} r={r} showProduction />
              ))}
            </div>
            <aside className="flex flex-col gap-3 md:sticky md:top-20 md:self-start">
              <SectionTitle>Recomendadas para ti</SectionTitle>
              {recs.length ? (
                <ul className="flex flex-col gap-2">
                  {recs.map((id) => {
                    const p = getProduction(id)!
                    const who = feed.filter((r) => r.productionId === id && r.rating >= 4)
                    return (
                      <li key={id}>
                        <button onClick={() => nav.go({ name: 'production', id })} className="paper flex w-full items-center gap-3 p-3 text-left hover:-translate-y-0.5 transition-transform">
                          <span className="w-12 shrink-0 -rotate-2 shadow">
                            <Poster production={p} showCompany={false} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold">{p.title}</span>
                            <span className="block text-xs text-gris">
                              Le gustó a {who.map((r) => allCommunityUsers().find((u) => u.id === r.userId)!.name.split(' ')[0]).join(' y ')}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gris">Ya viste todo lo que recomiendan las personas que sigues. Sigue a más gente para descubrir otras obras.</p>
              )}
            </aside>
          </div>
        ))}

      {tab === 'populares' && <Popular />}

      {tab === 'personas' && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {allCommunityUsers().map((u, i) => {
            const following = store.follows.includes(u.id)
            const count = reviews.filter((r) => r.userId === u.id).length
            return (
              <div key={u.id} className="flex flex-col bg-papel p-2 pb-3 shadow-[0_12px_20px_-14px_rgba(0,0,0,.6)]" style={{ rotate: `${((i % 3) - 1) * 1.2}deg` }}>
                <button onClick={() => nav.go({ name: 'profile', userId: u.id })} className="text-left">
                  <HalftonePortrait seed={u.handle} bg={u.color} ink={u.color === '#E9B321' || u.color === '#E76F91' ? '#191919' : '#F6E3A8'} label={u.name} />
                  <span className="mt-2 block font-display text-[19px] uppercase leading-none hover:underline">{u.name}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-gris">@{u.handle}</span>
                  <span className="mt-1.5 block text-[13px] leading-snug text-grafito">{u.bio}</span>
                  <span className="mt-1.5 block text-[11px] text-gris tabular">
                    {count} reseñas · {u.followers + (following ? 1 : 0)} seguidores
                  </span>
                </button>
                <Button
                  variant={following ? 'secondary' : 'ink'}
                  icon={following ? 'check' : 'plus'}
                  className="mt-3 !min-h-9 !px-3 !text-[13px]"
                  onClick={() => {
                    const now = store.toggleFollow(u.id)
                    store.notify(now ? `Ahora sigues a ${u.name.split(' ')[0]}` : `Dejaste de seguir a ${u.name.split(' ')[0]}`, now ? 'ok' : 'info')
                  }}
                >
                  {following ? 'Siguiendo' : 'Seguir'}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Popular() {
  const nav = useNav()
  const reviews = [...allCommunityReviews()].filter((r) => r.date >= '2026-09-01').sort((a, b) => b.likes - a.likes)
  const top = allProductions()
    .filter((p) => currentSeason(p).status === 'cartelera')
    .sort((a, b) => popularity(b.id) - popularity(a.id))
    .slice(0, 6)
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
      <section>
        <SectionTitle>Las más vistas</SectionTitle>
        <ol className="wall grid grid-cols-3 gap-4 rounded-xl p-4 pt-6">
          {top.map((p, i) => (
            <li key={p.id}>
              <button onClick={() => nav.go({ name: 'production', id: p.id })} className="relative block w-full text-left">
                <span className="absolute -left-3 -top-4 z-10 font-display text-[44px] leading-none text-rojo [text-shadow:2px_2px_0_#FBF8F2]">{i + 1}</span>
                <span className="block overflow-hidden rounded-[3px] shadow-[0_10px_16px_-10px_rgba(25,25,25,.6)]">
                  <Poster production={p} showCompany={false} />
                </span>
                <span className="mt-1.5 block truncate text-xs font-bold">{p.title}</span>
                <span className="block">
                  <CommunityScore stats={ratingStats(p.id)} size={10} compact />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <SectionTitle>Reseñas más queridas del mes</SectionTitle>
        <div className="flex flex-col gap-3">
          {reviews.slice(0, 5).map((r) => (
            <ReviewCard key={r.id} r={r} showProduction />
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-gris">
          <Icon name="info" size={14} /> Ordenadas por número de “me gusta”.
        </p>
      </section>
    </div>
  )
}
