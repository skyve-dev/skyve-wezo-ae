import React from 'react'
import { IoIosCash, IoIosHelp, IoIosTrendingUp, IoIosPeople, IoIosHeadset, IoIosDocument, IoIosHome, IoIosClose } from 'react-icons/io'
import { Box } from './Box'
import { Button } from './Button'

interface StartHostingModalProps {
    /**
     * Callback when user clicks "Get Started"
     */
    onGetStarted: () => void
    
    /**
     * Callback when user clicks "Maybe Later" or closes modal
     */
    onMaybeLater: () => void
    
    /**
     * User's name for personalization (optional)
     */
    userName?: string
}

/**
 * Start Hosting Modal Component
 * 
 * Shows the benefits of becoming a host on Wezo.ae platform.
 * Includes earning potential, platform benefits, and getting started steps.
 * Designed to convert guests into property owners.
 * 
 * Features:
 * - Earning potential highlights
 * - Platform benefits overview  
 * - Getting started process
 * - Commission structure info
 * - Support and documentation links
 * - "Get Started" and "Maybe Later" actions
 * 
 * @example
 * ```tsx
 * const StartHostingModal = () => {
 *   return (
 *     <StartHostingModal
 *       userName="John"
 *       onGetStarted={() => {
 *         closeModal()
 *         navigateTo('property-create', {})
 *       }}
 *       onMaybeLater={() => closeModal()}
 *     />
 *   )
 * }
 * ```
 */
