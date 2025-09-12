import React from 'react'
import { IoIosHelpCircle, IoIosMail, IoIosWarning } from 'react-icons/io'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { setShowNewMessageDrawer } from '@/store/slices/messageSlice'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import { useAppShell } from '@/components/base/AppShell'
import NewMessageDrawer from '@/components/messaging/NewMessageDrawer'

// Support Component
const Support: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { navigateTo } = useAppShell()

    const handleContactSupport = () => {
        // Navigate to inbox
        navigateTo('inbox', {})
        
        // Open new message drawer with support pre-selected
        // Note: The NewMessageDrawer will auto-select support when type is 'support'
        dispatch(setShowNewMessageDrawer(true))
    }

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                {/* Demo Page Notice */}
                <Box 
                    padding="1rem" 
                    backgroundColor="#fef3c7" 
                    border="1px solid #fde68a"
                    borderRadius="8px" 
                    marginBottom="2rem"
                >
                    <p style={{ color: '#92400e', fontWeight: '600', margin: 0 }}>
                        This page is a demo page
                    </p>
                </Box>

                <Box marginBottom="2rem">
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Partner Support</h1>
                    <p style={{color: '#666'}}>Get help and access resources</p>
                </Box>

                {/* Quick Links */}
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1.5rem" marginBottom="2rem">
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)" cursor="pointer">
                        <IoIosHelpCircle style={{fontSize: '2rem', color: '#6366f1', marginBottom: '1rem'}} />
                        <h3 style={{fontSize: '1.125rem', margin: '0 0 0.5rem 0'}}>FAQs</h3>
                        <p style={{color: '#666', margin: 0, fontSize: '0.875rem'}}>Find answers to common questions</p>
                    </Box>
                    <Box 
                        padding="1.5rem" 
                        backgroundColor="white" 
                        borderRadius="8px" 
                        boxShadow="0 2px 4px rgba(0,0,0,0.1)" 
                        cursor="pointer"
                        onClick={handleContactSupport}
                        style={{ transition: 'all 0.2s' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        <IoIosMail style={{fontSize: '2rem', color: '#10b981', marginBottom: '1rem'}} />
                        <h3 style={{fontSize: '1.125rem', margin: '0 0 0.5rem 0'}}>Contact Support</h3>
                        <p style={{color: '#666', margin: 0, fontSize: '0.875rem'}}>Get in touch with our support team via messages</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)" cursor="pointer">
                        <IoIosWarning style={{fontSize: '2rem', color: '#ef4444', marginBottom: '1rem'}} />
                        <h3 style={{fontSize: '1.125rem', margin: '0 0 0.5rem 0'}}>Report Security Issue</h3>
                        <p style={{color: '#666', margin: 0, fontSize: '0.875rem'}}>Report security breaches or suspicious activity</p>
                    </Box>
                </Box>

                {/* Partner Hub Articles */}
                <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                    <h3 style={{marginBottom: '1.5rem'}}>Partner Hub - Popular Articles</h3>
                    <Box display="grid" gap="1rem">
                        {[
                            "How to optimize your listing for more bookings",
                            "Understanding the commission structure",
                            "Best practices for guest communication",
                            "Managing cancellations and refunds",
                            "Photo guidelines and requirements"
                        ].map((article, index) => (
                            <Box key={index} padding="1rem" backgroundColor="#f9fafb" borderRadius="4px" cursor="pointer">
                                <p style={{margin: 0, color: '#6366f1'}}>{article}</p>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Emergency Contact */}
                <Box marginTop="2rem" padding="1.5rem" backgroundColor="#fef3c7" borderRadius="8px">
                    <Box display="flex" alignItems="center">
                        <IoIosWarning style={{color: '#f59e0b', marginRight: '1rem', fontSize: '1.5rem'}} />
                        <Box>
                            <p style={{margin: '0 0 0.5rem 0', fontWeight: '600'}}>24/7 Emergency Support</p>
                            <p style={{margin: 0, color: '#92400e'}}>For urgent issues, call: +971 4 123 4567</p>
                        </Box>
                    </Box>
                </Box>

                {/* New Message Drawer for support messaging */}
                <NewMessageDrawer />
            </Box>
        </SecuredPage>
    )
}

export default Support