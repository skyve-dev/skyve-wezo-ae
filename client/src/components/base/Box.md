# Box Component Responsive Design System

The Box component serves as the foundational building block for all UI elements in the Wezo.ae property rental application. It provides a comprehensive responsive design system that enables developers to create layouts that adapt seamlessly across different screen sizes and devices.

## Responsive Design Philosophy

The Box component implements a **mobile-first responsive design approach** using CSS media queries. This means:

1. **Base styles** are applied to all screen sizes (mobile by default)
2. **Responsive variants** override base styles at specific breakpoints
3. **Progressive enhancement** ensures optimal viewing on larger screens

### Breakpoint System

The responsive system uses four breakpoints that correspond to common device categories:

| Breakpoint | Suffix | Min Width | Target Devices |
|------------|--------|-----------|----------------|
| **Small** | `Sm` | 640px | Small phones and up |
| **Medium** | `Md` | 768px | Tablets and up |
| **Large** | `Lg` | 1024px | Laptops and up |
| **Extra Large** | `Xl` | 1280px | Desktop and larger |

## Responsive Property Naming Convention

Every CSS property in `BaseCSSProperties` supports responsive variants by appending breakpoint suffixes:

```typescript
// Base property (applies to all screen sizes)
display: 'flex'

// Responsive variants
displaySm: 'block'    // Small screens and up (≥640px)
displayMd: 'flex'     // Medium screens and up (≥768px)
displayLg: 'grid'     // Large screens and up (≥1024px)
displayXl: 'inline'   // Extra large screens and up (≥1280px)
```

## Complete List of Responsive Properties

All properties from `BaseCSSProperties` support the responsive suffix pattern (`Sm`, `Md`, `Lg`, `Xl`):

### Layout Properties
- `display` / `displaySm` / `displayMd` / `displayLg` / `displayXl`
- `position` / `positionSm` / `positionMd` / `positionLg` / `positionXl`
- `top` / `topSm` / `topMd` / `topLg` / `topXl`
- `right` / `rightSm` / `rightMd` / `rightLg` / `rightXl`
- `bottom` / `bottomSm` / `bottomMd` / `bottomLg` / `bottomXl`
- `left` / `leftSm` / `leftMd` / `leftLg` / `leftXl`
- `zIndex` / `zIndexSm` / `zIndexMd` / `zIndexLg` / `zIndexXl`

### Box Model Properties
- `width` / `widthSm` / `widthMd` / `widthLg` / `widthXl`
- `height` / `heightSm` / `heightMd` / `heightLg` / `heightXl`
- `minWidth` / `minWidthSm` / `minWidthMd` / `minWidthLg` / `minWidthXl`
- `maxWidth` / `maxWidthSm` / `maxWidthMd` / `maxWidthLg` / `maxWidthXl`
- `minHeight` / `minHeightSm` / `minHeightMd` / `minHeightLg` / `minHeightXl`
- `maxHeight` / `maxHeightSm` / `maxHeightMd` / `maxHeightLg` / `maxHeightXl`

### Spacing Properties
- `margin` / `marginSm` / `marginMd` / `marginLg` / `marginXl`
- `marginTop` / `marginTopSm` / `marginTopMd` / `marginTopLg` / `marginTopXl`
- `marginRight` / `marginRightSm` / `marginRightMd` / `marginRightLg` / `marginRightXl`
- `marginBottom` / `marginBottomSm` / `marginBottomMd` / `marginBottomLg` / `marginBottomXl`
- `marginLeft` / `marginLeftSm` / `marginLeftMd` / `marginLeftLg` / `marginLeftXl`
- `padding` / `paddingSm` / `paddingMd` / `paddingLg` / `paddingXl`
- `paddingTop` / `paddingTopSm` / `paddingTopMd` / `paddingTopLg` / `paddingTopXl`
- `paddingRight` / `paddingRightSm` / `paddingRightMd` / `paddingRightLg` / `paddingRightXl`
- `paddingBottom` / `paddingBottomSm` / `paddingBottomMd` / `paddingBottomLg` / `paddingBottomXl`
- `paddingLeft` / `paddingLeftSm` / `paddingLeftMd` / `paddingLeftLg` / `paddingLeftXl`
- `paddingX` / `paddingXSm` / `paddingXMd` / `paddingXLg` / `paddingXXl` *(horizontal padding shorthand)*
- `paddingY` / `paddingYSm` / `paddingYMd` / `paddingYLg` / `paddingYXl` *(vertical padding shorthand)*

### Flexbox Properties
- `flex` / `flexSm` / `flexMd` / `flexLg` / `flexXl`
- `flexDirection` / `flexDirectionSm` / `flexDirectionMd` / `flexDirectionLg` / `flexDirectionXl`
- `flexWrap` / `flexWrapSm` / `flexWrapMd` / `flexWrapLg` / `flexWrapXl`
- `justifyContent` / `justifyContentSm` / `justifyContentMd` / `justifyContentLg` / `justifyContentXl`
- `alignItems` / `alignItemsSm` / `alignItemsMd` / `alignItemsLg` / `alignItemsXl`
- `alignSelf` / `alignSelfSm` / `alignSelfMd` / `alignSelfLg` / `alignSelfXl`
- `alignContent` / `alignContentSm` / `alignContentMd` / `alignContentLg` / `alignContentXl`
- `flexGrow` / `flexGrowSm` / `flexGrowMd` / `flexGrowLg` / `flexGrowXl`
- `flexShrink` / `flexShrinkSm` / `flexShrinkMd` / `flexShrinkLg` / `flexShrinkXl`
- `flexBasis` / `flexBasisSm` / `flexBasisMd` / `flexBasisLg` / `flexBasisXl`
- `gap` / `gapSm` / `gapMd` / `gapLg` / `gapXl`
- `rowGap` / `rowGapSm` / `rowGapMd` / `rowGapLg` / `rowGapXl`
- `columnGap` / `columnGapSm` / `columnGapMd` / `columnGapLg` / `columnGapXl`

