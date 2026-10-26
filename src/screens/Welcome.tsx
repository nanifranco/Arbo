import { useState, type FormEvent } from 'react'
import { allProductions } from '../lib/catalog'
import { useStore } from '../lib/store'
import { IllustratedPoster, Poster } from '../components/Poster'
import { Tape } from '../components/deco'
import { Button, DemoBadge, Field, inputCls, Logo } from '../components/ui'

/** La pared: carteles pegados unos sobre otros, con cinta. Solo carteles ilustrados, sin fotos. */
export function PosterWall({ className = '', keyArt = false }: { className?: string; keyArt?: boolean }) {
  const ps = allProductions()
  // orden mezclado para que no se repitan carteles iguales en la misma columna
  const order = [3, 8, 0, 10, 5, 1, 7, 11, 2, 9, 4, 6]
  const tiles = Array.from({ length: 42 }, (_, i) => ps[order[(i * 5 + Math.floor(i / 12) * 7) % order.length] % ps.length])
  return (
    <div className={`wall pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute -left-[6%] -top-[4%] grid w-[112%] grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-7">
        {tiles.map((p, i) => (
          <div key={i} className="relative" style={{ rotate: `${((i * 37) % 9) - 4}deg`, translate: `0 ${((i * 13) % 5) * 6 - 12}px` }}>
            <div className="shadow-[0_12px_22px_-12px_rgba(0,0,0,.65)]">
              {keyArt ? <Poster production={p} /> : <IllustratedPoster production={p} />}
            </div>
            {i % 3 === 0 && <Tape tone={i % 2 ? 'clear' : 'yellow'} />}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,240,230,.15),rgba(25,25,25,.35))]" />
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
    <div className="relative grid min-h-[100dvh] place-items-center overflow-hidden px-4 py-10">
      <PosterWall />
      <div className="paper torn-bottom relative w-full max-w-sm -rotate-1 px-6 pb-9 pt-8 text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)]">
        <Tape />
        <Logo size="xl" />
        <p className="mt-2 font-marker text-[24px] leading-[1.05] text-tinta">
          Teatro para <span className="brush-underline">vivir la ciudad</span>
        </p>

        {mode === 'start' ? (
          <div className="mt-7 flex flex-col gap-3">
            <Button onClick={() => setMode('signup')} className="w-full !min-h-12 !text-[15px]">
              Crear cuenta
            </Button>
            <Button variant="secondary" onClick={enterDemo} className="w-full !min-h-12 !text-[15px]">
              Entrar con perfil de demostración
            </Button>
            <p className="pt-1 text-[11.5px] leading-snug text-gris">
              <DemoBadge className="mr-1" /> Prototipo con datos ficticios. Tus datos se guardan solo en este navegador.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4 text-left">
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
      </div>
    </div>
  )
}
