import React from 'react'
import {IoIosCalendar, IoIosTrendingUp} from 'react-icons/io'
import {Box} from '@/components'
import Button from '@/components/base/Button'

interface ModeToggleProps {
  currentMode: 'calendar' | 'dashboard'
  onModeChange: (mode: 'calendar' | 'dashboard') => void
  disabled?: boolean
}

const ModeToggle: React.FC<ModeToggleProps> = ({
  currentMode,
  onModeChange,
  disabled = false
}) => {
  return (
    <Box display="flex" backgroundColor="#f3f4f6" borderRadius="8px" padding="0.25rem">
      <Button
        label={window.innerWidth < 768 ? '' : 'Calendar'}
        icon={<IoIosCalendar />}
        onClick={() => onModeChange('calendar')}
        variant={currentMode === 'calendar' ? 'promoted' : 'plain'}
        size="small"
        disabled={disabled}
        style={{
          backgroundColor: currentMode === 'calendar' ? '#D52122' : 'transparent',
          color: currentMode === 'calendar' ? 'white' : '#374151',
          border: 'none',
          boxShadow: currentMode === 'calendar' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
          minWidth: window.innerWidth < 768 ? '40px' : '100px'
        }}
        title={window.innerWidth < 768 ? 'Calendar View' : undefined}
      />
      
      <Button
        label={window.innerWidth < 768 ? '' : 'Dashboard'}
        icon={<IoIosTrendingUp />}
        onClick={() => onModeChange('dashboard')}
        variant={currentMode === 'dashboard' ? 'promoted' : 'plain'}
        size="small"
        disabled={disabled}
        style={{
          backgroundColor: currentMode === 'dashboard' ? '#D52122' : 'transparent',
          color: currentMode === 'dashboard' ? 'white' : '#374151',
          border: 'none',
          boxShadow: currentMode === 'dashboard' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
          minWidth: window.innerWidth < 768 ? '40px' : '100px'
        }}
        title={window.innerWidth < 768 ? 'Dashboard View' : undefined}
      />
    </Box>
  )
}

export default ModeToggle