import { NavProvider, StoreProvider, useNav, useStore, type Route, type Tab } from './lib/store'
import { Icon, type IconName } from './components/Icon'
import { Button, DemoBadge, Logo, ToastHost } from './components/ui'
import { Welcome } from './screens/Welcome'
import { Home } from './screens/Home'
import { Explore } from './screens/Explore'
import { ProductionDetail } from './screens/ProductionDetail'
import { Diary } from './screens/Diary'
import { LogEntry } from './screens/LogEntry'
import { Profile, Watchlist } from './screens/Profile'
import { ArtistProfile, TheaterMap, VenueProfile } from './screens/Places'
import { Community } from './screens/Community'
import { ListDetail } from './screens/Lists'
import { Suggest } from './screens/Suggest'

const TABS: { tab: Tab; label: string; icon: IconName }[] = [
  { tab: 'home', label: 'Inicio', icon: 'home' },
  { tab: 'explore', label: 'Buscar', icon: 'search' },
  { tab: 'diary', label: 'Mi diario', icon: 'diary' },
  { tab: 'community', label: 'Comunidad', icon: 'community' },
  { tab: 'profile', label: 'Perfil', icon: 'user' },
]

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <Home />
    case 'explore':
      return <Explore initialTab={route.tab} initialQuery={route.q} initialGenre={route.genre} />
    case 'production':
      return <ProductionDetail id={route.id} />
    case 'diary':
      return <Diary />
    case 'log':
      return <LogEntry productionId={route.productionId} entryId={route.entryId} />
    case 'profile':
      return <Profile userId={route.userId} />
    case 'artist':
      return <ArtistProfile id={route.id} />
    case 'venue':
      return <VenueProfile id={route.id} />
    case 'map':
      return <TheaterMap />
    case 'watchlist':
      return <Watchlist />
    case 'community':
      return <Community />
    case 'list':
      return <ListDetail id={route.id} />
    case 'suggest':
      return <Suggest initialTitle={route.title} />
  }
}

function Shell() {
  const nav = useNav()
  const { user } = useStore()
  if (!user) return <Welcome />
  const key = JSON.stringify(nav.route)

  return (
    <div className="min-h-screen md:flex">
      {/* Barra lateral en escritorio */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-linea bg-papel/70 px-5 py-6 md:flex">
        <button onClick={() => nav.tab('home')} className="w-fit" aria-label="Inicio">
          <Logo size="lg" />
        </button>
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {TABS.map((t) => {
            const active = nav.currentTab === t.tab
            return (
              <button
                key={t.tab}
                onClick={() => nav.tab(t.tab)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold ${active ? 'bg-rojo text-papel' : 'text-grafito hover:bg-carton/60'}`}
              >
                <Icon name={t.icon} size={20} /> {t.label}
              </button>
            )
          })}
        </nav>
        <Button icon="plus" onClick={() => nav.go({ name: 'log' })}>
          Registrar obra
        </Button>
        <div className="mt-auto flex flex-col gap-2 text-xs text-gris">
          <DemoBadge label="Prototipo" />
          <p>Obras, teatros, funciones y personas de demostración. Sin venta de boletos.</p>
          <p className="font-marker text-base text-tinta">Teatro para vivir la ciudad</p>
        </div>
      </aside>

      <main className="safe-x min-w-0 flex-1 pb-[calc(84px+env(safe-area-inset-bottom,0px))] md:pb-10">
        <div key={key} className="mx-auto w-full max-w-5xl md:px-6">
          <Screen route={nav.route} />
        </div>
      </main>

      {/* Navegación inferior en móvil */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-papel/97 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur md:hidden"
        style={{ paddingLeft: 'max(0px, env(safe-area-inset-left, 0px))', paddingRight: 'max(0px, env(safe-area-inset-right, 0px))' }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {TABS.map((t) => {
            const active = nav.currentTab === t.tab
            return (
              <button key={t.tab} onClick={() => nav.tab(t.tab)} aria-current={active ? 'page' : undefined} className={`relative flex flex-col items-center gap-0.5 pb-2 pt-2.5 text-[11px] font-semibold ${active ? 'text-rojo' : 'text-gris'}`}>
                {active && <span className="absolute top-0 h-[3px] w-8 rounded-b bg-rojo" />}
                <Icon name={t.icon} size={22} strokeWidth={active ? 2.2 : 1.8} />
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <NavProvider>
        <Shell />
        <ToastHost />
      </NavProvider>
    </StoreProvider>
  )
}
