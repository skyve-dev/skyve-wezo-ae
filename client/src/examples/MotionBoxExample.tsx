import React from 'react';
import { Box } from '../components/Box';

// Example component demonstrating motion-based styling with responsive breakpoints
export const MotionBoxExample: React.FC = () => {
  return (
    <Box
      padding={20}
      display="flex"
      flexDirection="column"
      gap={24}
      maxWidth={800}
      margin="0 auto"
      backgroundColor="#f8f9fa"
      minHeight="100vh"
    >
      <Box as="h1" fontSize={32} fontWeight={700} textAlign="center" margin={0}>
        Motion-Based Box Component Examples
      </Box>

      {/* whileHover Example */}
      <Box
        as="button"
        padding={16}
        backgroundColor="#007bff"
        color="white"
        border="none"
        borderRadius={8}
        fontSize={16}
        cursor="pointer"
        whileHover={{
          // Mobile-first: base styles
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
          
          // Tablet and up
          Sm: {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: '0 6px 16px rgba(0,123,255,0.4)',
          },
          
          // Laptop and up
          Lg: {
            transform: 'translateY(-6px) scale(1.05)',
            boxShadow: '0 8px 24px rgba(0,123,255,0.5)',
            borderRadius: '12px',
          }
        }}
        style={{ transition: 'all 0.2s ease' }}
      >
        Hover me! (Responsive hover effects)
      </Box>

      {/* whileTap Example */}
      <Box
        as="button"
        padding={12}
        backgroundColor="#28a745"
        color="white"
        border="none"
        borderRadius={6}
        fontSize={14}
        cursor="pointer"
        whileTap={{
          // Mobile-first: base styles
          transform: 'scale(0.95)',
          backgroundColor: '#1e7e34',
          
          // Desktop and up - more dramatic effect
          Xl: {
            transform: 'scale(0.90) rotate(1deg)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
          }
        }}
        style={{ transition: 'all 0.1s ease' }}
      >
        Tap/Click me! (Press effect)
      </Box>

      {/* whileFocus Example */}
      <Box
        as="input"
        type="text"
        placeholder="Focus me to see responsive styles"
        padding={12}
        border="2px solid #dee2e6"
        borderRadius={6}
        fontSize={16}
        whileFocus={{
          // Mobile-first: base styles
          borderColor: '#007bff',
          boxShadow: '0 0 0 2px rgba(0,123,255,0.25)',
          
          // Tablet and up
          Md: {
            borderColor: '#0056b3',
            boxShadow: '0 0 0 3px rgba(0,123,255,0.35)',
            transform: 'translateY(-1px)',
          },
          
          // Laptop and up
          Lg: {
            boxShadow: '0 0 0 4px rgba(0,123,255,0.45)',
            transform: 'translateY(-2px) scale(1.02)',
          }
        }}
        style={{ transition: 'all 0.2s ease', outline: 'none' }}
      />

      {/* whileInView Example */}
      <Box
        marginTop={100}
        padding={32}
        backgroundColor="white"
        borderRadius={12}
        textAlign="center"
        whileInView={{
          // Mobile-first: base fade in
          opacity: 1,
          transform: 'translateY(0px)',
          
          // Tablet and up
          Sm: {
            opacity: 1,
            transform: 'translateY(0px) scale(1.02)',
          },
          
          // Laptop and up
          Lg: {
            opacity: 1,
            transform: 'translateY(0px) scale(1.05)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
        style={{
          // Initial state - hidden
          opacity: 0,
          transform: 'translateY(50px)',
          transition: 'all 0.6s ease'
        }}
      >
        <Box as="h2" fontSize={24} fontWeight={600} margin={0} marginBottom={16}>
          🎉 I appear when scrolled into view!
        </Box>
        <Box as="p" fontSize={16} color="#6c757d" margin={0}>
          This box has responsive animation effects based on viewport visibility.
          The animation intensity increases on larger screens.
        </Box>
      </Box>

      {/* whileDrag Example */}
      <Box
        padding={20}
        backgroundColor="#fd7e14"
        color="white"
        borderRadius={10}
        fontSize={16}
        fontWeight={500}
        cursor="grab"
        textAlign="center"
        userSelect="none"
        whileDrag={{
          // Mobile-first: base drag styles
          cursor: 'grabbing',
          transform: 'rotate(5deg) scale(1.05)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          
          // Tablet and up
          Md: {
            transform: 'rotate(8deg) scale(1.1)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
          },
          
          // Desktop and up
          Xl: {
            transform: 'rotate(10deg) scale(1.15)',
            boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
            opacity: 0.9,
          }
        }}
        style={{ transition: 'all 0.2s ease' }}
      >
        🤏 Drag me around! (Try it on different screen sizes)
      </Box>

      <Box height={200} />
    </Box>
  );
};