### Grid Properties
- `gridTemplate` / `gridTemplateSm` / `gridTemplateMd` / `gridTemplateLg` / `gridTemplateXl`
- `gridTemplateColumns` / `gridTemplateColumnsSm` / `gridTemplateColumnsMd` / `gridTemplateColumnsLg` / `gridTemplateColumnsXl`
- `gridTemplateRows` / `gridTemplateRowsSm` / `gridTemplateRowsMd` / `gridTemplateRowsLg` / `gridTemplateRowsXl`
- `gridTemplateAreas` / `gridTemplateAreasSm` / `gridTemplateAreasMd` / `gridTemplateAreasLg` / `gridTemplateAreasXl`
- `gridColumn` / `gridColumnSm` / `gridColumnMd` / `gridColumnLg` / `gridColumnXl`
- `gridRow` / `gridRowSm` / `gridRowMd` / `gridRowLg` / `gridRowXl`
- `gridArea` / `gridAreaSm` / `gridAreaMd` / `gridAreaLg` / `gridAreaXl`

### Border Properties
- `border` / `borderSm` / `borderMd` / `borderLg` / `borderXl`
- `borderTop` / `borderTopSm` / `borderTopMd` / `borderTopLg` / `borderTopXl`
- `borderRight` / `borderRightSm` / `borderRightMd` / `borderRightLg` / `borderRightXl`
- `borderBottom` / `borderBottomSm` / `borderBottomMd` / `borderBottomLg` / `borderBottomXl`
- `borderLeft` / `borderLeftSm` / `borderLeftMd` / `borderLeftLg` / `borderLeftXl`
- `borderWidth` / `borderWidthSm` / `borderWidthMd` / `borderWidthLg` / `borderWidthXl`
- `borderStyle` / `borderStyleSm` / `borderStyleMd` / `borderStyleLg` / `borderStyleXl`
- `borderColor` / `borderColorSm` / `borderColorMd` / `borderColorLg` / `borderColorXl`
- `borderTopColor` / `borderTopColorSm` / `borderTopColorMd` / `borderTopColorLg` / `borderTopColorXl`
- `borderRightColor` / `borderRightColorSm` / `borderRightColorMd` / `borderRightColorLg` / `borderRightColorXl`
- `borderBottomColor` / `borderBottomColorSm` / `borderBottomColorMd` / `borderBottomColorLg` / `borderBottomColorXl`
- `borderLeftColor` / `borderLeftColorSm` / `borderLeftColorMd` / `borderLeftColorLg` / `borderLeftColorXl`
- `borderRadius` / `borderRadiusSm` / `borderRadiusMd` / `borderRadiusLg` / `borderRadiusXl`

### Background Properties
- `background` / `backgroundSm` / `backgroundMd` / `backgroundLg` / `backgroundXl`
- `backgroundColor` / `backgroundColorSm` / `backgroundColorMd` / `backgroundColorLg` / `backgroundColorXl`
- `backgroundImage` / `backgroundImageSm` / `backgroundImageMd` / `backgroundImageLg` / `backgroundImageXl`
- `backgroundSize` / `backgroundSizeSm` / `backgroundSizeMd` / `backgroundSizeLg` / `backgroundSizeXl`
- `backgroundPosition` / `backgroundPositionSm` / `backgroundPositionMd` / `backgroundPositionLg` / `backgroundPositionXl`
- `backgroundRepeat` / `backgroundRepeatSm` / `backgroundRepeatMd` / `backgroundRepeatLg` / `backgroundRepeatXl`

### Typography Properties
- `color` / `colorSm` / `colorMd` / `colorLg` / `colorXl`
- `fontSize` / `fontSizeSm` / `fontSizeMd` / `fontSizeLg` / `fontSizeXl`
- `fontWeight` / `fontWeightSm` / `fontWeightMd` / `fontWeightLg` / `fontWeightXl`
- `fontFamily` / `fontFamilySm` / `fontFamilyMd` / `fontFamilyLg` / `fontFamilyXl`
- `fontStyle` / `fontStyleSm` / `fontStyleMd` / `fontStyleLg` / `fontStyleXl`
- `lineHeight` / `lineHeightSm` / `lineHeightMd` / `lineHeightLg` / `lineHeightXl`
- `textAlign` / `textAlignSm` / `textAlignMd` / `textAlignLg` / `textAlignXl`
- `textDecoration` / `textDecorationSm` / `textDecorationMd` / `textDecorationLg` / `textDecorationXl`
- `textTransform` / `textTransformSm` / `textTransformMd` / `textTransformLg` / `textTransformXl`

