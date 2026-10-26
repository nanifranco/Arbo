/**
 * Estado del usuario: perfil, diario, lista por ver, favoritas, seguidos y "me gusta".
 *
 * En el prototipo se guarda en el navegador (localStorage). Las acciones están aisladas en este
 * archivo para poder sustituirlas por llamadas a una API o base de datos más adelante.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { demoDiarySeed, demoFollowsSeed, demoWatchlistSeed } from '../data/demo'
import type { DiaryEntry, UserList, UserProfile, WorkSuggestion } from '../data/types'

interface State {
  user: UserProfile | null
  diary: DiaryEntry[]
  watchlist: string[]
  favorites: string[]
  follows: string[]
  likes: string[]
  lists: UserList[]
  suggestions: WorkSuggestion[]
}

const EMPTY: State = { user: null, diary: [], watchlist: [], favorites: [], follows: [], likes: [], lists: [], suggestions: [] }
const KEY = 'arbo.prototipo.v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    /* almacenamiento no disponible: el prototipo funciona en memoria */
  }
  return EMPTY
}

const uid = () => Math.random().toString(36).slice(2, 10)

export interface Toast {
  id: number
  text: string
  tone?: 'ok' | 'info' | 'error'
}

interface Store extends State {
  register: (p: Omit<UserProfile, 'isDemo'>) => void
  enterDemo: () => void
  logout: () => void
  updateProfile: (p: Partial<UserProfile>) => void
  saveEntry: (e: Omit<DiaryEntry, 'id' | 'createdAt'> & { id?: string }) => DiaryEntry
  removeEntry: (id: string) => void
  toggleWatch: (productionId: string) => boolean
  toggleFavorite: (productionId: string) => boolean
  toggleFollow: (userId: string) => boolean
  toggleLike: (reviewId: string) => void
  isSeen: (productionId: string) => boolean
  createList: (name: string, description: string, productionIds?: string[]) => UserList
  updateList: (id: string, patch: Partial<Pick<UserList, 'name' | 'description'>>) => void
  deleteList: (id: string) => void
  toggleInList: (listId: string, productionId: string) => boolean
  suggestWork: (s: Omit<WorkSuggestion, 'id' | 'status' | 'createdAt'>) => void
  entriesFor: (productionId: string) => DiaryEntry[]
  toast: Toast | null
  notify: (text: string, tone?: Toast['tone']) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* sin persistencia */
    }
  }, [state])

  const notify = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now()
    setToast({ id, text, tone })
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2800)
  }, [])

  const toggleIn = (list: keyof Pick<State, 'watchlist' | 'favorites' | 'follows' | 'likes'>, value: string) => {
    const has = state[list].includes(value)
    setState((s) => ({ ...s, [list]: has ? s[list].filter((v) => v !== value) : [value, ...s[list]] }))
    return !has
  }

  const store: Store = {
    ...state,
    toast,
    notify,
    register: (p) => setState({ ...EMPTY, user: { ...p, isDemo: false } }),
    enterDemo: () =>
      setState({
        user: { name: 'Nani Franco', handle: 'nani.en.butaca', bio: 'Perfil de demostración. Teatro independiente, comedia y cualquier cosa en una azotea.', isDemo: true },
        diary: demoDiarySeed.map((d) => ({
          id: uid(),
          productionId: d.productionId,
          seasonId: d.seasonId,
          date: d.date,
          rating: d.rating,
          review: d.review,
          createdAt: new Date().toISOString(),
        })),
        favorites: demoDiarySeed.filter((d) => d.favorite).map((d) => d.productionId),
        watchlist: demoWatchlistSeed,
        follows: demoFollowsSeed,
        likes: [],
        lists: [
          {
            id: uid(),
            name: 'Para llevar a mi mamá',
            description: 'Obras que creo que le van a encantar.',
            productionIds: ['jacaranda', 'azotea', 'loteria'],
            createdAt: new Date().toISOString(),
          },
        ],
        suggestions: [],
      }),
    logout: () => setState(EMPTY),
    updateProfile: (p) => setState((s) => (s.user ? { ...s, user: { ...s.user, ...p } } : s)),
    saveEntry: (e) => {
      const entry: DiaryEntry = { ...e, id: e.id ?? uid(), createdAt: new Date().toISOString() }
      setState((s) => ({
        ...s,
        diary: e.id ? s.diary.map((d) => (d.id === e.id ? entry : d)) : [entry, ...s.diary],
        // Al registrar una obra como vista, sale de la lista "por ver"
        watchlist: s.watchlist.filter((w) => w !== e.productionId),
      }))
      return entry
    },
    removeEntry: (id) => setState((s) => ({ ...s, diary: s.diary.filter((d) => d.id !== id) })),
    toggleWatch: (pid) => toggleIn('watchlist', pid),
    toggleFavorite: (pid) => toggleIn('favorites', pid),
    toggleFollow: (id) => toggleIn('follows', id),
    toggleLike: (id) => void toggleIn('likes', id),
    createList: (name, description, productionIds = []) => {
      const list: UserList = { id: uid(), name, description, productionIds, createdAt: new Date().toISOString() }
      setState((s) => ({ ...s, lists: [list, ...s.lists] }))
      return list
    },
    updateList: (id, patch) => setState((s) => ({ ...s, lists: s.lists.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
    deleteList: (id) => setState((s) => ({ ...s, lists: s.lists.filter((l) => l.id !== id) })),
    toggleInList: (listId, pid) => {
      const has = state.lists.find((l) => l.id === listId)?.productionIds.includes(pid) ?? false
      setState((s) => ({
        ...s,
        lists: s.lists.map((l) => (l.id === listId ? { ...l, productionIds: has ? l.productionIds.filter((x) => x !== pid) : [...l.productionIds, pid] } : l)),
      }))
      return !has
    },
    suggestWork: (sug) =>
      setState((s) => ({ ...s, suggestions: [{ ...sug, id: uid(), status: 'En revisión', createdAt: new Date().toISOString() }, ...s.suggestions] })),
    isSeen: (pid) => state.diary.some((d) => d.productionId === pid),
    entriesFor: (pid) => state.diary.filter((d) => d.productionId === pid).sort((a, b) => b.date.localeCompare(a.date)),
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fuera de StoreProvider')
  return s
}

// ——— Navegación ———

export type Route =
  | { name: 'home' }
  | { name: 'explore'; tab?: 'cartelera' | 'teatros' | 'archivo'; q?: string; genre?: string }
  | { name: 'production'; id: string }
  | { name: 'diary' }
  | { name: 'log'; productionId?: string; entryId?: string }
  | { name: 'profile'; userId?: string }
  | { name: 'artist'; id: string }
  | { name: 'venue'; id: string }
  | { name: 'map' }
  | { name: 'watchlist' }
  | { name: 'community' }
  | { name: 'list'; id: string }
  | { name: 'suggest'; title?: string }

export type Tab = 'home' | 'explore' | 'diary' | 'community' | 'profile'

interface Nav {
  route: Route
  canGoBack: boolean
  go: (r: Route) => void
  back: () => void
  tab: (t: Tab) => void
  currentTab: Tab
}

const NavCtx = createContext<Nav | null>(null)

const tabOf = (r: Route): Tab | null =>
  r.name === 'home' || r.name === 'explore' || r.name === 'diary' || r.name === 'community' || r.name === 'profile' ? r.name : null

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }])
  const route = stack[stack.length - 1]
  const currentTab = useMemo(() => {
    for (let i = stack.length - 1; i >= 0; i--) {
      const t = tabOf(stack[i])
      if (t) return t
    }
    return 'home'
  }, [stack])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route])

  const nav: Nav = {
    route,
    currentTab,
    canGoBack: stack.length > 1,
    go: (r) => setStack((s) => [...s, r]),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    tab: (t) => setStack([{ name: t } as Route]),
  }
  return <NavCtx.Provider value={nav}>{children}</NavCtx.Provider>
}

export function useNav() {
  const n = useContext(NavCtx)
  if (!n) throw new Error('useNav fuera de NavProvider')
  return n
}
