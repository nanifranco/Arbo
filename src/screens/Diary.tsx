import { useMemo, useState } from 'react'
import { allVenues, fmt, getPerson, getProduction, getSeason, getVenue, parseISO, TODAY, toISO } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import type { DiaryEntry } from '../data/types'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { CityMapBase } from '../components/CityMap'
import { HalftonePortrait, Stamp } from '../components/deco'
import { Button, EmptyState, Stars } from '../components/ui'

type View = 'boletos' | 'calendario' | 'pared' | 'resenas'

const GENRE_COLORS = ['#B71C1C', '#E9B321', '#E76F91', '#23452E', '#21418F', '#D2582A', '#7A5BA6', '#191919']

export function Diary() {
  const store = useStore()
  const nav = useNav()
  const [view, setView] = useState<View>('boletos')
  const entries = useMemo(() => [...store.diary].sort((a, b) => b.date.localeCompare(a.date)), [store.diary])

  return (
    <div className="flex flex-col gap-8 pb-24">
      <header className="flex items-end justify-between gap-3 pt-3">
        <div>
          <h1 className="font-display text-[44px] uppercase leading-[0.9] md:text-[56px]">Mi diario</h1>
          <p className="mt-1 text-sm text-gris tabular">
            {entries.length} {entries.length === 1 ? 'función registrada' : 'funciones registradas'}
          </p>
        </div>
        <button onClick={() => nav.go({ name: 'watchlist' })} className="inline-flex items-center gap-1.5 rounded-full border border-linea bg-papel px-3 py-2 text-[13px] font-semibold hover:border-grafito">
          <Icon name="bookmark" size={16} /> Por ver <span className="tabular text-gris">{store.watchlist.length}</span>
        </button>
      </header>

      {entries.length === 0 ? (
        <EmptyState
          title="Tu diario está en blanco"
          text="Cada obra que veas se guarda aquí como un boleto: fecha, teatro, calificación y lo que te dejó. Empieza con la última que viste, aunque ya haya terminado temporada."
          action="Registrar mi primera obra"
          onAction={() => nav.go({ name: 'log' })}
        />
      ) : (
        <>
          <YearInStage entries={entries} />

          <div className="no-scrollbar flex gap-1 overflow-x-auto border-b-2 border-tinta" role="tablist">
            {(
              [
                ['boletos', 'Boletos'],
                ['calendario', 'Calendario'],
                ['pared', 'Mi pared'],
                ['resenas', 'Reseñas'],
              ] as [View, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                role="tab"
                aria-selected={view === t}
                onClick={() => setView(t)}
                className={`-mb-[2px] shrink-0 rounded-t-md px-4 py-2.5 font-display text-[16px] uppercase tracking-wide ${view === t ? 'bg-tinta text-papel' : 'text-grafito hover:text-tinta'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {view === 'boletos' && <Timeline entries={entries} />}
          {view === 'calendario' && <CalendarView entries={entries} />}
          {view === 'pared' && <WallView entries={entries} />}
          {view === 'resenas' &&
            (entries.some((e) => e.review) ? (
              <div className="grid gap-4 md:grid-cols-2">
                {entries
                  .filter((e) => e.review)
                  .map((e) => (
                    <EntryCard key={e.id} e={e} full />
                  ))}
              </div>
            ) : (
              <EmptyState icon="chat" title="Aún no escribes reseñas" text="Cuando registres una obra puedes dejar unas líneas sobre la función. Aquí se juntan todas." />
            ))}
        </>
      )}

      <div className="fixed bottom-[calc(84px+env(safe-area-inset-bottom,0px))] right-[max(16px,env(safe-area-inset-right,0px))] z-30 md:bottom-8 md:right-8">
        <Button icon="plus" onClick={() => nav.go({ name: 'log' })} className="!min-h-12 shadow-lg">
          Registrar obra
        </Button>
      </div>
    </div>
  )
}

// ——— Tu año en escena ———

function YearInStage({ entries }: { entries: DiaryEntry[] }) {
  const nav = useNav()
  const years = [...new Set([TODAY.getFullYear(), ...entries.map((e) => parseISO(e.date).getFullYear())])].sort((a, b) => b - a)
  const [year, setYear] = useState(years[0])
  const list = entries.filter((e) => parseISO(e.date).getFullYear() === year)
  const prods = list.map((e) => getProduction(e.productionId)!).filter(Boolean)
  const venueIds = new Set(list.map((e) => (getSeason(getProduction(e.productionId)!, e.seasonId) ?? getProduction(e.productionId)!.seasons[0]).venueId))
  const rated = list.filter((e) => e.rating)
  const avg = rated.length ? rated.reduce((a, e) => a + (e.rating ?? 0), 0) / rated.length : null
  const minutes = prods.reduce((a, p) => a + p.durationMin, 0)

  const genreCount: Record<string, number> = {}
  prods.forEach((p) => p.genres.forEach((g) => (genreCount[g] = (genreCount[g] ?? 0) + 1)))
  const genres = Object.entries(genreCount).sort((a, b) => b[1] - a[1])
  const genreTotal = genres.reduce((a, [, n]) => a + n, 0)

  const ratingDist = [1, 2, 3, 4, 5].map((s) => rated.filter((e) => Math.ceil(e.rating!) === s).length)
  const maxR = Math.max(1, ...ratingDist)

  const peopleCount: Record<string, number> = {}
  prods.forEach((p) => new Set(p.credits.map((c) => c.personId)).forEach((id) => (peopleCount[id] = (peopleCount[id] ?? 0) + 1)))
  const topPeople = Object.entries(peopleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const jan1 = new Date(year, 0, 1)
  const offset = (jan1.getDay() + 6) % 7
  const byDay = new Map<string, number>()
  list.forEach((e) => byDay.set(e.date, (byDay.get(e.date) ?? 0) + 1))

  return (
    <section aria-label={`Tu año en escena ${year}`} className="wall relative overflow-hidden rounded-2xl p-5 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow text-grafito">Estadísticas</div>
          <h2 className="font-playbill text-[30px] leading-none md:text-[38px]">Tu año en escena</h2>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Año">
          {years.map((y) => (
            <button key={y} onClick={() => setYear(y)} aria-pressed={y === year} className={`rounded-full px-3 py-1 font-display text-[15px] tabular ${y === year ? 'bg-rojo text-papel' : 'bg-papel/70 text-grafito hover:bg-papel'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-6 font-hand text-2xl text-grafito">Este año todavía no registras funciones.</p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [String(list.length), list.length === 1 ? 'función' : 'funciones', '#B71C1C'],
              [String(venueIds.size), venueIds.size === 1 ? 'teatro' : 'teatros', '#23452E'],
              [avg ? avg.toFixed(1) : '—', 'calificación media', '#B8860B'],
              [String(Math.round(minutes / 60)), 'horas en butaca', '#C2456B'],
            ].map(([v, l, c], i) => (
              <div key={l} className="paper relative px-3 pb-3 pt-2.5" style={{ rotate: `${((i % 2) * 2 - 1) * 0.6}deg` }}>
                <div className="font-display text-[46px] leading-none tabular" style={{ color: c }}>
                  {v}
                </div>
                <div className="mt-1 text-[12px] font-bold uppercase tracking-wider text-grafito">{l}</div>
              </div>
            ))}
          </div>

          <div className="paper no-scrollbar mt-4 overflow-x-auto p-3">
            <div className="eyebrow mb-2 text-gris">Cada cuadro es un día · rojo = fuiste al teatro</div>
            <div className="grid grid-flow-col grid-rows-7 gap-[2px] sm:gap-[3px]" style={{ gridTemplateColumns: 'repeat(53, minmax(0, 1fr))' }}>
              {Array.from({ length: 53 * 7 }).map((_, i) => {
                const d = new Date(year, 0, 1 - offset + i)
                const inYear = d.getFullYear() === year
                const n = byDay.get(toISO(d)) ?? 0
                const future = d > TODAY
                return <span key={i} title={inYear ? `${fmt.short(toISO(d))}${n ? ` · ${n} función` : ''}` : undefined} className={`aspect-square rounded-[2px] ${!inYear ? 'opacity-0' : n ? 'bg-rojo' : future ? 'bg-carton/40' : 'bg-carton'}`} />
              })}
            </div>
            <div className="mt-1.5 grid grid-cols-12 font-mono text-[9px] uppercase text-gris sm:text-[10px]">
              {Array.from({ length: 12 }).map((_, m) => (
                <span key={m}>{fmt.monthShort(m)}</span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="paper p-4">
              <div className="eyebrow text-gris">Tus géneros</div>
              <div className="mt-3 flex h-4 overflow-hidden rounded-full">
                {genres.map(([g, n], i) => (
                  <span key={g} style={{ width: `${(n / genreTotal) * 100}%`, background: GENRE_COLORS[i % GENRE_COLORS.length] }} title={`${g}: ${n}`} />
                ))}
              </div>
              <ul className="mt-3 flex flex-col gap-1.5 text-[13px]">
                {genres.slice(0, 5).map(([g, n], i) => (
                  <li key={g} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                    <span className="flex-1">{g}</span>
                    <span className="font-mono font-bold tabular">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="paper p-4">
              <div className="eyebrow text-gris">Cómo calificas</div>
              <div className="mt-3 flex h-28 items-end gap-2">
                {ratingDist.map((n, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="font-mono text-[11px] tabular text-gris">{n}</span>
                    <div className="w-full rounded-t-sm bg-amarillo" style={{ height: `${Math.max(3, (n / maxR) * 70)}px` }} />
                    <span className="font-display text-sm leading-none">{i + 1}★</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="paper p-4">
              <div className="eyebrow text-gris">
                Teatros visitados · {venueIds.size} de {allVenues().length}
              </div>
              <svg viewBox="10 14 76 80" className="mt-2 block h-auto w-full rounded" aria-hidden="true">
                <CityMapBase labels={false} landmarks={false} />
                {allVenues().map((v) => (
                  <circle key={v.id} cx={v.x} cy={v.y} r={venueIds.has(v.id) ? 3.4 : 2.2} fill={venueIds.has(v.id) ? '#B71C1C' : '#FBF8F2'} stroke="#191919" strokeWidth=".6" />
                ))}
              </svg>
            </div>
          </div>

          {topPeople.length > 0 && (
            <div className="mt-5">
              <div className="eyebrow mb-2 text-grafito">Artistas que más has visto</div>
              <div className="grid grid-cols-4 gap-3">
                {topPeople.map(([id, n], i) => {
                  const person = getPerson(id)!
                  return (
                    <button key={id} onClick={() => nav.go({ name: 'artist', id })} className="bg-papel p-1.5 pb-2 text-left shadow-[0_8px_14px_-10px_rgba(0,0,0,.5)]" style={{ rotate: `${(i - 1.5) * 1.5}deg` }}>
                      <HalftonePortrait seed={id} bg={['#B71C1C', '#23452E', '#21418F', '#191919'][i]} ink={['#F6E3A8', '#E9B321', '#E76F91', '#E9B321'][i]} label={person.name} />
                      <div className="mt-1.5 truncate text-[12px] font-bold leading-tight">{person.name}</div>
                      <div className="font-mono text-[11px] text-gris">
                        ×{n} {n === 1 ? 'obra' : 'obras'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

// ——— Vistas ———

function Timeline({ entries }: { entries: DiaryEntry[] }) {
  const groups: { key: string; items: DiaryEntry[] }[] = []
  entries.forEach((e) => {
    const key = e.date.slice(0, 7)
    const g = groups.find((x) => x.key === key)
    if (g) g.items.push(e)
    else groups.push({ key, items: [e] })
  })
  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <section key={g.key}>
          <h2 className="mb-3 flex items-center gap-3">
            <span className="font-display text-2xl uppercase leading-none">{fmt.monthYear(g.key + '-01')}</span>
            <span className="h-[2px] flex-1 bg-tinta/80" />
            <span className="font-mono text-xs text-gris">{g.items.length}</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {g.items.map((e) => (
              <EntryCard key={e.id} e={e} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function CalendarView({ entries }: { entries: DiaryEntry[] }) {
  const nav = useNav()
  const latest = parseISO(entries[0].date)
  const [month, setMonth] = useState(new Date(latest.getFullYear(), latest.getMonth(), 1))
  const pad = (month.getDay() + 6) % 7
  const n = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: pad + n }, (_, i) => (i < pad ? null : new Date(month.getFullYear(), month.getMonth(), i - pad + 1)))
  const monthsWith = [...new Set(entries.map((e) => e.date.slice(0, 7)))]
  return (
    <div className="paper p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid size-9 place-items-center rounded-full hover:bg-carton" aria-label="Mes anterior">
          <Icon name="back" />
        </button>
        <div className="font-display text-2xl uppercase">{fmt.monthYear(toISO(month))}</div>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid size-9 place-items-center rounded-full hover:bg-carton" aria-label="Mes siguiente">
          <Icon name="next" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
          <span key={d} className="text-center text-[11px] font-bold uppercase text-gris">
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const day = entries.filter((e) => e.date === toISO(d))
          const p = day[0] && getProduction(day[0].productionId)
          return (
            <div key={i} className={`relative aspect-[2/3] overflow-hidden rounded-[3px] ${p ? 'shadow-md' : 'bg-crema'}`}>
              {p ? (
                <button onClick={() => nav.go({ name: 'production', id: p.id })} className="block h-full w-full" aria-label={`${d.getDate()}: ${p.title}`}>
                  <Poster production={p} showCompany={false} />
                </button>
              ) : null}
              <span className={`absolute left-1 top-0.5 font-display text-[13px] tabular ${p ? 'rounded-sm bg-tinta/80 px-1 text-papel' : 'text-gris'}`}>{d.getDate()}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-gris">Ir a:</span>
        {monthsWith.map((m) => (
          <button key={m} onClick={() => setMonth(parseISO(m + '-01'))} className="rounded-full border border-linea px-2 py-0.5 font-mono text-[11px] hover:border-tinta">
            {fmt.monthYear(m + '-01')}
          </button>
        ))}
      </div>
    </div>
  )
}

function WallView({ entries }: { entries: DiaryEntry[] }) {
  const nav = useNav()
  const store = useStore()
  return (
    <div className="wall grid grid-cols-3 gap-5 rounded-xl p-5 pt-7 sm:grid-cols-4 lg:grid-cols-6">
      {entries.map((e, i) => {
        const p = getProduction(e.productionId)
        if (!p) return null
        const fav = store.favorites.includes(p.id)
        return (
          <button key={e.id} onClick={() => nav.go({ name: 'production', id: p.id })} className="group relative text-left" style={{ rotate: `${((i * 7) % 5) - 2}deg` }}>
            <div className="poster-lift shadow-[0_12px_18px_-10px_rgba(0,0,0,.6)]">
              <Poster production={p} showCompany={false} />
            </div>
            {i % 2 === 0 && <span className="tape" style={{ width: '50%' }} />}
            {e.rating ? <span className="absolute -bottom-2 -right-2 grid size-10 place-items-center rounded-full border-2 border-papel bg-amarillo font-display text-[15px] text-tinta shadow">{e.rating}</span> : null}
            {fav && (
              <span className="absolute -left-2 -top-2 grid size-7 place-items-center rounded-full bg-rojo text-papel shadow">
                <Icon name="heart" size={14} filled />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ——— Boleto del diario ———

export function EntryCard({ e, full = false }: { e: DiaryEntry; full?: boolean }) {
  const nav = useNav()
  const store = useStore()
  const p = getProduction(e.productionId)
  if (!p) return null
  const s = getSeason(p, e.seasonId)
  const v = s ? getVenue(s.venueId) : undefined
  const fav = store.favorites.includes(p.id)
  const d = parseISO(e.date)
  const folio = String(Array.from(e.id).reduce((a, c) => a + c.charCodeAt(0) * 7, 0) % 9000 + 1000)
  const stubBg = p.poster.bg === '#F5F0E6' ? '#191919' : p.poster.bg
  const stubFg = p.poster.bg === '#F5F0E6' ? '#FBF8F2' : p.poster.fg
  return (
    <article className="ticket flex overflow-hidden" style={{ ['--notch' as string]: '76px' }}>
      <div className="flex w-[76px] shrink-0 flex-col items-center justify-center py-3" style={{ background: stubBg, color: stubFg }}>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{fmt.weekday(e.date)}</span>
        <span className="font-display text-[38px] leading-[0.9] tabular">{d.getDate()}</span>
        <span className="text-[11px] font-bold uppercase tracking-widest">{fmt.monthShort(d.getMonth())}</span>
        <span className="font-mono text-[10px] opacity-75">{d.getFullYear()}</span>
      </div>
      <button onClick={() => nav.go({ name: 'production', id: p.id })} className="ml-3 mt-3 w-[52px] shrink-0 self-start shadow-md" aria-label={`Ver ${p.title}`}>
        <Poster production={p} showCompany={false} />
      </button>
      <div className="relative min-w-0 flex-1 py-3 pl-3 pr-3">
        <div className="flex items-start gap-2">
          <button onClick={() => nav.go({ name: 'production', id: p.id })} className="min-w-0 flex-1 text-left">
            <span className="block font-display text-[19px] uppercase leading-[1.02] hover:underline">{p.title}</span>
            <span className="mt-1 block truncate text-xs text-gris">
              {v ? `${v.name} · ${s?.kind}` : p.company}
              {e.place ? ` · ${e.place}` : ''}
            </span>
          </button>
          <button onClick={() => nav.go({ name: 'log', entryId: e.id })} className="grid size-8 shrink-0 place-items-center rounded-full text-gris hover:bg-carton hover:text-tinta" aria-label={`Editar entrada de ${p.title}`}>
            <Icon name="edit" size={16} />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {e.rating ? <Stars value={e.rating} size={15} /> : <span className="text-xs text-gris">Sin calificar</span>}
          {fav && <Icon name="heart" size={15} filled className="text-rojo" />}
        </div>
        {e.review && <p className={`mt-2 font-hand text-[14.5px] leading-relaxed text-grafito ${full ? '' : 'line-clamp-2'}`}>“{e.review}”</p>}
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-gris">
          <span>Árbo · boleto nº {folio}</span>
          {fav && (
            <Stamp size="sm" rotate={-6}>
              Favorita
            </Stamp>
          )}
        </div>
      </div>
    </article>
  )
}