### Effect Properties
- `opacity` / `opacitySm` / `opacityMd` / `opacityLg` / `opacityXl`
- `boxShadow` / `boxShadowSm` / `boxShadowMd` / `boxShadowLg` / `boxShadowXl`
- `transform` / `transformSm` / `transformMd` / `transformLg` / `transformXl`
- `transition` / `transitionSm` / `transitionMd` / `transitionLg` / `transitionXl`
- `animation` / `animationSm` / `animationMd` / `animationLg` / `animationXl`

### Overflow Properties
- `overflow` / `overflowSm` / `overflowMd` / `overflowLg` / `overflowXl`
- `overflowX` / `overflowXSm` / `overflowXMd` / `overflowXLg` / `overflowXXl`
- `overflowY` / `overflowYSm` / `overflowYMd` / `overflowYLg` / `overflowYXl`

### Interactive Properties
- `cursor` / `cursorSm` / `cursorMd` / `cursorLg` / `cursorXl`
- `pointerEvents` / `pointerEventsSm` / `pointerEventsMd` / `pointerEventsLg` / `pointerEventsXl`
- `userSelect` / `userSelectSm` / `userSelectMd` / `userSelectLg` / `userSelectXl`

### Visibility Properties
- `visibility` / `visibilitySm` / `visibilityMd` / `visibilityLg` / `visibilityXl`

### Miscellaneous Properties
- `resize` / `resizeSm` / `resizeMd` / `resizeXl`
- `objectFit` / `objectFitSm` / `objectFitMd` / `objectFitLg` / `objectFitXl`
- `accentColor` / `accentColorSm` / `accentColorMd` / `accentColorLg` / `accentColorXl`

## ResponsiveCSSProperties Code Examples

### Example 1: Responsive Grid Layout for Property Cards

```tsx
import { Box } from '@/components/base/Box'

// Grid that adapts from 1 column on mobile to 4 columns on desktop
<Box
  display="grid"
  gridTemplateColumns="1fr"           // Mobile: 1 column
  gridTemplateColumnsSm="repeat(2, 1fr)"  // Small: 2 columns (≥640px)
  gridTemplateColumnsMd="repeat(2, 1fr)"  // Medium: 2 columns (≥768px)  
  gridTemplateColumnsLg="repeat(3, 1fr)"  // Large: 3 columns (≥1024px)
  gridTemplateColumnsXl="repeat(4, 1fr)"  // XL: 4 columns (≥1280px)
  gap="1rem"
  padding="1rem"
  paddingSm="1.5rem"
  paddingLg="2rem"
>
  {properties.map(property => (
    <Box key={property.id} /* property card content */>
      {/* Property card implementation */}
    </Box>
  ))}
</Box>
```

### Example 2: Responsive Typography and Spacing

```tsx
// Hero section with responsive text sizes and spacing
<Box
  textAlign="center"
  padding="2rem 1rem"          // Mobile: smaller padding
  paddingMd="3rem 2rem"        // Medium: increased padding
  paddingLg="4rem 3rem"        // Large: even more padding
  paddingXl="5rem 4rem"        // XL: maximum padding
>
  <Box
    fontSize="2rem"             // Mobile: 2rem
    fontSizeSm="2.5rem"         // Small: 2.5rem
    fontSizeMd="3rem"           // Medium: 3rem
    fontSizeLg="3.5rem"         // Large: 3.5rem
    fontSizeXl="4rem"           // XL: 4rem
    fontWeight="bold"
    marginBottom="1rem"
    marginBottomMd="1.5rem"
    marginBottomLg="2rem"
  >
    Find Your Perfect Villa in Dubai
  </Box>
  
  <Box
    fontSize="1rem"
    fontSizeMd="1.125rem"
    fontSizeLg="1.25rem"
    maxWidth="100%"
    maxWidthSm="600px"
    maxWidthLg="800px"
    margin="0 auto"
    color="#6b7280"
  >
    Discover luxury accommodations across the UAE with instant booking
  </Box>
</Box>
```

### Example 3: Responsive Navigation Layout

```tsx
// Navigation that switches from mobile hamburger to desktop menu
<Box
  display="flex"
  alignItems="center"
  justifyContent="space-between"
  padding="1rem"
  paddingMd="1rem 2rem"
  backgroundColor="white"
  boxShadow="0 2px 4px rgba(0,0,0,0.1)"
>
  {/* Logo */}
  <Box fontSize="1.5rem" fontWeight="bold">
    Wezo.ae
  </Box>
  
  {/* Desktop Navigation - Hidden on mobile */}
  <Box
    display="none"              // Hidden on mobile
    displayMd="flex"             // Visible on medium screens and up
    alignItems="center"
    gap="2rem"
  >
    <Box cursor="pointer">Properties</Box>
    <Box cursor="pointer">Bookings</Box>
    <Box cursor="pointer">About</Box>
  </Box>
  
  {/* Mobile Menu Button - Hidden on desktop */}
  <Box
    display="block"              // Visible on mobile
    displayMd="none"             // Hidden on medium screens and up
    fontSize="1.5rem"
    cursor="pointer"
  >
    ☰
  </Box>
</Box>
```

### Example 4: Responsive Card Layout with Stacking

