import { useState } from 'react'
import { currentSeason, fmt, getCommunityUser, getPerson, getProduction, getVenue, getWork, ratingStats, reviewsFor, seasonStatus, upcomingPerformances } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import type { CommunityReview, Production } from '../data/types'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { Avatar, Button, DemoBadge, EmptyState, GenreTag, ScreenHeader, Stars, StatusPill } from '../components/ui'

type Tab = 'info' | 'funciones' | 'elenco' | 'resenas'

export function ProductionDetail({ id }: { id: string }) {
  const p = getProduction(id)
  if (!p) return <EmptyState icon="info" title="No encontramos esta obra" text="Puede que el enlace esté mal escrito o que la ficha se haya retirado del catálogo." />
  return <Detail p={p} />
}

function Detail({ p }: { p: Production }) {
  const nav = useNav()
  const store = useStore()
  const [tab, setTab] = useState<Tab>('info')
  const { season, status } = currentSeason(p)
  const venue = getVenue(season.venueId)!
  const work = getWork(p.workId)
  const mine = store.entriesFor(p.id)
  const ownRatings = mine.map((e) => e.rating).filter((r): r is number => !!r)
  const stats = ratingStats(p.id, ownRatings.slice(0, 1))
  const watching = store.watchlist.includes(p.id)
  const fav = store.favorites.includes(p.id)
  const seen = mine.length > 0
  const maxDist = Math.max(1, ...stats.dist)

  const toggleWatch = () => {
    const now = store.toggleWatch(p.id)
    store.notify(now ? 'Guardada en Por ver' : 'Quitada de Por ver', now ? 'ok' : 'info')
  }
  const toggleFav = () => {
    if (!seen) return store.notify('Registra la obra en tu diario para marcarla como favorita', 'info')
    const now = store.toggleFavorite(p.id)
    store.notify(now ? 'Agregada a tus favoritas' : 'Quitada de favoritas', now ? 'ok' : 'info')
  }

  return (
    <div className="pb-10">
      <ScreenHeader title={p.title} sub={venue.name} />

      <div className="grid gap-6 md:grid-cols-[260px_1fr] md:gap-10">
        {/* Cartel + acciones */}
        <div className="grid grid-cols-[38%_1fr] gap-4 md:block">
          <div className="relative -rotate-1 md:sticky md:top-20">
            <div className="overflow-hidden rounded-md shadow-[0_14px_28px_-14px_rgba(25,25,25,.6)]">
              <Poster production={p} />
            </div>
            <span className="tape" />
            <p className="mt-2 hidden text-[11px] leading-snug text-gris md:block">Cartel generado para la demostración. Aquí irá el cartel oficial de la compañía.</p>
          </div>

          <div className="flex min-w-0 flex-col md:hidden">
            <TitleBlock p={p} status={status} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="hidden md:block">
            <TitleBlock p={p} status={status} />
          </div>

          {/* Acciones del usuario */}
          <div className="flex flex-wrap gap-2">
            <Button icon={seen ? 'repeat' : 'eye'} onClick={() => nav.go({ name: 'log', productionId: p.id })}>
              {seen ? 'La vi otra vez' : 'La vi'}
            </Button>
            {status !== 'archivo' && (
              <Button variant="secondary" icon="bookmark" ariaPressed={watching} onClick={toggleWatch}>
                {watching ? 'En Por ver' : 'Por ver'}
              </Button>
            )}
            <Button variant="secondary" icon="heart" ariaPressed={fav} onClick={toggleFav} className={fav ? '!text-rojo' : ''}>
              {fav ? 'Favorita' : 'Favorita'}
            </Button>
          </div>

          {seen && (
            <button onClick={() => nav.tab('diary')} className="ticket flex items-center gap-3 px-4 py-3 text-left" style={{ ['--notch' as string]: '78%' }}>
              <Icon name="check" size={20} className="text-verde" />
              <div className="min-w-0 flex-1 text-sm">
                <b>En tu diario</b>
                <span className="text-gris"> · {mine.length === 1 ? `la viste el ${fmt.short(mine[0].date)}` : `la has visto ${mine.length} veces`}</span>
              </div>
              {mine[0].rating ? <Stars value={mine[0].rating} size={13} /> : null}
            </button>
          )}

          {/* Calificación comunidad */}
          <section className="flex items-center gap-5 rounded-xl border border-linea bg-papel p-4">
            <div className="text-center">
              <div className="font-slab text-4xl leading-none tabular">{stats.count ? stats.avg.toFixed(1) : '—'}</div>
              <div className="mt-1">
                <Stars value={stats.avg} size={12} />
              </div>
              <div className="mt-1 text-[11px] text-gris tabular">{stats.count} calificaciones</div>
            </div>
            <div className="flex flex-1 flex-col gap-1" aria-label="Distribución de calificaciones">
              {[5, 4, 3, 2, 1].map((s) => (
                <div key={s} className="flex items-center gap-2 text-[11px]">
                  <span className="w-3 font-mono tabular text-gris">{s}</span>
                  <div className="h-2 flex-1 rounded-full bg-carton/70">
                    <div className="h-2 rounded-full bg-amarillo" style={{ width: `${(stats.dist[s - 1] / maxDist) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pestañas */}
          <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-linea" role="tablist">
            {(
              [
                ['info', 'Información'],
                ['funciones', status === 'archivo' ? 'Temporadas' : 'Funciones'],
                ['elenco', 'Elenco y equipo'],
                ['resenas', 'Reseñas'],
              ] as [Tab, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`-mb-px shrink-0 border-b-[3px] px-3 py-2.5 text-sm font-semibold ${tab === t ? 'border-rojo text-tinta' : 'border-transparent text-gris hover:text-tinta'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'info' && (
            <div className="flex flex-col gap-5">
              <p className="max-w-[62ch] text-[15px] leading-relaxed">{p.synopsis}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-linea bg-papel p-4 text-sm sm:grid-cols-3">
                <Spec label="Obra original" value={work ? `${work.title}` : '—'} />
                <Spec label="Autoría" value={work ? `${work.author}${work.year ? ` (${work.year < 0 ? `${-work.year} a. C.` : work.year})` : ''}` : '—'} />
                <Spec label="Compañía" value={p.company} />
                <Spec label="Duración" value={`${p.durationMin} min`} mono />
                <Spec label="Clasificación" value={p.age} />
                <Spec label="Temporadas" value={`${p.seasons.length}`} mono />
              </dl>
              <p className="text-xs text-gris">
                <b>Obra</b> es el texto; <b>producción</b> es esta puesta en escena de {p.company}; cada <b>temporada</b> es un periodo de funciones en un teatro.
              </p>
            </div>
          )}

          {tab === 'funciones' && <Seasons p={p} />}

          {tab === 'elenco' && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {p.credits.map((c, i) => {
                const person = getPerson(c.personId)
                if (!person) return null
                return (
                  <li key={i}>
                    <button onClick={() => nav.go({ name: 'artist', id: person.id })} className="flex w-full items-center gap-3 rounded-xl border border-linea bg-papel p-3 text-left hover:border-grafito">
                      <Avatar name={person.name} color={/Act|Intérprete|Titiritera/.test(c.role) ? '#E76F91' : '#23452E'} size={42} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{person.name}</span>
                        <span className="block truncate text-xs text-gris">
                          {c.role}
                          {c.character ? ` · ${c.character}` : ''}
                        </span>
                      </span>
                      <Icon name="next" size={18} className="text-gris" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {tab === 'resenas' && <Reviews p={p} />}
        </div>
      </div>
    </div>
  )
}

function TitleBlock({ p, status }: { p: Production; status: ReturnType<typeof currentSeason>['status'] }) {
  const nav = useNav()
  const { season } = currentSeason(p)
  const venue = getVenue(season.venueId)!
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={status} />
        <DemoBadge />
      </div>
      <h1 className="mt-2 font-marker text-[28px] leading-[1.02] md:text-5xl">{p.title}</h1>
      <p className="mt-1 text-sm text-grafito">{p.company}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.genres.map((g) => (
          <GenreTag key={g} genre={g} />
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-[13px]">
        <button onClick={() => nav.go({ name: 'venue', id: venue.id })} className="flex items-center gap-1.5 text-left font-semibold text-verde hover:underline">
          <Icon name="pin" size={15} /> {venue.name}, {venue.neighborhood}
        </button>
        <span className="flex items-center gap-1.5 font-mono text-grafito">
          <Icon name="calendar" size={15} /> {fmt.range(season.start, season.end)}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-grafito">
          <Icon name="clock" size={15} /> {p.durationMin} min · {p.age}
        </span>
      </div>
    </>
  )
}

function Spec({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow !text-[10px] text-gris">{label}</dt>
      <dd className={`mt-0.5 font-semibold ${mono ? 'font-mono tabular' : ''}`}>{value}</dd>
    </div>
  )
}

function Seasons({ p }: { p: Production }) {
  const nav = useNav()
  const { season, status } = currentSeason(p)
  const venue = getVenue(season.venueId)!
  const shows = status === 'archivo' ? [] : upcomingPerformances(season, 6)
  const byDay = [1, 2, 3, 4, 5, 6, 0]
    .map((d) => ({ d, times: season.schedule.filter((s) => s.day === d).map((s) => s.time) }))
    .filter((x) => x.times.length)
  const sorted = [...p.seasons].sort((a, b) => b.start.localeCompare(a.start))

  return (
    <div className="flex flex-col gap-6">
      {status !== 'archivo' ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-bold">
              {season.kind} en {venue.name}
            </h3>
            <span className="font-mono text-sm text-grafito">{fmt.range(season.start, season.end)}</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[13px]">
            {byDay.map(({ d, times }) => (
              <span key={d}>
                <b className="capitalize">{fmt.weekdayLong(d)}</b> {times.join(' y ')}
              </span>
            ))}
          </div>
          <div>
            <h4 className="eyebrow mb-2 text-gris">Próximas funciones</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shows.map((s) => (
                <div key={s.date + s.time} className="ticket flex items-stretch overflow-hidden" style={{ ['--notch' as string]: '68%' }}>
                  <div className="flex-1 px-3 py-2.5">
                    <div className="font-mono text-[11px] uppercase text-gris">{fmt.weekday(s.date)}</div>
                    <div className="font-mono text-[15px] font-bold">{fmt.dayMonth(s.date)}</div>
                  </div>
                  <div className="ticket-stub grid place-items-center px-3 font-mono text-[15px] font-bold text-rojo">{s.time}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-linea bg-papel p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="eyebrow text-gris">Boletos</div>
              <div className="font-mono text-lg font-bold tabular">{fmt.price(season.priceFrom, season.priceTo)} MXN</div>
              <p className="mt-1 text-xs text-gris">La venta de boletos no está conectada en este prototipo. En la versión real, este botón llevará a la taquilla oficial del teatro.</p>
            </div>
            <Button icon="ticket" disabled className="shrink-0">
              Comprar boletos
            </Button>
          </div>
        </section>
      ) : (
        <div className="rounded-xl bg-verde-claro p-4 text-sm text-verde">
          <b>Esta producción está en el Archivo.</b> Su última temporada terminó el {fmt.short(season.end)}. Si la viste, puedes registrarla en tu diario con la fecha en que fuiste.
        </div>
      )}

      <section>
        <h3 className="eyebrow mb-2 text-gris">Historial de temporadas</h3>
        <ol className="flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
          {sorted.map((s) => {
            const v = getVenue(s.venueId)!
            return (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">
                    {s.kind} ·{' '}
                    <button className="text-verde hover:underline" onClick={() => nav.go({ name: 'venue', id: v.id })}>
                      {v.name}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-grafito">{fmt.range(s.start, s.end)}</div>
                </div>
                <StatusPill status={seasonStatus(s)} />
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

function Reviews({ p }: { p: Production }) {
  const store = useStore()
  const nav = useNav()
  const mine = store.entriesFor(p.id).filter((e) => e.review || e.rating)
  const list = reviewsFor(p.id)
  return (
    <div className="flex flex-col gap-3">
      {mine.map((e) => (
        <div key={e.id} className="rounded-xl border-2 border-amarillo bg-amarillo-claro/40 p-4">
          <div className="flex items-center gap-2 text-sm">
            <b>Tu reseña</b>
            {e.rating ? <Stars value={e.rating} size={13} /> : null}
            <span className="ml-auto font-mono text-xs text-grafito">{fmt.short(e.date)}</span>
          </div>
          {e.review && <p className="mt-2 text-[15px] leading-relaxed">{e.review}</p>}
          <button onClick={() => nav.go({ name: 'log', entryId: e.id })} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-rojo hover:underline">
            <Icon name="edit" size={14} /> Editar
          </button>
        </div>
      ))}
      {list.length === 0 && mine.length === 0 ? (
        <EmptyState icon="chat" title="Todavía no hay reseñas" text="¿La viste? Cuéntale a la comunidad qué te pareció." action="Escribir reseña" onAction={() => nav.go({ name: 'log', productionId: p.id })} />
      ) : (
        list.map((r) => <ReviewCard key={r.id} r={r} />)
      )}
    </div>
  )
}

export function ReviewCard({ r, showProduction = false }: { r: CommunityReview; showProduction?: boolean }) {
  const nav = useNav()
  const store = useStore()
  const [reveal, setReveal] = useState(!r.spoiler)
  const u = getCommunityUser(r.userId)!
  const p = getProduction(r.productionId)!
  const liked = store.likes.includes(r.id)
  return (
    <article className="flex gap-3 rounded-xl border border-linea bg-papel p-4">
      {showProduction && (
        <button onClick={() => nav.go({ name: 'production', id: p.id })} className="w-16 shrink-0 self-start overflow-hidden rounded-sm" aria-label={`Ver ${p.title}`}>
          <Poster production={p} showCompany={false} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button onClick={() => nav.go({ name: 'profile', userId: u.id })} className="flex min-w-0 items-center gap-2 hover:underline">
            <Avatar name={u.name} color={u.color} size={28} />
            <span className="truncate text-sm font-semibold">{u.name}</span>
          </button>
          <span className="ml-auto shrink-0 font-mono text-[11px] text-gris">{fmt.short(r.date)}</span>
        </div>
        {showProduction && (
          <button onClick={() => nav.go({ name: 'production', id: p.id })} className="mt-2 block text-left font-bold hover:underline">
            {p.title}
          </button>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <Stars value={r.rating} size={13} />
        </div>
        {reveal ? (
          <p className="mt-2 text-[15px] leading-relaxed">{r.text}</p>
        ) : (
          <button onClick={() => setReveal(true)} className="mt-2 w-full rounded-lg bg-carton/70 px-3 py-3 text-left text-sm font-semibold">
            Esta reseña revela detalles del final. <span className="text-rojo underline">Mostrar</span>
          </button>
        )}
        <button onClick={() => store.toggleLike(r.id)} aria-pressed={liked} className={`mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold ${liked ? 'text-rojo' : 'text-gris hover:text-tinta'}`}>
          <Icon name="heart" size={16} filled={liked} />
          <span className="tabular">{r.likes + (liked ? 1 : 0)}</span>
        </button>
      </div>
    </article>
  )
}

