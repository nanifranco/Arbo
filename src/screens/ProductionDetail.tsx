import { useMemo, useState } from 'react'
import {
  allCommunityReviews,
  currentSeason,
  fmt,
  getCommunityUser,
  getPerson,
  getProduction,
  getVenue,
  getWork,
  parseISO,
  RATING_THRESHOLD,
  ratingStats,
  relatedTo,
  reviewsFor,
  seasonStatus,
  TODAY,
  toISO,
  type RatingStats,
} from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import type { CommunityReview, Production } from '../data/types'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { HalftonePortrait, HandNote, isLight, Stamp, Tape } from '../components/deco'
import { Avatar, Button, DemoBadge, EmptyState, PosterCard, ScreenHeader, SectionTitle, Stars, StatusPill } from '../components/ui'
import { ListPicker } from './Lists'

type Tab = 'programa' | 'funciones' | 'elenco' | 'resenas'

export function ProductionDetail({ id }: { id: string }) {
  const p = getProduction(id)
  if (!p)
    return (
      <>
        <ScreenHeader />
        <EmptyState icon="info" title="No encontramos esta obra" text="Puede que el enlace esté mal escrito o que la ficha se haya retirado del catálogo." />
      </>
    )
  return <Detail key={p.id} p={p} />
}

function Detail({ p }: { p: Production }) {
  const nav = useNav()
  const store = useStore()
  const { season, status } = currentSeason(p)
  const [tab, setTab] = useState<Tab>(status === 'archivo' ? 'programa' : 'funciones')
  const [picking, setPicking] = useState(false)
  const venue = getVenue(season.venueId)!
  const mine = store.entriesFor(p.id)
  const ownRatings = mine.map((e) => e.rating).filter((r): r is number => !!r)
  const stats = ratingStats(p.id, ownRatings.slice(0, 1))
  const watching = store.watchlist.includes(p.id)
  const fav = store.favorites.includes(p.id)
  const seen = mine.length > 0
  const { bg, fg, accent } = p.poster
  const friends = allCommunityReviews().filter((r) => r.productionId === p.id && store.follows.includes(r.userId))
  const related = relatedTo(p, 5)

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

      {/* ——— Héroe con los colores del cartel ——— */}
      <section className="relative -mx-4 -mt-4 overflow-hidden md:mx-0 md:mt-0 md:rounded-2xl" style={{ background: bg, color: fg }}>
        <div className="halftone absolute inset-0 opacity-[.13]" style={{ color: fg }} aria-hidden="true" />
        <div className="absolute inset-0" style={{ backgroundImage: 'var(--grain)' }} aria-hidden="true" />
        <div className="absolute -right-16 -top-16 size-72 rounded-full opacity-40" style={{ background: accent }} aria-hidden="true" />
        <div className="relative grid gap-6 px-5 pb-8 pt-7 md:grid-cols-[250px_1fr] md:items-end md:gap-10 md:p-10">
          <div className="relative mx-auto w-[58%] max-w-[240px] -rotate-2 md:mx-0 md:w-full">
            <div className="shadow-[0_26px_40px_-18px_rgba(0,0,0,.75)]">
              <Poster production={p} />
            </div>
            <Tape />
            {status !== 'cartelera' && (
              <div className="absolute -right-6 bottom-6">
                <Stamp color={status === 'archivo' ? '#191919' : '#B71C1C'} rotate={-12} size="lg" animate>
                  {status === 'archivo' ? 'Archivo' : 'Próximamente'}
                </Stamp>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={status} />
              <DemoBadge className={isLight(bg) ? '' : '!border-current !text-current'} />
            </div>
            <h1 className="mt-3 font-marker text-[38px] leading-[0.98] md:text-[60px]">{p.title}</h1>
            <p className="mt-2 text-[15px] opacity-90">
              {p.company} · {getWork(p.workId)?.author}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.genres.map((g) => (
                <span key={g} className="rounded-sm px-2 py-0.5 text-[12px] font-bold" style={{ background: fg, color: bg }}>
                  {g}
                </span>
              ))}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Teatro', venue.name],
                ['Temporada', fmt.range(season.start, season.end)],
                ['Duración', `${p.durationMin} min`],
                ['Clasificación', p.age],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md px-3 py-2" style={{ background: isLight(bg) ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.22)' }}>
                  <dt className="text-[10px] font-bold uppercase tracking-widest opacity-75">{k}</dt>
                  <dd className="mt-0.5 font-mono text-[13px] font-bold leading-tight">
                    {k === 'Teatro' ? (
                      <button onClick={() => nav.go({ name: 'venue', id: venue.id })} className="text-left underline decoration-dotted underline-offset-2">
                        {v}
                      </button>
                    ) : (
                      v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ——— Acciones ——— */}
      <div className="sticky top-[calc(env(safe-area-inset-top,0px)+57px)] z-10 -mx-4 mt-0 flex gap-2 overflow-x-auto border-b border-linea bg-crema/95 px-4 py-3 backdrop-blur no-scrollbar md:mx-0 md:mt-4 md:rounded-xl md:border md:bg-papel/90">
        <Button icon={seen ? 'repeat' : 'eye'} onClick={() => nav.go({ name: 'log', productionId: p.id })} className="shrink-0">
          {seen ? 'La vi otra vez' : 'La vi'}
        </Button>
        {status !== 'archivo' && (
          <Button variant="secondary" icon="bookmark" ariaPressed={watching} onClick={toggleWatch} className="shrink-0">
            {watching ? 'En Por ver' : 'Por ver'}
          </Button>
        )}
        <Button variant="secondary" icon="heart" ariaPressed={fav} onClick={toggleFav} className={`shrink-0 ${fav ? '!text-rojo' : ''}`}>
          Favorita
        </Button>
        <Button variant="secondary" icon="list" onClick={() => setPicking(true)} className="shrink-0">
          A una lista
        </Button>
      </div>
      <ListPicker productionId={p.id} open={picking} onClose={() => setPicking(false)} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {seen && (
            <button onClick={() => nav.tab('diary')} className="ticket flex items-stretch overflow-hidden text-left" style={{ ['--notch' as string]: '82%' }}>
              <div className="grid w-16 shrink-0 place-items-center bg-verde text-papel">
                <Icon name="check" size={26} strokeWidth={2.6} />
              </div>
              <div className="min-w-0 flex-1 px-4 py-3">
                <div className="font-display text-lg uppercase leading-none">En tu diario</div>
                <div className="mt-1 text-sm text-gris">{mine.length === 1 ? `La viste el ${fmt.short(mine[0].date)}` : `La has visto ${mine.length} veces`}</div>
              </div>
              <div className="ticket-stub grid place-items-center px-4">{mine[0].rating ? <Stars value={mine[0].rating} size={14} /> : <span className="text-xs text-gris">Sin calificar</span>}</div>
            </button>
          )}

          <div className="no-scrollbar flex gap-1 overflow-x-auto border-b-2 border-tinta" role="tablist">
            {(
              [
                ['funciones', status === 'archivo' ? 'Temporadas' : 'Funciones'],
                ['programa', 'Programa de mano'],
                ['elenco', 'Elenco y equipo'],
                ['resenas', `Reseñas · ${reviewsFor(p.id).length + mine.filter((m) => m.review).length}`],
              ] as [Tab, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`-mb-[2px] shrink-0 rounded-t-md px-3.5 py-2.5 font-display text-[16px] uppercase tracking-wide ${tab === t ? 'bg-tinta text-papel' : 'text-grafito hover:text-tinta'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'programa' && <Program p={p} />}
          {tab === 'funciones' && <Functions p={p} />}
          {tab === 'elenco' && <Cast p={p} />}
          {tab === 'resenas' && <Reviews p={p} />}
        </div>

        {/* ——— Columna lateral ——— */}
        <aside className="flex flex-col gap-6">
          <RatingCard stats={stats} />
          {friends.length > 0 && (
            <div className="paper p-4">
              <div className="eyebrow mb-3 text-gris">Personas que sigues</div>
              <div className="flex flex-col gap-2.5">
                {friends.map((r) => {
                  const u = getCommunityUser(r.userId)!
                  return (
                    <button key={r.id} onClick={() => nav.go({ name: 'profile', userId: u.id })} className="flex items-center gap-2 text-left hover:underline">
                      <Avatar name={u.name} color={u.color} size={30} />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{u.name}</span>
                      <Stars value={r.rating} size={12} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {related.length > 0 && (
            <div>
              <SectionTitle>Si te gustó</SectionTitle>
              <div className="grid grid-cols-3 gap-3 lg:grid-cols-2">
                {related.slice(0, 4).map((r) => (
                  <PosterCard key={r.id} production={r} width="w-auto" showVenue={false} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

// ——— Calificación con umbral ———

function RatingCard({ stats }: { stats: RatingStats }) {
  const maxDist = Math.max(1, ...stats.dist)
  return (
    <section className="paper relative overflow-hidden p-5" aria-label="Calificación de la comunidad">
      <div className="eyebrow text-gris">Calificación de la comunidad</div>
      {stats.avg !== null ? (
        <>
          <div className="mt-2 flex items-end gap-3">
            <span className="font-display text-[64px] leading-[0.85] tabular">{stats.avg.toFixed(1)}</span>
            <div className="pb-1">
              <Stars value={stats.avg} size={16} />
              <div className="mt-1 text-xs text-gris tabular">{stats.count} calificaciones</div>
            </div>
          </div>
          <div className="mt-4 flex h-20 items-end gap-2" aria-label="Distribución de calificaciones">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[10px] text-gris tabular">{stats.dist[s - 1]}</span>
                <div className="w-full rounded-t-sm bg-amarillo" style={{ height: `${Math.max(3, (stats.dist[s - 1] / maxDist) * 52)}px` }} />
                <span className="font-display text-sm leading-none">{s}★</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-display text-[56px] leading-[0.85] tabular">{stats.count}</span>
            <span className="pb-1 font-display text-2xl text-gris">/ {RATING_THRESHOLD}</span>
          </div>
          <div className="mt-3 flex gap-1" aria-hidden="true">
            {Array.from({ length: RATING_THRESHOLD }).map((_, i) => (
              <span key={i} className={`h-2 flex-1 rounded-full ${i < stats.count ? 'bg-amarillo' : 'bg-carton'}`} />
            ))}
          </div>
          <p className="mt-2 text-[13px] text-grafito">El promedio se publica cuando hay {RATING_THRESHOLD} calificaciones. Por ahora, estas son las individuales:</p>
          {stats.count ? (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
              {[...stats.ratings]
                .sort((a, b) => b - a)
                .map((r, i) => (
                  <Stars key={i} value={r} size={12} />
                ))}
            </div>
          ) : (
            <p className="mt-2 font-hand text-lg text-rojo">¡sé la primera persona en calificarla!</p>
          )}
        </>
      )}
    </section>
  )
}

// ——— Programa de mano ———

function Leader({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-[13.5px]">
      <span className="shrink-0 text-grafito">{k}</span>
      <span className="min-w-4 flex-1 border-b-2 border-dotted border-linea" />
      <span className="text-right font-bold">{v}</span>
    </div>
  )
}

function Program({ p }: { p: Production }) {
  const work = getWork(p.workId)
  const cast = p.credits.filter((c) => c.character)
  const crew = p.credits.filter((c) => !c.character)
  return (
    <article className="paper torn-top relative px-5 pb-6 pt-8 md:px-8">
      <div className="text-center">
        <div className="eyebrow text-gris">{p.company} presenta</div>
        <h2 className="mt-1 font-marker text-[30px] leading-tight">{p.title}</h2>
        <div className="mx-auto mt-2 h-[3px] w-24 bg-rojo" />
      </div>
      <p className="mx-auto mt-5 max-w-[60ch] text-[15.5px] leading-relaxed first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[52px] first-letter:leading-[0.8] first-letter:text-rojo">{p.synopsis}</p>

      <div className="mt-7 grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg uppercase tracking-wide">Ficha</h3>
          <Leader k="Obra" v={work?.title ?? '—'} />
          <Leader k="Autoría" v={work ? `${work.author}${work.year ? ` (${work.year < 0 ? `${-work.year} a. C.` : work.year})` : ''}` : '—'} />
          <Leader k="Compañía" v={p.company} />
          <Leader k="Duración" v={`${p.durationMin} min`} />
          <Leader k="Clasificación" v={p.age} />
          <Leader k="Temporadas" v={String(p.seasons.length)} />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg uppercase tracking-wide">Créditos</h3>
          {crew.map((c, i) => (
            <Leader key={i} k={c.role} v={getPerson(c.personId)?.name ?? ''} />
          ))}
          {cast.length > 0 && <h3 className="mt-3 font-display text-lg uppercase tracking-wide">Reparto</h3>}
          {cast.map((c, i) => (
            <Leader key={i} k={c.character!} v={getPerson(c.personId)?.name ?? ''} />
          ))}
        </div>
      </div>
      <p className="mt-7 border-t border-dashed border-linea pt-3 text-xs text-gris">
        <b>Obra</b> es el texto; <b>producción</b> es esta puesta en escena de {p.company}; cada <b>temporada</b> es un periodo de funciones en un teatro. Cartel generado para la demostración.
      </p>
    </article>
  )
}

// ——— Funciones: calendario + horarios + precios ———

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function Functions({ p }: { p: Production }) {
  const nav = useNav()
  const { season, status } = currentSeason(p)
  const venue = getVenue(season.venueId)!
  const firstDate = status === 'proximamente' ? parseISO(season.start) : TODAY
  const [month, setMonth] = useState(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1))
  const playing = (d: Date) => {
    const iso = toISO(d)
    return iso >= season.start && iso <= season.end && iso >= toISO(TODAY) ? season.schedule.filter((s) => s.day === d.getDay()).map((s) => s.time) : []
  }
  const firstPlayable = useMemo(() => {
    for (let i = 0; i < 120; i++) {
      const d = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + i)
      if (playing(d).length) return d
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id])
  const [picked, setPicked] = useState<Date | null>(firstPlayable)
  const startPad = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: startPad + daysInMonth }, (_, i) => (i < startPad ? null : new Date(month.getFullYear(), month.getMonth(), i - startPad + 1)))
  const seasonStart = parseISO(season.start)
  const seasonEnd = parseISO(season.end)
  const minDate = new Date(Math.max(TODAY.getTime(), seasonStart.getTime()))
  const canPrev = month > new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= seasonEnd
  const times = picked ? playing(picked) : []
  const tiers = [
    { name: 'General', price: season.priceTo },
    { name: 'Preferente', price: Math.round((season.priceFrom + season.priceTo) / 2) },
    { name: 'Estudiantes y personas mayores', price: season.priceFrom },
  ].filter((t, i, arr) => arr.findIndex((x) => x.price === t.price) === i)

  return (
    <div className="flex flex-col gap-8">
      {status !== 'archivo' ? (
        <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
          <div className="paper p-4">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} disabled={!canPrev} className="grid size-9 place-items-center rounded-full hover:bg-carton disabled:opacity-30" aria-label="Mes anterior">
                <Icon name="back" />
              </button>
              <div className="font-display text-xl uppercase tracking-wide">{fmt.monthYear(toISO(month))}</div>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} disabled={!canNext} className="grid size-9 place-items-center rounded-full hover:bg-carton disabled:opacity-30" aria-label="Mes siguiente">
                <Icon name="next" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEK.map((w, i) => (
                <span key={i} className="pb-1 text-[11px] font-bold text-gris">
                  {w}
                </span>
              ))}
              {cells.map((d, i) => {
                if (!d) return <span key={i} />
                const t = playing(d)
                const sel = picked && toISO(picked) === toISO(d)
                const isToday = toISO(d) === toISO(TODAY)
                return (
                  <button
                    key={i}
                    disabled={!t.length}
                    onClick={() => setPicked(d)}
                    aria-pressed={!!sel}
                    aria-label={`${d.getDate()}${t.length ? `, ${t.length} funciones` : ', sin función'}`}
                    className={`relative grid aspect-square place-items-center rounded-md font-display text-[17px] tabular transition-colors ${sel ? 'bg-rojo text-papel' : t.length ? 'bg-amarillo-claro hover:bg-amarillo' : 'text-gris/50'} ${isToday && !sel ? 'ring-2 ring-tinta' : ''}`}
                  >
                    {d.getDate()}
                    {t.length > 0 && <span className={`absolute bottom-1 flex gap-0.5`}>{t.map((_, k) => <span key={k} className={`size-1 rounded-full ${sel ? 'bg-papel' : 'bg-rojo'}`} />)}</span>}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-gris">Los días resaltados tienen función. Cada punto es un horario.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="eyebrow text-gris">{picked ? `${fmt.weekdayLong(picked.getDay())} ${picked.getDate()} de ${fmt.monthYear(toISO(picked)).split(' ')[0]}` : 'Elige un día'}</div>
              <div className="mt-2 flex flex-col gap-3">
                {times.map((t) => (
                  <div key={t} className="ticket flex items-stretch overflow-hidden" style={{ ['--notch' as string]: '70%' }}>
                    <div className="flex-1 px-4 py-3">
                      <div className="font-display text-[15px] uppercase leading-none">{venue.name}</div>
                      <div className="mt-1 text-xs text-gris">
                        {venue.neighborhood} · {p.durationMin} min
                      </div>
                    </div>
                    <div className="ticket-stub grid place-items-center px-5 font-display text-[28px] leading-none text-rojo tabular">{t}</div>
                  </div>
                ))}
                {!times.length && <p className="text-sm text-gris">No hay funciones ese día.</p>}
              </div>
            </div>
            <div className="paper p-4">
              <div className="eyebrow text-gris">Boletos</div>
              <div className="mt-2 flex flex-col gap-1.5">
                {tiers.map((t) => (
                  <div key={t.name} className="flex items-baseline gap-2 font-mono text-[13px]">
                    <span className="text-grafito">{t.name}</span>
                    <span className="flex-1 border-b-2 border-dotted border-linea" />
                    <span className="font-bold tabular">${t.price}</span>
                  </div>
                ))}
              </div>
              <Button icon="ticket" disabled className="mt-4 w-full">
                Comprar boletos
              </Button>
              <p className="mt-2 text-xs text-gris">La venta de boletos no está conectada en este prototipo. En la versión real, este botón llevará a la taquilla oficial del teatro o a la venta directa de ÁRBO.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="wall relative rounded-xl p-5">
          <Stamp color="#191919" rotate={-6} className="mb-3">
            Temporada terminada
          </Stamp>
          <p className="text-[15px]">
            La última temporada terminó el <b>{fmt.short(season.end)}</b>. Si la viste, puedes registrarla en tu diario con la fecha en que fuiste.
          </p>
          <Button className="mt-4" icon="eye" onClick={() => nav.go({ name: 'log', productionId: p.id })}>
            Registrar en mi diario
          </Button>
        </div>
      )}

      <SeasonTimeline p={p} />
    </div>
  )
}

/** Línea de tiempo de temporadas, estrenos y reposiciones */
function SeasonTimeline({ p }: { p: Production }) {
  const nav = useNav()
  const seasons = [...p.seasons].sort((a, b) => a.start.localeCompare(b.start))
  const y0 = parseISO(seasons[0].start).getFullYear()
  const y1 = Math.max(parseISO(seasons[seasons.length - 1].end).getFullYear(), TODAY.getFullYear())
  const span = new Date(y1 + 1, 0, 1).getTime() - new Date(y0, 0, 1).getTime()
  const pos = (iso: string) => ((parseISO(iso).getTime() - new Date(y0, 0, 1).getTime()) / span) * 100
  const years = Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i)
  return (
    <section>
      <SectionTitle eyebrow="Estreno, temporadas y reposiciones">Historia de la producción</SectionTitle>
      <div className="paper p-4">
        <div className="relative h-24">
          {years.map((y) => (
            <div key={y} className="absolute top-0 h-full border-l border-dashed border-linea" style={{ left: `${pos(`${y}-01-01`)}%` }}>
              <span className="absolute left-1 top-0 font-display text-sm text-gris">{y}</span>
            </div>
          ))}
          <div className="absolute top-0 h-full border-l-2 border-rojo" style={{ left: `${pos(toISO(TODAY))}%` }}>
            <span className="absolute -left-4 bottom-0 font-hand text-sm text-rojo">hoy</span>
          </div>
          {seasons.map((s, i) => {
            const st = seasonStatus(s)
            return (
              <div
                key={s.id}
                className={`absolute h-5 rounded-sm ${st === 'archivo' ? 'bg-grafito/60' : st === 'cartelera' ? 'bg-rojo' : 'bg-amarillo'}`}
                style={{ left: `${pos(s.start)}%`, width: `${Math.max(1.6, pos(s.end) - pos(s.start))}%`, top: 30 + (i % 2) * 22 }}
                title={`${s.kind}: ${fmt.range(s.start, s.end)}`}
              />
            )
          })}
        </div>
        <ol className="mt-3 flex flex-col divide-y divide-dashed divide-linea">
          {[...seasons].reverse().map((s) => {
            const v = getVenue(s.venueId)!
            return (
              <li key={s.id} className="flex items-center gap-3 py-2.5">
                <span className="w-12 shrink-0 font-display text-xl leading-none tabular">{s.start.slice(0, 4)}</span>
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
      </div>
    </section>
  )
}

// ——— Elenco ———

function Cast({ p }: { p: Production }) {
  const nav = useNav()
  const palette = [
    ['#23452E', '#E9B321'],
    ['#B71C1C', '#F6E3A8'],
    ['#21418F', '#E76F91'],
    ['#191919', '#E9B321'],
  ]
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {p.credits.map((c, i) => {
        const person = getPerson(c.personId)
        if (!person) return null
        const [bg, ink] = palette[i % palette.length]
        return (
          <button key={i} onClick={() => nav.go({ name: 'artist', id: person.id })} className="group bg-papel p-2 pb-3 text-left shadow-[0_10px_18px_-12px_rgba(0,0,0,.55)] transition-transform hover:-translate-y-1" style={{ rotate: `${((i % 3) - 1) * 1.2}deg` }}>
            <HalftonePortrait seed={person.id} bg={bg} ink={ink} label={`Retrato ilustrado de ${person.name}`} />
            <div className="mt-2 font-display text-[17px] uppercase leading-none">{person.name}</div>
            <div className="mt-1 text-xs text-gris">
              {c.role}
              {c.character ? ` · ${c.character}` : ''}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ——— Reseñas ———

function Reviews({ p }: { p: Production }) {
  const store = useStore()
  const nav = useNav()
  const mine = store.entriesFor(p.id).filter((e) => e.review || e.rating)
  const list = reviewsFor(p.id)
  return (
    <div className="flex flex-col gap-4">
      {mine.map((e) => (
        <div key={e.id} className="relative bg-amarillo-claro p-4 shadow-[0_8px_16px_-12px_rgba(0,0,0,.5)]" style={{ backgroundImage: 'var(--grain)' }}>
          <Tape tone="clear" />
          <div className="flex items-center gap-2 text-sm">
            <b className="font-display text-base uppercase">Tu reseña</b>
            {e.rating ? <Stars value={e.rating} size={13} /> : null}
            <span className="ml-auto font-mono text-xs text-grafito">{fmt.short(e.date)}</span>
          </div>
          {e.review && <p className="mt-2 font-hand text-[21px] leading-snug">{e.review}</p>}
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
      {list.length > 0 && <HandNote arrow="up">¿y tú qué opinas? toca “La vi”</HandNote>}
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
    <article className="paper flex gap-4 p-4">
      {showProduction && (
        <button onClick={() => nav.go({ name: 'production', id: p.id })} className="w-[72px] shrink-0 -rotate-2 self-start shadow-md" aria-label={`Ver ${p.title}`}>
          <Poster production={p} showCompany={false} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button onClick={() => nav.go({ name: 'profile', userId: u.id })} className="flex min-w-0 items-center gap-2 hover:underline">
            <Avatar name={u.name} color={u.color} size={30} />
            <span className="truncate text-sm font-semibold">{u.name}</span>
          </button>
          <span className="ml-auto shrink-0 font-mono text-[11px] text-gris">{fmt.short(r.date)}</span>
        </div>
        {showProduction && (
          <button onClick={() => nav.go({ name: 'production', id: p.id })} className="mt-2 block text-left font-display text-lg uppercase leading-tight hover:underline">
            {p.title}
          </button>
        )}
        <div className="mt-1.5">
          <Stars value={r.rating} size={14} />
        </div>
        {reveal ? (
          <p className="mt-2 text-[15px] leading-relaxed">{r.text}</p>
        ) : (
          <button onClick={() => setReveal(true)} className="mt-2 w-full rounded-md bg-tinta px-3 py-3 text-left text-sm font-semibold text-papel">
            <span className="font-display uppercase text-amarillo">Spoiler</span> · Esta reseña revela detalles del final. <span className="underline">Mostrar</span>
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

