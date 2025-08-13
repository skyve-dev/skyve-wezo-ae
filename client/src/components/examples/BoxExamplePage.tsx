import React, { useState } from 'react';
import { Box } from '../Box';

export const BoxExamplePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [clickCount, setClickCount] = useState(0);

  const tabs = [
    { id: 'basic', label: 'Basic Styling' },
    { id: 'responsive', label: 'Responsive' },
    { id: 'motion', label: 'Motion Effects' },
    { id: 'polymorphic', label: 'As Prop' },
    { id: 'layouts', label: 'Layouts' }
  ];

  const TabButton = ({ tab, isActive, onClick }: { tab: any; isActive: boolean; onClick: () => void }) => (
    <Box
      as="button"
      onClick={onClick}
      padding={12}
      paddingMd={16}
      backgroundColor={isActive ? '#007bff' : 'transparent'}
      color={isActive ? 'white' : '#007bff'}
      border="2px solid #007bff"
      borderRadius={6}
      fontSize={14}
      fontSizeMd={16}
      fontWeight={500}
      cursor="pointer"
      whileHover={{
        backgroundColor: isActive ? '#0056b3' : '#f8f9ff',
        Md: {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,123,255,0.2)',
        }
      }}
      whileTap={{
        transform: 'scale(0.98)',
        Md: {
          transform: 'scale(0.95)',
        }
      }}
      style={{ transition: 'all 0.2s ease' }}
    >
      {tab.label}
    </Box>
  );

  const CodeBlock = ({ children }: { children: React.ReactNode }) => (
    <Box
      as="pre"
      backgroundColor="#f8f9fa"
      border="1px solid #e9ecef"
      borderRadius={6}
      padding={16}
      fontSize={12}
      fontSizeMd={14}
      fontFamily="'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
      overflow="auto"
      whileInView={{
        opacity: 1,
        transform: 'translateY(0px)',
      }}
      style={{
        opacity: 0,
        transform: 'translateY(20px)',
        transition: 'all 0.4s ease',
        margin: 0,
      }}
    >
      {children}
    </Box>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Box
      as="h2"
      fontSize={20}
      fontSizeMd={24}
      fontSizeLg={28}
      fontWeight={700}
      color="#2c3e50"
      margin={0}
      marginBottom={16}
      marginBottomMd={20}
      whileInView={{
        opacity: 1,
        transform: 'translateX(0px)',
        Md: {
          transform: 'translateX(0px) scale(1.02)',
        }
      }}
      style={{
        opacity: 0,
        transform: 'translateX(-30px)',
        transition: 'all 0.6s ease',
      }}
    >
      {children}
    </Box>
  );

  const ExampleCard = ({ title, children, code }: { title: string; children: React.ReactNode; code?: string }) => (
    <Box
      backgroundColor="white"
      border="1px solid #e9ecef"
      borderRadius={8}
      padding={20}
      paddingMd={24}
      marginBottom={24}
      boxShadow="0 2px 4px rgba(0,0,0,0.05)"
      whileInView={{
        opacity: 1,
        transform: 'translateY(0px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        Lg: {
          transform: 'translateY(0px) scale(1.01)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        }
      }}
      style={{
        opacity: 0,
        transform: 'translateY(30px)',
        transition: 'all 0.5s ease',
      }}
    >
      <Box as="h3" fontSize={16} fontSizeMd={18} fontWeight={600} margin={0} marginBottom={16} color="#495057">
        {title}
      </Box>
      
      <Box marginBottom={code ? 20 : 0}>
        {children}
      </Box>
      
      {code && <CodeBlock>{code}</CodeBlock>}
    </Box>
  );

  const renderBasicStyling = () => (
    <Box>
      <SectionTitle>🎨 Basic Styling</SectionTitle>
      <Box as="p" fontSize={16} color="#6c757d" marginBottom={32} lineHeight={1.6}>
        The Box component supports all CSS properties as props, providing a consistent and flexible styling system.
      </Box>

      <ExampleCard
        title="Colors & Spacing"
        code={`<Box
  backgroundColor="#e3f2fd"
  color="#1976d2"
  padding={20}
  margin={16}
  borderRadius={8}
>
  Styled with props
</Box>`}
      >
        <Box
          backgroundColor="#e3f2fd"
          color="#1976d2"
          padding={20}
          margin={16}
          borderRadius={8}
          textAlign="center"
          fontWeight={500}
        >
          Styled with props instead of CSS classes!
        </Box>
      </ExampleCard>

      <ExampleCard
        title="Typography"
        code={`<Box fontSize={24} fontWeight={700} textAlign="center">
  Large Bold Text
</Box>
<Box fontSize={14} fontStyle="italic" color="#6c757d">
  Small italic text
</Box>`}
      >
        <Box fontSize={24} fontWeight={700} textAlign="center" marginBottom={8}>
          Large Bold Text
        </Box>
        <Box fontSize={14} fontStyle="italic" color="#6c757d" textAlign="center">
          Small italic text
        </Box>
      </ExampleCard>

      <ExampleCard
        title="Borders & Shadows"
        code={`<Box
  border="2px solid #28a745"
  borderRadius={12}
  boxShadow="0 4px 12px rgba(40,167,69,0.3)"
  padding={20}
>
  Custom borders and shadows
</Box>`}
      >
        <Box
          border="2px solid #28a745"
          borderRadius={12}
          boxShadow="0 4px 12px rgba(40,167,69,0.3)"
          padding={20}
          backgroundColor="#f8fff9"
          textAlign="center"
          color="#155724"
          fontWeight={500}
        >
          Custom borders and shadows
        </Box>
      </ExampleCard>
    </Box>
  );

  const renderResponsive = () => (
    <Box>
      <SectionTitle>📱 Responsive Design</SectionTitle>
      <Box as="p" fontSize={16} color="#6c757d" marginBottom={32} lineHeight={1.6}>
        Mobile-first responsive design with breakpoint suffixes: Sm (≥640px), Md (≥768px), Lg (≥1024px), Xl (≥1280px)
      </Box>

      <ExampleCard
        title="Responsive Sizing"
        code={`<Box
  // Mobile: small padding, stack vertically
  padding={16}
  display="flex"
  flexDirection="column"
  gap={8}
  
  // Tablet and up: larger padding, horizontal
  paddingMd={24}
  flexDirectionMd="row"
  gapMd={16}
  
  // Desktop: even larger padding
  paddingLg={32}
  gapLg={24}
>
  Content adapts to screen size
</Box>`}
      >
        <Box
          padding={16}
          paddingMd={24}
          paddingLg={32}
          backgroundColor="#fff3cd"
          border="1px solid #ffeaa7"
          borderRadius={8}
          display="flex"
          flexDirection="column"
          flexDirectionMd="row"
          gap={8}
          gapMd={16}
          gapLg={24}
          alignItems="center"
          justifyContent="center"
        >
          <Box
            backgroundColor="#fd7e14"
            color="white"
            padding={12}
            borderRadius={6}
            fontWeight={500}
            flex={1}
            textAlign="center"
          >
            Item 1
          </Box>
          <Box
            backgroundColor="#fd7e14"
            color="white"
            padding={12}
            borderRadius={6}
            fontWeight={500}
            flex={1}
            textAlign="center"
          >
            Item 2
          </Box>
        </Box>
      </ExampleCard>

      <ExampleCard
        title="Responsive Typography"
        code={`<Box
  fontSize={18}      // Mobile
  fontSizeMd={24}    // Tablet+
  fontSizeLg={32}    // Laptop+
  fontSizeXl={40}    // Desktop+
  textAlign="center"
>
  Responsive text size
</Box>`}
      >
        <Box
          fontSize={18}
          fontSizeMd={24}
          fontSizeLg={32}
          fontSizeXl={40}
          fontWeight={700}
          textAlign="center"
          color="#6f42c1"
          marginBottom={16}
        >
          Responsive text size
        </Box>
        <Box fontSize={14} color="#6c757d" textAlign="center">
          Resize your browser to see the text scale!
        </Box>
      </ExampleCard>

      <ExampleCard
        title="Responsive Layout Grid"
        code={`<Box
  display="grid"
  gridTemplateColumns="1fr"          // Mobile: 1 column
  gridTemplateColumnsMd="1fr 1fr"    // Tablet: 2 columns  
  gridTemplateColumnsLg="repeat(3, 1fr)" // Laptop: 3 columns
  gap={16}
  gapMd={20}
  gapLg={24}
>`}
      >
        <Box
          display="grid"
          gridTemplateColumns="1fr"
          gridTemplateColumnsMd="1fr 1fr"
          gridTemplateColumnsLg="repeat(3, 1fr)"
          gap={16}
          gapMd={20}
          gapLg={24}
        >
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <Box
              key={num}
              backgroundColor="#17a2b8"
              color="white"
              padding={20}
              borderRadius={8}
              textAlign="center"
              fontWeight={500}
              fontSize={16}
            >
              Grid Item {num}
            </Box>
          ))}
        </Box>
      </ExampleCard>
    </Box>
  );

  const renderMotion = () => (
    <Box>
      <SectionTitle>✨ Motion Effects</SectionTitle>
      <Box as="p" fontSize={16} color="#6c757d" marginBottom={32} lineHeight={1.6}>
        Interactive motion effects with responsive variations for enhanced user experience across all devices.
      </Box>

      <ExampleCard
        title="whileHover - Responsive Hover Effects"
        code={`<Box
  as="button"
  whileHover={{
    // Mobile: subtle effect
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
    
    // Tablet+: more dramatic
    Sm: {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 6px 16px rgba(0,123,255,0.4)',
    },
    
    // Desktop: maximum effect
    Lg: {
      transform: 'translateY(-6px) scale(1.05)',
      borderRadius: '12px',
    }
  }}
>`}
      >
        <Box
          as="button"
          padding={16}
          paddingMd={20}
          backgroundColor="#007bff"
          color="white"
          border="none"
          borderRadius={8}
          fontSize={16}
          fontWeight={500}
          cursor="pointer"
          whileHover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
            Sm: {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: '0 6px 16px rgba(0,123,255,0.4)',
            },
            Lg: {
              transform: 'translateY(-6px) scale(1.05)',
              borderRadius: '12px',
            }
          }}
          style={{ transition: 'all 0.2s ease' }}
        >
          Hover me! (Effects scale with screen size)
        </Box>
      </ExampleCard>

      <ExampleCard
        title="whileTap - Press Effects"
        code={`<Box
  as="button"
  whileTap={{
    // Mobile: simple scale
    transform: 'scale(0.95)',
    backgroundColor: '#1e7e34',
    
    // Desktop: dramatic effect
    Xl: {
      transform: 'scale(0.90) rotate(2deg)',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
    }
  }}
>`}
      >
        <Box display="flex" flexDirection="column" flexDirectionMd="row" gap={16} alignItems="center">
          <Box
            as="button"
            padding={12}
            backgroundColor="#28a745"
            color="white"
            border="none"
            borderRadius={6}
            fontSize={14}
            fontWeight={500}
            cursor="pointer"
            onClick={() => setClickCount(count => count + 1)}
            whileTap={{
              transform: 'scale(0.95)',
              backgroundColor: '#1e7e34',
              Xl: {
                transform: 'scale(0.90) rotate(2deg)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
              }
            }}
            style={{ transition: 'all 0.1s ease' }}
          >
            Click me! Clicked: {clickCount}
          </Box>
          <Box fontSize={14} color="#6c757d">
            Try on mobile vs desktop for different effects
          </Box>
        </Box>
      </ExampleCard>

      <ExampleCard
        title="whileFocus - Focus States"
        code={`<Box
  as="input"
  whileFocus={{
    borderColor: '#007bff',
    boxShadow: '0 0 0 2px rgba(0,123,255,0.25)',
    
    Md: {
      transform: 'translateY(-1px)',
      boxShadow: '0 0 0 3px rgba(0,123,255,0.35)',
    },
    
    Lg: {
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: '0 0 0 4px rgba(0,123,255,0.45)',
    }
  }}
/>`}
      >
        <Box
          as="input"
          type="text"
          placeholder="Focus me to see responsive focus effects"
          padding={12}
          paddingMd={16}
          border="2px solid #dee2e6"
          borderRadius={6}
          fontSize={16}
          width="100%"
          whileFocus={{
            borderColor: '#007bff',
            boxShadow: '0 0 0 2px rgba(0,123,255,0.25)',
            Md: {
              transform: 'translateY(-1px)',
              boxShadow: '0 0 0 3px rgba(0,123,255,0.35)',
            },
            Lg: {
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: '0 0 0 4px rgba(0,123,255,0.45)',
            }
          }}
          style={{ 
            transition: 'all 0.2s ease', 
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </ExampleCard>

      <ExampleCard
        title="whileDrag - Drag Effects"
        code={`<Box
  whileDrag={{
    cursor: 'grabbing',
    transform: 'rotate(5deg) scale(1.05)',
    
    Md: {
      transform: 'rotate(8deg) scale(1.1)',
      boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
    },
    
    Xl: {
      transform: 'rotate(10deg) scale(1.15)',
      opacity: 0.9,
    }
  }}
>`}
      >
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
            cursor: 'grabbing',
            transform: 'rotate(5deg) scale(1.05)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            Md: {
              transform: 'rotate(8deg) scale(1.1)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
            },
            Xl: {
              transform: 'rotate(10deg) scale(1.15)',
              boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
              opacity: 0.9,
            }
          }}
          style={{ transition: 'all 0.2s ease' }}
        >
          🤏 Drag me! (Try on different screen sizes)
        </Box>
      </ExampleCard>

      <ExampleCard
        title="whileInView - Scroll Animations"
        code={`<Box
  whileInView={{
    opacity: 1,
    transform: 'translateY(0px)',
    
    Sm: {
      transform: 'translateY(0px) scale(1.02)',
    },
    
    Lg: {
      transform: 'translateY(0px) scale(1.05)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    }
  }}
  style={{
    opacity: 0,
    transform: 'translateY(50px)',
    transition: 'all 0.6s ease'
  }}
>`}
      >
        <Box height={200} /> {/* Spacer to ensure scrolling */}
        <Box
          padding={32}
          backgroundColor="white"
          border="2px solid #e9ecef"
          borderRadius={12}
          textAlign="center"
          whileInView={{
            opacity: 1,
            transform: 'translateY(0px)',
            Sm: {
              opacity: 1,
              transform: 'translateY(0px) scale(1.02)',
            },
            Lg: {
              opacity: 1,
              transform: 'translateY(0px) scale(1.05)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }
          }}
          style={{
            opacity: 0,
            transform: 'translateY(50px)',
            transition: 'all 0.6s ease'
          }}
        >
          <Box as="h3" fontSize={20} fontWeight={600} margin={0} marginBottom={12}>
            🎉 I animate when scrolled into view!
          </Box>
          <Box color="#6c757d" fontSize={16}>
            Scroll effects that adapt to screen size
          </Box>
        </Box>
      </ExampleCard>
    </Box>
  );

  const renderPolymorphic = () => (
    <Box>
      <SectionTitle>🔄 Polymorphic "as" Prop</SectionTitle>
      <Box as="p" fontSize={16} color="#6c757d" marginBottom={32} lineHeight={1.6}>
        Use the "as" prop to render any HTML element while maintaining Box styling capabilities and full TypeScript support.
      </Box>

      <ExampleCard
        title="Different HTML Elements"
        code={`<Box as="h1" fontSize={32} color="#2c3e50">Heading</Box>
<Box as="p" fontSize={16} color="#6c757d">Paragraph</Box>
<Box as="button" padding={12} backgroundColor="#007bff">Button</Box>
<Box as="input" padding={10} border="1px solid #ccc" />
<Box as="a" href="#" color="#007bff">Link</Box>`}
      >
        <Box display="flex" flexDirection="column" gap={16}>
          <Box as="h1" fontSize={24} fontSizeMd={28} color="#2c3e50" margin={0}>
            This is an h1 element
          </Box>
          <Box as="p" fontSize={16} color="#6c757d" margin={0} lineHeight={1.5}>
            This is a paragraph element with proper semantic meaning for accessibility.
          </Box>
          <Box
            as="button"
            padding={12}
            backgroundColor="#007bff"
            color="white"
            border="none"
            borderRadius={6}
            cursor="pointer"
            fontSize={14}
            fontWeight={500}
            alignSelf="flex-start"
          >
            This is a button element
          </Box>
          <Box
            as="input"
            type="text"
            placeholder="This is an input element"
            padding={10}
            border="1px solid #ccc"
            borderRadius={4}
            fontSize={14}
          />
          <Box
            as="a"
            href="#polymorphic"
            color="#007bff"
            textDecoration="underline"
            fontSize={14}
          >
            This is an anchor element
          </Box>
        </Box>
      </ExampleCard>

      <ExampleCard
        title="Form Elements with Box Styling"
        code={`<Box as="form" display="flex" flexDirection="column" gap={16}>
  <Box as="label" fontSize={14} fontWeight={500}>Email</Box>
  <Box as="input" type="email" padding={12} border="2px solid #e9ecef" />
  <Box as="textarea" padding={12} minHeight={100} />
  <Box as="button" type="submit" padding={12} backgroundColor="#28a745">
    Submit
  </Box>
</Box>`}
      >
        <Box as="form" display="flex" flexDirection="column" gap={16}>
          <Box as="label" fontSize={14} fontWeight={500} color="#495057">
            Email Address
          </Box>
          <Box
            as="input"
            type="email"
            placeholder="Enter your email"
            padding={12}
            border="2px solid #e9ecef"
            borderRadius={6}
            fontSize={14}
            style={{ outline: 'none' }}
            whileFocus={{
              borderColor: '#007bff',
              boxShadow: '0 0 0 2px rgba(0,123,255,0.1)',
            }}
          />
          <Box as="label" fontSize={14} fontWeight={500} color="#495057">
            Message
          </Box>
          <Box
            as="textarea"
            placeholder="Enter your message"
            padding={12}
            minHeight={80}
            border="2px solid #e9ecef"
            borderRadius={6}
            fontSize={14}
            resize="vertical"
            fontFamily="inherit"
            style={{ outline: 'none' }}
            whileFocus={{
              borderColor: '#007bff',
              boxShadow: '0 0 0 2px rgba(0,123,255,0.1)',
            }}
          />
          <Box
            as="button"
            type="button"
            padding={12}
            backgroundColor="#28a745"
            color="white"
            border="none"
            borderRadius={6}
            fontSize={16}
            fontWeight={500}
            cursor="pointer"
            alignSelf="flex-start"
            whileHover={{
              backgroundColor: '#218838',
            }}
            whileTap={{
              transform: 'scale(0.98)',
            }}
          >
            Submit Form
          </Box>
        </Box>
      </ExampleCard>

      <ExampleCard
        title="Navigation Elements"
        code={`<Box as="nav" display="flex" gap={20} padding={16}>
  <Box as="a" href="#home" color="#007bff">Home</Box>
  <Box as="a" href="#about" color="#007bff">About</Box>
  <Box as="a" href="#contact" color="#007bff">Contact</Box>
</Box>`}
      >
        <Box 
          as="nav" 
          display="flex" 
          gap={20} 
          gapMd={32}
          padding={16}
          backgroundColor="#f8f9fa"
          borderRadius={8}
          justifyContent="center"
          flexWrap="wrap"
        >
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <Box
              key={item}
              as="a"
              href={`#${item.toLowerCase()}`}
              color="#007bff"
              textDecoration="none"
              fontSize={16}
              fontWeight={500}
              padding={8}
              borderRadius={4}
              whileHover={{
                backgroundColor: '#e3f2fd',
                textDecoration: 'underline',
              }}
              style={{ transition: 'all 0.2s ease' }}
            >
              {item}
            </Box>
          ))}
        </Box>
      </ExampleCard>
    </Box>
  );

  const renderLayouts = () => (
    <Box>
      <SectionTitle>📐 Layout Examples</SectionTitle>
      <Box as="p" fontSize={16} color="#6c757d" marginBottom={32} lineHeight={1.6}>
        Powerful layout capabilities with Flexbox and CSS Grid, all responsive and motion-enabled.
      </Box>

      <ExampleCard
        title="Flexbox Layout"
        code={`<Box
  display="flex"
  flexDirection="column"
  flexDirectionMd="row"
  gap={16}
  padding={20}
  justifyContent="space-between"
  alignItems="center"
>`}
      >
        <Box
          display="flex"
          flexDirection="column"
          flexDirectionMd="row"
          gap={16}
          gapMd={24}
          padding={20}
          backgroundColor="#f8f9fa"
          borderRadius={8}
          justifyContent="space-between"
          alignItems="center"
          alignItemsMd="flex-start"
        >
          <Box
            backgroundColor="#6f42c1"
            color="white"
            padding={16}
            borderRadius={8}
            textAlign="center"
            flex={1}
            minWidth={120}
          >
            Flex Item 1
          </Box>
          <Box
            backgroundColor="#6f42c1"
            color="white"
            padding={16}
            borderRadius={8}
            textAlign="center"
            flex={2}
            minWidth={120}
          >
            Flex Item 2 (flex: 2)
          </Box>
          <Box
            backgroundColor="#6f42c1"
            color="white"
            padding={16}
            borderRadius={8}
            textAlign="center"
            flex={1}
            minWidth={120}
          >
            Flex Item 3
          </Box>
        </Box>
      </ExampleCard>

      <ExampleCard
        title="CSS Grid Layout"
        code={`<Box
  display="grid"
  gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
  gap={16}
  padding={20}
>`}
      >
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          gap={16}
          gapMd={20}
          padding={20}
          backgroundColor="#f8f9fa"
          borderRadius={8}
        >
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <Box
              key={num}
              backgroundColor="#20c997"
              color="white"
              padding={20}
              borderRadius={8}
              textAlign="center"
              fontWeight={500}
              fontSize={16}
              minHeight={100}
              display="flex"
              alignItems="center"
              justifyContent="center"
              whileHover={{
                transform: 'scale(1.02)',
                backgroundColor: '#17a2b8',
              }}
              style={{ transition: 'all 0.2s ease' }}
            >
              Grid {num}
            </Box>
          ))}
        </Box>
      </ExampleCard>

      <ExampleCard
        title="Complex Card Layout"
        code={`<Box
  display="grid"
  gridTemplateColumns="1fr"
  gridTemplateColumnsMd="300px 1fr"
  gap={24}
  backgroundColor="white"
  borderRadius={12}
  overflow="hidden"
  boxShadow="0 4px 16px rgba(0,0,0,0.1)"
>`}
      >
        <Box
          display="grid"
          gridTemplateColumns="1fr"
          gridTemplateColumnsMd="300px 1fr"
          gap={0}
          backgroundColor="white"
          borderRadius={12}
          overflow="hidden"
          boxShadow="0 4px 16px rgba(0,0,0,0.1)"
          whileHover={{
            boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
            Lg: {
              transform: 'translateY(-4px) scale(1.01)',
            }
          }}
          style={{ transition: 'all 0.3s ease' }}
        >
          {/* Image placeholder */}
          <Box
            backgroundColor="#e9ecef"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
            minHeightMd={250}
            color="#6c757d"
            fontSize={48}
          >
            🖼️
          </Box>
          
          {/* Content */}
          <Box padding={24} paddingMd={32}>
            <Box as="h3" fontSize={20} fontSizeMd={24} fontWeight={700} margin={0} marginBottom={12} color="#2c3e50">
              Card Title
            </Box>
            <Box as="p" fontSize={16} color="#6c757d" lineHeight={1.6} marginBottom={20} margin={0}>
              This is a complex card layout built entirely with Box components. It's responsive, 
              has hover effects, and demonstrates the power of combining CSS Grid with Box styling.
            </Box>
            <Box
              as="button"
              padding={10}
              paddingX={20}
              backgroundColor="#007bff"
              color="white"
              border="none"
              borderRadius={6}
              fontSize={14}
              fontWeight={500}
              cursor="pointer"
              whileHover={{
                backgroundColor: '#0056b3',
              }}
              whileTap={{
                transform: 'scale(0.98)',
              }}
              style={{ transition: 'all 0.2s ease' }}
            >
              Read More
            </Box>
          </Box>
        </Box>
      </ExampleCard>
    </Box>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicStyling();
      case 'responsive':
        return renderResponsive();
      case 'motion':
        return renderMotion();
      case 'polymorphic':
        return renderPolymorphic();
      case 'layouts':
        return renderLayouts();
      default:
        return renderBasicStyling();
    }
  };

  return (
    <Box
      minHeight="100vh"
      backgroundColor="#f8f9fa"
      padding={20}
      paddingMd={40}
      paddingLg={60}
    >
      {/* Header */}
      <Box maxWidth={1200} margin="0 auto" marginBottom={40}>
        <Box textAlign="center" marginBottom={32}>
          <Box
            as="h1"
            fontSize={32}
            fontSizeMd={40}
            fontSizeLg={48}
            fontWeight={900}
            margin={0}
            marginBottom={16}
            color="#2c3e50"
            whileInView={{
              opacity: 1,
              transform: 'translateY(0px) scale(1)',
              Lg: {
                transform: 'translateY(0px) scale(1.02)',
              }
            }}
            style={{
              opacity: 0,
              transform: 'translateY(-30px) scale(0.9)',
              transition: 'all 0.8s ease',
            }}
          >
            📦 Box Component
          </Box>
          <Box
            fontSize={16}
            fontSizeMd={18}
            fontSizeLg={20}
            color="#6c757d"
            lineHeight={1.6}
            maxWidth={600}
            margin="0 auto"
            whileInView={{
              opacity: 1,
              transform: 'translateY(0px)',
            }}
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'all 0.8s ease 0.2s',
            }}
          >
            A powerful, responsive, and motion-enabled component that replaces traditional CSS with props.
            Build complex layouts, responsive designs, and interactive experiences with ease.
          </Box>
        </Box>

        {/* Tab Navigation */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={8}
          gapMd={12}
          justifyContent="center"
          marginBottom={32}
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </Box>
      </Box>

      {/* Content */}
      <Box maxWidth={1200} margin="0 auto">
        {renderContent()}
      </Box>

      {/* Footer */}
      <Box
        maxWidth={1200}
        margin="0 auto"
        marginTop={80}
        textAlign="center"
        padding={32}
        backgroundColor="white"
        borderRadius={12}
        boxShadow="0 4px 16px rgba(0,0,0,0.05)"
      >
        <Box as="h2" fontSize={24} fontWeight={700} margin={0} marginBottom={16} color="#2c3e50">
          🚀 Ready to build amazing UIs?
        </Box>
        <Box fontSize={16} color="#6c757d" marginBottom={24}>
          The Box component gives you the power of CSS with the convenience of props,
          responsive design out of the box, and delightful motion effects.
        </Box>
        <Box
          as="button"
          padding={16}
          paddingX={32}
          backgroundColor="#28a745"
          color="white"
          border="none"
          borderRadius={8}
          fontSize={18}
          fontWeight={600}
          cursor="pointer"
          whileHover={{
            backgroundColor: '#218838',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(40,167,69,0.3)',
            Lg: {
              transform: 'translateY(-4px) scale(1.05)',
            }
          }}
          whileTap={{
            transform: 'scale(0.98)',
          }}
          style={{ transition: 'all 0.2s ease' }}
        >
          Start Building with Box! ✨
        </Box>
      </Box>
    </Box>
  );
};