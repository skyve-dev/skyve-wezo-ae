# Dialog Component

A flexible Dialog component that creates an overlay interface appearing in the center of the screen with smooth scale animations. The Dialog component is perfect for alerts, confirmations, forms, and other modal interactions.

## Features

- **Centered Overlay**: Appears in the center of the screen with a backdrop
- **Scale Animations**: Smooth scale-in/scale-out animations for entry and exit
- **Scroll Control**: Automatically prevents body scrolling when open
- **Portal Rendering**: Uses React Portal for proper z-index layering
- **Accessibility**: Full keyboard navigation and ARIA support
- **Customizable**: Extensive styling and behavior customization options
- **Focus Management**: Automatically manages focus for accessibility

## Design Rationale

The Dialog component was designed with the following principles:

1. **User Experience**: Smooth animations provide visual feedback and maintain context
2. **Accessibility**: Full ARIA support and keyboard navigation ensure usability for all users
3. **Performance**: Uses React Portal and optimized animations for smooth performance
4. **Flexibility**: Extensive customization options while maintaining sensible defaults
5. **Consistency**: Uses the Box component system for consistent styling patterns

## Basic Usage

```tsx
import React, { useState } from 'react'
import Dialog from './Dialog'
import { Button } from './Button'

function BasicExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        label="Open Dialog" 
        onClick={() => setIsOpen(true)} 
      />
      
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div style={{ padding: '2rem' }}>
          <h2>Hello Dialog!</h2>
          <p>This is a basic dialog example.</p>
        </div>
      </Dialog>
    </>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | Required | Controls the dialog's visibility |
| `onClose` | `() => void` | Required | Callback when dialog should close |
| `children` | `ReactNode` | Required | Content to render inside the dialog |
| `width` | `string` | `'auto'` | Dialog width |
| `height` | `string` | `'auto'` | Dialog height |
| `maxWidth` | `string` | `'90vw'` | Maximum dialog width |
| `maxHeight` | `string` | `'90vh'` | Maximum dialog height |
| `zIndex` | `number` | `9999` | Z-index for the dialog |
| `backdropColor` | `string` | `'rgba(0, 0, 0, 0.5)'` | Backdrop overlay color |
| `backgroundColor` | `string` | `'white'` | Dialog background color |
| `animationDuration` | `number` | `300` | Animation duration in milliseconds |
| `disableBackdropClick` | `boolean` | `false` | Disable closing on backdrop click |
| `disableEscapeKey` | `boolean` | `false` | Disable closing with Escape key |
| `className` | `string` | `undefined` | Custom CSS class name |
| `contentStyles` | `CSSProperties` | `{}` | Additional inline styles |
| `showCloseButton` | `boolean` | `false` | Show default close button |
| `closeButton` | `ReactNode` | `undefined` | Custom close button component |
| `portalId` | `string` | `'dialog-root'` | Portal container ID |

## Examples

### Alert Dialog

```tsx
<Dialog
  isOpen={isAlertOpen}
  onClose={() => setIsAlertOpen(false)}
  width="400px"
  showCloseButton
>
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>
      ⚠️ Warning
    </h2>
    <p style={{ marginBottom: '2rem' }}>
      This action cannot be undone. Are you sure you want to continue?
    </p>
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      <Button 
        label="Cancel" 
        variant="normal" 
        onClick={() => setIsAlertOpen(false)} 
      />
      <Button 
        label="Confirm" 
        variant="primary" 
        onClick={handleConfirm} 
      />
    </div>
  </div>
</Dialog>
```

### Form Dialog

```tsx
<Dialog
  isOpen={isFormOpen}
  onClose={() => setIsFormOpen(false)}
  width="500px"
  maxHeight="80vh"
  disableBackdropClick
>
  <div style={{ padding: '2rem' }}>
    <h2 style={{ marginBottom: '1.5rem' }}>Create New Item</h2>
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label>Title</label>
        <input 
          type="text" 
          style={{ width: '100%', padding: '0.5rem' }}
          placeholder="Enter title..."
        />
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <label>Description</label>
        <textarea 
          style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
          placeholder="Enter description..."
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <Button 
          type="button"
          label="Cancel" 
          variant="normal" 
          onClick={() => setIsFormOpen(false)} 
        />
        <Button 
          type="submit"
          label="Create" 
          variant="primary" 
        />
      </div>
    </form>
  </div>
