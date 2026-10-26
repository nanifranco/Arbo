import { useState } from 'react'
import { fmt, getProduction, getSeason, getVenue, parseISO, TODAY } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import type { DiaryEntry } from '../data/types'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { Button, EmptyState, PosterCard, Stars } from '../components/ui'

type Tab = 'diario' | 'favoritas' | 'resenas'

export function Diary() {
  const store = useStore()
  const nav = useNav()
  const [tab, setTab] = useState<Tab>('diario')
  const entries = [...store.diary].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex items-end justify-between gap-3 pt-3">
        <div>
          <h1 className="font-marker text-[32px] leading-none md:text-4xl">Mi diario</h1>
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
          <Stats entries={entries} />

          <div className="flex gap-1 border-b border-linea" role="tablist">
            {(
              [
                ['diario', 'Historial'],
                ['favoritas', `Favoritas · ${store.favorites.length}`],
                ['resenas', 'Mis reseñas'],
              ] as [Tab, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`-mb-px border-b-[3px] px-3 py-2.5 text-sm font-semibold ${tab === t ? 'border-rojo' : 'border-transparent text-gris hover:text-tinta'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'diario' && <Timeline entries={entries} />}
          {tab === 'favoritas' &&
            (store.favorites.length ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {store.favorites.map((id) => getProduction(id)).filter(Boolean).map((p) => (
                  <PosterCard key={p!.id} production={p!} width="w-auto" />
                ))}
              </div>
            ) : (
              <EmptyState icon="heart" title="Sin favoritas todavía" text="Marca con el corazón las obras que te gustaría volver a ver o recomendar siempre." />
            ))}
          {tab === 'resenas' &&
            (entries.some((e) => e.review) ? (
              <div className="flex flex-col gap-3">
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

function Stats({ entries }: { entries: DiaryEntry[] }) {
  const year = TODAY.getFullYear()
  const thisYear = entries.filter((e) => parseISO(e.date).getFullYear() === year)
  const venues = new Set(entries.map((e) => (getSeason(getProduction(e.productionId)!, e.seasonId) ?? getProduction(e.productionId)!.seasons[0]).venueId))
  const rated = entries.filter((e) => e.rating)
  const avg = rated.length ? rated.reduce((a, e) => a + (e.rating ?? 0), 0) / rated.length : 0
  const genreCount: Record<string, number> = {}
  entries.forEach((e) => getProduction(e.productionId)?.genres.forEach((g) => (genreCount[g] = (genreCount[g] ?? 0) + 1)))
  const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0]

  // Últimos 12 meses
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - 11 + i, 1)
    const count = entries.filter((e) => {
      const x = parseISO(e.date)
      return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth()
    }).length
    return { m: d.getMonth(), count }
  })
  const max = Math.max(1, ...months.map((m) => m.count))

  return (
    <section className="grid gap-4 rounded-2xl bg-verde p-4 text-papel md:grid-cols-[1fr_1.2fr] md:p-6" aria-label="Tus estadísticas">
      <div className="grid grid-cols-2 gap-4">
        <Stat value={String(thisYear.length)} label={`obras en ${year}`} />
        <Stat value={String(venues.size)} label={venues.size === 1 ? 'teatro visitado' : 'teatros visitados'} />
        <Stat value={avg ? avg.toFixed(1) : '—'} label="calificación promedio" />
        <Stat value={topGenre ?? '—'} label="tu género" small />
      </div>
      <div>
        <div className="eyebrow mb-2 text-papel/70">Funciones por mes · últimos 12 meses</div>
        <div className="flex h-24 items-end gap-1.5">
          {months.map((m, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-sm bg-amarillo" style={{ height: `${(m.count / max) * 72}px`, minHeight: m.count ? 6 : 2, opacity: m.count ? 1 : 0.25 }} title={`${m.count}`} />
              <span className="font-mono text-[9px] uppercase text-papel/70">{fmt.monthShort(m.m).slice(0, 1)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label, small }: { value: string; label: string; small?: boolean }) {
  return (
    <div>
      <div className={`${small ? 'font-marker text-xl leading-tight' : 'font-slab text-4xl leading-none'} tabular text-amarillo`}>{value}</div>
      <div className="mt-1 text-xs text-papel/80">{label}</div>
    </div>
  )
}

function Timeline({ entries }: { entries: DiaryEntry[] }) {
  const groups: { key: string; items: DiaryEntry[] }[] = []
  entries.forEach((e) => {
    const key = e.date.slice(0, 7)
    const g = groups.find((x) => x.key === key)
    if (g) g.items.push(e)
    else groups.push({ key, items: [e] })
  })
  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <section key={g.key}>
          <h2 className="eyebrow mb-2 text-gris">{fmt.monthYear(g.key + '-01')}</h2>
          <div className="flex flex-col gap-3">
            {g.items.map((e) => (
              <EntryCard key={e.id} e={e} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function EntryCard({ e, full = false }: { e: DiaryEntry; full?: boolean }) {
  const nav = useNav()
  const store = useStore()
  const p = getProduction(e.productionId)
  if (!p) return null
  const s = getSeason(p, e.seasonId)
  const v = s ? getVenue(s.venueId) : undefined
  const fav = store.favorites.includes(p.id)
  const d = parseISO(e.date)
  return (
    <article className="ticket flex overflow-hidden" style={{ ['--notch' as string]: '64px' }}>
      <div className="flex w-16 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-linea bg-crema/60 py-3 font-mono">
        <span className="text-[10px] uppercase text-gris">{fmt.weekday(e.date)}</span>
        <span className="text-2xl font-bold leading-none tabular">{d.getDate()}</span>
        <span className="text-[10px] uppercase text-gris">{fmt.monthShort(d.getMonth())}</span>
      </div>
      <button onClick={() => nav.go({ name: 'production', id: p.id })} className="m-2.5 w-12 shrink-0 self-start overflow-hidden rounded-sm" aria-label={`Ver ${p.title}`}>
        <Poster production={p} showCompany={false} />
      </button>
      <div className="min-w-0 flex-1 py-2.5 pr-3">
        <div className="flex items-start gap-2">
          <button onClick={() => nav.go({ name: 'production', id: p.id })} className="min-w-0 flex-1 text-left">
            <span className="block line-clamp-2 font-bold leading-snug hover:underline">{p.title}</span>
            <span className="block truncate text-xs text-gris">{v ? `${v.name} · ${s?.kind}` : p.company}</span>
          </button>
          <button onClick={() => nav.go({ name: 'log', entryId: e.id })} className="grid size-8 shrink-0 place-items-center rounded-full text-gris hover:bg-carton hover:text-tinta" aria-label={`Editar entrada de ${p.title}`}>
            <Icon name="edit" size={16} />
          </button>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {e.rating ? <Stars value={e.rating} size={13} /> : <span className="text-xs text-gris">Sin calificar</span>}
          {fav && <Icon name="heart" size={14} filled className="text-rojo" />}
          {e.review && !full && <Icon name="chat" size={14} className="text-gris" />}
        </div>
        {e.review && <p className={`mt-1.5 text-sm leading-relaxed text-grafito ${full ? '' : 'line-clamp-2'}`}>{e.review}</p>}
      </div>
    </article>
  )
}
