import { useState, type FormEvent } from 'react'
import { allProductions } from '../lib/catalog'
import { useStore } from '../lib/store'
import { Poster } from '../components/Poster'
import { PaintedSign, Stamp, Tape } from '../components/deco'
import { Photo } from '../components/Photo'
import { CITY_PHOTOS } from '../data/demo'
import { Icon } from '../components/Icon'
import { Button, DemoBadge, Field, inputCls, Logo } from '../components/ui'

/** La pared: carteles pegados unos sobre otros, rótulos pintados y cinta */
export function PosterWall({ className = '' }: { className?: string }) {
  const ps = allProductions()
  const spots = [
    { p: 0, l: -4, t: -6, w: 34, r: -5 },
    { p: 3, l: 26, t: -10, w: 30, r: 4 },
    { p: 1, l: 53, t: -4, w: 32, r: -3 },
    { p: 8, l: 80, t: -8, w: 30, r: 6 },
    { p: 6, l: 8, t: 34, w: 28, r: 3 },
    { p: 2, l: 62, t: 30, w: 30, r: -6 },
    { p: 4, l: 86, t: 32, w: 26, r: -2 },
    { p: 9, l: -6, t: 64, w: 26, r: -4 },
    { p: 7, l: 74, t: 62, w: 30, r: 5 },
  ]
  return (
    <div className={`wall pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* restos de papel viejo */}
      <div className="absolute left-[30%] top-[52%] h-[30%] w-[40%] rotate-2 bg-papel/70" />
      <div className="absolute left-[2%] top-[22%] h-[14%] w-[30%] -rotate-6 bg-rosa/40" />
      {spots.map((s, i) => (
        <div key={i} className="absolute" style={{ left: `${s.l}%`, top: `${s.t}%`, width: `${s.w}%`, rotate: `${s.r}deg` }}>
          <div className="shadow-[0_12px_22px_-12px_rgba(0,0,0,.65)]">
            <Poster production={ps[s.p % ps.length]} />
          </div>
          {i % 2 === 0 && <Tape tone={i % 4 === 0 ? 'yellow' : 'clear'} />}
        </div>
      ))}
      <div className="absolute left-[24%] top-[36%] w-[40%] min-w-[150px]">
        <PaintedSign lines={['Aquí', 'también', 'hay teatro']} bg="#E9B321" rotate={-4} />
      </div>
      <div className="absolute left-[56%] top-[66%] w-[30%] min-w-[120px]">
        <PaintedSign lines={['El arte', 'también', 'vive aquí']} bg="#E76F91" rotate={5} />
      </div>
      <div className="absolute left-[8%] top-[78%]">
        <Stamp color="#B71C1C" rotate={-10} size="lg">
          Hoy · CDMX
        </Stamp>
      </div>
    </div>
  )
}

export function Welcome() {
  const { register, enterDemo } = useStore()
  const [mode, setMode] = useState<'start' | 'signup'>('start')
  const [form, setForm] = useState({ name: '', handle: '', email: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.trim().length < 2) errs.name = 'Escribe tu nombre (mínimo 2 letras).'
    if (!/^[a-z0-9._]{3,20}$/.test(form.handle)) errs.handle = 'Usa de 3 a 20 caracteres: minúsculas, números, punto o guion bajo.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Revisa el correo: falta la @ o el dominio.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    register({ name: form.name.trim(), handle: form.handle, bio: '' })
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[1.15fr_1fr]">
      <div className="relative h-[52vh] min-h-[340px] md:sticky md:top-0 md:h-screen">
        <PosterWall />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-crema torn-top md:hidden" />
      </div>

      <div className="safe-x relative flex flex-col pb-8 pt-4 md:justify-center md:px-12 md:py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-start justify-between">
            <Logo size="xl" />

          </div>
          <p className="mt-3 font-marker text-[28px] leading-[1.05] text-tinta md:text-[34px]">
            Teatro para
            <br />
            <span className="brush-underline">vivir la ciudad</span>
          </p>
          <p className="mt-5 border-l-[3px] border-rojo pl-3 font-mono text-[14.5px] leading-relaxed text-grafito">
            Descubre, vive y comparte el teatro mexicano. ÁRBO conecta a las personas con las obras, los artistas y los espacios que dan vida a la Ciudad de México.
          </p>

          <ul className="mt-6 grid grid-cols-3 gap-2">
            {[
              ['search', 'Descubre', 'qué hay hoy'],
              ['diary', 'Registra', 'lo que viste'],
              ['community', 'Comparte', 'con tu gente'],
            ].map(([icon, a, b]) => (
              <li key={a} className="paper flex flex-col items-start gap-1 px-3 py-2.5">
                <Icon name={icon as 'search'} size={20} className="text-rojo" />
                <span className="font-display text-[17px] uppercase leading-none">{a}</span>
                <span className="text-[11.5px] leading-tight text-gris">{b}</span>
              </li>
            ))}
          </ul>

          {mode === 'start' ? (
            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={() => setMode('signup')} className="w-full !min-h-12 !text-[15px]">
                Crear cuenta
              </Button>
              <Button variant="secondary" onClick={enterDemo} className="w-full !min-h-12 !text-[15px]">
                Entrar con perfil de demostración
              </Button>
              <p className="flex items-start gap-2 pt-1 text-xs text-gris">
                <DemoBadge />
                <span>Prototipo: las obras, teatros, funciones y personas son ficticios. Tus datos se guardan solo en este navegador.</span>
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="paper relative mt-6 flex flex-col gap-4 p-5">
              <Tape />
              <h2 className="font-marker text-2xl">Tu butaca te espera</h2>
              <Field label="Nombre" htmlFor="su-name" error={errors.name}>
                <input id="su-name" className={inputCls} value={form.name} aria-invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </Field>
              <Field label="Nombre de usuario" htmlFor="su-handle" error={errors.handle} hint="Así te encontrarán en la comunidad.">
                <div className="flex items-center rounded-lg border border-linea bg-papel focus-within:border-tinta">
                  <span className="pl-3 text-gris">@</span>
                  <input
                    id="su-handle"
                    className="w-full bg-transparent px-1 py-2.5 text-[15px] focus:outline-none"
                    value={form.handle}
                    aria-invalid={!!errors.handle}
                    onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase() })}
                    autoComplete="username"
                  />
                </div>
              </Field>
              <Field label="Correo" htmlFor="su-email" error={errors.email} hint="En el prototipo no se envía ningún correo.">
                <input id="su-email" type="email" className={inputCls} value={form.email} aria-invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
              </Field>
              <div className="flex gap-2 pt-1">
                <Button variant="ghost" onClick={() => setMode('start')}>
                  Atrás
                </Button>
                <Button type="submit" className="flex-1">
                  Crear cuenta
                </Button>
              </div>
            </form>
          )}

          <div className="mt-10 grid grid-cols-3 gap-1.5">
            {[CITY_PHOTOS.bellasArtes, CITY_PHOTOS.telon, CITY_PHOTOS.jacarandas].map((id, i) => (
              <Photo key={id} id={id} alt={['Palacio de Bellas Artes', 'Telón rojo de teatro', 'Jacarandas en flor'][i]} w={500} className="aspect-[3/4] rounded-sm" />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-gris">Fotos de referencia: Unsplash.</p>
        </div>
      </div>
    </div>
  )
}