```tsx
// Cards that stack vertically on mobile, horizontally on desktop
<Box
  display="flex"
  flexDirection="column"         // Mobile: stack vertically
  flexDirectionLg="row"          // Large screens: arrange horizontally
  gap="1.5rem"
  padding="2rem 1rem"
  paddingLg="2rem"
>
  {/* Main Content */}
  <Box
    flex="1"
    flexLg="2"                   // Takes 2/3 width on large screens
    backgroundColor="white"
    borderRadius="1rem"
    padding="1.5rem"
    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
  >
    <Box fontSize="1.5rem" fontWeight="600" marginBottom="1rem">
      Property Details
    </Box>
    <Box lineHeight="1.6" color="#6b7280">
      Comprehensive information about your selected property...
    </Box>
  </Box>
  
  {/* Sidebar */}
  <Box
    flex="1"
    flexLg="1"                   // Takes 1/3 width on large screens
    backgroundColor="white"
    borderRadius="1rem"
    padding="1.5rem"
    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
  >
    <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem">
      Booking Summary
    </Box>
    <Box>Pricing and availability information...</Box>
  </Box>
</Box>
```

### Example 5: Advanced Responsive Grid with Conditional Display

```tsx
// Complex dashboard layout with different arrangements per screen size
<Box
  display="grid"
  gridTemplateColumns="1fr"                    // Mobile: single column
  gridTemplateColumnsSm="1fr"                  // Small: single column
  gridTemplateColumnsMd="2fr 1fr"              // Medium: 2-column layout
  gridTemplateColumnsLg="2fr 1fr 1fr"          // Large: 3-column layout
  gridTemplateColumnsXl="3fr 2fr 1fr"          // XL: 3-column with different ratios
  gap="1rem"
  gapMd="1.5rem"
  gapLg="2rem"
  padding="1rem"
  paddingMd="1.5rem"
  paddingLg="2rem"
  minHeight="100vh"
>
  {/* Main Dashboard Content */}
  <Box
    gridColumn="1"
    gridColumnMd="1"
    gridColumnLg="1 / 2"
    gridColumnXl="1 / 2"
    backgroundColor="white"
    borderRadius="1rem"
    padding="1.5rem"
    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
  >
    <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1rem">
      Dashboard Overview
    </Box>
    {/* Main content */}
  </Box>
  
  {/* Sidebar - Stats */}
  <Box
    gridColumn="1"
    gridColumnMd="2"
    gridColumnLg="2"
    gridColumnXl="2"
    backgroundColor="white"
    borderRadius="1rem"
    padding="1.5rem"
    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
  >
    <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem">
      Statistics
    </Box>
    {/* Stats content */}
  </Box>
  
  {/* Additional Panel - Only visible on large screens */}
  <Box
    display="none"                     // Hidden on mobile and small
    displayLg="block"                  // Visible on large screens and up
    gridColumn="3"
    gridColumnXl="3"
    backgroundColor="white"
    borderRadius="1rem"
    padding="1.5rem"
    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
  >
    <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem">
      Quick Actions
    </Box>
    {/* Quick actions content */}
  </Box>
</Box>
```

### Example 6: Responsive Image and Content Layout

```tsx
// Property listing with responsive image sizing and content flow
<Box
  display="flex"
  flexDirection="column"         // Mobile: stack image above content
  flexDirectionMd="row"          // Medium+: side-by-side layout
  backgroundColor="white"
  borderRadius="1rem"
  boxShadow="0 4px 12px rgba(0,0,0,0.1)"
  overflow="hidden"
>
  {/* Property Image */}
  <Box
    width="100%"                 // Mobile: full width
    widthMd="40%"                // Medium+: 40% of container
    height="200px"               // Mobile: fixed height
    heightMd="300px"             // Medium+: taller
    backgroundImage="url('/property-image.jpg')"
    backgroundSize="cover"
    backgroundPosition="center"
  />
  
  {/* Property Content */}
  <Box
    flex="1"
    padding="1rem"               // Mobile: standard padding
    paddingMd="1.5rem"           // Medium+: more padding
    paddingLg="2rem"             // Large+: even more padding
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
  >
    <Box>
      <Box
        fontSize="1.125rem"       // Mobile: smaller title
        fontSizeMd="1.25rem"      // Medium+: larger title
        fontSizeLg="1.5rem"       // Large+: even larger
        fontWeight="bold"
        marginBottom="0.5rem"
      >
        Luxury Villa in Dubai Marina
      </Box>
      
      <Box
        fontSize="0.875rem"       // Mobile: smaller text
        fontSizeMd="1rem"         // Medium+: regular text
        color="#6b7280"
        marginBottom="1rem"
        marginBottomMd="1.5rem"
      >
        Experience waterfront living in this stunning 4-bedroom villa...
      </Box>
    </Box>
    
    <Box
      display="flex"
      flexDirection="column"      // Mobile: stack price and button
      flexDirectionSm="row"       // Small+: side by side
      alignItems="flex-start"
      alignItemsSm="center"
      justifyContent="space-between"
      gap="1rem"
    >
      <Box
        fontSize="1.25rem"
        fontSizeMd="1.5rem"
        fontWeight="bold"
        color="#059669"
      >
        AED 2,500/night
      </Box>
      
      <Box
        padding="0.75rem 1.5rem"
        backgroundColor="#3182ce"
        color="white"
        borderRadius="0.5rem"
        fontSize="0.875rem"
        fontSizeSm="1rem"
        fontWeight="600"
        textAlign="center"
        cursor="pointer"
        width="100%"              // Mobile: full width button
        widthSm="auto"            // Small+: auto width
      >
        Book Now
      </Box>
    </Box>
  </Box>
</Box>
```

