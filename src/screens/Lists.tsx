import { useState, type FormEvent } from 'react'
import { getProduction } from '../lib/catalog'
import { useNav, useStore } from '../lib/store'
import { Icon } from '../components/Icon'
import { Poster } from '../components/Poster'
import { Button, EmptyState, Field, inputCls, PosterCard, ScreenHeader, Sheet } from '../components/ui'

/** Formulario para crear (o editar) una lista */
function ListForm({ initial, submitLabel, onSubmit }: { initial?: { name: string; description: string }; submitLabel: string; onSubmit: (name: string, description: string) => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [error, setError] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setError('Ponle un nombre a la lista (mínimo 2 letras).')
    onSubmit(name.trim(), description.trim())
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Nombre de la lista" htmlFor="list-name" error={error}>
        <input id="list-name" className={inputCls} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Ej. Teatro para ir en primera cita" aria-invalid={!!error} />
      </Field>
      <Field label="Descripción" htmlFor="list-desc" hint="Opcional">
        <textarea id="list-desc" rows={2} maxLength={200} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Button type="submit">{submitLabel}</Button>
    </form>
  )
}

/** Hoja para agregar o quitar una obra de las listas del usuario */
export function ListPicker({ productionId, open, onClose }: { productionId: string; open: boolean; onClose: () => void }) {
  const store = useStore()
  const [creating, setCreating] = useState(false)
  const close = () => {
    setCreating(false)
    onClose()
  }
  return (
    <Sheet open={open} onClose={close} title={creating ? 'Nueva lista' : 'Agregar a lista'}>
      {creating ? (
        <ListForm
          submitLabel="Crear y agregar"
          onSubmit={(name, description) => {
            store.createList(name, description, [productionId])
            store.notify(`Agregada a “${name}”`)
            close()
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {store.lists.length === 0 ? (
            <p className="text-sm text-gris">Aún no tienes listas. Crea una para agrupar obras a tu manera: por tema, por compañía, para regalar…</p>
          ) : (
            <ul className="flex max-h-[50vh] flex-col divide-y divide-linea overflow-y-auto rounded-xl border border-linea">
              {store.lists.map((l) => {
                const inList = l.productionIds.includes(productionId)
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => {
                        const added = store.toggleInList(l.id, productionId)
                        store.notify(added ? `Agregada a “${l.name}”` : `Quitada de “${l.name}”`, added ? 'ok' : 'info')
                      }}
                      aria-pressed={inList}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-crema"
                    >
                      <span className={`grid size-6 shrink-0 place-items-center rounded-md border-2 ${inList ? 'border-rojo bg-rojo text-papel' : 'border-linea'}`}>
                        {inList && <Icon name="check" size={14} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{l.name}</span>
                        <span className="block text-xs text-gris tabular">{l.productionIds.length} obras</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <Button variant="secondary" icon="plus" onClick={() => setCreating(true)}>
            Nueva lista
          </Button>
        </div>
      )}
    </Sheet>
  )
}

/** Sección "Mis listas" para el perfil */
export function MyLists() {
  const store = useStore()
  const nav = useNav()
  const [creating, setCreating] = useState(false)
  return (
    <>
      {store.lists.length === 0 ? (
        <button onClick={() => setCreating(true)} className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-linea p-4 text-left text-sm text-gris hover:border-grafito">
          <Icon name="plus" size={20} /> Crea listas con nombre propio: “Clásicos que me faltan”, “Para ir con mi papá”…
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {store.lists.map((l) => {
            const ps = l.productionIds.map(getProduction).filter(Boolean)
            return (
              <button key={l.id} onClick={() => nav.go({ name: 'list', id: l.id })} className="flex items-center gap-4 rounded-xl border border-linea bg-papel p-3 text-left hover:border-grafito">
                <span className="relative h-16 w-20 shrink-0">
                  {ps.slice(0, 3).map((p, i) => (
                    <span key={p!.id} className="absolute top-0 w-11 overflow-hidden rounded-sm shadow" style={{ left: i * 14, transform: `rotate(${(i - 1) * 5}deg)`, zIndex: 3 - i }}>
                      <Poster production={p!} showCompany={false} />
                    </span>
                  ))}
                  {ps.length === 0 && <span className="grid h-full place-items-center rounded-md bg-carton text-gris"><Icon name="list" /></span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{l.name}</span>
                  <span className="block text-xs text-gris tabular">{l.productionIds.length} {l.productionIds.length === 1 ? 'obra' : 'obras'}</span>
                </span>
              </button>
            )
          })}
          <button onClick={() => setCreating(true)} className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-linea p-3 text-sm font-semibold text-gris hover:border-grafito hover:text-tinta">
            <Icon name="plus" size={18} /> Nueva lista
          </button>
        </div>
      )}
      <Sheet open={creating} onClose={() => setCreating(false)} title="Nueva lista">
        <ListForm
          submitLabel="Crear lista"
          onSubmit={(name, description) => {
            const l = store.createList(name, description)
            setCreating(false)
            store.notify('Lista creada')
            nav.go({ name: 'list', id: l.id })
          }}
        />
      </Sheet>
    </>
  )
}

export function ListDetail({ id }: { id: string }) {
  const store = useStore()
  const nav = useNav()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const list = store.lists.find((l) => l.id === id)
  if (!list)
    return (
      <>
        <ScreenHeader title="Lista" />
        <EmptyState icon="list" title="Esta lista ya no existe" text="Puede que la hayas borrado." />
      </>
    )
  const items = list.productionIds.map(getProduction).filter(Boolean)
  return (
    <div className="pb-10">
      <ScreenHeader
        title={list.name}
        right={
          <button onClick={() => setEditing(true)} className="grid size-10 place-items-center rounded-full hover:bg-carton/60" aria-label="Editar lista">
            <Icon name="edit" size={18} />
          </button>
        }
      />
      <p className="eyebrow text-gris">Lista · {items.length} {items.length === 1 ? 'obra' : 'obras'}</p>
      <h1 className="mt-1 font-marker text-[32px] leading-tight">{list.name}</h1>
      {list.description && <p className="mt-1 max-w-[60ch] text-[15px] text-grafito">{list.description}</p>}

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState icon="list" title="Lista vacía" text="Abre la ficha de cualquier obra y toca “Agregar a lista”." action="Explorar obras" onAction={() => nav.go({ name: 'explore' })} />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => (
              <div key={p!.id} className="flex flex-col">
                <PosterCard production={p!} width="w-auto" />
                <button
                  onClick={() => {
                    store.toggleInList(list.id, p!.id)
                    store.notify('Quitada de la lista', 'info')
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

      <div className="mt-10 border-t border-linea pt-5">
        {!confirmDelete ? (
          <Button variant="ghost" icon="trash" onClick={() => setConfirmDelete(true)}>
            Borrar lista
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rojo bg-rosa-claro/50 p-3 text-sm" role="alert">
            <span className="flex-1 font-semibold">¿Borrar “{list.name}”? Las obras no se borran de tu diario.</span>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                store.deleteList(list.id)
                store.notify('Lista borrada', 'info')
                nav.back()
              }}
            >
              Borrar
            </Button>
          </div>
        )}
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Editar lista">
        <ListForm
          initial={list}
          submitLabel="Guardar"
          onSubmit={(name, description) => {
            store.updateList(list.id, { name, description })
            setEditing(false)
            store.notify('Lista actualizada')
          }}
        />
      </Sheet>
    </div>
  )
}
