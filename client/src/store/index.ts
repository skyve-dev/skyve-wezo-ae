import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import authReducer from './slices/authSlice'
import propertyReducer from './slices/propertySlice'
import reservationReducer from './slices/reservationSlice'
import reviewReducer from './slices/reviewSlice'
import messageReducer from './slices/messageSlice'
import financeReducer from './slices/financeSlice'
import availabilityReducer from './slices/availabilitySlice'
import dashboardReducer from './slices/dashboardSlice'
import ratePlanReducer from './slices/ratePlanSlice'
import priceReducer from './slices/priceSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    reservations: reservationReducer,
    reviews: reviewReducer,
    messages: messageReducer,
    finance: financeReducer,
    availability: availabilityReducer,
    dashboard: dashboardReducer,
    ratePlan: ratePlanReducer,
    price: priceReducer,
  },
})

// Export types for components that need them
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Custom hooks - use these instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector