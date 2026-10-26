import { useState } from 'react'
import { allCommunityReviews, getCommunityUser, getProduction } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import { Icon } from '../components/Icon'
import { Avatar, Button, DemoBadge, EmptyState, Field, inputCls, PosterCard, ScreenHeader, SectionTitle, Sheet } from '../components/ui'
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
      <header className="relative mt-3 overflow-hidden rounded-2xl bg-rosa p-5 md:p-7">
        <div className="absolute -right-6 -top-10 font-marker text-[150px] leading-none text-tinta/10" aria-hidden="true">
          ★
        </div>
        <div className="relative flex items-center gap-4">
          <div className="-rotate-6 rounded-full border-[3px] border-papel shadow-md">
            <Avatar name={user.name} color="#B71C1C" size={76} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-marker text-[28px] leading-tight md:text-4xl">{user.name}</h1>
            <p className="font-mono text-sm">@{user.handle}</p>
            {user.isDemo && <DemoBadge className="mt-1 !border-tinta/60 !text-tinta" label="Perfil demo" />}
          </div>
        </div>
        {user.bio ? <p className="relative mt-4 max-w-xl text-[15px] leading-relaxed">{user.bio}</p> : <p className="relative mt-4 text-sm text-tinta/70">Agrega una descripción para que la comunidad sepa qué teatro te gusta.</p>}
        <div className="relative mt-4 flex flex-wrap gap-2">
          <Button variant="ink" icon="edit" onClick={() => setEditing(true)} className="!min-h-10">
            Editar perfil
          </Button>
        </div>
      </header>

      <dl className="grid grid-cols-4 divide-x divide-linea rounded-xl border border-linea bg-papel text-center">
        {[
          [store.diary.length, 'Vistas'],
          [reviews, 'Reseñas'],
          [user.isDemo ? 64 : 0, 'Seguidores'],
          [store.follows.length, 'Siguiendo'],
        ].map(([v, l]) => (
          <div key={l as string} className="px-1 py-3">
            <dd className="font-slab text-2xl tabular">{v}</dd>
            <dt className="text-[11px] text-gris">{l}</dt>
          </div>
        ))}
      </dl>

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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={u.name} color={u.color} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-marker text-3xl leading-tight">{u.name}</h1>
            <DemoBadge />
          </div>
          <p className="font-mono text-sm text-grafito">@{u.handle}</p>
          <p className="mt-2 text-[15px]">{u.bio}</p>
          <p className="mt-2 text-sm text-gris">
            <b className="tabular text-tinta">{u.followers + (following ? 1 : 0)}</b> seguidores · <b className="tabular text-tinta">{reviews.length}</b> reseñas
          </p>
        </div>
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
      </header>
      <section>
        <SectionTitle>Reseñas</SectionTitle>
        <div className="flex flex-col gap-3">
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
      <h1 className="font-marker text-[32px] leading-none">Por ver</h1>
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
