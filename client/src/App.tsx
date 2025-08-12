import { RouterProvider } from '@tanstack/react-router'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { router } from './router'
import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { checkAuth } from '@/store/slices/authSlice'

function AppContent() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return <RouterProvider router={router} />
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App