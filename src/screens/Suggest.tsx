import { useMemo, useState, type FormEvent } from 'react'
import { allProductions, currentSeason, fmt, getVenue, getWork, normalize } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { Button, Field, inputCls, ScreenHeader, StatusPill } from '../components/ui'

const STOP = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'y', 'en', 'a', 'con', 'un', 'una', 'que', 'por'])
const tokens = (s: string) => normalize(s).split(/[^a-z0-9ñ]+/).filter((t) => t.length > 1 && !STOP.has(t))

/** Obras del catálogo con título parecido: evita duplicados mientras se escribe */
export function similarProductions(title: string) {
  const q = normalize(title)
  if (q.length < 3) return []
  const qt = tokens(title)
  return allProductions().filter((p) => {
    const w = getWork(p.workId)
    return [p.title, w?.title ?? ''].some((t) => {
      const n = normalize(t)
      if (n.includes(q) || q.includes(n)) return true
      const tt = tokens(t)
      const shared = qt.filter((x) => tt.some((y) => y.startsWith(x) || x.startsWith(y))).length
      return qt.length > 0 && shared / qt.length >= 0.6
    })
  })
}

export function Suggest({ initialTitle = '' }: { initialTitle?: string }) {
  const store = useStore()
  const nav = useNav()
  const [form, setForm] = useState({ title: initialTitle, author: '', company: '', country: 'México', year: '', note: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const similar = useMemo(() => similarProductions(form.title), [form.title])
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.title.trim().length < 2) errs.title = 'Escribe el título de la obra.'
    if (form.author.trim().length < 2) errs.author = 'Indica quién la escribió (o “creación colectiva”).'
    if (!form.country.trim()) errs.country = 'Indica el país de origen.'
    if (form.year && !/^\d{4}$/.test(form.year)) errs.year = 'Usa cuatro dígitos, por ejemplo 2019.'
    else if (form.year && Number(form.year) > new Date().getFullYear() + 1) errs.year = 'El año de estreno no puede estar tan en el futuro.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    store.suggestWork({ title: form.title.trim(), author: form.author.trim(), company: form.company.trim(), country: form.country.trim(), year: form.year, note: form.note.trim() })
    setSent(true)
  }

  if (sent)
    return (
      <div className="pb-10">
        <ScreenHeader title="Solicitud enviada" />
        <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
          <div className="ticket mb-6 w-full px-6 py-5 text-left" style={{ ['--notch' as string]: '75%' }}>
            <div className="eyebrow text-gris">Solicitud de obra</div>
            <div className="mt-1 font-marker text-2xl">{form.title}</div>
            <div className="mt-1 text-sm text-gris">
              {form.author} · {form.country}
              {form.year ? ` · ${form.year}` : ''}
            </div>
            <div className="mt-3 inline-block rounded-full bg-amarillo px-2.5 py-0.5 text-xs font-bold">En revisión</div>
          </div>
          <h1 className="font-marker text-3xl">¡Gracias por sumar al archivo!</h1>
          <p className="mt-2 text-sm text-gris">El equipo de ÁRBO revisa cada solicitud antes de publicarla. Puedes ver su estado en tu perfil. En este prototipo la revisión no ocurre: la solicitud se queda guardada en tu navegador.</p>
          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={() => nav.back()}>
              Listo
            </Button>
            <Button onClick={() => nav.tab('profile')}>Ver mis solicitudes</Button>
          </div>
        </div>
      </div>
    )

  return (
    <div className="pb-10">
      <ScreenHeader title="Sugerir una obra" />
      <form onSubmit={submit} noValidate className="mx-auto flex max-w-xl flex-col gap-5">
        <div>
          <h1 className="font-marker text-[30px] leading-tight">¿Falta una obra?</h1>
          <p className="mt-1 text-sm text-gris">El archivo incluye obras de cualquier país y época. Antes de publicarla, el equipo revisa que la información sea correcta.</p>
        </div>

        <Field label="Título de la obra *" htmlFor="sg-title" error={errors.title}>
          <input id="sg-title" className={inputCls} value={form.title} onChange={set('title')} aria-invalid={!!errors.title} autoComplete="off" />
        </Field>

        {similar.length > 0 && (
          <div className="rounded-xl border-2 border-amarillo bg-amarillo-claro/40 p-3" role="status">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Icon name="info" size={16} /> ¿Es alguna de estas? Ya están en ÁRBO
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {similar.slice(0, 4).map((p) => {
                const { season, status } = currentSeason(p)
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => nav.go({ name: 'production', id: p.id })} className="flex w-full items-center gap-3 rounded-lg bg-papel p-2 text-left hover:ring-1 hover:ring-grafito">
                      <span className="w-9 shrink-0 overflow-hidden rounded-sm">
                        <Poster production={p} showCompany={false} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{p.title}</span>
                        <span className="block truncate text-xs text-gris">
                          {getWork(p.workId)?.author} · {getVenue(season.venueId)?.name} · {fmt.range(season.start, season.end)}
                        </span>
                      </span>
                      <StatusPill status={status} />
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 text-xs text-grafito">Si es otra puesta en escena del mismo texto (otra compañía o año), sí puedes enviarla.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Autoría *" htmlFor="sg-author" error={errors.author}>
            <input id="sg-author" className={inputCls} value={form.author} onChange={set('author')} aria-invalid={!!errors.author} />
          </Field>
          <Field label="Compañía o producción" htmlFor="sg-company">
            <input id="sg-company" className={inputCls} value={form.company} onChange={set('company')} />
          </Field>
          <Field label="País de origen *" htmlFor="sg-country" error={errors.country}>
            <input id="sg-country" className={inputCls} value={form.country} onChange={set('country')} aria-invalid={!!errors.country} />
          </Field>
          <Field label="Año de estreno" htmlFor="sg-year" error={errors.year}>
            <input id="sg-year" inputMode="numeric" maxLength={4} className={`${inputCls} font-mono`} value={form.year} onChange={set('year')} aria-invalid={!!errors.year} placeholder="2024" />
          </Field>
        </div>
        <Field label="¿Algo más que debamos saber?" htmlFor="sg-note" hint="Dónde la viste, enlace de la compañía, elenco…">
          <textarea id="sg-note" rows={3} className={inputCls} value={form.note} onChange={set('note')} />
        </Field>
        <Button type="submit" icon="check">
          Enviar a revisión
        </Button>
      </form>
    </div>
  )
}

/** Solicitudes del usuario, para el perfil */
export function MySuggestions() {
  const { suggestions } = useStore()
  if (!suggestions.length) return null
  return (
    <ul className="flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
      {suggestions.map((s) => (
        <li key={s.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{s.title}</div>
            <div className="truncate text-xs text-gris">
              {s.author} · {s.country}
              {s.year ? ` · ${s.year}` : ''}
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-amarillo px-2.5 py-0.5 text-xs font-bold">{s.status}</span>
        </li>
      ))}
    </ul>
  )
}
