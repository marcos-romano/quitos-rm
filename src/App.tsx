import { useLayoutEffect, useRef, useState } from 'react'
import { BottomNav, type Tab } from './ui/components/BottomNav.tsx'
import { HistoryScreen } from './ui/screens/HistoryScreen.tsx'
import { HomeScreen } from './ui/screens/HomeScreen.tsx'
import { MaxesScreen } from './ui/screens/MaxesScreen.tsx'
import { MoreScreen } from './ui/screens/MoreScreen.tsx'
import { ProgramScreen } from './ui/screens/ProgramScreen.tsx'
import { UpdatePrompt } from './ui/UpdatePrompt.tsx'
import { usePwa } from './ui/usePwa.ts'

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const scrollByTab = useRef<Partial<Record<Tab, number>>>({})
  const { worksOffline, needRefresh, update } = usePwa()

  // Cambiar de pestaña no altera nada (CLAUDE.md §6.8): las cinco pantallas
  // quedan armadas aunque no se vean, y cada una recuerda hasta dónde se bajó.
  function selectTab(next: Tab) {
    if (next === tab) return
    scrollByTab.current[tab] = window.scrollY
    setTab(next)
  }

  useLayoutEffect(() => {
    window.scrollTo(0, scrollByTab.current[tab] ?? 0)
  }, [tab])

  return (
    <>
      <main className={needRefresh ? 'app app-with-prompt' : 'app'}>
        <div hidden={tab !== 'home'}>
          <HomeScreen />
        </div>
        <div hidden={tab !== 'program'}>
          <ProgramScreen />
        </div>
        <div hidden={tab !== 'maxes'}>
          <MaxesScreen />
        </div>
        <div hidden={tab !== 'history'}>
          <HistoryScreen />
        </div>
        <div hidden={tab !== 'more'}>
          <MoreScreen worksOffline={worksOffline} />
        </div>
      </main>
      {needRefresh && <UpdatePrompt onUpdate={update} />}
      <BottomNav active={tab} onSelect={selectTab} />
    </>
  )
}

export default App