## Motion Props with Responsive Behavior

The Box component provides special **MotionProps** that enable interactive animations and state-based styling. These props support the same responsive behavior as regular CSS properties, allowing animations to adapt across different screen sizes.

### Available Motion Props

The Box component supports five motion-based props that trigger animations based on user interactions:

1. **`whileHover`** - Styles applied when the user hovers over the element
2. **`whileTap`** - Styles applied when the user taps/clicks the element
3. **`whileDrag`** - Styles applied while the element is being dragged
4. **`whileFocus`** - Styles applied when the element has focus
5. **`whileInView`** - Styles applied when the element enters the viewport

### ResponsiveMotionStyle Object

Each motion prop accepts a `ResponsiveMotionStyles` object that can contain:
- **Base styles** that apply to all screen sizes
- **Responsive breakpoint styles** using `Sm`, `Md`, `Lg`, `Xl` properties

The structure follows the same mobile-first approach as regular responsive properties:

```typescript
interface ResponsiveMotionStyles {
  // Base styles (mobile-first, applies to all sizes)
  [cssProperty: string]: CSSPropertyValue;
  
  // Responsive breakpoint styles
  Sm?: Partial<ResponsiveMotionStyles>;  // ≥640px
  Md?: Partial<ResponsiveMotionStyles>;  // ≥768px
  Lg?: Partial<ResponsiveMotionStyles>;  // ≥1024px
  Xl?: Partial<ResponsiveMotionStyles>;  // ≥1280px
}
```

### How Motion Props Work

1. **Event Detection**: The component automatically detects user interactions (hover, tap, drag, focus, viewport entry)
2. **State Management**: Internal state tracks which interactions are active
3. **Dynamic CSS Generation**: The component generates CSS rules with appropriate pseudo-selectors or state classes
4. **Responsive Application**: Styles are applied based on the current viewport size using media queries

## Motion Props Code Examples

### Example 7: Basic Hover with Responsive Styles

```tsx
// Button with different hover effects across screen sizes
<Box
  as="button"
  padding="0.75rem 1.5rem"
  backgroundColor="#3182ce"
  color="white"
  borderRadius="0.5rem"
  cursor="pointer"
  whileHover={{
    // Mobile: Simple color change
    backgroundColor: '#2563eb',
    // Tablet and up: Add transform
    Md: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-2px)',
    },
    // Desktop: Add shadow for depth
    Lg: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)',
    }
  }}
>
  Book Property
</Box>
```

### Example 8: Interactive Card with Multiple Motion States

```tsx
// Property card with hover and tap animations
<Box
  backgroundColor="white"
  borderRadius="1rem"
  padding="1.5rem"
  boxShadow="0 2px 8px rgba(0,0,0,0.1)"
  cursor="pointer"
  transition="all 0.2s"
  whileHover={{
    // Base mobile hover
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    // Enhanced desktop hover
    Lg: {
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      transform: 'scale(1.02)',
    }
  }}
  whileTap={{
    transform: 'scale(0.98)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }}
>
  <Box fontSize="1.25rem" fontWeight="bold" marginBottom="0.5rem">
    Luxury Villa Marina
  </Box>
  <Box color="#6b7280">
    4 Bedrooms • 3 Bathrooms • Pool
  </Box>
</Box>
```

### Example 9: Form Input with Focus States

```tsx
// Input field with responsive focus animations
<Box
  as="input"
  type="text"
  placeholder="Search properties..."
  width="100%"
  padding="0.75rem"
  border="2px solid #e5e7eb"
  borderRadius="0.5rem"
  fontSize="1rem"
  transition="all 0.2s"
  whileFocus={{
    // Mobile: Simple border color
    borderColor: '#3182ce',
    outline: 'none',
    // Desktop: Add glow effect
    Md: {
      borderColor: '#3182ce',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
    },
    Lg: {
      borderColor: '#3182ce',
      outline: 'none',
      boxShadow: '0 0 0 4px rgba(49, 130, 206, 0.15)',
    }
  }}
/>
```

### Example 10: Animated Navigation Menu Item

```tsx
// Navigation link with responsive hover and tap states
<Box
  as="a"
  href="/properties"
  display="inline-block"
  padding="0.5rem 1rem"
  color="#374151"
  fontWeight="500"
  textDecoration="none"
  position="relative"
  whileHover={{
    color: '#3182ce',
    // Desktop: Add underline animation
    Lg: {
      color: '#3182ce',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '2px',
        backgroundColor: '#3182ce',
        transform: 'scaleX(1)',
      }
    }
  }}
  whileTap={{
    color: '#1e40af',
    transform: 'scale(0.95)',
  }}
>
  Browse Properties
</Box>
```

### Example 11: Draggable Component

```tsx
// Draggable element with visual feedback
<Box
  width="100px"
  height="100px"
  backgroundColor="#3182ce"
  borderRadius="0.5rem"
  display="flex"
  alignItems="center"
  justifyContent="center"
  color="white"
  cursor="move"
  whileDrag={{
    // Visual feedback while dragging
    backgroundColor: '#1e40af',
    transform: 'scale(1.1)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    opacity: 0.8,
    // Enhanced effect on larger screens
    Lg: {
      transform: 'scale(1.15)',
      boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
    }
  }}
>
  Drag Me
</Box>
```

