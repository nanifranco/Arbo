import { useState } from 'react'
import { allCommunityReviews, allCommunityUsers, allProductions, currentSeason, getProduction, popularity, ratingStats } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { Avatar, Button, DemoBadge, EmptyState, SectionTitle, Stars } from '../components/ui'
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
      <header className="pt-3">
        <h1 className="font-marker text-[32px] leading-none md:text-4xl">Comunidad</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gris">
          Lo que la gente está viendo en los teatros de la ciudad. <DemoBadge label="Personas demo" />
        </p>
      </header>

      <div className="flex gap-1 border-b border-linea" role="tablist">
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
            className={`-mb-px border-b-[3px] px-3 py-2.5 text-sm font-semibold ${tab === t ? 'border-rojo' : 'border-transparent text-gris hover:text-tinta'}`}
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
            <div className="flex flex-col gap-3">
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
                        <button onClick={() => nav.go({ name: 'production', id })} className="flex w-full items-center gap-3 rounded-xl border border-linea bg-papel p-3 text-left hover:border-grafito">
                          <span className="w-11 shrink-0 overflow-hidden rounded-sm">
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
        <div className="grid gap-3 sm:grid-cols-2">
          {allCommunityUsers().map((u) => {
            const following = store.follows.includes(u.id)
            const count = reviews.filter((r) => r.userId === u.id).length
            return (
              <div key={u.id} className="flex items-center gap-3 rounded-xl border border-linea bg-papel p-3">
                <button onClick={() => nav.go({ name: 'profile', userId: u.id })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <Avatar name={u.name} color={u.color} size={46} />
                  <span className="min-w-0">
                    <span className="block truncate font-bold hover:underline">{u.name}</span>
                    <span className="block truncate text-xs text-gris">{u.bio}</span>
                    <span className="block text-[11px] text-gris tabular">
                      {count} reseñas · {u.followers + (following ? 1 : 0)} seguidores
                    </span>
                  </span>
                </button>
                <Button
                  variant={following ? 'secondary' : 'ink'}
                  className="!min-h-9 !px-3 !text-[13px]"
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
        <ol className="grid grid-cols-3 gap-3">
          {top.map((p, i) => (
            <li key={p.id}>
              <button onClick={() => nav.go({ name: 'production', id: p.id })} className="relative block w-full text-left">
                <span className="absolute -left-1.5 -top-2 z-10 grid size-7 place-items-center rounded-full bg-amarillo font-slab text-sm text-tinta shadow">{i + 1}</span>
                <span className="block overflow-hidden rounded-md shadow-[0_6px_14px_-8px_rgba(25,25,25,.45)]">
                  <Poster production={p} showCompany={false} />
                </span>
                <span className="mt-1.5 block truncate text-xs font-bold">{p.title}</span>
                <span className="block">
                  <Stars value={ratingStats(p.id).avg} size={10} />
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