const StartHostingModal: React.FC<StartHostingModalProps> = ({
    onGetStarted,
    onMaybeLater,
    userName
}) => {
    // Earning potential data
    const earningHighlights = [
        {
            icon: <IoIosCash style={{ color: '#059669' }} />,
            title: "Competitive Earnings",
            description: "Earn up to AED 15,000+ per month with premium villa listings"
        },
        {
            icon: <IoIosTrendingUp style={{ color: '#3b82f6' }} />,
            title: "Dynamic Pricing",
            description: "Our smart pricing tools help maximize your revenue automatically"
        },
        {
            icon: <IoIosPeople style={{ color: '#f59e0b' }} />,
            title: "High Demand",
            description: "UAE's growing tourism market ensures steady booking requests"
        }
    ]

    // Platform benefits
    const platformBenefits = [
        {
            icon: <IoIosHelp style={{ color: '#059669' }} />,
            title: "Secure Payments",
            description: "Guaranteed payments with fraud protection and insurance coverage"
        },
        {
            icon: <IoIosHeadset style={{ color: '#3b82f6' }} />,
            title: "24/7 Support", 
            description: "Dedicated partner support team to help with any questions or issues"
        },
        {
            icon: <IoIosTrendingUp style={{ color: '#8b5cf6' }} />,
            title: "Performance Analytics",
            description: "Detailed insights and reports to optimize your listing performance"
        }
    ]

    // Getting started steps
    const gettingStartedSteps = [
        {
            step: "1",
            title: "Complete KYU Form",
            description: "Quick identity verification for secure transactions"
        },
        {
            step: "2", 
            title: "List Your Property",
            description: "Add photos, amenities, and pricing details"
        },
        {
            step: "3",
            title: "Start Earning",
            description: "Receive bookings and manage your calendar"
        }
    ]

    const getPersonalizedTitle = () => {
        if (userName) {
            return `Ready to start hosting, ${userName}?`
        }
        return "Ready to start hosting?"
    }

    return (
        <Box
            padding="0"
            borderRadius="0"
            borderRadiusSm="16px"
            height="100vh"
            heightSm="auto"
            maxHeight="100vh"
            maxHeightSm="90vh"
            backgroundColor="white"
            boxShadow="0 25px 60px rgba(0, 0, 0, 0.15)"
            width="100vw"
            widthSm="90vw"
            widthMd="700px"
            maxWidth="100vw"
            maxWidthSm="90vw"
            maxWidthMd="700px"
            overflow="hidden"
            position="relative"
            display="flex"
            flexDirection="column"
        >
            {/* Header */}
            <Box
                padding="1.5rem 1rem"
                paddingSm="2rem 2rem 1.5rem 2rem"
                background="linear-gradient(135deg, #D52122 0%, #ff4444 100%)"
                color="white"
                textAlign="center"
                position="relative"
                flexShrink={0}
            >
                {/* Close Button */}
                <Button
                    label=""
                    icon={<IoIosClose />}
                    onClick={onMaybeLater}
                    variant="normal"
                    size="small"
                    position="absolute"
                    top="0.75rem"
                    topSm="1rem"
                    right="0.75rem"
                    rightSm="1rem"
                    backgroundColor="transparent"
                    color="white"
                    border="none"
                    style={{
                        minWidth: 'unset',
                        width: '2rem',
                        height: '2rem',
                        opacity: 0.8
                    }}
                />

                {/* Title */}
                <Box
                    fontSize="1.25rem"
                    fontSizeSm="1.5rem"
                    fontSizeMd="1.75rem"
                    fontWeight="700"
                    marginBottom="0.5rem"
                    lineHeight="1.2"
                    paddingRight="2rem"
                >
                    {getPersonalizedTitle()}
                </Box>

                {/* Subtitle */}
                <Box
                    fontSize="0.875rem"
                    fontSizeSm="1rem"
                    fontSizeMd="1.1rem"
                    opacity={0.9}
                    lineHeight="1.4"
                >
                    Join thousands of successful hosts earning with Wezo.ae
                </Box>
            </Box>

            {/* Content - Scrollable */}
            <Box
                padding="0"
                flex="1"
                overflow="auto"
                overflowX="hidden"
            >
                {/* Earning Potential Section */}
                <Box 
                    padding="1rem"
                    paddingSm="1.5rem 1.5rem"
                    paddingMd="1.5rem 2rem"
                >
                    <Box
                        fontSize="1rem"
                        fontSizeSm="1.125rem"
                        fontSizeMd="1.25rem"
                        fontWeight="600"
                        color="#1f2937"
                        marginBottom="0.75rem"
                        marginBottomSm="1rem"
                        display="flex"
                        alignItems="center"
                        gap="0.5rem"
                    >
                        <IoIosCash style={{ color: '#059669' }} />
                        Earning Potential
                    </Box>

                    <Box
                        display="grid"
                        gridTemplateColumns="1fr"
                        gridTemplateColumnsSm="repeat(auto-fit, minmax(200px, 1fr))"
                        gap="0.75rem"
                        gapSm="1rem"
                        marginBottom="1.5rem"
                        marginBottomSm="2rem"
                    >
                        {earningHighlights.map((highlight, index) => (
                            <Box
                                key={index}
                                padding="1rem"
                                paddingSm="1.25rem"
                                borderRadius="12px"
                                backgroundColor="#f8fafc"
                                border="1px solid #e2e8f0"
                            >
                                <Box 
                                    fontSize="1.25rem"
                                    fontSizeSm="1.5rem"
                                    marginBottom="0.5rem"
                                    marginBottomSm="0.75rem"
                                >
                                    {highlight.icon}
                                </Box>
                                <Box
                                    fontSize="0.875rem"
                                    fontSizeSm="0.9375rem"
                                    fontWeight="600"
                                    color="#1f2937"
                                    marginBottom="0.25rem"
                                    marginBottomSm="0.5rem"
                                >
                                    {highlight.title}
                                </Box>
                                <Box
                                    fontSize="0.8125rem"
                                    fontSizeSm="0.875rem"
                                    color="#6b7280"
                                    lineHeight="1.4"
                                >
                                    {highlight.description}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Commission Structure */}
                <Box 
                    padding="0 1rem"
                    paddingSm="0 1.5rem"
                    paddingMd="0 2rem"
                    marginBottom="1rem"
                    marginBottomSm="1.5rem"
                >
                    <Box
                        padding="1rem"
                        paddingSm="1.25rem"
                        borderRadius="12px"
                        backgroundColor="#dbeafe"
                        border="1px solid #93c5fd"
                    >
                        <Box
                            fontSize="0.875rem"
                            fontSizeSm="0.9375rem"
                            fontSizeMd="1rem"
                            fontWeight="600"
                            color="#1e40af"
                            marginBottom="0.375rem"
                            marginBottomSm="0.5rem"
                        >
                            💰 Competitive Commission Structure
                        </Box>
                        <Box
                            fontSize="0.8125rem"
                            fontSizeSm="0.875rem"
                            color="#1e3a8a"
                            lineHeight="1.4"
                        >
                            Keep up to 85% of your earnings! Our transparent fee structure 
                            ensures you maximize profits from every booking.
                        </Box>
                    </Box>
                </Box>

                {/* Platform Benefits Section */}
                <Box 
                    padding="0 1rem"
                    paddingSm="0 1.5rem"
                    paddingMd="0 2rem"
                >
                    <Box
                        fontSize="1rem"
                        fontSizeSm="1.125rem"
                        fontSizeMd="1.25rem"
                        fontWeight="600"
                        color="#1f2937"
                        marginBottom="0.75rem"
                        marginBottomSm="1rem"
                        display="flex"
                        alignItems="center"
                        gap="0.5rem"
                    >
                        <IoIosHelp style={{ color: '#3b82f6' }} />
                        Platform Benefits
                    </Box>

                    <Box
                        display="grid"
                        gridTemplateColumns="1fr"
                        gridTemplateColumnsSm="repeat(auto-fit, minmax(250px, 1fr))"
                        gap="0.75rem"
                        gapSm="1rem"
                        marginBottom="1.5rem"
                        marginBottomSm="2rem"
                    >
                        {platformBenefits.map((benefit, index) => (
                            <Box
                                key={index}
                                padding="1rem"
                                paddingSm="1.25rem"
                                borderRadius="12px"
                                backgroundColor="#f8fafc"
                                border="1px solid #e2e8f0"
                            >
                                <Box 
                                    fontSize="1.25rem"
                                    fontSizeSm="1.5rem"
                                    marginBottom="0.5rem"
                                    marginBottomSm="0.75rem"
                                >
                                    {benefit.icon}
                                </Box>
                                <Box
                                    fontSize="0.875rem"
                                    fontSizeSm="0.9375rem"
                                    fontWeight="600"
                                    color="#1f2937"
                                    marginBottom="0.25rem"
                                    marginBottomSm="0.5rem"
                                >
                                    {benefit.title}
                                </Box>
                                <Box
                                    fontSize="0.8125rem"
                                    fontSizeSm="0.875rem"
                                    color="#6b7280"
                                    lineHeight="1.4"
                                >
                                    {benefit.description}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Getting Started Section */}
                <Box 
                    padding="0 1rem"
                    paddingSm="0 1.5rem"
                    paddingMd="0 2rem"
                >
                    <Box
                        fontSize="1rem"
                        fontSizeSm="1.125rem"
                        fontSizeMd="1.25rem"
                        fontWeight="600"
                        color="#1f2937"
                        marginBottom="0.75rem"
                        marginBottomSm="1rem"
                        display="flex"
                        alignItems="center"
                        gap="0.5rem"
                    >
                        <IoIosDocument style={{ color: '#f59e0b' }} />
                        Getting Started Steps
                    </Box>

                    <Box 
                        marginBottom="1.5rem"
                        marginBottomSm="2rem"
                    >
                        {gettingStartedSteps.map((step, index) => (
                            <Box
                                key={index}
                                display="flex"
                                alignItems="flex-start"
                                gap="0.75rem"
                                gapSm="1rem"
                                marginBottom="0.75rem"
                                marginBottomSm="1rem"
                                padding="0.75rem"
                                paddingSm="1rem"
                                borderRadius="12px"
                                backgroundColor="#f9fafb"
                            >
                                {/* Step Number */}
                                <Box
                                    width="1.75rem"
                                    widthSm="2rem"
                                    height="1.75rem"
                                    heightSm="2rem"
                                    minWidth="1.75rem"
                                    minWidthSm="2rem"
                                    borderRadius="50%"
                                    backgroundColor="#D52122"
                                    color="white"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    fontSize="0.75rem"
                                    fontSizeSm="0.875rem"
                                    fontWeight="600"
                                    flexShrink={0}
                                >
                                    {step.step}
                                </Box>

                                {/* Step Content */}
                                <Box flex="1">
                                    <Box
                                        fontSize="0.875rem"
                                        fontSizeSm="0.9375rem"
                                        fontWeight="600"
                                        color="#1f2937"
                                        marginBottom="0.125rem"
                                        marginBottomSm="0.25rem"
                                    >
                                        {step.title}
                                    </Box>
                                    <Box
                                        fontSize="0.8125rem"
                                        fontSizeSm="0.875rem"
                                        color="#6b7280"
                                        lineHeight="1.4"
                                    >
                                        {step.description}
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Action Buttons */}
                <Box 
                    padding="1rem"
                    paddingSm="1.5rem 1.5rem 2rem 1.5rem"
                    paddingMd="1.5rem 2rem 2rem 2rem"
                >
                    <Box
                        display="flex"
                        gap="0.75rem"
                        justifyContent="center"
                        flexDirection="column"
                        flexDirectionSm="row"
                    >
                        <Button
                            label="Get Started"
                            icon={<IoIosHome />}
                            onClick={onGetStarted}
                            variant="promoted"
                            size="small"
                            flex="1"
                            flexSm="unset"
                            style={{
                                background: 'linear-gradient(135deg, #D52122 0%, #ff4444 100%)',
                                border: 'none',
                                fontWeight: '600',
                                padding: '0.625rem 1.5rem',
                                fontSize: window.innerWidth < 480 ? '0.875rem' : undefined
                            }}
                        />

                        <Button
                            label="Maybe Later"
                            onClick={onMaybeLater}
                            variant="normal"
                            size="small"
                            flex="1"
                            flexSm="unset"
                            backgroundColor="#f8fafc"
                            color="#6b7280"
                            border="1px solid #e2e8f0"
                            style={{
                                fontWeight: '500',
                                padding: '0.625rem 1.5rem',
                                fontSize: window.innerWidth < 480 ? '0.875rem' : undefined
                            }}
                        />
                    </Box>

                    {/* Additional Info */}
                    <Box
                        textAlign="center"
                        marginTop="0.75rem"
                        marginTopSm="1rem"
                        fontSize="0.6875rem"
                        fontSizeSm="0.75rem"
                        color="#9ca3af"
                    >
                        No setup fees • Free listing • Cancel anytime
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default StartHostingModal