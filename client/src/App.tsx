import {Provider} from 'react-redux'
import {store, useAppDispatch} from '@/store'
import {useEffect} from 'react'
import {checkAuth} from '@/store/slices/authSlice'
import AppShellExample from "@/components/base/AppShell/AppShell.hooks.example.tsx";

function AppContent() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return <AppShellExample></AppShellExample>
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App