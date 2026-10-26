import { useMemo, useState } from 'react'
import {
  addDays,
  ALL_GENRES,
  allCommunityReviews,
  allProductions,
  allVenues,
  closingSoon,
  currentSeason,
  DAY_NAMES,
  fmt,
  getCommunityUser,
  getProduction,
  getVenue,
  performancesOn,
  popularity,
  ratingStats,
  TODAY,
  upcomingPerformances,
  type DayPerformance,
} from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import type { PosterMotif } from '../data/types'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { CityMapBase } from '../components/CityMap'
import { Photo } from '../components/Photo'
import { CITY_PHOTOS } from '../data/demo'
import { Marquee, Stamp, Tape } from '../components/deco'
import { Avatar, CommunityScore, DemoBadge, GenreTag, Logo, PosterCard, SectionTitle, Stars } from '../components/ui'

export function Home() {
  const nav = useNav()
  const { user, watchlist } = useStore()
  const all = allProductions()
  const cartelera = all.filter((p) => currentSeason(p).status === 'cartelera').sort((a, b) => popularity(b.id) - popularity(a.id))
  const archivo = all.filter((p) => currentSeason(p).status === 'archivo')
  const proximamente = all.filter((p) => currentSeason(p).status === 'proximamente')
  const featured = getProduction('medea-barrio') ?? cartelera[0]
  const fs = currentSeason(featured)
  const fv = getVenue(fs.season.venueId)!
  const nextShows = upcomingPerformances(fs.season, 3)
  const closing = closingSoon(35)
  const firstName = user?.name.split(' ')[0]
  const wallPosters = cartelera.filter((p) => p.id !== featured.id).slice(0, 3)

  return (
    <div className="flex flex-col gap-12 pb-6">
      <header className="flex items-center justify-between pt-3 md:hidden">
        <Logo size="md" />
        <span className="inline-flex items-center gap-1 rounded-full border border-linea bg-papel px-3 py-1.5 text-[13px] font-semibold">
          <Icon name="pin" size={15} className="text-rojo" /> CDMX
        </span>
      </header>

      {/* ——— Héroe: foto de escena de la obra destacada ——— */}
      <section aria-labelledby="destacada" className="-mx-4 md:mx-0">
        <div className="relative overflow-hidden md:rounded-2xl">
          <Photo id={featured.photos?.[0]} alt={`Escena de referencia para ${featured.title}`} w={1600} className="h-[560px] md:h-[520px]" grade="warm" fallback={<div className="absolute inset-0" style={{ background: featured.poster.bg }} />}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 grid gap-6 p-5 md:grid-cols-[1fr_auto] md:items-end md:p-10">
              <div className="max-w-2xl text-papel">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm bg-rojo px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest">Destacada de la semana</span>
                  <DemoBadge className="!border-papel/60 !text-papel" />
                </div>
                <h1 id="destacada" className="mt-3 font-marker text-[42px] leading-[0.98] md:text-[64px]">
                  {featured.title}
                </h1>
                <p className="mt-2 text-[14px] text-papel/80">
                  {featured.company} · {featured.genres.join(' / ')} · {fv.name}, {fv.neighborhood}
                </p>
                <p className="mt-3 line-clamp-2 max-w-xl text-[15px] leading-relaxed text-papel/90 md:line-clamp-3">{featured.synopsis}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {nextShows.map((s) => (
                    <span key={s.date + s.time} className="rounded border border-papel/35 bg-black/30 px-2.5 py-1 font-mono text-[12px] font-bold backdrop-blur-sm">
                      {fmt.weekday(s.date).toUpperCase()} {fmt.dayMonth(s.date)} · <span className="text-amarillo">{s.time}</span>
                    </span>
                  ))}
                </div>
                <button onClick={() => nav.go({ name: 'production', id: featured.id })} className="mt-5 inline-flex items-center gap-2 rounded-full bg-rojo px-6 py-3 text-sm font-bold text-papel shadow-[0_2px_0_#6d0f0f] hover:bg-rojo-hondo">
                  Ver obra y funciones <Icon name="arrow" size={16} />
                </button>
              </div>
              <div className="hidden gap-3 md:flex">
                {wallPosters.slice(0, 2).map((p, i) => (
                  <button key={p.id} onClick={() => nav.go({ name: 'production', id: p.id })} className="w-[120px] shadow-[0_16px_30px_-12px_rgba(0,0,0,.9)] transition-transform hover:-translate-y-1" style={{ rotate: `${i ? 3 : -2}deg` }} aria-label={`Ver ${p.title}`}>
                    <Poster production={p} />
                  </button>
                ))}
              </div>
            </div>
          </Photo>
        </div>
        <Marquee items={['Obras', 'Gente', 'Espacios', 'Historias', 'CDMX', 'Teatro para vivir la ciudad']} />
      </section>

      <div className="-mt-4">
        <p className="eyebrow text-gris">Hola{firstName ? `, ${firstName}` : ''}</p>
        <p className="mt-1 font-marker text-[26px] leading-tight md:text-[32px]">¿Qué vamos a ver esta semana?</p>
      </div>

      <Tonight />

      {/* ——— Últimas funciones ——— */}
      {closing.length > 0 && (
        <section aria-labelledby="ultimas">
          <SectionTitle id="ultimas" note="¡corre!">
            Últimas funciones
          </SectionTitle>
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 pt-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {closing.slice(0, 3).map(({ production, season, daysLeft }) => (
              <button key={production.id} onClick={() => nav.go({ name: 'production', id: production.id })} className="paper group relative flex w-[330px] shrink-0 items-center gap-4 p-3 pt-4 text-left md:w-auto">
                <div className="poster-lift w-[30%] shrink-0">
                  <Poster production={production} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[52px] leading-[0.85] text-rojo tabular">{daysLeft}</span>
                    <span className="font-display text-lg uppercase leading-none">{daysLeft === 1 ? 'día' : 'días'}</span>
                  </div>
                  <div className="mt-1 whitespace-nowrap text-[10.5px] font-bold uppercase tracking-wider text-gris">para que termine</div>
                  <div className="mt-2 line-clamp-2 font-bold leading-snug">{production.title}</div>
                  <div className="mt-0.5 truncate text-xs text-gris">
                    {getVenue(season.venueId)?.name} · cierra {fmt.dayMonth(season.end)}
                  </div>
                </div>
                {daysLeft <= 30 && (
                  <Stamp className="absolute -top-3 right-3" size="sm" rotate={6}>
                    Última llamada
                  </Stamp>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ——— Cartelera ——— */}
      <section aria-labelledby="cartelera">
        <SectionTitle id="cartelera" eyebrow={`${cartelera.length} obras en temporada`} action="Toda la cartelera" onAction={() => nav.go({ name: 'explore', tab: 'cartelera' })}>
          En cartelera
        </SectionTitle>
        <div className="wall no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-5 pb-6 pt-7 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:rounded-xl md:px-6">
          {cartelera.slice(0, 10).map((p) => (
            <PosterCard key={p.id} production={p} width="w-[138px] md:w-auto" tilt />
          ))}
        </div>
      </section>

      {/* ——— Géneros como cartas ——— */}
      <GenreDeck />

      <div className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-8">
        <Ranking />
        {/* Mapa */}
        <section aria-labelledby="cerca">
          <SectionTitle id="cerca" action="Abrir mapa" onAction={() => nav.go({ name: 'map' })}>
            La ciudad es teatro
          </SectionTitle>
          <button onClick={() => nav.go({ name: 'map' })} className="paper group relative block w-full overflow-hidden !p-0 text-left" aria-label="Abrir mapa de teatros">
            <svg viewBox="8 14 80 80" className="block h-auto w-full" aria-hidden="true">
              <CityMapBase labels={false} />
              {allVenues().map((v) => (
                <g key={v.id} transform={`translate(${v.x} ${v.y})`}>
                  <path d="M0 0 C-2.6 -3.2 -3.2 -4.6 -3.2 -5.8 A3.2 3.2 0 0 1 3.2 -5.8 C3.2 -4.6 2.6 -3.2 0 0z" fill={v.color} stroke="#FBF8F2" strokeWidth=".5" />
                </g>
              ))}
            </svg>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-papel/95 px-3 py-2 text-sm shadow">
              <span>
                <b className="tabular">{allVenues().length}</b> teatros · <span className="text-gris">Centro, Roma, Coyoacán…</span>
              </span>
              <Icon name="arrow" size={18} className="text-rojo" />
            </div>
          </button>
        </section>
      </div>

      {watchlist.length > 0 && (
        <section aria-labelledby="porver">
          <SectionTitle id="porver" note={`${watchlist.length} guardadas`} action="Tu lista" onAction={() => nav.go({ name: 'watchlist' })}>
            Pendientes
          </SectionTitle>
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-3 md:mx-0 md:px-0">
            {watchlist
              .map((id) => getProduction(id))
              .filter(Boolean)
              .map((p) => (
                <PosterCard key={p!.id} production={p!} width="w-[112px]" tilt />
              ))}
          </div>
        </section>
      )}

      <CommunityWall />

      <div className="grid gap-12 md:grid-cols-2 md:gap-8">
        <section aria-labelledby="proximas">
          <SectionTitle id="proximas" note="pronto">
            Próximos estrenos
          </SectionTitle>
          <div className="flex gap-4 pt-2">
            {proximamente.map((p) => (
              <PosterCard key={p.id} production={p} width="w-[128px]" tilt />
            ))}
          </div>
        </section>
        <section aria-labelledby="archivo">
          <SectionTitle id="archivo" action="Explorar el archivo" onAction={() => nav.go({ name: 'explore', tab: 'archivo' })}>
            Del archivo
          </SectionTitle>
          <p className="-mt-2 mb-4 text-sm text-gris">Temporadas que ya terminaron. Puedes registrarlas en tu diario si las viste.</p>
          <div className="flex gap-4">
            {archivo.slice(0, 3).map((p, i) => (
              <button key={p.id} onClick={() => nav.go({ name: 'production', id: p.id })} className="group w-[104px] shrink-0 bg-papel p-1.5 pb-6 text-left shadow-[0_8px_16px_-10px_rgba(0,0,0,.5)]" style={{ rotate: `${(i - 1) * 3}deg` }}>
                <div className="overflow-hidden [filter:grayscale(.85)_sepia(.35)_contrast(1.05)] transition-[filter] group-hover:[filter:none]">
                  <Poster production={p} showCompany={false} />
                </div>
                <div className="mt-1.5 truncate font-hand text-[15px] leading-none text-grafito">{currentSeason(p).season.start.slice(0, 4)}</div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <footer className="-mx-4 md:mx-0">
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {[CITY_PHOTOS.bellasArtes, CITY_PHOTOS.jacarandas, CITY_PHOTOS.angel].map((id, i) => (
            <Photo key={id} id={id} alt={['Palacio de Bellas Artes', 'Jacarandas en flor', 'Ángel de la Independencia'][i]} w={700} className="aspect-[4/5] md:rounded-md" />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 md:px-0">
          <span className="font-marker text-xl">Teatro para vivir la ciudad</span>
          <DemoBadge label="Datos de demostración · fotos de referencia: Unsplash" />
        </div>
      </footer>
    </div>
  )
}

// ——— Esta noche: funciones del día en una línea de tiempo ———

const START_H = 11
const END_H = 24
const PX_PER_H = 96

function Tonight() {
  const nav = useNav()
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ date: addDays(TODAY, i), perfs: performancesOn(addDays(TODAY, i)) })), [])
  const firstWithShows = Math.max(0, days.findIndex((d) => d.perfs.length > 0))
  const [sel, setSel] = useState(firstWithShows)
  const day = days[sel]
  const now = new Date()
  const nowH = now.getHours() + now.getMinutes() / 60

  // asignar carriles para que las funciones no se encimen
  const lanes: number[] = []
  const placed = day.perfs.map((pf: DayPerformance) => {
    const [h, m] = pf.time.split(':').map(Number)
    const start = h + m / 60
    const end = start + Math.max(pf.production.durationMin, 85) / 60 + 0.15
    let lane = lanes.findIndex((l) => l <= start)
    if (lane === -1) {
      lane = lanes.length
      lanes.push(end)
    } else lanes[lane] = end
    return { pf, start, lane }
  })
  const label = (i: number) => (i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : DAY_NAMES[days[i].date.getDay()].slice(0, 3))

  return (
    <section aria-labelledby="noche">
      <SectionTitle id="noche" eyebrow="Funciones por día y hora" note={sel === 0 ? 'hoy' : undefined}>
        {sel === 0 ? 'Esta noche en la ciudad' : `${DAY_NAMES[day.date.getDay()]} en la ciudad`}
      </SectionTitle>
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Día">
        {days.map((d, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={sel === i}
            onClick={() => setSel(i)}
            className={`flex shrink-0 flex-col items-center rounded-lg border px-3 py-1.5 ${sel === i ? 'border-tinta bg-tinta text-papel' : 'border-linea bg-papel hover:border-grafito'} ${d.perfs.length ? '' : 'opacity-50'}`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider">{label(i)}</span>
            <span className="font-display text-xl leading-none tabular">{d.date.getDate()}</span>
            <span className={`text-[10px] ${sel === i ? 'text-amarillo' : 'text-gris'}`}>{d.perfs.length ? `${d.perfs.length} func.` : 'descanso'}</span>
          </button>
        ))}
      </div>

      {day.perfs.length === 0 ? (
        <div className="wall rounded-xl p-6 text-center">
          <p className="font-display text-2xl uppercase">Día de descanso</p>
          <p className="mt-1 text-sm text-grafito">Casi todos los foros descansan los lunes y martes. Elige otro día para ver las funciones.</p>
        </div>
      ) : (
        <div className="paper no-scrollbar overflow-x-auto !p-0">
          <div className="relative" style={{ width: (END_H - START_H) * PX_PER_H + 24, height: 52 + Math.max(1, lanes.length) * 64 }}>
            {Array.from({ length: END_H - START_H + 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 h-full border-l border-dashed border-linea" style={{ left: 12 + i * PX_PER_H }}>
                <span className="absolute left-1.5 top-2 font-display text-[15px] text-gris tabular">{`${START_H + i}:00`}</span>
              </div>
            ))}
            {sel === 0 && nowH > START_H && nowH < END_H && (
              <div className="absolute top-0 z-10 h-full border-l-2 border-rojo" style={{ left: 12 + (nowH - START_H) * PX_PER_H }}>
                <span className="absolute -left-5 top-8 rounded-sm bg-rojo px-1 font-hand text-sm text-papel">ahora</span>
              </div>
            )}
            {placed.map(({ pf, start, lane }) => (
              <button
                key={pf.production.id + pf.time}
                onClick={() => nav.go({ name: 'production', id: pf.production.id })}
                className="absolute flex items-center gap-2 overflow-hidden rounded-md border border-tinta/15 bg-papel pr-2 text-left shadow-[0_4px_10px_-6px_rgba(0,0,0,.5)] hover:z-20 hover:border-tinta"
                style={{ left: 12 + (start - START_H) * PX_PER_H, top: 44 + lane * 64, width: Math.max(180, (pf.production.durationMin / 60) * PX_PER_H), height: 56, borderLeft: `5px solid ${pf.production.poster.bg}` }}
              >
                <span className="w-8 shrink-0">
                  <Poster production={pf.production} showCompany={false} />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[12px] font-bold text-rojo">{pf.time}</span>
                  <span className="block truncate text-[13px] font-bold leading-tight">{pf.production.title}</span>
                  <span className="block truncate text-[11px] text-gris">{pf.venue.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// ——— Géneros: baraja de cartas ———

const GENRE_CARD: Record<string, { bg: string; fg: string; motif: PosterMotif }> = {
  Comedia: { bg: '#E9B321', fg: '#191919', motif: 'mascaras' },
  Drama: { bg: '#7A5BA6', fg: '#F5F0E6', motif: 'corazon' },
  Tragedia: { bg: '#B71C1C', fg: '#F5F0E6', motif: 'ojo' },
  'Teatro físico': { bg: '#191919', fg: '#E9B321', motif: 'luna' },
  Cabaret: { bg: '#E76F91', fg: '#191919', motif: 'estrella' },
  Infantil: { bg: '#21418F', fg: '#F5F0E6', motif: 'estrella' },
  Unipersonal: { bg: '#23452E', fg: '#F5F0E6', motif: 'mano' },
  Clásico: { bg: '#D2582A', fg: '#F5F0E6', motif: 'cupula' },
  Contemporáneo: { bg: '#F5F0E6', fg: '#191919', motif: 'silla' },
  Musical: { bg: '#E9B321', fg: '#191919', motif: 'estrella' },
}

function GenreDeck() {
  const nav = useNav()
  const all = allProductions().filter((p) => currentSeason(p).status !== 'archivo')
  const genres = ALL_GENRES.map((g) => ({ g, ps: all.filter((p) => p.genres.includes(g)) })).filter((x) => x.ps.length > 0)
  return (
    <section aria-labelledby="generos">
      <SectionTitle id="generos" eyebrow="Encuentra tu tipo de función">
        Explora por género
      </SectionTitle>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {genres.map(({ g, ps }, i) => {
          const c = GENRE_CARD[g]
          const p = ps[i % ps.length]
          return (
            <button key={g} onClick={() => nav.go({ name: 'explore', tab: 'cartelera', genre: g })} className="group relative w-[150px] shrink-0 overflow-hidden rounded-md text-left md:w-auto">
              <Photo id={p.photos?.[1] ?? p.photos?.[0]} alt="" w={500} grade="mono" className="aspect-[4/5]" fallback={<div className="absolute inset-0" style={{ background: c.bg }} />}>
                <div className="absolute inset-0 mix-blend-multiply transition-opacity group-hover:opacity-70" style={{ background: c.bg === '#F5F0E6' ? '#8A8073' : c.bg }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-papel">
                  <div className="font-display text-[26px] uppercase leading-none">{g}</div>
                  <div className="mt-1 text-[12px] font-semibold text-papel/85">
                    {ps.length} {ps.length === 1 ? 'obra' : 'obras'}
                  </div>
                </div>
              </Photo>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ——— Ranking ———

function Ranking() {
  const nav = useNav()
  const list = allProductions()
    .filter((p) => currentSeason(p).status === 'cartelera')
    .map((p) => ({ p, r: ratingStats(p.id) }))
    .sort((a, b) => popularity(b.p.id) - popularity(a.p.id))
    .slice(0, 5)
  const max = Math.max(...list.map((x) => x.r.count))
  return (
    <section aria-labelledby="comentadas">
      <SectionTitle id="comentadas" eyebrow="Top 5 de la semana">
        Lo más comentado
      </SectionTitle>
      <ol className="paper flex flex-col !p-0">
        {list.map(({ p, r }, i) => (
          <li key={p.id} className="border-b border-dashed border-linea last:border-0">
            <button onClick={() => nav.go({ name: 'production', id: p.id })} className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-crema/70">
              <span className={`w-8 text-center font-display text-[34px] leading-none ${i === 0 ? 'text-rojo' : 'text-tinta/80'}`}>{i + 1}</span>
              <span className="w-11 shrink-0 shadow-sm">
                <Poster production={p} showCompany={false} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{p.title}</span>
                <span className="mt-1 block">
                  <CommunityScore stats={r} size={12} compact />
                </span>
                <span className="mt-1.5 block h-1.5 rounded-full bg-carton">
                  <span className="block h-1.5 rounded-full bg-rojo" style={{ width: `${(r.count / max) * 100}%` }} />
                </span>
              </span>
              <span className="hidden sm:block">
                <GenreTag genre={p.genres[0]} />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ——— Pared de la comunidad ———

function CommunityWall() {
  const nav = useNav()
  const recent = allCommunityReviews()
    .filter((r) => !r.spoiler)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)
  const tones = ['#FBF8F2', '#F6E3A8', '#F7D3DC', '#DBE5D6']
  return (
    <section aria-labelledby="dicen">
      <SectionTitle id="dicen" action="Comunidad" onAction={() => nav.tab('community')}>
        Lo que dice la banda
      </SectionTitle>
      <div className="wall grid gap-5 rounded-xl p-5 pt-7 sm:grid-cols-2 lg:grid-cols-4">
        {recent.map((r, i) => {
          const u = getCommunityUser(r.userId)!
          const p = getProduction(r.productionId)!
          return (
            <button
              key={r.id}
              onClick={() => nav.go({ name: 'production', id: p.id })}
              className="relative flex flex-col gap-2 p-4 pb-5 text-left shadow-[0_10px_18px_-12px_rgba(0,0,0,.55)] transition-transform hover:-translate-y-0.5"
              style={{ background: tones[i % tones.length], rotate: `${((i % 3) - 1) * 1.6}deg`, backgroundImage: 'var(--grain)' }}
            >
              <Tape tone={i % 2 ? 'clear' : 'yellow'} />
              <div className="flex items-center gap-2">
                <Avatar name={u.name} color={u.color} size={28} />
                <span className="truncate text-[13px] font-semibold">{u.name.split(' ')[0]}</span>
                <span className="ml-auto">
                  <Stars value={r.rating} size={12} />
                </span>
              </div>
              <p className="font-hand text-[19px] leading-[1.15] text-tinta">“{r.text.length > 120 ? r.text.slice(0, 118) + '…' : r.text}”</p>
              <div className="mt-auto flex items-center gap-1.5 border-t border-dashed border-tinta/20 pt-2 text-xs font-bold">
                <Icon name="ticket" size={14} className="text-rojo" /> {p.title}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
