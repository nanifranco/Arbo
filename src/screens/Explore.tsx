import { useMemo, useState } from 'react'
import {
  addDays,
  DAY_NAMES,
  performancesOn,
  ALL_GENRES,
  allProductions,
  allVenues,
  currentSeason,
  fmt,
  getVenue,
  getWork,
  performsOn,
  popularity,
  productionsAtVenue,
  ratingStats,
  searchAll,
  TODAY,
} from '../lib/catalog'
import { useNav } from '../lib/store'
import type { Production } from '../data/types'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { Facade, FACADE } from '../components/deco'
import { Photo } from '../components/Photo'
import { MetroChip } from '../components/broadway'
import { Avatar, Button, Chip, CommunityScore, DemoBadge, EmptyState, Sheet, StatusPill } from '../components/ui'

type DateFilter = 'any' | 'today' | 'weekend' | 'week'
type TimeFilter = 'any' | 'matine' | 'tarde' | 'noche'
type Sort = 'popular' | 'rating' | 'closing' | 'az'

interface Filters {
  genres: string[]
  alcaldia: string
  venue: string
  maxPrice: number
  date: DateFilter
  time: TimeFilter
  minRating: number
  sort: Sort
  includeUpcoming: boolean
}

const DEFAULTS: Filters = { genres: [], alcaldia: '', venue: '', maxPrice: 800, date: 'any', time: 'any', minRating: 0, sort: 'popular', includeUpcoming: false }

const DATE_LABEL: Record<DateFilter, string> = { any: 'Cualquier fecha', today: 'Hoy', weekend: 'Este fin de semana', week: 'Próximos 7 días' }
const TIME_LABEL: Record<TimeFilter, string> = { any: 'Cualquier hora', matine: 'Matiné (antes de 15:00)', tarde: 'Tarde (15:00–18:59)', noche: 'Noche (19:00 o más)' }
const SORT_LABEL: Record<Sort, string> = { popular: 'Popularidad', rating: 'Calificación', closing: 'Termina pronto', az: 'A–Z' }

function datesFor(f: DateFilter): Date[] {
  const days = (n: number, from = TODAY) => Array.from({ length: n }, (_, i) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + i))
  if (f === 'today') return days(1)
  if (f === 'week') return days(7)
  if (f === 'weekend') {
    const d = TODAY.getDay()
    const toFri = d === 0 ? -2 : d === 6 ? -1 : 5 - d
    const fri = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + toFri)
    return days(3, fri).filter((x) => x >= TODAY)
  }
  return []
}
const timeOk = (t: string, f: TimeFilter) => (f === 'any' ? true : f === 'matine' ? t < '15:00' : f === 'tarde' ? t >= '15:00' && t < '19:00' : t >= '19:00')

