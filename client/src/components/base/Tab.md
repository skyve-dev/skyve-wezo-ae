# Tab Component

A comprehensive and accessible Tab component that provides smooth navigation between different content sections with animated focus ring transitions. Perfect for organizing content in dashboards, settings panels, and multi-step forms.

## Features

- **Animated Focus Ring**: Smooth sliding animation when switching between tabs
- **Icon & Label Support**: Display icons and labels simultaneously
- **Multiple Variants**: Default, pills, underline, and minimal styles
- **Responsive Design**: Works seamlessly across mobile, tablet, and desktop
- **Accessibility**: Full keyboard navigation and ARIA support
- **Customizable**: Extensive styling and behavior options
- **Badge Support**: Optional notification badges on tabs
- **Orientation Support**: Horizontal and vertical layouts

## Design Rationale

The Tab component was designed with the following principles:

1. **User Experience**: Smooth animations provide clear visual feedback during navigation
2. **Accessibility**: Full ARIA support and keyboard navigation ensure usability for all users
3. **Flexibility**: Multiple variants and customization options for different use cases
4. **Performance**: Optimized animations and efficient re-rendering
5. **Consistency**: Uses the Box component system for consistent styling patterns

## Basic Usage

```tsx
import React, { useState } from 'react'
import Tab, { TabItem } from './Tab'

function BasicExample() {
  const [activeTab, setActiveTab] = useState('tab1')

  const tabs: TabItem[] = [
    {
      id: 'tab1',
      label: 'Overview',
      content: <div>Overview content here</div>
    },
    {
      id: 'tab2',
      label: 'Details',
      content: <div>Details content here</div>
    },
    {
      id: 'tab3',
      label: 'Settings',
      content: <div>Settings content here</div>
    }
  ]

  return (
    <Tab
      items={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )
}
```

## Props

### TabProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabItem[]` | Required | Array of tab items to display |
| `activeTab` | `string` | Required | ID of the currently active tab |
| `onTabChange` | `(tabId: string) => void` | Required | Callback when tab selection changes |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Tab layout orientation |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant for tabs |
| `variant` | `'default' \| 'pills' \| 'underline' \| 'minimal'` | `'default'` | Visual style variant |
| `fullWidth` | `boolean` | `false` | Whether tabs should take full width |
| `className` | `string` | `undefined` | Custom CSS class name |
| `style` | `CSSProperties` | `undefined` | Custom inline styles |
| `animationDuration` | `number` | `200` | Focus ring animation duration (ms) |
| `centered` | `boolean` | `false` | Whether to center tab content |
| `backgroundColor` | `string` | `'transparent'` | Background color for tab container |
| `activeColor` | `string` | `'#3b82f6'` | Color for active tab and focus ring |
| `inactiveColor` | `string` | `'#6b7280'` | Color for inactive tabs |

### TabItem Interface

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the tab |
| `label` | `string` | Display label for the tab |
| `icon` | `ReactNode` | Optional icon component |
| `content` | `ReactNode` | Content to display when tab is active |
| `disabled` | `boolean` | Whether the tab is disabled |
| `badge` | `string \| number` | Optional badge or notification indicator |

## Variants

### Default Variant

The default variant provides a subtle background highlight for the active tab.

```tsx
<Tab
  items={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="default"
/>
```

### Pills Variant

The pills variant creates rounded, filled tabs with a sliding pill animation.

```tsx
<Tab
  items={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pills"
/>
```

### Underline Variant

The underline variant shows a sliding underline indicator below the active tab.

```tsx
<Tab
  items={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="underline"
/>
```

### Minimal Variant

The minimal variant provides the simplest styling with just text emphasis.

```tsx
<Tab
  items={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="minimal"
/>
```

## Examples

### Tabs with Icons

```tsx
import { FaHome, FaUser, FaCog } from 'react-icons/fa'

const tabsWithIcons: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <FaHome />,
    content: <div>Home content</div>
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <FaUser />,
    content: <div>Profile content</div>
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <FaCog />,
    content: <div>Settings content</div>
  }
]

<Tab
  items={tabsWithIcons}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pills"
/>
```

### Tabs with Badges

```tsx
const tabsWithBadges: TabItem[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    badge: 5,
    content: <div>5 new messages</div>
  },
  {
    id: 'drafts',
    label: 'Drafts',
    badge: '2',
    content: <div>2 draft messages</div>
  },
  {
    id: 'sent',
    label: 'Sent',
    content: <div>Sent messages</div>
  }
]

<Tab
  items={tabsWithBadges}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="default"
/>
```

### Vertical Tabs

```tsx
<Tab
  items={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  orientation="vertical"
  variant="pills"
/>
```

### Full Width Tabs

```tsx
<Tab
  items={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  fullWidth
  variant="underline"
/>
```

### Custom Styled Tabs