### Example 12: Scroll-Triggered Animation

```tsx
// Element that animates when scrolled into view
<Box
  opacity={0}
  transform="translateY(20px)"
  transition="all 0.6s ease-out"
  whileInView={{
    // Fade in and slide up when visible
    opacity: 1,
    transform: 'translateY(0)',
    // Staggered timing on larger screens
    Lg: {
      opacity: 1,
      transform: 'translateY(0)',
      transition: 'all 0.8s ease-out',
    }
  }}
>
  <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem">
    Discover Premium Properties
  </Box>
  <Box color="#6b7280">
    Browse our exclusive collection of luxury villas and apartments
  </Box>
</Box>
```

## Combining ResponsiveCSSProperties with MotionProps

The real power of the Box component comes from combining responsive CSS properties with motion props for fully adaptive, interactive interfaces:

### Example 13: Complete Responsive Form with Motion States

```tsx
// Full form with responsive layout and interactive feedback
<Box
  as="form"
  maxWidth="600px"
  margin="0 auto"
  padding="1.5rem"
  paddingMd="2rem"
  paddingLg="2.5rem"
  backgroundColor="white"
  borderRadius="1rem"
  boxShadow="0 4px 12px rgba(0,0,0,0.1)"
>
  {/* Form Title with responsive sizing */}
  <Box
    fontSize="1.5rem"
    fontSizeMd="1.75rem"
    fontSizeLg="2rem"
    fontWeight="bold"
    marginBottom="1.5rem"
    textAlign="center"
  >
    Property Registration
  </Box>

  {/* Form Grid with responsive columns */}
  <Box
    display="grid"
    gridTemplateColumns="1fr"              // Single column on mobile
    gridTemplateColumnsMd="repeat(2, 1fr)" // Two columns on medium+
    gap="1rem"
    gapMd="1.5rem"
  >
    {/* Input with responsive sizing and motion states */}
    <Box display="flex" flexDirection="column" gap="0.5rem">
      <Box as="label" fontSize="0.875rem" fontWeight="500" color="#374151">
        First Name *
      </Box>
      <Box
        as="input"
        type="text"
        required
        padding="0.75rem"
        paddingMd="1rem"
        fontSize="0.875rem"
        fontSizeMd="1rem"
        border="2px solid #e5e7eb"
        borderRadius="0.5rem"
        transition="all 0.2s"
        whileFocus={{
          borderColor: '#3182ce',
          outline: 'none',
          Md: {
            borderColor: '#3182ce',
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)',
          }
        }}
        whileHover={{
          borderColor: '#9ca3af',
          Md: {
            borderColor: '#9ca3af',
            backgroundColor: '#f9fafb',
          }
        }}
      />
    </Box>

    {/* Submit Button with responsive sizing and motion */}
    <Box
      gridColumn="1"
      gridColumnMd="1 / -1"
      marginTop="1rem"
    >
      <Box
        as="button"
        type="submit"
        width="100%"
        padding="1rem"
        paddingMd="1.125rem"
        paddingLg="1.25rem"
        fontSize="1rem"
        fontSizeMd="1.125rem"
        fontWeight="600"
        backgroundColor="#3182ce"
        color="white"
        border="none"
        borderRadius="0.5rem"
        cursor="pointer"
        transition="all 0.2s"
        whileHover={{
          backgroundColor: '#2563eb',
          Md: {
            backgroundColor: '#2563eb',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)',
          }
        }}
        whileTap={{
          transform: 'scale(0.98)',
        }}
        whileFocus={{
          outline: 'none',
          boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.3)',
        }}
      >
        Register Property
      </Box>
    </Box>
  </Box>
</Box>
```

### Example 14: Responsive Property Card with Rich Interactions

