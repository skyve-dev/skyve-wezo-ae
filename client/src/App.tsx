import { useEffect, useState } from 'react';
import { Box } from '@/components/Box';
import { applyGlobalStyles } from '@/utils/globalStyles';

/**
 * Main App component demonstrating the Box component usage
 */
function App() {
  const [touchInfo, setTouchInfo] = useState('');

  // Apply global styles on mount
  useEffect(() => {
    applyGlobalStyles();
  }, []);

  // Mobile touch event handlers
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    setTouchInfo(`Touch Start: x=${Math.round(touch.clientX)}, y=${Math.round(touch.clientY)}`);
  };

  const handleTouchEnd = () => {
    setTouchInfo('Touch End');
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    setTouchInfo(`Touch Move: x=${Math.round(touch.clientX)}, y=${Math.round(touch.clientY)}`);
  };

  return (
    <Box
      width="100%"
      minHeight="100vh"
      backgroundColor="#f5f5f5"
      padding={10}
      display="flex"
      flexDirection="column"
      gap={20}
    >
      <Box
        backgroundColor="white"
        borderRadius={8}
        padding={24}
        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      >
        <h1>Wezo Client Application</h1>
        <p>Welcome to the Wezo property rental platform.</p>
      </Box>

      <Box
        display={'flex'}
        flexWrap={'wrap'}
        gap={16}
      >
        <Box
          backgroundColor="white"
          padding={16}
          borderRadius={8}
          display={'flex'}
          flexDirection={'column'}
          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
          gap={10}
        >
          <Box fontSize={22}>Responsive Design</Box>
          <Box fontSize={18}>This card adapts to different screen sizes using responsive props.</Box>
        </Box>

        <Box
          backgroundColor="white"
          padding={16}
          borderRadius={8}
          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          <h3>Touch Interactive Card</h3>
          <p>Touch this card on mobile devices to see touch events.</p>
          {touchInfo && <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{touchInfo}</p>}
        </Box>

        <Box
          backgroundColor="white"
          padding={16}
          borderRadius={8}
          boxShadow="0 1px 3px rgba(0,0,0,0.1)"

        >
          <h3>Conditional Display</h3>
          <p>This card only appears on large screens (lg and up).</p>
        </Box>
      </Box>
    </Box>
  );
}

export default App;