</Dialog>
```

### Custom Styled Dialog

```tsx
<Dialog
  isOpen={isCustomOpen}
  onClose={() => setIsCustomOpen(false)}
  width="600px"
  backgroundColor="#1f2937"
  backdropColor="rgba(0, 0, 0, 0.8)"
  animationDuration={500}
  contentStyles={{
    border: '2px solid #374151',
    borderRadius: '12px'
  }}
>
  <div style={{ 
    padding: '2rem', 
    color: 'white',
    background: 'linear-gradient(135deg, #1f2937, #374151)'
  }}>
    <h2 style={{ marginBottom: '1rem' }}>Custom Dark Dialog</h2>
    <p>This dialog has custom styling and longer animations.</p>
  </div>
</Dialog>
```

## Accessibility Features

- **ARIA Attributes**: Proper `role="dialog"` and `aria-modal="true"`
- **Focus Management**: Automatically focuses dialog and restores previous focus
- **Keyboard Navigation**: Escape key support (configurable)
- **Screen Reader Support**: Proper labeling and structure

## Animation Details

The Dialog uses CSS transforms and opacity for smooth animations:

- **Entry**: Scales from 0.8 to 1.0 with opacity fade-in
- **Exit**: Scales from 1.0 to 0.8 with opacity fade-out
- **Timing**: Uses `cubic-bezier(0.4, 0, 0.2, 1)` for natural motion
- **Duration**: Configurable via `animationDuration` prop

## Portal System

The Dialog uses React Portal for rendering:

- **Container**: Creates or uses existing portal container
- **Z-Index Management**: Proper layering with backdrop and content
- **Cleanup**: Automatically cleans up portal on unmount

## Scroll Management

The Dialog prevents body scrolling using the same system as SlidingDrawer:

- **Disable**: Adds CSS to prevent scrolling when open
- **Enable**: Removes CSS to restore scrolling when closed
- **Cleanup**: Ensures scrolling is restored on unmount

## Best Practices

1. **State Management**: Use controlled state for `isOpen` prop
2. **Event Handlers**: Always provide `onClose` callback
3. **Content Structure**: Wrap content in proper semantic HTML
4. **Form Handling**: Use `disableBackdropClick` for forms to prevent accidental closure
5. **Accessibility**: Include proper headings and labels within dialog content
6. **Performance**: Avoid heavy content or complex layouts within dialogs

## Common Patterns

### Confirmation Dialog

```tsx
const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  const confirm = (options: typeof config) => {
    setConfig(options)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setConfig(null)
  }

  const ConfirmDialog = config ? (
    <Dialog isOpen={isOpen} onClose={handleClose} width="400px">
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>{config.title}</h3>
        <p>{config.message}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button label="Cancel" onClick={handleClose} />
          <Button 
            label="Confirm" 
            variant="primary" 
            onClick={() => {
              config.onConfirm()
              handleClose()
            }} 
          />
        </div>
      </div>
    </Dialog>
  ) : null

  return { confirm, ConfirmDialog }
}
```

### Loading Dialog

```tsx
<Dialog
  isOpen={isLoading}
  onClose={() => {}} // Prevent closing during loading
  width="300px"
  disableBackdropClick
  disableEscapeKey
>
  <div style={{ 
    padding: '3rem', 
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <div className="spinner" />
    <p>Loading...</p>
  </div>
</Dialog>
```

## Integration with Form Libraries

The Dialog works well with form libraries like Formik or React Hook Form:

```tsx
import { useForm } from 'react-hook-form'

function FormDialog({ isOpen, onClose, onSubmit }) {
  const { register, handleSubmit, reset } = useForm()

  const handleFormSubmit = (data) => {
    onSubmit(data)
    reset()
    onClose()
  }

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      disableBackdropClick
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Form fields */}
      </form>
    </Dialog>
  )
}
```