import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import authReducer from './slices/authSlice'
import propertyReducer from './slices/propertySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
  },
})

// Internal types - not exported to force usage of custom hooks
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch

// Custom hooks - use these instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector