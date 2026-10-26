import { useMemo, useState } from 'react'
import {
  addDays,
  allVenues,
  creditsOf,
  currentSeason,
  fmt,
  getPerson,
  getVenue,
  performancesOn,
  productionsAtVenue,
  TODAY,
  upcomingPerformances,
} from '../lib/catalog'
import { useNav } from '../lib/store'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { CityMapBase } from '../components/CityMap'
import { Photo } from '../components/Photo'
import { MetroChip, StreetPlate } from '../components/broadway'
import { Facade, FACADE, HalftonePortrait, SeatMap, Stamp, Tape } from '../components/deco'
import { Chip, DemoBadge, EmptyState, PosterCard, ScreenHeader, SectionTitle, StatusPill } from '../components/ui'

// ——— Perfil de artista ———

export function ArtistProfile({ id }: { id: string }) {
  const nav = useNav()
  const person = getPerson(id)
  if (!person)
    return (
      <>
        <ScreenHeader />
        <EmptyState icon="user" title="Artista no encontrado" text="No tenemos una ficha con ese nombre en el catálogo." />
      </>
    )
  const credits = creditsOf(id)
  const now = credits.filter((c) => currentSeason(c.production).status !== 'archivo')
  const history = [...credits].sort((a, b) => firstStart(b.production).localeCompare(firstStart(a.production)))
  const roles = [...new Set(credits.map((c) => c.credit.role))]
  const collab: Record<string, number> = {}
  credits.forEach(({ production }) => production.credits.forEach((c) => c.personId !== id && (collab[c.personId] = (collab[c.personId] ?? 0) + 1)))
  const collaborators = Object.entries(collab)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const years = history.map((h) => Number(firstStart(h.production).slice(0, 4)))
  const since = years.length ? Math.min(...years) : null

  return (
    <div className="flex flex-col gap-10 pb-10">
      <ScreenHeader title={person.name} sub={person.roles.join(' · ')} />

      <header className="wall relative -mx-4 -mt-4 overflow-hidden px-5 pb-8 pt-8 md:mx-0 md:mt-0 md:rounded-2xl md:p-10">
        <div className="grid gap-7 sm:grid-cols-[220px_1fr] sm:items-end">
          <div className="relative mx-auto w-[60%] max-w-[230px] -rotate-3 bg-papel p-2 pb-8 shadow-[0_18px_30px_-16px_rgba(0,0,0,.6)] sm:mx-0 sm:w-full">
            <HalftonePortrait seed={person.id} bg="#23452E" ink="#E9B321" label={`Retrato ilustrado de ${person.name}`} />
            <Tape />
            <span className="absolute bottom-2 left-3 font-hand text-lg text-grafito">{person.name.split(' ')[0]}</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {person.roles.map((r, i) => (
                <Stamp key={r} rotate={i % 2 ? 3 : -4} size="sm" color={i % 2 ? '#23452E' : '#B71C1C'}>
                  {r}
                </Stamp>
              ))}
              <DemoBadge />
            </div>
            <h1 className="mt-3 font-display text-[54px] uppercase leading-[0.88] md:text-[80px]">{person.name}</h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-grafito">
              <Icon name="pin" size={14} /> {person.from}
            </p>
            <p className="mt-3 max-w-[58ch] text-[15.5px] leading-relaxed">{person.bio}</p>
          </div>
        </div>
        <dl className="mt-7 grid grid-cols-3 gap-3">
          {[
            [credits.length, credits.length === 1 ? 'producción' : 'producciones'],
            [now.length, 'en escena o por estrenar'],
            [since ?? '—', 'en ÁRBO desde'],
          ].map(([v, l]) => (
            <div key={l as string} className="paper px-3 py-2.5">
              <dd className="font-display text-[38px] leading-none tabular text-rojo">{v}</dd>
              <dt className="mt-1 text-[11px] font-bold uppercase tracking-wider text-grafito">{l}</dt>
            </div>
          ))}
        </dl>
      </header>

      {now.length > 0 && (
        <section>
          <SectionTitle note="¡ve a verla!">Ahora en escena</SectionTitle>
          <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pt-2 md:mx-0 md:px-0">
            {now.map(({ production, credit }) => (
              <div key={production.id} className="w-[140px] shrink-0">
                <PosterCard production={production} width="w-full" tilt />
                <div className="mt-0.5 font-hand text-[17px] leading-none text-verde">{credit.character ?? credit.role}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle eyebrow={roles.join(' · ')}>Trayectoria</SectionTitle>
        <ol className="relative ml-3 border-l-[3px] border-tinta pl-6">
          {history.map(({ production, credit }) => {
            const { status } = currentSeason(production)
            return (
              <li key={production.id + credit.role} className="relative mb-5 last:mb-0">
                <span className="absolute -left-[37px] top-3 grid size-5 place-items-center rounded-full border-[3px] border-tinta bg-amarillo" />
                <button onClick={() => nav.go({ name: 'production', id: production.id })} className="paper flex w-full items-center gap-4 p-3 text-left hover:-translate-y-0.5 transition-transform">
                  <span className="w-12 shrink-0 font-display text-[24px] leading-none tabular text-rojo">{firstStart(production).slice(0, 4)}</span>
                  <span className="w-11 shrink-0 shadow-sm">
                    <Poster production={production} showCompany={false} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[17px] uppercase leading-[1.05]">{production.title}</span>
                    <span className="block truncate text-xs text-gris">
                      {credit.role}
                      {credit.character ? ` · ${credit.character}` : ''} · {production.company}
                    </span>
                  </span>
                  <span className="hidden sm:block">
                    <StatusPill status={status} />
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      {collaborators.length > 0 && (
        <section>
          <SectionTitle eyebrow="Personas con quienes ha compartido escena">Ha trabajado con</SectionTitle>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {collaborators.map(([pid, n], i) => {
              const c = getPerson(pid)!
              return (
                <button key={pid} onClick={() => nav.go({ name: 'artist', id: pid })} className="bg-papel p-1.5 pb-2 text-left shadow-[0_8px_14px_-10px_rgba(0,0,0,.5)] transition-transform hover:-translate-y-1" style={{ rotate: `${((i % 3) - 1) * 2}deg` }}>
                  <HalftonePortrait seed={pid} bg={['#B71C1C', '#21418F', '#191919', '#E76F91', '#23452E', '#D2582A'][i]} ink={i === 3 ? '#191919' : '#F6E3A8'} label={c.name} />
                  <div className="mt-1.5 truncate text-[12px] font-bold">{c.name}</div>
                  <div className="font-mono text-[11px] text-gris">
                    {n} {n === 1 ? 'obra' : 'obras'}
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function firstStart(p: { seasons: { start: string }[] }) {
  return [...p.seasons].sort((a, b) => a.start.localeCompare(b.start))[0].start
}

// ——— Perfil de teatro ———

export function VenueProfile({ id }: { id: string }) {
  const nav = useNav()
  const v = getVenue(id)
  if (!v)
    return (
      <>
        <ScreenHeader />
        <EmptyState icon="seat" title="Teatro no encontrado" text="Revisa el nombre o búscalo desde el mapa." />
      </>
    )
  const at = productionsAtVenue(v.id)
  return (
    <div className="flex flex-col gap-10 pb-10">
      <ScreenHeader title={v.name} sub={`${v.neighborhood}, ${v.alcaldia}`} />

      <header className="relative -mx-4 -mt-4 overflow-hidden bg-tinta text-papel md:mx-0 md:mt-0 md:rounded-2xl">
        <Photo id={v.photo} alt={`Foto de referencia de ${v.name}`} w={1600} grade="warm" className="!absolute inset-0" fallback={<div className="wall absolute inset-0 flex items-start justify-center px-10 pt-6 opacity-60"><Facade name={v.name} color={v.color} style={FACADE[v.id] ?? 'bodega'} className="max-w-md" /></div>} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" aria-hidden="true" />
        <div className="relative px-5 pb-8 pt-48 md:px-10 md:pb-10 md:pt-64">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest" style={{ background: v.color === '#191919' ? '#23452E' : v.color, color: v.color === '#E9B321' || v.color === '#E76F91' ? '#191919' : '#FBF8F2' }}>
              {v.neighborhood} · {v.alcaldia}
            </span>
            <DemoBadge className="!border-papel/60 !text-papel" />
          </div>
          <h1 className="mt-3 font-playbill text-[46px] leading-[0.95] [text-shadow:0_2px_12px_rgba(0,0,0,.5)] md:text-[68px]">{v.name}</h1>
          <p className="mt-3 max-w-[58ch] text-[15.5px] leading-relaxed text-papel/90">{v.description}</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="paper flex flex-col gap-3 p-5">
          <h2 className="font-display text-xl uppercase">Cómo llegar</h2>
          <div className="flex flex-wrap items-center gap-2">
            <StreetPlate street={v.address.split(',')[0]} colonia={v.neighborhood} />
            <MetroChip name={v.neighborhood} />
          </div>
          <p className="text-xs text-gris">Dirección de demostración.</p>
          <ul className="flex flex-col gap-2 text-sm text-grafito">
            {v.access.map((a) => (
              <li key={a} className="flex items-start gap-2">
                <Icon name="access" size={16} className="mt-0.5 shrink-0 text-verde" /> {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="paper p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl uppercase">La sala</h2>
            <span className="font-mono text-xs text-gris">desde {v.founded ?? '—'}</span>
          </div>
          <SeatMap capacity={v.capacity} color={v.color === '#191919' ? '#23452E' : v.color} className="mt-2" />
          <div className="mt-1 text-center">
            <span className="font-display text-[34px] leading-none tabular">{v.capacity}</span>
            <span className="ml-1 text-sm font-semibold text-grafito">butacas</span>
          </div>
          <p className="mt-1 text-center text-[11px] text-gris">Distribución ilustrativa, no es el mapa real de la sala.</p>
        </div>
        <button onClick={() => nav.go({ name: 'map' })} className="paper group relative overflow-hidden !p-0 text-left" aria-label="Ver en el mapa">
          <svg viewBox={`${v.x - 30} ${v.y - 26} 60 52`} className="block h-full min-h-[220px] w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <CityMapBase />
            <circle cx={v.x} cy={v.y} r="6" fill={v.color} opacity=".25" />
            <path transform={`translate(${v.x} ${v.y})`} d="M0 0 C-2.6 -3.2 -3.2 -4.6 -3.2 -5.8 A3.2 3.2 0 0 1 3.2 -5.8 C3.2 -4.6 2.6 -3.2 0 0z" fill={v.color} stroke="#191919" strokeWidth=".5" />
          </svg>
          <span className="absolute bottom-3 right-3 rounded-full bg-papel px-3 py-1.5 text-xs font-bold shadow">Ver en el mapa →</span>
        </button>
      </div>

      <section>
        <SectionTitle eyebrow={`${at.cartelera.length} en temporada`}>En cartelera</SectionTitle>
        {at.cartelera.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {at.cartelera.map(({ production, season }) => {
              const next = upcomingPerformances(season, 3)
              return (
                <button key={season.id} onClick={() => nav.go({ name: 'production', id: production.id })} className="ticket flex items-stretch gap-4 overflow-hidden p-3 text-left" style={{ ['--notch' as string]: '28%' }}>
                  <span className="w-[22%] shrink-0 -rotate-2 shadow-md">
                    <Poster production={production} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[22px] uppercase leading-none">{production.title}</span>
                    <span className="mt-1 block text-xs text-gris">{production.company}</span>
                    <span className="mt-2 block font-mono text-xs text-grafito">
                      {fmt.range(season.start, season.end)} · {fmt.price(season.priceFrom, season.priceTo)}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {next.map((n) => (
                        <span key={n.date + n.time} className="rounded-sm bg-amarillo-claro px-1.5 py-0.5 font-mono text-[11px] font-bold">
                          {fmt.weekday(n.date)} {fmt.dayMonth(n.date)} · {n.time}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <EmptyState icon="calendar" title="Sin funciones ahora" text="Este teatro no tiene obras en temporada en este momento. Revisa lo que viene o su archivo." />
        )}
      </section>

      {at.proximamente.length > 0 && (
        <section>
          <SectionTitle note="pronto">Próximamente</SectionTitle>
          <div className="flex gap-4 pt-2">
            {at.proximamente.map(({ production }) => (
              <PosterCard key={production.id} production={production} showVenue={false} tilt />
            ))}
          </div>
        </section>
      )}

      {at.archivo.length > 0 && (
        <section>
          <SectionTitle eyebrow="Lo que ya pasó por este escenario">Archivo de la sala</SectionTitle>
          <div className="flex flex-wrap gap-4">
            {at.archivo.map(({ production, season }, i) => (
              <button key={season.id} onClick={() => nav.go({ name: 'production', id: production.id })} className="group w-[112px] bg-papel p-1.5 pb-2 text-left shadow-[0_8px_16px_-10px_rgba(0,0,0,.5)]" style={{ rotate: `${((i % 3) - 1) * 2.5}deg` }}>
                <div className="[filter:grayscale(.85)_sepia(.35)] transition-[filter] group-hover:[filter:none]">
                  <Poster production={production} showCompany={false} />
                </div>
                <div className="mt-1.5 truncate text-[12px] font-bold">{production.title}</div>
                <div className="font-hand text-[15px] leading-none text-grafito">
                  {season.kind} {season.start.slice(0, 4)}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ——— Mapa ———

type MapFilter = 'todos' | 'cartelera' | 'finde'

export function TheaterMap() {
  const nav = useNav()
  const [filter, setFilter] = useState<MapFilter>('cartelera')
  const [selected, setSelected] = useState<string>('teatro-jacaranda')
  const weekendVenues = useMemo(() => {
    const d = TODAY.getDay()
    const toFri = d === 0 ? -2 : d === 6 ? -1 : 5 - d
    const ids = new Set<string>()
    for (let i = 0; i < 3; i++) performancesOn(addDays(TODAY, toFri + i)).forEach((p) => ids.add(p.venue.id))
    return ids
  }, [])
  const venues = allVenues().filter((v) => (filter === 'todos' ? true : filter === 'cartelera' ? productionsAtVenue(v.id).cartelera.length > 0 : weekendVenues.has(v.id)))
  const sel = venues.find((v) => v.id === selected) ?? venues[0]
  const selAt = sel ? productionsAtVenue(sel.id) : null

  return (
    <div className="flex flex-col gap-5 pb-10">
      <ScreenHeader title="Mapa de teatros" sub="Ciudad de México" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-[44px] uppercase leading-[0.9]">La ciudad es teatro</h1>
        <span className="text-sm text-gris">Toca un teatro para ver su cartelera</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip active={filter === 'cartelera'} onClick={() => setFilter('cartelera')}>
          Con obras en cartelera
        </Chip>
        <Chip active={filter === 'finde'} onClick={() => setFilter('finde')}>
          Con función este fin de semana
        </Chip>
        <Chip active={filter === 'todos'} onClick={() => setFilter('todos')}>
          Todos los teatros
        </Chip>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="paper relative overflow-hidden !p-0">
          <svg viewBox="2 4 92 96" className="block h-auto w-full" role="group" aria-label="Mapa ilustrativo de teatros">
            <CityMapBase />
            {venues.map((v) => {
              const active = sel && v.id === sel.id
              const count = productionsAtVenue(v.id).cartelera.length
              return (
                <g
                  key={v.id}
                  transform={`translate(${v.x} ${v.y})`}
                  onClick={() => setSelected(v.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(v.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${v.name}, ${count} obras en cartelera`}
                  aria-pressed={!!active}
                  className="cursor-pointer focus:outline-none"
                >
                  {active && <circle r="9" fill={v.color} opacity=".18" />}
                  <g transform={active ? 'scale(1.45)' : undefined}>
                    <path d="M0 0 C-3.2 -4 -4 -5.6 -4 -7.2 A4 4 0 0 1 4 -7.2 C4 -5.6 3.2 -4 0 0z" fill={v.color} stroke={active ? '#191919' : '#FBF8F2'} strokeWidth={active ? 0.7 : 0.6} />
                    <text y="-5.9" textAnchor="middle" fontSize="3.4" fontFamily="'Anton', sans-serif" fill={v.color === '#E9B321' || v.color === '#E76F91' ? '#191919' : '#FBF8F2'}>
                      {count}
                    </text>
                  </g>
                  <text y="4.2" textAnchor="middle" fontSize={active ? 2.9 : 2.3} fontWeight="700" fontFamily="'DM Sans', sans-serif" fill="#191919" stroke="#EFE7D6" strokeWidth=".7" paintOrder="stroke">
                    {v.name}
                  </text>
                </g>
              )
            })}
          </svg>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-linea px-3 py-2 text-[11px] text-gris">
            <span>Mapa ilustrativo, no a escala.</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-0 w-4 border-t-2 border-dashed border-rosa" /> Metro (ilustrativo)
            </span>
            <span>El número en cada pin = obras en cartelera.</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {sel && selAt ? (
            <div className="paper overflow-hidden !p-0">
              <Photo id={sel.photo} alt={`Foto de referencia de ${sel.name}`} w={800} className="aspect-[16/9]" fallback={<div className="wall absolute inset-0 px-4 pt-4"><Facade name={sel.name} color={sel.color} style={FACADE[sel.id] ?? 'bodega'} /></div>} />
              <div className="flex flex-col gap-3 p-4">
                <div>
                  <div className="font-display text-[26px] uppercase leading-none">{sel.name}</div>
                  <p className="mt-1 text-sm text-grafito">
                    {sel.neighborhood}, {sel.alcaldia} · {sel.capacity} butacas
                  </p>
                </div>
                {selAt.cartelera.length ? (
                  <ul className="flex flex-col gap-2.5">
                    {selAt.cartelera.map(({ production, season }) => (
                      <li key={season.id}>
                        <button onClick={() => nav.go({ name: 'production', id: production.id })} className="flex w-full items-center gap-3 text-left hover:underline">
                          <span className="w-10 shrink-0 shadow">
                            <Poster production={production} showCompany={false} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold">{production.title}</span>
                            <span className="block font-mono text-[11px] text-grafito">hasta {fmt.dayMonth(season.end)}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gris">Sin obras en temporada por ahora.</p>
                )}
                <button onClick={() => nav.go({ name: 'venue', id: sel.id })} className="inline-flex w-fit items-center gap-1 rounded-full bg-rojo px-4 py-2 text-sm font-bold text-papel hover:bg-rojo-hondo">
                  Ver teatro <Icon name="arrow" size={16} />
                </button>
              </div>
            </div>
          ) : (
            <EmptyState icon="map" title="Ningún teatro" text="No hay teatros con ese filtro. Prueba con “Todos los teatros”." />
          )}
          <ul className="paper flex flex-col !p-0">
            {venues.map((v) => (
              <li key={v.id} className="border-b border-dashed border-linea last:border-0">
                <button onClick={() => setSelected(v.id)} aria-pressed={sel?.id === v.id} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${sel?.id === v.id ? 'bg-amarillo-claro/70' : 'hover:bg-crema'}`}>
                  <span className="size-3 shrink-0 rounded-full border border-tinta/30" style={{ background: v.color }} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{v.name}</span>
                  <span className="text-xs text-gris">{v.neighborhood}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
