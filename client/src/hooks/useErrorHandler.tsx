import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useAppShell} from '../components/base/AppShell'
import {ApiError} from '../utils/api'
import {clearCurrentError, ErrorInfo, selectCurrentError, setApiError, setError} from '../store/slices/errorSlice'
import {Box} from '../components/base/Box'
import {Button} from '../components/base/Button'

export interface UseErrorHandlerReturn {
  /**
   * Show error dialog for ApiError instances
   */
  showApiError: (error: ApiError, context?: string) => Promise<void>
  
  /**
   * Show error dialog for generic error messages  
   */
  showError: (message: string, context?: string) => Promise<void>
  
  /**
   * Show success message dialog
   */
  showSuccess: (message: string) => Promise<void>
  
  /**
   * Show warning message dialog
   */
  showWarning: (message: string) => Promise<void>
  
  /**
   * Show confirmation dialog
   */
  showConfirmation: (message: string, title?: string) => Promise<boolean>
  
  /**
   * Clear current error from state
   */
  clearError: () => void
  
  /**
   * Current error from global state
   */
  currentError: ErrorInfo | null
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const dispatch = useDispatch()
  const { openDialog, addToast } = useAppShell()
  const currentError = useSelector(selectCurrentError)
  
  const showApiError = useCallback(async (error: ApiError, context?: string) => {
    // Store serializable error data in global state for debugging/logging
    const errorData = {
      message: error.message,
      serverMessage: error.getUserMessage(),
      status: error.status,
      endpoint: error.endpoint
    }
    dispatch(setApiError({ error: errorData, context }))
    
    
    // Show user-friendly error toast
    const contextMessage = context ? `${error.getUserMessage()} (Context: ${context})` : error.getUserMessage()
    addToast(contextMessage, {
      type: 'error',
      autoHide: !error.isServerError(), // Don't auto-hide server errors
      duration: error.isValidationError() ? 4000 : 6000
    })
  }, [dispatch, openDialog])
  
  const showError = useCallback(async (message: string, context?: string) => {
    // Store error in global state
    dispatch(setError({ message, context }))
    
    // Show error toast
    const contextMessage = context ? `${message} (Context: ${context})` : message
    addToast(contextMessage, {
      type: 'error',
      autoHide: true,
      duration: 5000
    })
  }, [dispatch, openDialog])
  
  const showSuccess = useCallback(async (message: string) => {
    addToast(message, {
      type: 'success',
      autoHide: true,
      duration: 4000
    })
  }, [addToast])
  
  const showWarning = useCallback(async (message: string) => {
    addToast(message, {
      type: 'warning',
      autoHide: true,
      duration: 5000
    })
  }, [addToast])
  
  const showConfirmation = useCallback(async (message: string, title = 'Confirm') => {
    return await openDialog<boolean>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box 
          fontSize="1.25rem" 
          fontWeight="bold" 
          marginBottom="1rem" 
          color="#374151"
        >
          {title}
        </Box>
        <Box marginBottom="2rem" color="#374151">
          {message}
        </Box>
        <Box display="flex" gap="1rem" justifyContent="center">
          <Button 
            label="Cancel" 
            onClick={() => close(false)} 
          />
          <Button 
            label="Confirm" 
            onClick={() => close(true)} 
            variant="promoted" 
          />
        </Box>
      </Box>
    ))
  }, [openDialog])
  
  const clearError = useCallback(() => {
    dispatch(clearCurrentError())
  }, [dispatch])
  
  return {
    showApiError,
    showError,
    showSuccess,
    showWarning,
    showConfirmation,
    clearError,
    currentError
  }
}

export default useErrorHandler