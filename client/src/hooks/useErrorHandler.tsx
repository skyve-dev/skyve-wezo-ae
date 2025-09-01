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
  const { openDialog } = useAppShell()
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
    
    // Determine dialog styling based on error type
    const getErrorColor = () => {
      if (error.isValidationError()) return '#f59e0b' // amber
      if (error.isAuthError()) return '#ef4444' // red
      if (error.isPermissionError()) return '#f97316' // orange  
      if (error.isServerError()) return '#dc2626' // dark red
      return '#ef4444' // default red
    }
    
    const getErrorTitle = () => {
      if (error.isValidationError()) return 'Validation Error'
      if (error.isAuthError()) return 'Authentication Required'
      if (error.isPermissionError()) return 'Permission Denied'
      if (error.isNotFoundError()) return 'Not Found'
      if (error.isServerError()) return 'Server Error'
      return 'Error'
    }
    
    // Show user-friendly error dialog
    await openDialog<void>((close) => (
      <Box padding="2rem" textAlign="center" background={'white'}>
        <Box 
          fontSize="1.25rem" 
          fontWeight="bold" 
          marginBottom="1rem" 
          color={getErrorColor()}
        >
          {getErrorTitle()}
        </Box>
        <Box marginBottom="2rem" color="#374151">
          {error.getUserMessage()}
        </Box>
        {context && (
          <Box 
            fontSize="0.875rem" 
            marginBottom="1rem" 
            color="#6b7280"
            fontStyle="italic"
          >
            Context: {context}
          </Box>
        )}
        <Box display="flex" justifyContent="center">
          <Button 
            label="OK" 
            onClick={() => close()} 
            variant="promoted" 
          />
        </Box>
      </Box>
    ))
  }, [dispatch, openDialog])
  
  const showError = useCallback(async (message: string, context?: string) => {
    // Store error in global state
    dispatch(setError({ message, context }))
    
    // Show error dialog
    await openDialog<void>((close) => (
      <Box padding="2rem" textAlign="center" background={'white'}>
        <Box 
          fontSize="1.25rem" 
          fontWeight="bold" 
          marginBottom="1rem" 
          color="#ef4444"
        >
          Error
        </Box>
        <Box marginBottom="2rem" color="#374151">
          {message}
        </Box>
        {context && (
          <Box 
            fontSize="0.875rem" 
            marginBottom="1rem" 
            color="#6b7280"
            fontStyle="italic"
          >
            Context: {context}
          </Box>
        )}
        <Box display="flex" justifyContent="center">
          <Button 
            label="OK" 
            onClick={() => close()} 
            variant="promoted" 
          />
        </Box>
      </Box>
    ))
  }, [dispatch, openDialog])
  
  const showSuccess = useCallback(async (message: string) => {
    await openDialog<void>((close) => (
      <Box padding="2rem" textAlign="center" background={'white'}>
        <Box 
          fontSize="1.25rem" 
          fontWeight="bold" 
          marginBottom="1rem" 
          color="#059669"
        >
          Success!
        </Box>
        <Box marginBottom="2rem" color="#374151">
          {message}
        </Box>
        <Box display="flex" justifyContent="center">
          <Button 
            label="Continue" 
            onClick={() => close()} 
            variant="promoted" 
          />
        </Box>
      </Box>
    ))
  }, [openDialog])
  
  const showWarning = useCallback(async (message: string) => {
    await openDialog<void>((close) => (
      <Box padding="2rem" textAlign="center">
        <Box 
          fontSize="1.25rem" 
          fontWeight="bold" 
          marginBottom="1rem" 
          color="#f59e0b"
        >
          Warning
        </Box>
        <Box marginBottom="2rem" color="#374151">
          {message}
        </Box>
        <Box display="flex" justifyContent="center">
          <Button 
            label="OK" 
            onClick={() => close()} 
            variant="promoted" 
          />
        </Box>
      </Box>
    ))
  }, [openDialog])
  
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