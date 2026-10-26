import { useMemo, useState, type FormEvent } from 'react'
import { allProductions, currentSeason, fmt, getProduction, getVenue, searchAll, TODAY, toISO } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { Button, EmptyState, Field, inputCls, ScreenHeader, StarInput, Stars, StatusPill } from '../components/ui'

const MAX = 1000

export function LogEntry({ productionId, entryId }: { productionId?: string; entryId?: string }) {
  const store = useStore()
  const existing = entryId ? store.diary.find((d) => d.id === entryId) : undefined
  const [pid, setPid] = useState(existing?.productionId ?? productionId)

  if (entryId && !existing)
    return (
      <>
        <ScreenHeader title="Editar entrada" />
        <EmptyState icon="info" title="Esta entrada ya no existe" text="Puede que la hayas borrado desde otra pantalla." />
      </>
    )

  if (!pid) return <PickProduction onPick={setPid} />
  return <Form key={pid} productionId={pid} entryId={existing?.id} onChangeProduction={!existing && !productionId ? () => setPid(undefined) : undefined} />
}

function PickProduction({ onPick }: { onPick: (id: string) => void }) {
  const nav = useNav()
  const [q, setQ] = useState('')
  const list = useMemo(() => (q.trim() ? searchAll(q).productions : allProductions().filter((p) => currentSeason(p).status !== 'proximamente')), [q])
  return (
    <div className="pb-10">
      <ScreenHeader title="Registrar una obra" />
      <h1 className="font-display text-[44px] uppercase leading-[0.9]">¿Qué viste?</h1>
      <p className="mt-1 text-sm text-gris">Incluye obras en cartelera y del archivo.</p>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-linea bg-papel px-4 focus-within:border-tinta">
        <Icon name="search" size={18} className="text-gris" />
        <label htmlFor="pick-q" className="sr-only">
          Buscar obra
        </label>
        <input id="pick-q" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Título, compañía o autoría" className="h-12 w-full bg-transparent focus:outline-none" />
      </div>
      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="search" title="No está en el catálogo" text="Sugiérela y, cuando el equipo la publique, podrás registrarla en tu diario." action="Sugerir esta obra" onAction={() => nav.go({ name: 'suggest', title: q.trim() })} />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
          {list.map((p) => {
            const { season, status } = currentSeason(p)
            return (
              <li key={p.id}>
                <button onClick={() => onPick(p.id)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-crema">
                  <span className="w-11 shrink-0 overflow-hidden rounded-sm">
                    <Poster production={p} showCompany={false} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{p.title}</span>
                    <span className="block truncate text-xs text-gris">{getVenue(season.venueId)?.name}</span>
                  </span>
                  <StatusPill status={status} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {list.length > 0 && (
        <button onClick={() => nav.go({ name: 'suggest', title: q.trim() })} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rojo hover:underline">
          <Icon name="plus" size={16} /> ¿No aparece? Sugerir una obra
        </button>
      )}
    </div>
  )
}

function Form({ productionId, entryId, onChangeProduction }: { productionId: string; entryId?: string; onChangeProduction?: () => void }) {
  const store = useStore()
  const nav = useNav()
  const p = getProduction(productionId)!
  const existing = entryId ? store.diary.find((d) => d.id === entryId) : undefined
  const pastSeasons = p.seasons.filter((s) => s.start <= toISO(TODAY)).sort((a, b) => b.start.localeCompare(a.start))
  const defaultSeason = existing?.seasonId ?? pastSeasons[0]?.id ?? ''
  const defaultDate = existing?.date ?? (() => {
    const s = pastSeasons.find((x) => x.id === defaultSeason)
    if (!s) return toISO(TODAY)
    return s.end < toISO(TODAY) ? s.end : toISO(TODAY)
  })()

  const [seasonId, setSeasonId] = useState(defaultSeason)
  const [date, setDate] = useState(defaultDate)
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [review, setReview] = useState(existing?.review ?? '')
  const [spoiler, setSpoiler] = useState(existing?.spoiler ?? false)
  const [place, setPlace] = useState(existing?.place ?? '')
  const [fav, setFav] = useState(store.favorites.includes(p.id))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const previous = store.entriesFor(p.id).filter((e) => e.id !== entryId)

  if (pastSeasons.length === 0)
    return (
      <>
        <ScreenHeader title={p.title} />
        <EmptyState icon="calendar" title="Aún no se estrena" text={`${p.title} todavía no ha tenido funciones, así que no se puede registrar como vista. Guárdala en Por ver para no perderla.`} action="Guardar en Por ver" onAction={() => {
          if (!store.watchlist.includes(p.id)) store.toggleWatch(p.id)
          store.notify('Guardada en Por ver')
          nav.back()
        }} />
      </>
    )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    const s = p.seasons.find((x) => x.id === seasonId)
    if (!date) errs.date = 'Indica la fecha en que fuiste.'
    else if (date > toISO(TODAY)) errs.date = 'La fecha no puede ser posterior a hoy.'
    else if (s && (date < s.start || date > s.end)) errs.date = `Esa temporada fue del ${fmt.short(s.start)} al ${fmt.short(s.end)}. Revisa la fecha o elige otra temporada.`
    if (review.length > MAX) errs.review = `La reseña tiene ${review.length} caracteres; el máximo es ${MAX}.`
    setErrors(errs)
    if (Object.keys(errs).length) return
    store.saveEntry({ id: entryId, productionId: p.id, seasonId: seasonId || undefined, date, rating: rating || undefined, review: review.trim() || undefined, spoiler: spoiler || undefined, place: place.trim() || undefined })
    if (fav !== store.favorites.includes(p.id)) store.toggleFavorite(p.id)
    store.notify(entryId ? 'Entrada actualizada' : 'Guardada en tu diario')
    nav.back()
  }

  return (
    <div className="pb-10">
      <ScreenHeader title={entryId ? 'Editar entrada' : 'Registrar en el diario'} />
      <form onSubmit={submit} noValidate className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow text-gris">{previous.length ? `La has visto ${previous.length} ${previous.length === 1 ? 'vez' : 'veces'} antes` : 'Primera vez'}</p>
            <h1 className="font-display text-[34px] uppercase leading-none">Tu boleto</h1>
          </div>
          {onChangeProduction && (
            <button type="button" onClick={onChangeProduction} className="text-[13px] font-semibold text-rojo hover:underline">
              Cambiar obra
            </button>
          )}
        </div>

        {/* Vista previa en vivo del boleto que se guardará */}
        <div className="ticket flex overflow-hidden shadow-[0_14px_28px_-18px_rgba(0,0,0,.6)]" style={{ ['--notch' as string]: '72%' }} aria-label="Vista previa del boleto">
          <div className="w-24 shrink-0 p-2.5">
            <div className="-rotate-2 shadow-md">
              <Poster production={p} showCompany={false} />
            </div>
          </div>
          <div className="min-w-0 flex-1 py-3 pr-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-gris">Árbo · admite una persona</div>
            <div className="mt-1 font-display text-[22px] uppercase leading-[1.02]">{p.title}</div>
            <div className="mt-1 truncate text-xs text-gris">
              {getVenue(p.seasons.find((x) => x.id === seasonId)?.venueId ?? '')?.name}
              {place.trim() ? ` · ${place.trim()}` : ''}
            </div>
            <div className="mt-2">{rating ? <Stars value={rating} size={16} /> : <span className="font-hand text-lg leading-none text-gris">sin calificar todavía</span>}</div>
          </div>
          <div className="ticket-stub flex w-[28%] flex-col items-center justify-center bg-crema/60 px-2 text-center">
            {date ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gris">{fmt.weekday(date)}</span>
                <span className="font-display text-[40px] leading-[0.9] tabular">{Number(date.slice(8, 10))}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest">{fmt.short(date).split(' ')[1]}</span>
                <span className="font-mono text-[10px] text-gris">{date.slice(0, 4)}</span>
              </>
            ) : (
              <span className="text-xs text-gris">Sin fecha</span>
            )}
            {fav && <Icon name="heart" size={16} filled className="mt-1 text-rojo" />}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Temporada" htmlFor="log-season">
            <select id="log-season" value={seasonId} onChange={(e) => setSeasonId(e.target.value)} className={inputCls}>
              {pastSeasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.kind} · {getVenue(s.venueId)?.name} ({s.start.slice(0, 4)})
                </option>
              ))}
            </select>
          </Field>
          <Field label="¿Cuándo fuiste?" htmlFor="log-date" error={errors.date}>
            <input id="log-date" type="date" value={date} max={toISO(TODAY)} onChange={(e) => setDate(e.target.value)} className={`${inputCls} font-mono`} aria-invalid={!!errors.date} />
          </Field>
        </div>

        <Field label="Ciudad o país" htmlFor="log-place" hint="Opcional. Útil si la viste de gira o fuera de la Ciudad de México.">
          <input id="log-place" className={inputCls} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Ciudad de México" maxLength={60} />
        </Field>

        <div>
          <div className="mb-2 text-[13px] font-semibold">Tu calificación</div>
          <StarInput value={rating} onChange={setRating} />
          <p className="mt-1 text-xs text-gris">Toca la mitad izquierda de una estrella para media estrella. Es opcional.</p>
        </div>

        <Field label="Reseña" htmlFor="log-review" error={errors.review} hint="Opcional. ¿Qué te llevaste de la función?">
          <textarea
            id="log-review"
            rows={6}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="La escena que no te puedes sacar de la cabeza, el teatro, con quién fuiste…"
            className={`${inputCls} resize-y leading-relaxed`}
            aria-invalid={!!errors.review}
          />
        </Field>
        <div className={`-mt-4 text-right font-mono text-xs tabular ${review.length > MAX ? 'font-bold text-rojo' : 'text-gris'}`}>
          {review.length}/{MAX}
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between gap-3 rounded-lg border border-linea bg-papel px-3 py-3 text-sm font-semibold">
            <span>
              Contiene spoilers
              <span className="block text-xs font-normal text-gris">Se ocultará hasta que alguien decida leerla.</span>
            </span>
            <input type="checkbox" id="log-spoiler" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} className="size-5 accent-[#B71C1C]" />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-lg border border-linea bg-papel px-3 py-3 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Icon name="heart" size={18} filled={fav} className={fav ? 'text-rojo' : ''} /> Agregar a mis favoritas
            </span>
            <input type="checkbox" id="log-fav" checked={fav} onChange={(e) => setFav(e.target.checked)} className="size-5 accent-[#B71C1C]" />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="flex-1" icon="check">
            {entryId ? 'Guardar cambios' : 'Guardar en mi diario'}
          </Button>
          {entryId && !confirmDelete && (
            <Button variant="ghost" icon="trash" onClick={() => setConfirmDelete(true)}>
              Borrar
            </Button>
          )}
        </div>
        {confirmDelete && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rojo bg-rosa-claro/50 p-3 text-sm" role="alert">
            <span className="flex-1 font-semibold">¿Borrar esta entrada del diario? No se puede deshacer.</span>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                store.removeEntry(entryId!)
                store.notify('Entrada borrada', 'info')
                nav.back()
              }}
            >
              Borrar
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
