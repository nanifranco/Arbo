import { useState } from 'react'
import { allCommunityReviews, getCommunityUser, getProduction } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import { Icon } from '../components/Icon'
import { HalftonePortrait, Sticker } from '../components/deco'
import { getSeason, getVenue, currentSeason } from '../lib/catalog'
import type { ReactNode } from 'react'
import { Button, EmptyState, Field, inputCls, PosterCard, ScreenHeader, SectionTitle, Sheet } from '../components/ui'
import { EntryCard } from './Diary'
import { MyLists } from './Lists'
import { MySuggestions } from './Suggest'
import { ReviewCard } from './ProductionDetail'

export function Profile({ userId }: { userId?: string }) {
  return userId ? <PublicProfile userId={userId} /> : <OwnProfile />
}

function OwnProfile() {
  const store = useStore()
  const nav = useNav()
  const [editing, setEditing] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [draft, setDraft] = useState({ name: store.user?.name ?? '', bio: store.user?.bio ?? '' })
  const [error, setError] = useState('')
  const user = store.user!
  const reviews = store.diary.filter((d) => d.review).length
  const recent = [...store.diary].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Credential
        name={user.name}
        handle={user.handle}
        bio={user.bio || 'Agrega una descripción para que la comunidad sepa qué teatro te gusta.'}
        color="#B71C1C"
        demo={user.isDemo}
        stats={[
          [store.diary.length, 'Vistas'],
          [reviews, 'Reseñas'],
          [user.isDemo ? 64 : 0, 'Seguidores'],
          [store.follows.length, 'Siguiendo'],
        ]}
        action={
          <Button variant="ink" icon="edit" onClick={() => setEditing(true)} className="!min-h-10">
            Editar perfil
          </Button>
        }
      />

      <Badges />

      <section>
        <SectionTitle action={store.favorites.length ? 'Ver todas' : undefined} onAction={() => nav.tab('diary')}>
          Mis favoritas
        </SectionTitle>
        {store.favorites.length ? (
          <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
            {store.favorites.slice(0, 6).map((id) => getProduction(id)).filter(Boolean).map((p) => (
              <PosterCard key={p!.id} production={p!} width="w-auto" showVenue={false} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-linea p-4 text-sm text-gris">Marca obras con el corazón desde su ficha o al registrarlas.</p>
        )}
      </section>

      <section>
        <SectionTitle action="Ver lista" onAction={() => nav.go({ name: 'watchlist' })}>
          Por ver
        </SectionTitle>
        {store.watchlist.length ? (
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:px-0">
            {store.watchlist.map((id) => getProduction(id)).filter(Boolean).map((p) => (
              <PosterCard key={p!.id} production={p!} width="w-[104px]" showVenue={false} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-linea p-4 text-sm text-gris">Guarda aquí las obras a las que quieres ir.</p>
        )}
      </section>

      <section>
        <SectionTitle>Mis listas</SectionTitle>
        <MyLists />
      </section>

      <section>
        <SectionTitle action={recent.length ? 'Abrir diario' : undefined} onAction={() => nav.tab('diary')}>
          Actividad reciente
        </SectionTitle>
        {recent.length ? (
          <div className="flex flex-col gap-3">
            {recent.map((e) => (
              <EntryCard key={e.id} e={e} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nada por aquí" text="Tus funciones registradas aparecerán en tu perfil." action="Registrar una obra" onAction={() => nav.go({ name: 'log' })} />
        )}
      </section>

      <section>
        <SectionTitle action="Sugerir una obra" onAction={() => nav.go({ name: 'suggest' })}>
          Mis solicitudes
        </SectionTitle>
        {store.suggestions.length ? (
          <MySuggestions />
        ) : (
          <p className="rounded-xl border border-dashed border-linea p-4 text-sm text-gris">Si una obra que viste no está en ÁRBO, sugiérela y el equipo la revisa antes de publicarla.</p>
        )}
      </section>

      <section className="flex flex-col gap-2 border-t border-linea pt-6">
        <h2 className="eyebrow text-gris">Cuenta</h2>
        <p className="text-sm text-gris">En el prototipo tu perfil vive en este navegador. Al salir se borran tu diario y tus listas.</p>
        {!leaving ? (
          <Button variant="secondary" icon="logout" className="w-fit" onClick={() => setLeaving(true)}>
            Salir y borrar datos del prototipo
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rojo bg-rosa-claro/50 p-3 text-sm" role="alert">
            <span className="flex-1 font-semibold">Se borrarán {store.diary.length} entradas del diario y tus listas. ¿Continuar?</span>
            <Button variant="ghost" onClick={() => setLeaving(false)}>
              Cancelar
            </Button>
            <Button onClick={store.logout}>Salir</Button>
          </div>
        )}
      </section>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Editar perfil">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.name.trim().length < 2) return setError('Escribe tu nombre (mínimo 2 letras).')
            store.updateProfile({ name: draft.name.trim(), bio: draft.bio.trim() })
            setError('')
            setEditing(false)
            store.notify('Perfil actualizado')
          }}
        >
          <Field label="Nombre" htmlFor="pf-name" error={error}>
            <input id="pf-name" className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} aria-invalid={!!error} />
          </Field>
          <Field label="Sobre ti" htmlFor="pf-bio" hint={`${draft.bio.length}/160`}>
            <textarea id="pf-bio" rows={3} maxLength={160} className={inputCls} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
          </Field>
          <Button type="submit">Guardar</Button>
        </form>
      </Sheet>
    </div>
  )
}

function PublicProfile({ userId }: { userId: string }) {
  const store = useStore()
  const u = getCommunityUser(userId)
  if (!u)
    return (
      <>
        <ScreenHeader />
        <EmptyState icon="user" title="Perfil no disponible" text="Esta persona ya no está en la comunidad o el enlace es incorrecto." />
      </>
    )
  const following = store.follows.includes(u.id)
  const reviews = allCommunityReviews()
    .filter((r) => r.userId === u.id)
    .sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="flex flex-col gap-6 pb-10">
      <ScreenHeader title={u.name} sub={`@${u.handle}`} />
      <Credential
        name={u.name}
        handle={u.handle}
        bio={u.bio}
        color={u.color}
        demo
        stats={[
          [reviews.length, 'Reseñas'],
          [u.followers + (following ? 1 : 0), 'Seguidores'],
          [new Set(reviews.map((r) => r.productionId)).size, 'Obras'],
          [reviews.length ? Number((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)) : 0, 'Promedio'],
        ]}
        action={
          <Button
            variant={following ? 'secondary' : 'primary'}
            icon={following ? 'check' : 'plus'}
            onClick={() => {
              const now = store.toggleFollow(u.id)
              store.notify(now ? `Ahora sigues a ${u.name.split(' ')[0]}` : `Dejaste de seguir a ${u.name.split(' ')[0]}`, now ? 'ok' : 'info')
            }}
          >
            {following ? 'Siguiendo' : 'Seguir'}
          </Button>
        }
      />
      <section>
        <SectionTitle>Reseñas</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <ReviewCard key={r.id} r={r} showProduction />
          ))}
        </div>
      </section>
    </div>
  )
}

export function Watchlist() {
  const store = useStore()
  const nav = useNav()
  const items = store.watchlist.map((id) => getProduction(id)).filter(Boolean)
  return (
    <div className="pb-10">
      <ScreenHeader title="Por ver" />
      <h1 className="font-display text-[44px] uppercase leading-[0.9] md:text-[56px]">Por ver</h1>
      <p className="mt-1 text-sm text-gris">Obras que guardaste para ir después. Cuando registres una en tu diario, sale de esta lista.</p>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState icon="bookmark" title="Tu lista está vacía" text="Toca “Por ver” en cualquier obra para guardarla aquí y no perderle la pista antes de que termine su temporada." action="Explorar la cartelera" onAction={() => nav.go({ name: 'explore', tab: 'cartelera' })} />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => (
              <div key={p!.id} className="flex flex-col">
                <PosterCard production={p!} width="w-auto" />
                <button
                  onClick={() => {
                    store.toggleWatch(p!.id)
                    store.notify('Quitada de Por ver', 'info')
                  }}
                  className="mt-1.5 inline-flex w-fit items-center gap-1 text-xs font-semibold text-gris hover:text-rojo"
                >
                  <Icon name="x" size={14} /> Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


// ——— Credencial ÁRBO ———

function Credential({ name, handle, bio, color, stats, action, demo }: { name: string; handle: string; bio: string; color: string; stats: [number, string][]; action?: ReactNode; demo?: boolean }) {
  const bars = Array.from(handle + name).map((c, i) => ((c.charCodeAt(0) * (i + 3)) % 4) + 1)
  return (
    <section aria-label="Credencial" className="relative mt-3">
      <div className="relative overflow-hidden rounded-2xl bg-rosa shadow-[0_18px_34px_-22px_rgba(0,0,0,.7)]" style={{ backgroundImage: 'var(--grain)' }}>
        <div className="halftone absolute -right-10 -top-10 size-64 rounded-full text-tinta opacity-15" aria-hidden="true" />
        <div className="flex items-center justify-between bg-tinta px-5 py-2 text-papel">
          <span className="font-marker text-xl leading-none text-rojo">ÁRBO<span className="text-amarillo">✱</span></span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">Credencial de público</span>
        </div>
        <div className="relative grid gap-5 p-5 sm:grid-cols-[150px_1fr] md:p-7">
          <div className="relative mx-auto w-[130px] -rotate-3 bg-papel p-1.5 pb-5 shadow-lg sm:mx-0 sm:w-full">
            <HalftonePortrait seed={handle} bg={color} ink="#F6E3A8" label={`Foto de credencial de ${name}`} />
            <span className="absolute bottom-1 left-2 font-hand text-[15px] text-grafito">@{handle}</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow text-tinta/70">Nombre</span>
              {demo && <span className="rounded-sm border border-dashed border-tinta/60 px-1.5 font-mono text-[10px] font-bold uppercase">Perfil demo</span>}
            </div>
            <h1 className="font-display text-[42px] uppercase leading-[0.9] md:text-[56px]">{name}</h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-tinta/85">{bio}</p>
            <dl className="mt-4 grid grid-cols-4 gap-2">
              {stats.map(([v, l]) => (
                <div key={l} className="rounded-md bg-papel/80 px-2 py-1.5 text-center">
                  <dd className="font-display text-[26px] leading-none tabular">{v}</dd>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-grafito">{l}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              {action}
              <div className="flex h-9 items-stretch gap-[2px]" aria-hidden="true">
                {bars.slice(0, 34).map((w, i) => (
                  <span key={i} className="bg-tinta" style={{ width: w }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ——— Insignias ———

function Badges() {
  const store = useStore()
  const prods = store.diary.map((d) => getProduction(d.productionId)).filter(Boolean)
  const venues = new Set(store.diary.map((d) => {
    const p = getProduction(d.productionId)!
    return (getSeason(p, d.seasonId) ?? p.seasons[0]).venueId
  }))
  const alcaldias = new Set([...venues].map((v) => getVenue(v)?.alcaldia))
  const reviews = store.diary.filter((d) => d.review).length
  const badges: { label: string; desc: string; have: number; need: number; bg: string; fg: string }[] = [
    { label: 'Primera llamada', desc: 'Registra tu primera función', have: store.diary.length, need: 1, bg: '#E9B321', fg: '#191919' },
    { label: 'Foro hopper', desc: 'Visita 3 teatros distintos', have: venues.size, need: 3, bg: '#E76F91', fg: '#191919' },
    { label: 'Pluma afilada', desc: 'Escribe 3 reseñas', have: reviews, need: 3, bg: '#B71C1C', fg: '#FBF8F2' },
    { label: 'Archivista', desc: 'Registra una obra del archivo', have: prods.filter((p) => currentSeason(p!).status === 'archivo').length, need: 1, bg: '#191919', fg: '#E9B321' },
    { label: 'Clásicos', desc: 'Ve una obra clásica', have: prods.filter((p) => p!.genres.includes('Clásico')).length, need: 1, bg: '#D2582A', fg: '#FBF8F2' },
    { label: 'Chilanga de butaca', desc: 'Ve teatro en 3 alcaldías', have: alcaldias.size, need: 3, bg: '#23452E', fg: '#FBF8F2' },
    { label: 'Diez funciones', desc: 'Llega a 10 funciones', have: store.diary.length, need: 10, bg: '#21418F', fg: '#FBF8F2' },
    { label: 'Curaduría', desc: 'Crea tu primera lista', have: store.lists.length, need: 1, bg: '#7A5BA6', fg: '#FBF8F2' },
  ]
  const earned = badges.filter((b) => b.have >= b.need).length
  return (
    <section>
      <SectionTitle eyebrow={`${earned} de ${badges.length} conseguidas`}>Insignias</SectionTitle>
      <div className="wall grid grid-cols-4 gap-3 rounded-xl p-4 sm:grid-cols-8">
        {badges.map((b, i) => {
          const ok = b.have >= b.need
          return (
            <div key={b.label} className="flex flex-col items-center gap-1.5 text-center" title={b.desc}>
              <Sticker bg={ok ? b.bg : '#E8DFCD'} fg={ok ? b.fg : '#8A8073'} size={72} rotate={((i % 3) - 1) * 8} className={ok ? '' : 'opacity-70 grayscale'}>
                {b.label}
              </Sticker>
              <span className="text-[11px] leading-tight text-grafito">{ok ? b.desc : `${Math.min(b.have, b.need)}/${b.need} · ${b.desc}`}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