export function Explore({ initialTab = 'cartelera', initialQuery = '', initialGenre }: { initialTab?: 'cartelera' | 'teatros' | 'archivo'; initialQuery?: string; initialGenre?: string }) {
  const nav = useNav()
  const [tab, setTab] = useState(initialTab)
  const [q, setQ] = useState(initialQuery)
  const [f, setF] = useState<Filters>({ ...DEFAULTS, genres: initialGenre ? [initialGenre] : [] })
  const [sheet, setSheet] = useState(false)
  const [view, setView] = useState<'carteles' | 'semana'>('carteles')

  const results = useMemo(() => searchAll(q), [q])
  const alcaldias = [...new Set(allVenues().map((v) => v.alcaldia))]

  const activeCount =
    (f.alcaldia ? 1 : 0) + (f.venue ? 1 : 0) + (f.maxPrice < 800 ? 1 : 0) + (f.date !== 'any' ? 1 : 0) + (f.time !== 'any' ? 1 : 0) + (f.minRating ? 1 : 0) + (f.includeUpcoming ? 1 : 0)

  const list = useMemo(() => {
    const wanted = tab === 'archivo' ? ['archivo'] : f.includeUpcoming ? ['cartelera', 'proximamente'] : ['cartelera']
    const dates = datesFor(f.date)
    let out = allProductions().filter((p) => {
      const { season, status } = currentSeason(p)
      if (!wanted.includes(status)) return false
      if (f.genres.length && !f.genres.some((g) => p.genres.includes(g as never))) return false
      const v = getVenue(season.venueId)!
      if (tab !== 'archivo') {
        if (f.alcaldia && v.alcaldia !== f.alcaldia) return false
        if (f.venue && v.id !== f.venue) return false
        if (season.priceFrom > f.maxPrice) return false
        if (f.date !== 'any' || f.time !== 'any') {
          const slots = f.date === 'any' ? season.schedule : dates.flatMap((d) => performsOn(season, d))
          if (!slots.some((s) => timeOk(s.time, f.time))) return false
        }
      }
      if (f.minRating && (ratingStats(p.id).avg ?? 0) < f.minRating) return false
      return true
    })
    out = [...out].sort((a, b) => {
      if (f.sort === 'rating') return (ratingStats(b.id).avg ?? -1) - (ratingStats(a.id).avg ?? -1)
      if (f.sort === 'closing') return currentSeason(a).season.end.localeCompare(currentSeason(b).season.end)
      if (f.sort === 'az') return a.title.localeCompare(b.title, 'es')
      return popularity(b.id) - popularity(a.id)
    })
    return out
  }, [f, tab])

  const searching = q.trim().length > 0
  const nothingFound = searching && !results.productions.length && !results.venues.length && !results.people.length

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-end justify-between gap-3 pt-3">
        <h1 className="font-display text-[44px] uppercase leading-[0.9] md:text-[56px]">
          {tab === 'teatros' ? 'Teatros' : tab === 'archivo' ? 'Archivo' : 'Cartelera'}
        </h1>
        <span className="mb-1 hidden text-sm text-gris sm:block">{tab === 'teatros' ? 'Los foros de la ciudad' : tab === 'archivo' ? 'Temporadas que ya terminaron' : 'Todo lo que hay en la ciudad'}</span>
      </div>

      <div className="sticky top-[env(safe-area-inset-top,0px)] z-20 -mx-4 bg-crema/95 px-4 pb-2 pt-1 backdrop-blur md:mx-0 md:px-0">
        <label htmlFor="search" className="sr-only">
          Buscar obras, teatros o artistas
        </label>
        <div className="flex items-center gap-2 rounded-full border border-linea bg-papel px-4 focus-within:border-tinta">
          <Icon name="search" size={18} className="text-gris" />
          <input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Obras, teatros, artistas o géneros"
            className="h-12 w-full bg-transparent text-[15px] focus:outline-none"
            type="search"
            autoComplete="off"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Borrar búsqueda" className="grid size-8 place-items-center rounded-full hover:bg-carton">
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
        {!searching && (
          <div className="mt-3 flex items-center gap-1 overflow-x-auto no-scrollbar" role="tablist" aria-label="Secciones">
            {(['cartelera', 'teatros', 'archivo'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === t ? 'bg-rojo text-papel' : 'text-grafito hover:bg-carton/60'}`}
              >
                {t === 'cartelera' ? 'Cartelera' : t === 'teatros' ? 'Teatros' : 'Archivo'}
              </button>
            ))}
            <button onClick={() => nav.go({ name: 'map' })} className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-linea bg-papel px-3 py-2 text-sm font-semibold hover:border-grafito">
              <Icon name="map" size={16} /> Mapa
            </button>
          </div>
        )}
      </div>

      {searching ? (
        nothingFound ? (
          <EmptyState icon="search" title="Sin resultados" text={`No encontramos nada para “${q}”. Prueba con el nombre de una colonia, un género como “comedia” o el apellido de una actriz.`} action="Sugerir esta obra" onAction={() => nav.go({ name: 'suggest', title: q.trim() })} />
        ) : (
          <>
            <SearchResults r={results} />
            <button onClick={() => nav.go({ name: 'suggest', title: q.trim() })} className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-rojo hover:underline">
              <Icon name="plus" size={16} /> ¿No está la que buscas? Sugerir una obra
            </button>
          </>
        )
      ) : tab === 'teatros' ? (
        <VenueList />
      ) : (
        <>
          {/* Filtros */}
          <div className="flex flex-col gap-3">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
              <button
                onClick={() => setSheet(true)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold ${activeCount ? 'border-rojo bg-rosa-claro text-rojo-hondo' : 'border-tinta bg-papel'}`}
              >
                <Icon name="filter" size={16} /> Filtros{activeCount ? ` · ${activeCount}` : ''}
              </button>
              {ALL_GENRES.map((g) => (
                <Chip key={g} active={f.genres.includes(g)} onClick={() => setF({ ...f, genres: f.genres.includes(g) ? f.genres.filter((x) => x !== g) : [...f.genres, g] })}>
                  {g}
                </Chip>
              ))}
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gris">
                <b className="tabular text-tinta">{list.length}</b> {list.length === 1 ? 'obra' : 'obras'}
                {tab === 'archivo' ? ' en el archivo' : ''}
              </span>
              {tab === 'cartelera' && (
                <div className="ml-auto mr-3 flex rounded-full border border-linea bg-papel p-0.5" role="group" aria-label="Vista">
                  {(['carteles', 'semana'] as const).map((v) => (
                    <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`rounded-full px-3 py-1 text-[12px] font-bold capitalize ${view === v ? 'bg-tinta text-papel' : 'text-grafito'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              )}
              <label className={`flex items-center gap-1.5 ${tab === 'cartelera' && view === 'semana' ? 'hidden' : ''}`}>
                <span className="text-gris">Ordenar</span>
                <select id="sort" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value as Sort })} className="rounded-md border border-linea bg-papel px-2 py-1 font-semibold">
                  {(Object.keys(SORT_LABEL) as Sort[])
                    .filter((s) => !(tab === 'archivo' && s === 'closing'))
                    .map((s) => (
                      <option key={s} value={s}>
                        {SORT_LABEL[s]}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            {tab === 'archivo' && (
              <p className="rounded-lg bg-verde-claro px-3 py-2 text-[13px] text-verde">
                Producciones cuya temporada ya terminó. Siguen disponibles para consultar su ficha y registrarlas en tu diario.
              </p>
            )}
          </div>

          {list.length === 0 ? (
            <EmptyState
              icon="filter"
              title="Nada con esos filtros"
              text="Ninguna obra coincide con todo lo que elegiste. Quita algún filtro o amplía la fecha."
              action="Quitar filtros"
              onAction={() => setF({ ...DEFAULTS })}
            />
          ) : tab === 'cartelera' && view === 'semana' ? (
            <WeekView ids={list.map((p) => p.id)} />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => (
                <ResultCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Filtros">
        <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
          <FilterGroup label="Fecha">
            {(Object.keys(DATE_LABEL) as DateFilter[]).map((d) => (
              <Chip key={d} active={f.date === d} onClick={() => setF({ ...f, date: d })}>
                {DATE_LABEL[d]}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Horario">
            {(Object.keys(TIME_LABEL) as TimeFilter[]).map((t) => (
              <Chip key={t} active={f.time === t} onClick={() => setF({ ...f, time: t })}>
                {TIME_LABEL[t]}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Ubicación">
            <Chip active={!f.alcaldia} onClick={() => setF({ ...f, alcaldia: '', venue: '' })}>
              Toda la ciudad
            </Chip>
            {alcaldias.map((a) => (
              <Chip key={a} active={f.alcaldia === a} onClick={() => setF({ ...f, alcaldia: a, venue: '' })}>
                {a}
              </Chip>
            ))}
          </FilterGroup>
          <div>
            <label htmlFor="f-venue" className="mb-2 block text-[13px] font-bold">
              Teatro
            </label>
            <select id="f-venue" value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} className="w-full rounded-lg border border-linea bg-papel px-3 py-2.5">
              <option value="">Todos los teatros</option>
              {allVenues()
                .filter((v) => !f.alcaldia || v.alcaldia === f.alcaldia)
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.neighborhood}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-price" className="mb-2 flex justify-between text-[13px] font-bold">
              <span>Precio desde</span>
              <span className="font-mono tabular">{f.maxPrice >= 800 ? 'Cualquiera' : `hasta $${f.maxPrice}`}</span>
            </label>
            <input id="f-price" type="range" min={150} max={800} step={50} value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: Number(e.target.value) })} className="w-full accent-[#B71C1C]" />
          </div>
          <FilterGroup label="Calificación de la comunidad">
            {[0, 3, 4, 4.5].map((r) => (
              <Chip key={r} active={f.minRating === r} onClick={() => setF({ ...f, minRating: r })}>
                {r ? `${r}+ estrellas` : 'Todas'}
              </Chip>
            ))}
          </FilterGroup>
          <label className="flex items-center justify-between gap-3 rounded-lg border border-linea px-3 py-2.5 text-sm font-semibold">
            Incluir obras que estrenan pronto
            <input type="checkbox" id="f-upcoming" checked={f.includeUpcoming} onChange={(e) => setF({ ...f, includeUpcoming: e.target.checked })} className="size-5 accent-[#B71C1C]" />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={() => setF({ ...DEFAULTS, genres: f.genres, sort: f.sort })}>
            Limpiar
          </Button>
          <Button className="flex-1" onClick={() => setSheet(false)}>
            Ver {list.length} {list.length === 1 ? 'obra' : 'obras'}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-bold">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function ResultCard({ p }: { p: Production }) {
  const nav = useNav()
  const { season, status } = currentSeason(p)
  const v = getVenue(season.venueId)
  const r = ratingStats(p.id)
  return (
    <button onClick={() => nav.go({ name: 'production', id: p.id })} className="group flex flex-col text-left">
      <div className="poster-lift relative overflow-hidden rounded-[3px] shadow-[0_12px_20px_-12px_rgba(25,25,25,.6)]">
        <Poster production={p} />
        {status !== 'cartelera' && (
          <div className="absolute left-1.5 top-1.5">
            <StatusPill status={status} />
          </div>
        )}
      </div>
      <div className="mt-2 line-clamp-2 text-sm font-bold leading-snug">{p.title}</div>
      <div className="mt-0.5 truncate text-xs text-gris">
        {v?.name} · {v?.neighborhood}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <CommunityScore stats={r} size={12} compact />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-grafito">
        {status === 'archivo' ? <span>{fmt.range(season.start, season.end)}</span> : <span>{fmt.price(season.priceFrom, season.priceTo)}</span>}
      </div>
    </button>
  )
}

function SearchResults({ r }: { r: ReturnType<typeof searchAll> }) {
  const nav = useNav()
  return (
    <div className="flex flex-col gap-7">
      {r.productions.length > 0 && (
        <section>
          <h2 className="eyebrow mb-2 text-gris">Obras · {r.productions.length}</h2>
          <ul className="flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
            {r.productions.map((p) => {
              const { season, status } = currentSeason(p)
              const w = getWork(p.workId)
              return (
                <li key={p.id}>
                  <button onClick={() => nav.go({ name: 'production', id: p.id })} className="flex w-full items-center gap-3 p-3 text-left hover:bg-crema">
                    <span className="w-11 shrink-0 overflow-hidden rounded-sm">
                      <Poster production={p} showCompany={false} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{p.title}</span>
                      <span className="block truncate text-xs text-gris">
                        {w?.author} · {getVenue(season.venueId)?.name}
                      </span>
                    </span>
                    <StatusPill status={status} />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
      {r.venues.length > 0 && (
        <section>
          <h2 className="eyebrow mb-2 text-gris">Teatros · {r.venues.length}</h2>
          <ul className="flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
            {r.venues.map((v) => (
              <li key={v.id}>
                <button onClick={() => nav.go({ name: 'venue', id: v.id })} className="flex w-full items-center gap-3 p-3 text-left hover:bg-crema">
                  <span className="grid size-11 shrink-0 place-items-center rounded-md text-papel" style={{ background: v.color }}>
                    <Icon name="seat" size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{v.name}</span>
                    <span className="block truncate text-xs text-gris">
                      {v.neighborhood}, {v.alcaldia}
                    </span>
                  </span>
                  <Icon name="next" size={18} className="text-gris" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {r.people.length > 0 && (
        <section>
          <h2 className="eyebrow mb-2 text-gris">Artistas · {r.people.length}</h2>
          <ul className="flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
            {r.people.map((p) => (
              <li key={p.id}>
                <button onClick={() => nav.go({ name: 'artist', id: p.id })} className="flex w-full items-center gap-3 p-3 text-left hover:bg-crema">
                  <Avatar name={p.name} color="#23452E" size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{p.name}</span>
                    <span className="block truncate text-xs text-gris">{p.roles.join(' · ')}</span>
                  </span>
                  <Icon name="next" size={18} className="text-gris" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function VenueList() {
  const nav = useNav()
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {allVenues().map((v, i) => {
        const { cartelera } = productionsAtVenue(v.id)
        return (
          <button key={v.id} onClick={() => nav.go({ name: 'venue', id: v.id })} className="paper group flex flex-col overflow-hidden !p-0 text-left" style={{ rotate: `${((i % 3) - 1) * 0.5}deg` }}>
            <Photo id={v.photo} alt={`Foto de referencia de ${v.name}`} w={800} className="aspect-[16/9]" fallback={<div className="wall absolute inset-0 px-4 pt-4"><Facade name={v.name} color={v.color} style={FACADE[v.id] ?? 'bodega'} /></div>}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-2 left-3">
                <MetroChip name={v.neighborhood} small />
              </span>
            </Photo>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="font-display text-[22px] uppercase leading-none">{v.name}</div>
                <div className="mt-1 truncate text-xs text-gris">
                  {v.neighborhood} · {v.alcaldia} · {v.capacity} butacas
                </div>
                <div className="mt-1.5 text-[13px]">
                  {cartelera.length ? (
                    <span className="font-semibold text-rojo">
                      {cartelera.length} {cartelera.length === 1 ? 'obra' : 'obras'} en cartelera
                    </span>
                  ) : (
                    <span className="text-gris">Sin funciones por ahora</span>
                  )}
                </div>
              </div>
              <div className="flex -space-x-4">
                {cartelera.slice(0, 3).map((c, k) => (
                  <span key={c.production.id} className="w-10 border-2 border-papel shadow" style={{ rotate: `${(k - 1) * 6}deg` }}>
                    <Poster production={c.production} showCompany={false} />
                  </span>
                ))}
              </div>
            </div>
          </button>
        )
      })}
      <p className="text-xs text-gris sm:col-span-2">
        <DemoBadge className="mr-1" /> Recintos ficticios ubicados en colonias reales para el prototipo.
      </p>
    </div>
  )
}

/** Vista de semana: funciones de los próximos 7 días por columna */
function WeekView({ ids }: { ids: string[] }) {
  const nav = useNav()
  const days = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i))
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div className="grid min-w-[980px] grid-cols-7 gap-2 lg:min-w-0">
        {days.map((d, i) => {
          const perfs = performancesOn(d).filter((x) => ids.includes(x.production.id))
          return (
            <div key={i} className={`flex flex-col gap-2 rounded-lg p-2 ${i === 0 ? 'bg-amarillo-claro/60' : 'wall'}`}>
              <div className="flex items-baseline justify-between border-b-2 border-tinta pb-1">
                <span className="font-display text-lg uppercase leading-none">{i === 0 ? 'Hoy' : DAY_NAMES[d.getDay()].slice(0, 3)}</span>
                <span className="font-display text-2xl leading-none tabular">{d.getDate()}</span>
              </div>
              {perfs.length === 0 ? (
                <p className="py-4 text-center font-hand text-lg text-gris">descanso</p>
              ) : (
                perfs.map((pf) => (
                  <button
                    key={pf.production.id + pf.time}
                    onClick={() => nav.go({ name: 'production', id: pf.production.id })}
                    className="flex flex-col rounded-md bg-papel p-2 text-left shadow-sm hover:ring-1 hover:ring-tinta"
                    style={{ borderTop: `4px solid ${pf.production.poster.bg}` }}
                  >
                    <span className="font-mono text-[12px] font-bold text-rojo">{pf.time}</span>
                    <span className="line-clamp-2 text-[12.5px] font-bold leading-tight">{pf.production.title}</span>
                    <span className="mt-0.5 truncate text-[11px] text-gris">{pf.venue.name}</span>
                  </button>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Rótulo pintado del recinto */
export function VenueSign({ venue, big = false }: { venue: { name: string; color: string; founded?: number; neighborhood: string }; big?: boolean }) {
  const light = venue.color === '#E9B321' || venue.color === '#E76F91'
  return (
    <div className={`relative flex flex-col justify-end overflow-hidden ${big ? 'min-h-44 p-5 md:min-h-56' : 'h-28 p-3'}`} style={{ background: venue.color, color: light ? '#191919' : '#FBF8F2' }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 18px, rgba(0,0,0,.35) 18px 20px)' }} aria-hidden="true" />
      <div className="absolute right-3 top-3 font-mono text-[11px] font-bold opacity-80">{venue.founded ? `DESDE ${venue.founded}` : ''}</div>
      <div className={`relative font-marker leading-[.95] ${big ? 'text-5xl md:text-6xl' : 'text-[26px]'}`}>{venue.name}</div>
    </div>
  )
}
