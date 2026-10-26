import { useState, type FormEvent } from 'react'
import { allProductions } from '../lib/catalog'
import { useStore } from '../lib/store'
import { Poster } from '../components/Poster'
import { Button, DemoBadge, Field, inputCls, Logo } from '../components/ui'

/** Pared de carteles: la única pantalla donde la marca ocupa todo */
function PosterWall() {
  const ps = allProductions()
  const tilts = [-4, 3, -2, 5, -6, 2, -3, 4, -1]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-6 -top-8 grid w-[130%] grid-cols-4 gap-3 opacity-95 md:w-[115%] md:grid-cols-5">
        {[...ps, ...ps].slice(0, 15).map((p, i) => (
          <div key={i} className="relative" style={{ transform: `rotate(${tilts[i % tilts.length]}deg) translateY(${(i % 3) * 14}px)` }}>
            <div className="shadow-[0_8px_18px_-10px_rgba(0,0,0,.6)]">
              <Poster production={p} showCompany={false} />
            </div>
            {i % 3 === 0 && <span className="tape" />}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-crema/0 via-crema/40 to-crema" />
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
    <div className="min-h-screen md:grid md:grid-cols-2">
      <div className="relative h-[46vh] min-h-[300px] md:h-auto md:min-h-screen">
        <PosterWall />
      </div>

      <div className="safe-x relative -mt-24 flex flex-col pb-10 md:mt-0 md:justify-center md:px-14">
        <div className="mx-auto w-full max-w-md">
          <Logo size="xl" />
          <p className="mt-3 font-marker text-2xl leading-tight text-tinta md:text-3xl">
            Teatro para <span className="brush-underline">vivir la ciudad</span>
          </p>
          <p className="mt-4 font-mono text-[15px] leading-relaxed text-grafito">
            Descubre qué hay en cartelera, lleva un diario de las obras que ves y comparte lo que te movió con quienes también van al teatro en la Ciudad de México.
          </p>

          {mode === 'start' ? (
            <div className="mt-7 flex flex-col gap-3">
              <Button onClick={() => setMode('signup')} className="w-full">
                Crear cuenta
              </Button>
              <Button variant="secondary" onClick={enterDemo} className="w-full">
                Entrar con perfil de demostración
              </Button>
              <p className="flex items-start gap-2 pt-1 text-xs text-gris">
                <DemoBadge />
                <span>Prototipo: las obras, teatros, funciones y personas son ficticios. Tus datos se guardan solo en este navegador.</span>
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4 rounded-2xl border border-linea bg-papel p-5">
              <h2 className="font-marker text-2xl">Tu butaca te espera</h2>
              <Field label="Nombre" htmlFor="su-name" error={errors.name}>
                <input id="su-name" className={inputCls} value={form.name} aria-invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </Field>
              <Field label="Nombre de usuario" htmlFor="su-handle" error={errors.handle} hint="Así te encontrarán en la comunidad.">
                <div className="flex items-center rounded-lg border border-linea bg-papel focus-within:border-tinta" aria-invalid={!!errors.handle}>
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
    </div>
  )
}