```tsx
// Property card that combines responsive layout with interactive states
<Box
  display="flex"
  flexDirection="column"
  flexDirectionMd="row"
  backgroundColor="white"
  borderRadius="0.5rem"
  borderRadiusMd="1rem"
  overflow="hidden"
  boxShadow="0 2px 8px rgba(0,0,0,0.1)"
  transition="all 0.3s"
  cursor="pointer"
  whileHover={{
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    Md: {
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      transform: 'translateY(-4px)',
    }
  }}
  whileTap={{
    transform: 'scale(0.98)',
  }}
>
  {/* Image with responsive sizing and hover effect */}
  <Box
    width="100%"
    widthMd="300px"
    height="200px"
    heightMd="250px"
    position="relative"
    overflow="hidden"
  >
    <Box
      as="img"
      src="/villa.jpg"
      alt="Villa"
      width="100%"
      height="100%"
      objectFit="cover"
      transition="transform 0.3s"
      whileHover={{
        transform: 'scale(1.05)',
        Md: {
          transform: 'scale(1.1)',
        }
      }}
    />
    
    {/* Price tag with responsive positioning */}
    <Box
      position="absolute"
      top="1rem"
      right="1rem"
      padding="0.5rem 1rem"
      paddingMd="0.75rem 1.25rem"
      backgroundColor="rgba(0,0,0,0.8)"
      color="white"
      borderRadius="0.5rem"
      fontSize="0.875rem"
      fontSizeMd="1rem"
      fontWeight="600"
    >
      AED 3,500/night
    </Box>
  </Box>

  {/* Content with responsive spacing */}
  <Box
    flex="1"
    padding="1rem"
    paddingMd="1.5rem"
    paddingLg="2rem"
  >
    <Box
      fontSize="1.25rem"
      fontSizeMd="1.5rem"
      fontWeight="bold"
      marginBottom="0.5rem"
      color="#1a202c"
    >
      Beachfront Villa Paradise
    </Box>
    
    <Box
      fontSize="0.875rem"
      fontSizeMd="1rem"
      color="#6b7280"
      marginBottom="1rem"
      lineHeight="1.5"
    >
      Stunning 5-bedroom villa with private beach access and panoramic ocean views
    </Box>

    {/* Amenities with responsive grid */}
    <Box
      display="grid"
      gridTemplateColumns="repeat(2, 1fr)"
      gridTemplateColumnsSm="repeat(3, 1fr)"
      gridTemplateColumnsMd="repeat(2, 1fr)"
      gridTemplateColumnsLg="repeat(3, 1fr)"
      gap="0.5rem"
      marginBottom="1rem"
    >
      {['5 Beds', '4 Baths', 'Pool', 'Beach', 'WiFi', 'Parking'].map(amenity => (
        <Box
          key={amenity}
          padding="0.25rem 0.5rem"
          backgroundColor="#f3f4f6"
          borderRadius="0.25rem"
          fontSize="0.75rem"
          fontSizeMd="0.875rem"
          textAlign="center"
          whileHover={{
            backgroundColor: '#e5e7eb',
            Md: {
              backgroundColor: '#3182ce',
              color: 'white',
            }
          }}
        >
          {amenity}
        </Box>
      ))}
    </Box>

    {/* CTA Button with responsive styling */}
    <Box
      as="button"
      width="100%"
      padding="0.75rem"
      paddingMd="1rem"
      backgroundColor="#10b981"
      color="white"
      border="none"
      borderRadius="0.5rem"
      fontSize="0.875rem"
      fontSizeMd="1rem"
      fontWeight="600"
      cursor="pointer"
      transition="all 0.2s"
      whileHover={{
        backgroundColor: '#059669',
        Md: {
          backgroundColor: '#059669',
          transform: 'scale(1.02)',
        }
      }}
      whileTap={{
        transform: 'scale(0.95)',
      }}
      onClick={(e: Event) => {
        e.stopPropagation();
        // Handle booking
      }}
    >
      Check Availability
    </Box>
  </Box>
</Box>
```

### Example 15: Interactive Dashboard Widget

```tsx
// Dashboard widget with responsive layout and rich interactions
<Box
  backgroundColor="white"
  borderRadius="0.5rem"
  borderRadiusMd="1rem"
  padding="1rem"
  paddingMd="1.5rem"
  paddingLg="2rem"
  boxShadow="0 2px 8px rgba(0,0,0,0.1)"
  position="relative"
  overflow="hidden"
  whileInView={{
    opacity: 1,
    transform: 'translateY(0)',
    Md: {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    }
  }}
  opacity={0}
  transform="translateY(20px)"
  transition="all 0.5s"
>
  {/* Header with responsive text */}
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    marginBottom="1rem"
    marginBottomMd="1.5rem"
  >
    <Box
      fontSize="1rem"
      fontSizeMd="1.125rem"
      fontSizeLg="1.25rem"
      fontWeight="600"
      color="#374151"
    >
      Revenue Overview
    </Box>
    
    {/* Interactive dropdown trigger */}
    <Box
      as="button"
      padding="0.5rem"
      backgroundColor="#f3f4f6"
      border="none"
      borderRadius="0.375rem"
      cursor="pointer"
      fontSize="0.875rem"
      fontSizeMd="1rem"
      whileHover={{
        backgroundColor: '#e5e7eb',
        Md: {
          backgroundColor: '#3182ce',
          color: 'white',
        }
      }}
      whileTap={{
        transform: 'scale(0.9)',
      }}
    >
      This Month ▼
    </Box>
  </Box>

  {/* Stats grid with responsive columns */}
  <Box
    display="grid"
    gridTemplateColumns="1fr"
    gridTemplateColumnsSm="repeat(2, 1fr)"
    gridTemplateColumnsMd="repeat(3, 1fr)"
    gap="1rem"
    gapMd="1.5rem"
  >
    {[
      { label: 'Total Revenue', value: 'AED 125,430', change: '+12%' },
      { label: 'Bookings', value: '48', change: '+8%' },
      { label: 'Occupancy', value: '87%', change: '+5%' }
    ].map((stat, index) => (
      <Box
        key={stat.label}
        padding="1rem"
        backgroundColor="#f9fafb"
        borderRadius="0.5rem"
        transition="all 0.2s"
        whileHover={{
          backgroundColor: '#f3f4f6',
          transform: 'scale(1.02)',
          Md: {
            backgroundColor: '#eff6ff',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box
          fontSize="0.75rem"
          fontSizeMd="0.875rem"
          color="#6b7280"
          marginBottom="0.25rem"
        >
          {stat.label}
        </Box>
        <Box
          fontSize="1.25rem"
          fontSizeMd="1.5rem"
          fontSizeLg="1.75rem"
          fontWeight="bold"
          color="#1a202c"
          marginBottom="0.25rem"
        >
          {stat.value}
        </Box>
        <Box
          fontSize="0.75rem"
          fontSizeMd="0.875rem"
          color="#10b981"
          fontWeight="500"
        >
          {stat.change}
        </Box>
      </Box>
    ))}
  </Box>

  {/* Action buttons with responsive layout */}
  <Box
    display="flex"
    flexDirection="column"
    flexDirectionSm="row"
    gap="0.75rem"
    marginTop="1.5rem"
    marginTopMd="2rem"
  >
    <Box
      as="button"
      flex="1"
      padding="0.75rem"
      paddingMd="1rem"
      backgroundColor="#3182ce"
      color="white"
      border="none"
      borderRadius="0.5rem"
      fontSize="0.875rem"
      fontSizeMd="1rem"
      fontWeight="600"
      cursor="pointer"
      transition="all 0.2s"
      whileHover={{
        backgroundColor: '#2563eb',
        Md: {
          backgroundColor: '#2563eb',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)',
        }
      }}
      whileTap={{
        transform: 'scale(0.95)',
      }}
    >
      View Details
    </Box>
    
    <Box
      as="button"
      flex="1"
      padding="0.75rem"
      paddingMd="1rem"
      backgroundColor="transparent"
      color="#3182ce"
      border="2px solid #3182ce"
      borderRadius="0.5rem"
      fontSize="0.875rem"
      fontSizeMd="1rem"
      fontWeight="600"
      cursor="pointer"
      transition="all 0.2s"
      whileHover={{
        backgroundColor: '#eff6ff',
        Md: {
          backgroundColor: '#3182ce',
          color: 'white',
        }
      }}
      whileTap={{
        transform: 'scale(0.95)',
      }}
    >
      Export Report
    </Box>
  </Box>
</Box>
```