```tsx
<Tab
  items={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pills"
  size="large"
  activeColor="#10b981"
  inactiveColor="#64748b"
  backgroundColor="#f8fafc"
  animationDuration={300}
/>
```

### Disabled Tabs

```tsx
const tabsWithDisabled: TabItem[] = [
  {
    id: 'available',
    label: 'Available',
    content: <div>Available content</div>
  },
  {
    id: 'disabled',
    label: 'Disabled',
    disabled: true,
    content: <div>This content is not accessible</div>
  },
  {
    id: 'premium',
    label: 'Premium',
    content: <div>Premium content</div>
  }
]

<Tab
  items={tabsWithDisabled}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

## Accessibility Features

- **ARIA Attributes**: Proper `role="tablist"`, `role="tab"`, and `role="tabpanel"`
- **Keyboard Navigation**: 
  - Arrow keys to navigate between tabs
  - Home/End to jump to first/last tab
  - Enter/Space to activate tab
- **Focus Management**: Proper focus indicators and tab sequence
- **Screen Reader Support**: Proper labeling and state announcements

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate between horizontal tabs |
| `↑` / `↓` | Navigate between vertical tabs |
| `Home` | Move to first tab |
| `End` | Move to last tab |
| `Enter` / `Space` | Activate focused tab |

## Animation Details

The Tab component uses CSS transforms for smooth focus ring animations:

- **Movement**: Translates the focus ring to the active tab position
- **Timing**: Uses `cubic-bezier(0.4, 0, 0.2, 1)` for natural motion
- **Duration**: Configurable via `animationDuration` prop (default: 200ms)
- **Performance**: Uses transform properties for hardware acceleration

## Size Configurations

### Small
- Padding: `0.5rem 1rem`
- Font Size: `0.875rem`
- Min Height: `2rem`
- Icon Size: `1rem`

### Medium (Default)
- Padding: `0.75rem 1.5rem`
- Font Size: `1rem`
- Min Height: `2.5rem`
- Icon Size: `1.25rem`

### Large
- Padding: `1rem 2rem`
- Font Size: `1.125rem`
- Min Height: `3rem`
- Icon Size: `1.5rem`

## Best Practices

1. **State Management**: Use controlled state for `activeTab` prop
2. **Content Organization**: Keep tab content focused and related
3. **Label Clarity**: Use clear, descriptive labels for tabs
4. **Icon Consistency**: Use consistent icon styles across tabs
5. **Performance**: Lazy load tab content for better performance
6. **Accessibility**: Always provide meaningful labels and proper ARIA attributes

## Common Patterns

### Settings Panel

```tsx
const settingsTabs: TabItem[] = [
  {
    id: 'general',
    label: 'General',
    icon: <FaCog />,
    content: <GeneralSettings />
  },
  {
    id: 'security',
    label: 'Security',
    icon: <FaLock />,
    content: <SecuritySettings />
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <FaBell />,
    badge: hasNotificationUpdates ? '!' : undefined,
    content: <NotificationSettings />
  }
]
```

### Dashboard Navigation

```tsx
const dashboardTabs: TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <FaChart />,
    content: <DashboardOverview />
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <FaChartLine />,
    content: <AnalyticsView />
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <FaFileAlt />,
    content: <ReportsView />
  }
]
```

### Form Steps

```tsx
const formSteps: TabItem[] = [
  {
    id: 'personal',
    label: 'Personal Info',
    content: <PersonalInfoForm />,
    disabled: false
  },
  {
    id: 'contact',
    label: 'Contact',
    content: <ContactForm />,
    disabled: !personalInfoComplete
  },
  {
    id: 'review',
    label: 'Review',
    content: <ReviewForm />,
    disabled: !contactInfoComplete
  }
]
```

## Integration with Forms

The Tab component works well with form libraries and validation:

```tsx
import { useForm } from 'react-hook-form'

function FormWithTabs() {
  const [activeTab, setActiveTab] = useState('step1')
  const { register, handleSubmit, trigger, formState: { errors } } = useForm()

  const handleTabChange = async (tabId: string) => {
    // Validate current tab before switching
    const isValid = await trigger()
    if (isValid || tabId === 'step1') {
      setActiveTab(tabId)
    }
  }

  const tabs: TabItem[] = [
    {
      id: 'step1',
      label: 'Step 1',
      content: <Step1Form register={register} errors={errors} />
    },
    {
      id: 'step2',
      label: 'Step 2',
      content: <Step2Form register={register} errors={errors} />
    }
  ]

  return (
    <Tab
      items={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      variant="underline"
    />
  )
}
```

## Performance Considerations

- **Lazy Loading**: Consider lazy loading tab content for better initial load performance
- **Memoization**: Use `React.memo` for tab content components that don't change frequently
- **Animation**: The focus ring animation is optimized for performance using transforms
- **Event Handlers**: Event handlers are optimized to prevent unnecessary re-renders

## Browser Support

The Tab component supports all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

CSS transforms and transitions are well-supported across these browsers for smooth animations.