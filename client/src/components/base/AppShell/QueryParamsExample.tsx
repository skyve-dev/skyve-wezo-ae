import React from 'react'
import { useAppShell } from './index'
import { Button } from '../Button'
import { Box } from '../Box'

/**
 * Example component demonstrating URL query parameter functionality
 * This shows how components can receive params from navigation and URL
 */
interface ExampleComponentProps {
  userId?: string
  tab?: string
  filter?: string
  settings?: {
    theme: string
    language: string
  }
}

const ExampleComponent: React.FC<ExampleComponentProps> = (props) => {
  const { navigateTo, currentParams } = useAppShell()

  // The component receives both props passed via navigateTo() and URL query parameters
  const allParams = { ...props, ...currentParams }

  const handleNavigation = async () => {
    // Navigate with complex parameters that will be serialized to URL query string
    await navigateTo('example' as any, {
      userId: '123',
      tab: 'profile',
      filter: 'active',
      settings: {
        theme: 'dark',
        language: 'en'
      },
      timestamp: Date.now()
    })
  }

  const handleSimpleNavigation = async () => {
    // Navigate with simple parameters
    await navigateTo('example' as any, {
      userId: '456',
      tab: 'settings'
    })
  }

  return (
    <Box padding="2rem">
      <h2 style={{ marginBottom: '1rem' }}>Query Parameters Example</h2>
      
      <Box marginBottom="2rem">
        <h3>Current Parameters:</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          {JSON.stringify(allParams, null, 2)}
        </pre>
      </Box>

      <Box marginBottom="2rem">
        <h3>Current URL:</h3>
        <code style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '0.5rem', 
          borderRadius: '4px',
          display: 'block',
          fontSize: '0.875rem'
        }}>
          {window.location.pathname + window.location.search}
        </code>
      </Box>

      <Box display="flex" gap="1rem">
        <Button
          label="Navigate with Complex Params"
          onClick={handleNavigation}
          variant="promoted"
        />
        
        <Button
          label="Navigate with Simple Params"
          onClick={handleSimpleNavigation}
          variant="normal"
        />
      </Box>

      <Box marginTop="2rem">
        <h3>How it works:</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li>When you call <code>navigateTo(route, params)</code>, the params object is serialized into URL query parameters</li>
          <li>Complex objects are JSON-encoded in the URL</li>
          <li>When the component loads, URL query parameters are automatically parsed and passed as props</li>
          <li>The component receives a unified params object combining navigation props and URL parameters</li>
          <li>Direct URL visits (copy/paste, refresh) maintain the same parameter structure</li>
        </ul>
      </Box>
    </Box>
  )
}

export default ExampleComponent