## Best Practices

### 1. Mobile-First Approach
Always define base styles for mobile devices first, then enhance for larger screens:

```tsx
// ✅ Good - Mobile first
<Box
  fontSize="1rem"        // Base mobile size
  fontSizeMd="1.125rem"  // Enhance for medium screens
  fontSizeLg="1.25rem"   // Enhance for large screens
/>

// ❌ Avoid - Desktop first
<Box
  fontSize="1.25rem"     // Large screen size as base
  fontSizeSm="1rem"      // Reducing for smaller screens
/>
```

### 2. Consistent Spacing Scale
Use a consistent spacing scale across all breakpoints:

```tsx
<Box
  padding="1rem"         // 16px on mobile
  paddingSm="1.25rem"    // 20px on small screens
  paddingMd="1.5rem"     // 24px on medium screens
  paddingLg="2rem"       // 32px on large screens
  paddingXl="2.5rem"     // 40px on extra large screens
/>
```

### 3. Logical Breakpoint Progression
Ensure your responsive values make logical sense as screen size increases:

```tsx
<Box
  gridTemplateColumns="1fr"              // 1 column on mobile
  gridTemplateColumnsSm="repeat(2, 1fr)" // 2 columns on small
  gridTemplateColumnsMd="repeat(2, 1fr)" // 2 columns on medium
  gridTemplateColumnsLg="repeat(3, 1fr)" // 3 columns on large
  gridTemplateColumnsXl="repeat(4, 1fr)" // 4 columns on XL
/>
```

### 4. Performance Considerations for Motion
Keep animations lightweight, especially on mobile devices:

```tsx
// ✅ Good - Simple mobile animations, enhanced on desktop
<Box
  whileHover={{
    backgroundColor: '#2563eb',  // Simple color change on mobile
    Md: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-2px)',  // Add transform on larger screens
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',  // Add shadow on desktop
    }
  }}
/>

// ❌ Avoid - Heavy animations on all devices
<Box
  whileHover={{
    transform: 'scale(1.2) rotate(10deg)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    filter: 'blur(2px)',  // Performance-intensive
  }}
/>
```

### 5. Accessibility Considerations
Respect user preferences for reduced motion and ensure interactive elements are accessible:

```tsx
<Box
  transition="all 0.3s"
  whileHover={{
    transform: 'scale(1.05)',
    // Provide alternative feedback for reduced motion
    backgroundColor: '#2563eb',
  }}
  whileFocus={{
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.3)',  // Visible focus indicator
  }}
/>
```

## Integration with Property Rental Features

The Box component's responsive system and motion props are particularly well-suited for property rental applications:

- **Property Cards**: Grid layouts that adapt from single column on mobile to multi-column displays on desktop, with hover effects that preview property details
- **Search Filters**: Horizontal filter bars on desktop that stack vertically on mobile, with interactive feedback for selected filters
- **Property Details**: Image galleries and content that reflow based on screen size, with zoom and pan interactions
- **Booking Forms**: Form layouts that optimize for different input methods (touch vs mouse), with focus states that guide users through the booking process
- **Dashboard Views**: Property management interfaces that adapt to available screen real estate, with hover tooltips and interactive data visualizations
- **Form Elements**: Fully responsive form controls that adapt to screen size and input method, with validation feedback animations

The combination of ResponsiveCSSProperties and MotionProps ensures that your property rental platform provides an optimal user experience across all devices, from mobile property browsing to desktop property management, with interactive elements that respond naturally to user interactions while maintaining performance and accessibility standards.