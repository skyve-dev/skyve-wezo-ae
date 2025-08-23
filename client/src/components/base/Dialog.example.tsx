import React, { useState } from 'react'
import Dialog from './Dialog'
import { Button } from './Button'
import { Box } from './Box'
import { Input } from './Input'

const DialogExample: React.FC = () => {
    // State for different dialog types
    const [basicDialog, setBasicDialog] = useState(false)
    const [alertDialog, setAlertDialog] = useState(false)
    const [formDialog, setFormDialog] = useState(false)
    const [customDialog, setCustomDialog] = useState(false)
    const [loadingDialog, setLoadingDialog] = useState(false)
    const [confirmDialog, setConfirmDialog] = useState(false)
    const [sizedDialog, setSizedDialog] = useState(false)
    const [noBackdropDialog, setNoBackdropDialog] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        email: ''
    })

    // Simulate loading
    const handleLoading = () => {
        setLoadingDialog(true)
        setTimeout(() => {
            setLoadingDialog(false)
        }, 3000)
    }

    // Form handlers
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        setFormDialog(false)
        setFormData({ title: '', description: '', email: '' })
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Box padding="2rem" maxWidth="1200px" margin="0 auto">
            <Box marginBottom="2rem">
                <h1 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: 'bold' }}>
                    Dialog Component Examples
                </h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    Interactive examples showcasing different Dialog component configurations and use cases.
                </p>
            </Box>

            {/* Basic Examples Grid */}
            <Box 
                display="grid" 
                gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" 
                gap="1.5rem"
                marginBottom="3rem"
            >
                {/* Basic Dialog */}
                <Box 
                    padding="1.5rem" 
                    border="1px solid #e5e7eb" 
                    borderRadius="8px"
                    backgroundColor="white"
                >
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Basic Dialog</h3>
                    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        Simple dialog with default settings and content.
                    </p>
                    <Button 
                        label="Open Basic Dialog"
                        onClick={() => setBasicDialog(true)}
                        variant="promoted"
                        width="100%"
                    />
                </Box>

                {/* Alert Dialog */}
                <Box 
                    padding="1.5rem" 
                    border="1px solid #e5e7eb" 
                    borderRadius="8px"
                    backgroundColor="white"
                >
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Alert Dialog</h3>
                    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        Warning dialog with action buttons and close button.
                    </p>
                    <Button 
                        label="Show Alert"
                        onClick={() => setAlertDialog(true)}
                        variant="normal"
                        width="100%"
                    />
                </Box>

                {/* Form Dialog */}
                <Box 
                    padding="1.5rem" 
                    border="1px solid #e5e7eb" 
                    borderRadius="8px"
                    backgroundColor="white"
                >
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Form Dialog</h3>
                    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        Dialog containing a form with backdrop click disabled.
                    </p>
                    <Button 
                        label="Open Form"
                        onClick={() => setFormDialog(true)}
                        variant="promoted"
                        width="100%"
                    />
                </Box>

                {/* Custom Styled Dialog */}
                <Box 
                    padding="1.5rem" 
                    border="1px solid #e5e7eb" 
                    borderRadius="8px"
                    backgroundColor="white"
                >
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Custom Styled</h3>
                    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        Dark themed dialog with custom colors and animations.
                    </p>
                    <Button 
                        label="Open Custom Dialog"
                        onClick={() => setCustomDialog(true)}
                        variant="normal"
                        width="100%"
                    />
                </Box>

                {/* Loading Dialog */}
                <Box 
                    padding="1.5rem" 
                    border="1px solid #e5e7eb" 
                    borderRadius="8px"
                    backgroundColor="white"
                >
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Loading Dialog</h3>
                    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        Non-closable dialog for loading states.
                    </p>
                    <Button 
                        label="Start Loading"
                        onClick={handleLoading}
                        variant="promoted"
                        width="100%"
                    />
                </Box>

                {/* Confirmation Dialog */}
                <Box 
                    padding="1.5rem" 
                    border="1px solid #e5e7eb" 
                    borderRadius="8px"
                    backgroundColor="white"
                >
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Confirmation</h3>
                    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        Destructive action confirmation dialog.
                    </p>
                    <Button 
                        label="Delete Item"
                        onClick={() => setConfirmDialog(true)}
                        variant="normal"
                        width="100%"
                        whileHover={{
                            background : 'white',
                            color : '#dc2626'
                        }}
                        style={{ backgroundColor: '#dc2626', color: 'white' }}
                    />
                </Box>

                {/* Sized Dialog */}
                <Box 
                    padding="1.5rem" 
                    border="1px solid #e5e7eb" 
                    borderRadius="8px"
                    backgroundColor="white"
                >
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Large Dialog</h3>
                    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        Dialog with custom width and height dimensions.
                    </p>
                    <Button 
                        label="Open Large Dialog"
                        onClick={() => setSizedDialog(true)}
                        variant="promoted"
                        width="100%"
                    />
                </Box>

                {/* No Backdrop Dialog */}
                <Box 
                    padding="1.5rem" 
                    border="1px solid #e5e7eb" 
                    borderRadius="8px"
                    backgroundColor="white"
                >
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>No Backdrop Click</h3>
                    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        Dialog that ignores backdrop clicks and escape key.
                    </p>
                    <Button 
                        label="Open Modal Dialog"
                        onClick={() => setNoBackdropDialog(true)}
                        variant="normal"
                        width="100%"
                    />
                </Box>
            </Box>

            {/* Dialog Implementations */}

            {/* Basic Dialog */}
            <Dialog
                isOpen={basicDialog}
                onClose={() => setBasicDialog(false)}
                width="400px"
            >
                <Box padding="2rem" textAlign="center">
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
                        Hello Dialog! 👋
                    </h2>
                    <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
                        This is a basic dialog example with default settings. You can close it by clicking the backdrop, pressing Escape, or using the button below.
                    </p>
                    <Button 
                        label="Close Dialog"
                        onClick={() => setBasicDialog(false)}
                        variant="promoted"
                    />
                </Box>
            </Dialog>

            {/* Alert Dialog */}
            <Dialog
                isOpen={alertDialog}
                onClose={() => setAlertDialog(false)}
                width="450px"
                showCloseButton
            >
                <Box padding="2rem" textAlign="center">
                    <Box 
                        fontSize="3rem" 
                        marginBottom="1rem"
                        color="#ef4444"
                    >
                        ⚠️
                    </Box>
                    <h2 style={{ 
                        marginBottom: '1rem', 
                        fontSize: '1.5rem',
                        color: '#ef4444'
                    }}>
                        Warning
                    </h2>
                    <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
                        This action cannot be undone. Are you sure you want to continue with this operation?
                    </p>
                    <Box display="flex" gap="1rem" justifyContent="center">
                        <Button 
                            label="Cancel"
                            onClick={() => setAlertDialog(false)}
                            variant="normal"
                        />
                        <Button 
                            label="Continue"
                            onClick={() => {
                                console.log('Action confirmed')
                                setAlertDialog(false)
                            }}
                            variant="promoted"
                            style={{ backgroundColor: '#ef4444' }}
                        />
                    </Box>
                </Box>
            </Dialog>

            {/* Form Dialog */}
            <Dialog
                isOpen={formDialog}
                onClose={() => setFormDialog(false)}
                width="500px"
                maxHeight="80vh"
                disableBackdropClick
            >
                <Box padding="2rem">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                        Create New Item
                    </h2>
                    <form onSubmit={handleFormSubmit}>
                        <Box marginBottom="1rem">
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '0.5rem',
                                fontWeight: '500'
                            }}>
                                Title *
                            </label>
                            <Input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Enter title..."
                                required
                                width="100%"
                            />
                        </Box>
                        
                        <Box marginBottom="1rem">
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '0.5rem',
                                fontWeight: '500'
                            }}>
                                Email *
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter email..."
                                required
                                width="100%"
                            />
                        </Box>
                        
                        <Box marginBottom="2rem">
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '0.5rem',
                                fontWeight: '500'
                            }}>
                                Description
                            </label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Enter description..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </Box>
                        
                        <Box display="flex" gap="1rem" justifyContent="flex-end">
                            <Button 
                                type="button"
                                label="Cancel"
                                onClick={() => setFormDialog(false)}
                                variant="normal"
                            />
                            <Button 
                                type="submit"
                                label="Create Item"
                                variant="promoted"
                            />
                        </Box>
                    </form>
                </Box>
            </Dialog>

            {/* Custom Styled Dialog */}
            <Dialog
                isOpen={customDialog}
                onClose={() => setCustomDialog(false)}
                width="600px"
                backgroundColor="#1f2937"
                backdropColor="rgba(0, 0, 0, 0.8)"
                animationDuration={500}
                contentStyles={{
                    border: '2px solid #374151',
                    borderRadius: '12px'
                }}
            >
                <Box 
                    padding="2rem"
                    color="white"
                    background="linear-gradient(135deg, #1f2937, #374151)"
                    borderRadius="12px"
                >
                    <h2 style={{ 
                        marginBottom: '1rem', 
                        fontSize: '1.5rem',
                        background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        🌟 Custom Dark Dialog
                    </h2>
                    <p style={{ marginBottom: '1.5rem', color: '#d1d5db' }}>
                        This dialog showcases custom styling with a dark theme, gradient backgrounds, 
                        longer animation duration (500ms), and custom border styling.
                    </p>
                    <Box 
                        padding="1rem"
                        backgroundColor="rgba(55, 65, 81, 0.5)"
                        borderRadius="8px"
                        marginBottom="1.5rem"
                        border="1px solid #4b5563"
                    >
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                            💡 <strong>Features:</strong> Extended animation, custom colors, 
                            gradient backgrounds, and enhanced backdrop opacity.
                        </p>
                    </Box>
                    <Button 
                        label="Close Dialog"
                        onClick={() => setCustomDialog(false)}
                        variant="promoted"
                        style={{
                            background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                            border: 'none'
                        }}
                    />
                </Box>
            </Dialog>

            {/* Loading Dialog */}
            <Dialog
                isOpen={loadingDialog}
                onClose={() => {}} // Prevent closing during loading
                width="300px"
                disableBackdropClick
                disableEscapeKey
            >
                <Box 
                    padding="3rem"
                    textAlign="center"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap="1rem"
                >
                    <Box
                        width="40px"
                        height="40px"
                        border="4px solid #f3f4f6"
                        borderTop="4px solid #3b82f6"
                        borderRadius="50%"
                        animation="spin 1s linear infinite"
                        style={{
                            animation: 'spin 1s linear infinite'
                        }}
                    />
                    <p style={{ color: '#6b7280', fontWeight: '500' }}>
                        Loading...
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        Please wait while we process your request
                    </p>
                </Box>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                width="400px"
            >
                <Box padding="2rem" textAlign="center">
                    <Box 
                        fontSize="2.5rem" 
                        marginBottom="1rem"
                        color="#dc2626"
                    >
                        🗑️
                    </Box>
                    <h2 style={{ 
                        marginBottom: '1rem', 
                        fontSize: '1.25rem',
                        color: '#dc2626'
                    }}>
                        Delete Item
                    </h2>
                    <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
                        Are you sure you want to delete this item? This action cannot be undone 
                        and will permanently remove all associated data.
                    </p>
                    <Box display="flex" gap="1rem" justifyContent="center">
                        <Button 
                            label="Cancel"
                            onClick={() => setConfirmDialog(false)}
                            variant="normal"
                        />
                        <Button 
                            label="Delete"
                            onClick={() => {
                                console.log('Item deleted')
                                setConfirmDialog(false)
                            }}
                            variant="promoted"
                            whileHover={{
                                backgroundColor:'white',
                                color : '#dc2626'
                            }}
                            style={{ backgroundColor: '#dc2626',color:'white' }}
                        />
                    </Box>
                </Box>
            </Dialog>

            {/* Large Sized Dialog */}
            <Dialog
                isOpen={sizedDialog}
                onClose={() => setSizedDialog(false)}
                width="800px"
                height="600px"
                maxWidth="95vw"
                maxHeight="95vh"
                showCloseButton
            >
                <Box padding="2rem" height="100%" overflow="auto">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                        Large Content Dialog
                    </h2>
                    
                    <Box marginBottom="2rem">
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                            Features Demonstrated
                        </h3>
                        <ul style={{ marginLeft: '1.5rem', color: '#6b7280' }}>
                            <li>Custom width (800px) and height (600px)</li>
                            <li>Responsive maximum dimensions (95vw/95vh)</li>
                            <li>Built-in close button</li>
                            <li>Scrollable content when needed</li>
                            <li>Proper spacing and typography</li>
                        </ul>
                    </Box>

                    <Box 
                        padding="1.5rem"
                        backgroundColor="#f9fafb"
                        borderRadius="8px"
                        marginBottom="2rem"
                        border="1px solid #e5e7eb"
                    >
                        <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>
                            Sample Content Section
                        </h4>
                        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                            This dialog demonstrates how content flows within a larger dialog. 
                            The content area is scrollable when it exceeds the dialog height, 
                            ensuring accessibility and usability across different screen sizes.
                        </p>
                        <p style={{ color: '#6b7280' }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </Box>

                    <Box display="flex" justifyContent="flex-end">
                        <Button 
                            label="Close Large Dialog"
                            onClick={() => setSizedDialog(false)}
                            variant="promoted"
                        />
                    </Box>
                </Box>
            </Dialog>

            {/* No Backdrop Click Dialog */}
            <Dialog
                isOpen={noBackdropDialog}
                onClose={() => setNoBackdropDialog(false)}
                width="450px"
                disableBackdropClick
                disableEscapeKey
            >
                <Box padding="2rem" textAlign="center">
                    <Box 
                        fontSize="2rem" 
                        marginBottom="1rem"
                        color="#f59e0b"
                    >
                        🔒
                    </Box>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
                        Modal Dialog
                    </h2>
                    <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
                        This dialog cannot be closed by clicking the backdrop or pressing Escape. 
                        You must use the button below to close it.
                    </p>
                    <Box 
                        padding="1rem"
                        backgroundColor="#fef3c7"
                        borderRadius="8px"
                        marginBottom="2rem"
                        border="1px solid #f59e0b"
                    >
                        <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                            💡 This is useful for critical actions, forms, or loading states 
                            where accidental dismissal should be prevented.
                        </p>
                    </Box>
                    <Button 
                        label="Close Modal"
                        onClick={() => setNoBackdropDialog(false)}
                        variant="promoted"
                    />
                </Box>
            </Dialog>

            {/* CSS for spinner animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </Box>
    )
}

export default DialogExample