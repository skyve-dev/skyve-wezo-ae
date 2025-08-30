import React from 'react'
import { FaSignOutAlt } from 'react-icons/fa'
import { useAppDispatch } from '@/store'
import { logout } from '@/store/slices/authSlice.ts'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Landing Page Component
const LandingPage: React.FC = () => {

    const dispatch = useAppDispatch()
    const handleLogout = () => {
        dispatch(logout())
    }

    return (
        <SecuredPage>
            <Box padding="2rem" textAlign="center" maxWidth="800px" margin="0 auto">
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

                <Box marginBottom="3rem">
                    <h1 style={{fontSize: '3rem', fontWeight: 'bold', margin: '0 0 1rem 0', color: '#1a202c'}}>
                        Welcome to Wezo.ae
                    </h1>
                    <p style={{fontSize: '1.25rem', color: '#4a5568', margin: '0 0 2rem 0', lineHeight: '1.6'}}>
                        Your premier destination for villa rentals in the UAE. Discover luxury accommodations
                        and unforgettable experiences across the Emirates.
                    </p>
                </Box>

                <Box display="flex" flexDirection="column" alignItems="center" gap="2rem">
                    <Box padding="2rem" backgroundColor="#f0fdf4" borderRadius="8px" border="2px solid #22c55e">
                        <p style={{fontSize: '1.125rem', color: '#15803d', margin: 0, fontWeight: '600'}}>
                            🎉 Welcome back! You're successfully signed in.
                        </p>
                    </Box>
                    <Button
                        label="Sign Out"
                        icon={<FaSignOutAlt/>}
                        onClick={handleLogout}
                        variant="normal"
                        size="medium"
                    />
                </Box>

                <Box marginTop="4rem" display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                     gap="2rem">
                    <Box padding="2rem" backgroundColor="white" borderRadius="8px"
                         boxShadow="0 2px 8px rgba(0,0,0,0.1)">
                        <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0', color: '#1a202c'}}>
                            Luxury Villas
                        </h3>
                        <p style={{color: '#4a5568', margin: 0, lineHeight: '1.5'}}>
                            Browse our collection of premium villas across Dubai, Abu Dhabi, and beyond.
                        </p>
                    </Box>
                    <Box padding="2rem" backgroundColor="white" borderRadius="8px"
                         boxShadow="0 2px 8px rgba(0,0,0,0.1)">
                        <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0', color: '#1a202c'}}>
                            Easy Booking
                        </h3>
                        <p style={{color: '#4a5568', margin: 0, lineHeight: '1.5'}}>
                            Simple and secure booking process with instant confirmation and 24/7 support.
                        </p>
                    </Box>
                    <Box padding="2rem" backgroundColor="white" borderRadius="8px"
                         boxShadow="0 2px 8px rgba(0,0,0,0.1)">
                        <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0', color: '#1a202c'}}>
                            Best Prices
                        </h3>
                        <p style={{color: '#4a5568', margin: 0, lineHeight: '1.5'}}>
                            Competitive rates and exclusive deals on the finest properties in the UAE.
                        </p>
                    </Box>
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default LandingPage