import { allCommunityReviews, allProductions, allVenues, currentSeason, fmt, getCommunityUser, getProduction, getVenue, popularity, ratingStats, upcomingPerformances } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { Avatar, CommunityScore, DemoBadge, GenreTag, Logo, PosterCard, SectionTitle, Stars } from '../components/ui'

export function Home() {
  const nav = useNav()
  const { user, watchlist } = useStore()
  const all = allProductions()
  const cartelera = all.filter((p) => currentSeason(p).status === 'cartelera').sort((a, b) => popularity(b.id) - popularity(a.id))
  const proximamente = all.filter((p) => currentSeason(p).status === 'proximamente')
  const archivo = all.filter((p) => currentSeason(p).status === 'archivo')
  const featured = getProduction('medea-barrio') ?? cartelera[0]
  const fs = currentSeason(featured)
  const fv = getVenue(fs.season.venueId)
  const nextShows = upcomingPerformances(fs.season, 3)
  const ranking = cartelera.slice(0, 5)
  const recent = allCommunityReviews()
    .filter((r) => !r.spoiler)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
  const firstName = user?.name.split(' ')[0]

  return (
    <div className="flex flex-col gap-9 pb-8">
      {/* Encabezado */}
      <header className="flex items-center justify-between pt-3 md:hidden">
        <Logo size="md" />
        <span className="inline-flex items-center gap-1 rounded-full border border-linea bg-papel px-3 py-1.5 text-[13px] font-semibold">
          <Icon name="pin" size={15} className="text-rojo" /> CDMX
        </span>
      </header>

      <div>
        <p className="eyebrow text-gris">Hola{firstName ? `, ${firstName}` : ''}</p>
        <h1 className="mt-1 font-marker text-[34px] leading-[1.05] md:text-5xl">¿Qué vamos a ver esta semana?</h1>
      </div>

      {/* Destacada: cartel pegado en la pared */}
      <section aria-labelledby="destacada" className="relative overflow-hidden rounded-2xl bg-rojo text-papel">
        <div className="absolute inset-0 opacity-[.13]" style={{ backgroundImage: 'repeating-linear-gradient(-8deg, transparent 0 22px, #000 22px 23px)' }} aria-hidden="true" />
        <div className="relative grid grid-cols-[42%_1fr] gap-4 p-4 md:grid-cols-[220px_1fr] md:gap-8 md:p-7">
          <button onClick={() => nav.go({ name: 'production', id: featured.id })} className="relative -rotate-2 self-start" aria-label={`Ver ${featured.title}`}>
            <div className="shadow-[0_14px_24px_-12px_rgba(0,0,0,.7)]">
              <Poster production={featured} />
            </div>
            <span className="tape" />
          </button>
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow text-amarillo">Destacada</span>
              <DemoBadge className="!border-papel/70 !text-papel" />
            </div>
            <h2 id="destacada" className="mt-2 font-marker text-[26px] leading-[1.05] md:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-1 text-[13px] text-papel/85">{featured.company}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-papel/90 md:line-clamp-none md:max-w-lg">{featured.synopsis}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold">
              <Icon name="pin" size={15} /> {fv?.name}
            </div>
            {nextShows.length > 0 && (
              <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
                {nextShows.map((s) => (
                  <span key={s.date + s.time} className="rounded border border-papel/40 px-2 py-1 font-mono text-xs">
                    {fmt.weekday(s.date)} {fmt.dayMonth(s.date)} · {s.time}
                  </span>
                ))}
              </div>
            )}
            <button onClick={() => nav.go({ name: 'production', id: featured.id })} className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-papel px-4 py-2.5 text-sm font-bold text-rojo hover:bg-amarillo-claro">
              Ver obra <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* En cartelera */}
      <section aria-labelledby="cartelera">
        <SectionTitle id="cartelera" action="Ver toda la cartelera" onAction={() => nav.go({ name: 'explore', tab: 'cartelera' })}>
          En cartelera
        </SectionTitle>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
          {cartelera.slice(0, 8).map((p) => (
            <PosterCard key={p.id} production={p} width="w-[132px] md:w-auto" />
          ))}
        </div>
      </section>

      <div className="grid gap-9 md:grid-cols-2 md:gap-8">
        {/* Ranking: la numeración es el lugar en la lista */}
        <section aria-labelledby="comentadas">
          <SectionTitle id="comentadas">Lo más comentado</SectionTitle>
          <ol className="flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
            {ranking.map((p, i) => {
              const r = ratingStats(p.id)
              return (
                <li key={p.id}>
                  <button onClick={() => nav.go({ name: 'production', id: p.id })} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-crema">
                    <span className="w-6 text-center font-slab text-xl text-rojo">{i + 1}</span>
                    <span className="w-10 shrink-0 overflow-hidden rounded-sm">
                      <Poster production={p} showCompany={false} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{p.title}</span>
                      <span className="flex items-center gap-2 text-xs text-gris">
                        <CommunityScore stats={r} size={12} />
                      </span>
                    </span>
                    <span className="hidden sm:block">
                      <GenreTag genre={p.genres[0]} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>

        {/* Mapa */}
        <section aria-labelledby="cerca">
          <SectionTitle id="cerca" action="Abrir mapa" onAction={() => nav.go({ name: 'map' })}>
            Teatros en la ciudad
          </SectionTitle>
          <button onClick={() => nav.go({ name: 'map' })} className="relative block w-full overflow-hidden rounded-xl border border-linea bg-[#efe7d6] text-left" aria-label="Abrir mapa de teatros">
            <MiniMap />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-papel/95 px-3 py-2 text-sm shadow">
              <span>
                <b className="tabular">{allVenues().length}</b> teatros · <span className="text-gris">Roma, Centro, Coyoacán y más</span>
              </span>
              <Icon name="arrow" size={18} className="text-rojo" />
            </div>
          </button>
        </section>
      </div>

      {/* Por ver */}
      {watchlist.length > 0 && (
        <section aria-labelledby="porver">
          <SectionTitle id="porver" action="Tu lista" onAction={() => nav.go({ name: 'watchlist' })}>
            Tienes pendientes
          </SectionTitle>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {watchlist.map((id) => getProduction(id)).filter(Boolean).map((p) => (
              <PosterCard key={p!.id} production={p!} width="w-[110px]" />
            ))}
          </div>
        </section>
      )}

      {/* Comunidad */}
      <section aria-labelledby="dicen">
        <SectionTitle id="dicen" action="Ir a comunidad" onAction={() => nav.tab('community')}>
          Lo que dice la banda
        </SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {recent.map((r) => {
            const u = getCommunityUser(r.userId)!
            const p = getProduction(r.productionId)!
            return (
              <button key={r.id} onClick={() => nav.go({ name: 'production', id: p.id })} className="flex flex-col gap-2 rounded-xl border border-linea bg-papel p-4 text-left hover:border-grafito">
                <div className="flex items-center gap-2">
                  <Avatar name={u.name} color={u.color} size={28} />
                  <span className="truncate text-[13px] font-semibold">{u.name}</span>
                  <Stars value={r.rating} size={12} />
                </div>
                <div className="text-sm font-bold">{p.title}</div>
                <p className="line-clamp-3 text-sm leading-relaxed text-grafito">“{r.text}”</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Próximamente + archivo */}
      <div className="grid gap-9 md:grid-cols-2 md:gap-8">
        <section aria-labelledby="proximas">
          <SectionTitle id="proximas">Próximamente</SectionTitle>
          <div className="flex gap-3">
            {proximamente.map((p) => (
              <PosterCard key={p.id} production={p} width="w-[120px]" />
            ))}
          </div>
        </section>
        <section aria-labelledby="archivo">
          <SectionTitle id="archivo" action="Explorar el archivo" onAction={() => nav.go({ name: 'explore', tab: 'archivo' })}>
            Del archivo
          </SectionTitle>
          <p className="mb-3 text-sm text-gris">Temporadas que ya terminaron. Puedes registrarlas en tu diario si las viste.</p>
          <div className="flex gap-3">
            {archivo.slice(0, 3).map((p) => (
              <PosterCard key={p.id} production={p} width="w-[100px]" showVenue={false} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

/** Vista previa del mapa ilustrado */
function MiniMap() {
  return (
    <svg viewBox="0 0 100 62" className="block h-auto w-full" aria-hidden="true">
      <MapBase compact />
      {allVenues().map((v) => (
        <g key={v.id} transform={`translate(${v.x} ${v.y * 0.62})`}>
          <circle r="2.6" fill={v.color} stroke="#FBF8F2" strokeWidth=".8" />
        </g>
      ))}
    </svg>
  )
}

/** Base del mapa ilustrativo de la ciudad (no está a escala) */
export function MapBase({ compact = false }: { compact?: boolean }) {
  const k = compact ? 0.62 : 1
  return (
    <g>
      <rect width="100" height={100 * k} fill="#EFE7D6" />
      {/* cuadrícula de calles */}
      <g stroke="#E2D7C1" strokeWidth=".5">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={'v' + i} x1={i * 5 + 2} y1="0" x2={i * 5 - 3} y2={100 * k} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={'h' + i} x1="0" y1={i * 5 * k} x2="100" y2={(i * 5 + 2) * k} />
        ))}
      </g>
      {/* Bosque de Chapultepec */}
      <path d={`M12 ${40 * k} q8 -8 18 -4 q6 6 2 14 q-10 6 -20 0 q-4 -4 0 -10z`} fill="#CFDCC6" />
      {/* Viveros / Coyoacán */}
      <path d={`M40 ${80 * k} q6 -4 12 0 q2 6 -4 8 q-8 0 -8 -8z`} fill="#CFDCC6" />
      {/* Avenidas principales */}
      <g fill="none" strokeLinecap="round">
        <path d={`M14 ${30 * k} L48 ${40 * k} L66 ${30 * k}`} stroke="#F5F0E6" strokeWidth="2.6" />
        <path d={`M50 0 L52 ${100 * k}`} stroke="#F5F0E6" strokeWidth="2.2" />
        <path d={`M0 ${70 * k} Q50 ${62 * k} 100 ${72 * k}`} stroke="#F5F0E6" strokeWidth="2" />
        <path d={`M66 0 L64 ${100 * k}`} stroke="#E8C9C9" strokeWidth="1.2" strokeDasharray="2 1.5" />
      </g>
      {!compact && (
        <g fontFamily="'DM Sans', sans-serif" fontSize="2.4" fontWeight="700" fill="#8A8073" letterSpacing=".25">
          <text x="62" y="27">CENTRO</text>
          <text x="38" y="45">ROMA</text>
          <text x="25" y="61">CONDESA</text>
          <text x="40" y="34">JUÁREZ</text>
          <text x="55" y="70">NARVARTE</text>
          <text x="52" y="93">COYOACÁN</text>
          <text x="18" y="90">SAN ÁNGEL</text>
          <text x="14" y="37" fill="#6F8A63">CHAPULTEPEC</text>
        </g>
      )}
    </g>
  )
}
