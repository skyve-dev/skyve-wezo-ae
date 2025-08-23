import {Provider} from 'react-redux'
import {store, useAppDispatch} from '@/store'
import {useEffect} from 'react'
import {checkAuth} from '@/store/slices/authSlice'
import AppContent from "@/AppContent.tsx";
import {applyGlobalStyles} from "@/utils/globalStyles.ts";

function AppWrapper() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])
  useEffect(() => {
    applyGlobalStyles()
  }, [])
  return <AppContent />
}

function App() {
  return (
    <Provider store={store}>
      <AppWrapper />
    </Provider>
  )
}

export default App