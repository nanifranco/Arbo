import { useState } from 'react'
import { allVenues, creditsOf, currentSeason, fmt, getPerson, getVenue, productionsAtVenue, seasonStatus } from '../lib/catalog'
import { useNav } from '../lib/store'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { Chip, DemoBadge, EmptyState, PosterCard, ScreenHeader, SectionTitle, StatusPill } from '../components/ui'
import { VenueSign } from './Explore'
import { MapBase } from './Home'

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
  const history = [...credits].sort((a, b) => currentSeason(b.production).season.start.localeCompare(currentSeason(a.production).season.start))
  const roles = [...new Set(credits.map((c) => c.credit.role))]

  return (
    <div className="flex flex-col gap-8 pb-10">
      <ScreenHeader title={person.name} sub={person.roles.join(' · ')} />
      <header className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative w-fit">
          <div className="-rotate-3 rounded-sm bg-papel p-2 pb-6 shadow-[0_10px_20px_-12px_rgba(0,0,0,.5)]">
            <div className="grid size-32 place-items-center bg-verde">
              <span className="font-marker text-5xl text-amarillo">
                {person.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')}
              </span>
            </div>
          </div>
          <span className="tape" />
        </div>
        <div>
          <div className="flex flex-wrap gap-1.5">
            {person.roles.map((r) => (
              <span key={r} className="eyebrow rounded-full bg-verde-claro px-2 py-0.5 text-verde">
                {r}
              </span>
            ))}
            <DemoBadge />
          </div>
          <h1 className="mt-2 font-marker text-4xl leading-none md:text-5xl">{person.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-gris">
            <Icon name="pin" size={14} /> {person.from}
          </p>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed">{person.bio}</p>
        </div>
      </header>

      <dl className="grid grid-cols-3 divide-x divide-linea rounded-xl border border-linea bg-papel text-center">
        <div className="py-3">
          <dd className="font-slab text-2xl tabular">{credits.length}</dd>
          <dt className="text-[11px] text-gris">producciones</dt>
        </div>
        <div className="py-3">
          <dd className="font-slab text-2xl tabular">{now.length}</dd>
          <dt className="text-[11px] text-gris">en cartelera o por estrenar</dt>
        </div>
        <div className="py-3">
          <dd className="font-slab text-2xl tabular">{roles.length}</dd>
          <dt className="text-[11px] text-gris">{roles.length === 1 ? 'oficio' : 'oficios'}</dt>
        </div>
      </dl>

      {now.length > 0 && (
        <section>
          <SectionTitle>Ahora en escena</SectionTitle>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:px-0">
            {now.map(({ production, credit }) => (
              <div key={production.id} className="w-[132px] shrink-0">
                <PosterCard production={production} width="w-full" />
                <div className="mt-0.5 text-xs font-semibold text-verde">{credit.character ?? credit.role}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle>Trayectoria</SectionTitle>
        <ol className="flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
          {history.map(({ production, credit }) => {
            const first = [...production.seasons].sort((a, b) => a.start.localeCompare(b.start))[0]
            const { status } = currentSeason(production)
            return (
              <li key={production.id + credit.role}>
                <button onClick={() => nav.go({ name: 'production', id: production.id })} className="flex w-full items-center gap-3 p-3 text-left hover:bg-crema">
                  <span className="w-12 shrink-0 font-mono text-sm font-bold text-gris tabular">{first.start.slice(0, 4)}</span>
                  <span className="w-9 shrink-0 overflow-hidden rounded-sm">
                    <Poster production={production} showCompany={false} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{production.title}</span>
                    <span className="block truncate text-xs text-gris">
                      {credit.role}
                      {credit.character ? ` · ${credit.character}` : ''}
                    </span>
                  </span>
                  <StatusPill status={status} />
                </button>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
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
    <div className="flex flex-col gap-8 pb-10">
      <ScreenHeader title={v.name} sub={`${v.neighborhood}, ${v.alcaldia}`} />
      <div className="-mx-4 overflow-hidden md:mx-0 md:rounded-2xl">
        <VenueSign venue={v} big />
      </div>

      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow text-gris">
              {v.neighborhood} · {v.alcaldia}
            </span>
            <DemoBadge />
          </div>
          <p className="max-w-[62ch] text-[15px] leading-relaxed">{v.description}</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-linea bg-papel p-3">
              <dt className="eyebrow !text-[10px] text-gris">Aforo</dt>
              <dd className="font-mono text-lg font-bold tabular">{v.capacity} butacas</dd>
            </div>
            <div className="rounded-lg border border-linea bg-papel p-3">
              <dt className="eyebrow !text-[10px] text-gris">Desde</dt>
              <dd className="font-mono text-lg font-bold tabular">{v.founded ?? '—'}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-linea bg-papel p-4">
          <h2 className="font-bold">Cómo llegar</h2>
          <p className="flex items-start gap-2 text-sm">
            <Icon name="pin" size={16} className="mt-0.5 shrink-0 text-rojo" /> {v.address}
          </p>
          <ul className="flex flex-col gap-1.5 text-sm text-grafito">
            {v.access.map((a) => (
              <li key={a} className="flex items-start gap-2">
                <Icon name="access" size={16} className="mt-0.5 shrink-0 text-verde" /> {a}
              </li>
            ))}
          </ul>
          <button onClick={() => nav.go({ name: 'map' })} className="relative mt-1 overflow-hidden rounded-lg border border-linea" aria-label="Ver en el mapa">
            <svg viewBox={`${v.x - 18} ${v.y - 10} 36 20`} className="block h-28 w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <MapBase />
              <circle cx={v.x} cy={v.y} r="2.2" fill={v.color} stroke="#FBF8F2" strokeWidth=".6" />
            </svg>
            <span className="absolute bottom-2 right-2 rounded-full bg-papel px-2.5 py-1 text-xs font-semibold shadow">Ver en el mapa</span>
          </button>
        </div>
      </div>

      <section>
        <SectionTitle>En cartelera</SectionTitle>
        {at.cartelera.length ? (
          <div className="flex flex-col gap-3">
            {at.cartelera.map(({ production, season }) => (
              <button key={season.id} onClick={() => nav.go({ name: 'production', id: production.id })} className="ticket flex items-center gap-3 p-3 text-left" style={{ ['--notch' as string]: '80%' }}>
                <span className="w-14 shrink-0 overflow-hidden rounded-sm">
                  <Poster production={production} showCompany={false} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{production.title}</span>
                  <span className="block text-xs text-gris">{production.company}</span>
                  <span className="mt-1 block font-mono text-xs text-grafito">
                    {fmt.range(season.start, season.end)} · {fmt.price(season.priceFrom, season.priceTo)}
                  </span>
                </span>
                <Icon name="next" size={18} className="text-gris" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon="calendar" title="Sin funciones ahora" text="Este teatro no tiene obras en temporada en este momento. Revisa lo que viene o su archivo." />
        )}
      </section>

      {at.proximamente.length > 0 && (
        <section>
          <SectionTitle>Próximamente</SectionTitle>
          <div className="flex gap-3">
            {at.proximamente.map(({ production }) => (
              <PosterCard key={production.id} production={production} showVenue={false} />
            ))}
          </div>
        </section>
      )}

      {at.archivo.length > 0 && (
        <section>
          <SectionTitle>Archivo de esta sala</SectionTitle>
          <ul className="flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
            {at.archivo.map(({ production, season }) => (
              <li key={season.id}>
                <button onClick={() => nav.go({ name: 'production', id: production.id })} className="flex w-full items-center gap-3 p-3 text-left hover:bg-crema">
                  <span className="w-9 shrink-0 overflow-hidden rounded-sm">
                    <Poster production={production} showCompany={false} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{production.title}</span>
                    <span className="block font-mono text-xs text-grafito">
                      {season.kind} · {fmt.range(season.start, season.end)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

// ——— Mapa ———

export function TheaterMap() {
  const nav = useNav()
  const [onlyActive, setOnlyActive] = useState(false)
  const [selected, setSelected] = useState<string | null>('teatro-jacaranda')
  const venues = allVenues().filter((v) => !onlyActive || productionsAtVenue(v.id).cartelera.length > 0)
  const sel = venues.find((v) => v.id === selected)
  const selAt = sel ? productionsAtVenue(sel.id) : null

  return (
    <div className="flex flex-col gap-4 pb-10">
      <ScreenHeader title="Mapa de teatros" sub="Ciudad de México" />
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={!onlyActive} onClick={() => setOnlyActive(false)}>
          Todos los teatros
        </Chip>
        <Chip active={onlyActive} onClick={() => setOnlyActive(true)}>
          Con funciones ahora
        </Chip>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-linea">
          <svg viewBox="0 0 100 100" className="block h-auto w-full" role="group" aria-label="Mapa ilustrativo de teatros">
            <MapBase />
            {venues.map((v) => {
              const active = v.id === selected
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
                  aria-pressed={active}
                  className="cursor-pointer focus:outline-none"
                >
                  <path d="M0 0 C-4 -5 -5 -7 -5 -9 A5 5 0 0 1 5 -9 C5 -7 4 -5 0 0z" fill={v.color} stroke={active ? '#191919' : '#FBF8F2'} strokeWidth={active ? 1 : 0.7} transform={active ? 'scale(1.35)' : undefined} />
                  <text y={active ? -10.4 : -7.7} textAnchor="middle" fontSize="3.6" fontFamily="'Courier Prime', monospace" fontWeight="700" fill={v.color === '#E9B321' || v.color === '#E76F91' ? '#191919' : '#FBF8F2'}>
                    {count}
                  </text>
                  {active && (
                    <text y="5" textAnchor="middle" fontSize="3" fontWeight="700" fontFamily="'DM Sans', sans-serif" fill="#191919" stroke="#EFE7D6" strokeWidth=".8" paintOrder="stroke">
                      {v.name}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
          <p className="absolute bottom-2 left-2 rounded bg-papel/90 px-2 py-1 text-[11px] text-gris">Mapa ilustrativo, no a escala. El número es cuántas obras hay en cartelera.</p>
        </div>

        <div className="flex flex-col gap-3">
          {sel && selAt ? (
            <div className="overflow-hidden rounded-xl border border-linea bg-papel">
              <VenueSign venue={sel} />
              <div className="flex flex-col gap-3 p-4">
                <p className="text-sm text-grafito">
                  {sel.neighborhood}, {sel.alcaldia} · {sel.capacity} butacas
                </p>
                {selAt.cartelera.length ? (
                  <ul className="flex flex-col gap-2">
                    {selAt.cartelera.map(({ production, season }) => (
                      <li key={season.id}>
                        <button onClick={() => nav.go({ name: 'production', id: production.id })} className="flex w-full items-center gap-3 text-left hover:underline">
                          <span className="w-9 shrink-0 overflow-hidden rounded-sm">
                            <Poster production={production} showCompany={false} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold">{production.title}</span>
                            <span className="block font-mono text-[11px] text-grafito">hasta {fmt.dayMonth(season.end)}</span>
                          </span>
                          <StatusPill status={seasonStatus(season)} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gris">Sin obras en temporada por ahora.</p>
                )}
                <button onClick={() => nav.go({ name: 'venue', id: sel.id })} className="inline-flex items-center gap-1 text-sm font-semibold text-rojo hover:underline">
                  Ver teatro <Icon name="arrow" size={16} />
                </button>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-linea p-4 text-sm text-gris">Toca un teatro en el mapa para ver qué hay en cartelera.</p>
          )}
          <ul className="flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
            {venues.map((v) => (
              <li key={v.id}>
                <button onClick={() => setSelected(v.id)} aria-pressed={v.id === selected} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${v.id === selected ? 'bg-amarillo-claro/60' : 'hover:bg-crema'}`}>
                  <span className="size-3 shrink-0 rounded-full" style={{ background: v.color }} />
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

