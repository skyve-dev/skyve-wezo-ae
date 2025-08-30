import React, { useEffect } from 'react'
import { FaHome, FaSearch, FaHeart, FaStar } from 'react-icons/fa'
import { Box } from './Box'
import { Button } from './Button'

interface WelcomeModalProps {
    /**
     * User's first name for personalization
     */
    userName?: string
    
    /**
     * Callback when user clicks "Start Browsing"
     */
    onStartBrowsing: () => void
    
    /**
     * Callback when user clicks "Maybe Later" 
     */
    onMaybeLater: () => void
    
    /**
     * Whether to auto-dismiss after 10 seconds
     */
    autoDismiss?: boolean
    
    /**
     * Auto-dismiss duration in milliseconds (default: 10000)
     */
    autoDismissDelay?: number
}

/**
 * Welcome Modal Component
 * 
 * Shown to new Tenant users to explain browsing features and encourage exploration.
 * Auto-dismisses after 10 seconds or user can manually interact.
 * 
 * Features:
 * - Personalized greeting with user name
 * - Feature highlights with icons
 * - "Start Browsing" and "Maybe Later" actions
 * - Auto-dismiss with countdown (optional)
 * - Responsive design
 * - Welcoming color scheme
 * 
 * @example
 * ```tsx
 * const WelcomeModal = () => {
 *   return (
 *     <WelcomeModal
 *       userName="John"
 *       onStartBrowsing={() => navigateTo('properties', {})}
 *       onMaybeLater={() => setShowWelcome(false)}
 *       autoDismiss={true}
 *     />
 *   )
 * }
 * ```
 */
const WelcomeModal: React.FC<WelcomeModalProps> = ({
    userName,
    onStartBrowsing,
    onMaybeLater,
    autoDismiss = true,
    autoDismissDelay = 10000
}) => {
    // Handle auto-dismiss
    useEffect(() => {
        if (autoDismiss) {
            const timer = setTimeout(() => {
                onMaybeLater()
            }, autoDismissDelay)

            return () => clearTimeout(timer)
        }
    }, [autoDismiss, autoDismissDelay, onMaybeLater])

    // Get personalized greeting
    const getGreeting = () => {
        if (userName) {
            return `Welcome to Wezo.ae, ${userName}!`
        }
        return "Welcome to Wezo.ae!"
    }

    // Feature highlights
    const features = [
        {
            icon: <FaSearch style={{ color: '#3b82f6' }} />,
            title: "Discover Properties",
            description: "Browse amazing villas and properties across the UAE"
        },
        {
            icon: <FaHeart style={{ color: '#ef4444' }} />,
            title: "Save Favorites",
            description: "Bookmark properties you love for quick access later"
        },
        {
            icon: <FaStar style={{ color: '#f59e0b' }} />,
            title: "Read Reviews",
            description: "See what other guests say about their experiences"
        },
        {
            icon: <FaHome style={{ color: '#059669' }} />,
            title: "Book Instantly",
            description: "Secure your perfect stay with just a few clicks"
        }
    ]

    return (
        <Box
            padding="0"
            borderRadius="16px"
            backgroundColor="white"
            boxShadow="0 25px 60px rgba(0, 0, 0, 0.15)"
            minWidth="400px"
            maxWidth="500px"
            overflow="hidden"
        >
            {/* Header with Brand Colors */}
            <Box
                padding="2rem 2rem 1.5rem 2rem"
                background="linear-gradient(135deg, #D52122 0%, #ff4444 100%)"
                color="white"
                textAlign="center"
            >
                {/* Welcome Title */}
                <Box
                    fontSize="1.75rem"
                    fontWeight="700"
                    marginBottom="0.5rem"
                    lineHeight="1.2"
                >
                    {getGreeting()}
                </Box>

                {/* Subtitle */}
                <Box
                    fontSize="1rem"
                    opacity={0.9}
                    lineHeight="1.4"
                >
                    Your gateway to exceptional properties and unforgettable stays
                </Box>
            </Box>

            {/* Content */}
            <Box padding="1.5rem 2rem">
                {/* Features Grid */}
                <Box
                    display="grid"
                    gridTemplateColumns="1fr 1fr"
                    gap="1.25rem"
                    marginBottom="2rem"
                >
                    {features.map((feature, index) => (
                        <Box
                            key={index}
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            textAlign="center"
                            padding="1rem"
                            borderRadius="12px"
                            backgroundColor="#f8fafc"
                            border="1px solid #e2e8f0"
                        >
                            {/* Feature Icon */}
                            <Box
                                fontSize="1.5rem"
                                marginBottom="0.75rem"
                            >
                                {feature.icon}
                            </Box>

                            {/* Feature Title */}
                            <Box
                                fontSize="0.875rem"
                                fontWeight="600"
                                color="#1f2937"
                                marginBottom="0.5rem"
                                lineHeight="1.2"
                            >
                                {feature.title}
                            </Box>

                            {/* Feature Description */}
                            <Box
                                fontSize="0.75rem"
                                color="#6b7280"
                                lineHeight="1.3"
                            >
                                {feature.description}
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Call to Action */}
                <Box textAlign="center" marginBottom="1rem">
                    <Box
                        fontSize="0.9375rem"
                        color="#4b5563"
                        lineHeight="1.5"
                        marginBottom="1.5rem"
                    >
                        Ready to explore? Start browsing our collection of premium properties 
                        or take your time to get familiar with the platform.
                    </Box>

                    {/* Action Buttons */}
                    <Box
                        display="flex"
                        gap="0.75rem"
                        justifyContent="center"
                        flexDirection={{
                            base: 'column',    // Stack on mobile
                            sm: 'row'         // Side by side on desktop
                        }}
                    >
                        <Button
                            label="Start Browsing"
                            icon={<FaSearch />}
                            onClick={onStartBrowsing}
                            variant="promoted"
                            size="medium"
                            flex={{
                                base: '1',     // Full width on mobile
                                sm: 'unset'   // Auto width on desktop  
                            }}
                            style={{
                                background: 'linear-gradient(135deg, #D52122 0%, #ff4444 100%)',
                                border: 'none',
                                fontWeight: '600'
                            }}
                        />

                        <Button
                            label="Maybe Later"
                            onClick={onMaybeLater}
                            variant="normal"
                            size="medium"
                            flex={{
                                base: '1',     // Full width on mobile
                                sm: 'unset'   // Auto width on desktop
                            }}
                            backgroundColor="#f8fafc"
                            color="#6b7280"
                            border="1px solid #e2e8f0"
                            style={{
                                fontWeight: '500'
                            }}
                        />
                    </Box>
                </Box>

                {/* Auto-dismiss Notice */}
                {autoDismiss && (
                    <Box
                        textAlign="center"
                        fontSize="0.75rem"
                        color="#9ca3af"
                        fontStyle="italic"
                    >
                        This message will auto-close in {Math.ceil(autoDismissDelay / 1000)} seconds
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default WelcomeModal