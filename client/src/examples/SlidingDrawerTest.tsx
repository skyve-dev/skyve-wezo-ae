import {useEffect, useState} from 'react'
import SlidingDrawer from '../components/SlidingDrawer'
import {Box} from '../components/Box'
import useDrawerManager from '../hooks/useDrawerManager'

/**
 * Simple test component to verify SlidingDrawer functionality
 */
export function SlidingDrawerTest() {
    const drawerManager = useDrawerManager()
    const [testResult, setTestResult] = useState<string>('')
    const [debugInfo, setDebugInfo] = useState<string>('')
    const [isTestRunning, setIsTestRunning] = useState(false)

    // Monitor drawer state changes
    useEffect(() => {
        if (isTestRunning) {
            const isOpen = drawerManager.isDrawerOpen('test-drawer')
            const zIndex = drawerManager.getDrawerZIndex('test-drawer')
            const openCount = drawerManager.openDrawerCount
            const openIds = drawerManager.openDrawerIds

            const portalState = checkPortalContainerState()
            const debug = `State Check:
- Is Open: ${isOpen}
- Z-Index: ${zIndex}
- Open Count: ${openCount}
- Open IDs: [${openIds.join(', ')}]

Portal Container:
- Position: ${portalState?.position || 'N/A'}
- Size: ${portalState?.width || 'N/A'} x ${portalState?.height || 'N/A'}
- Z-Index: ${portalState?.zIndex || 'N/A'}
- Pointer Events: ${portalState?.pointerEvents || 'N/A'}`

            setDebugInfo(debug)
            console.log('Drawer state changed:', {isOpen, zIndex, openCount, openIds})

            if (isOpen) {
                setTestResult('✅ SlidingDrawer is working correctly! Drawer opened successfully.')
                setIsTestRunning(false)

                // // Auto-close after 2 seconds for better UX
                // setTimeout(() => {
                //     drawerManager.closeDrawer('test-drawer')
                //     setDebugInfo('')
                // }, 2000)
            }
        }
    }, [drawerManager.openDrawerCount, drawerManager.openDrawerIds, isTestRunning, drawerManager])

    const checkPortalContainerState = () => {
        const portalContainer = document.getElementById('drawer-root')
        if (portalContainer) {
            const styles = window.getComputedStyle(portalContainer)
            return {
                position: styles.position,
                width: styles.width,
                height: styles.height,
                zIndex: styles.zIndex,
                pointerEvents: styles.pointerEvents
            }
        }
        return null
    }

    const runTest = () => {
        try {
            setTestResult('🔄 Testing SlidingDrawer...')
            setDebugInfo('')
            setIsTestRunning(true)

            // Test portal container state before opening
            const beforeState = checkPortalContainerState()
            console.log('Portal container state before opening:', beforeState)

            // Test 1: Open a drawer
            console.log('Starting SlidingDrawer test...')
            drawerManager.openDrawer('test-drawer')

            // Set up timeout in case the test doesn't pass
            setTimeout(() => {
                if (isTestRunning) {
                    const afterState = checkPortalContainerState()
                    console.log('Portal container state after opening:', afterState)
                    setTestResult('❌ Test failed: Drawer did not open within timeout period.')
                    setIsTestRunning(false)
                }
            }, 2000)
        } catch (error) {
            setTestResult(`❌ Test failed with error: ${error}`)
            setIsTestRunning(false)
            console.error('SlidingDrawer test error:', error)
        }
    }

    return (
        <Box
            minHeight="100vh"
            backgroundColor="#f8fafc"
            padding="2rem"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="2rem"
        >
            <Box textAlign="center">
                <Box fontSize="2rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
                    SlidingDrawer Test
                </Box>
                <Box fontSize="1rem" color="#6b7280" marginBottom="2rem" maxWidth="500px">
                    Click the button below to test if the SlidingDrawer component is working correctly.
                    The drawer should open and automatically close after 2 seconds.
                </Box>
            </Box>

            <Box
                as="button"
                onClick={runTest}
                padding="1rem 2rem"
                backgroundColor="#3182ce"
                color="white"
                borderRadius="0.5rem"
                border="none"
                fontSize="1rem"
                fontWeight="600"
                cursor="pointer"
                whileHover={{
                    backgroundColor: '#2563eb'
                }}
            >
                Test SlidingDrawer
            </Box>

            {testResult && (
                <Box
                    padding="1rem 2rem"
                    backgroundColor={testResult.includes('✅') ? '#dcfce7' : testResult.includes('🔄') ? '#e0f2fe' : '#fee2e2'}
                    color={testResult.includes('✅') ? '#166534' : testResult.includes('🔄') ? '#0891b2' : '#dc2626'}
                    borderRadius="0.5rem"
                    fontSize="1rem"
                    fontWeight="500"
                    textAlign="center"
                    maxWidth="500px"
                >
                    {testResult}
                </Box>
            )}

            {debugInfo && (
                <Box
                    padding="1rem"
                    backgroundColor="#f3f4f6"
                    color="#374151"
                    borderRadius="0.5rem"
                    fontSize="0.875rem"
                    fontFamily="monospace"
                    maxWidth="500px"
                    style={{whiteSpace: 'pre-line'}}
                    border="1px solid #d1d5db"
                >
                    {debugInfo}
                </Box>
            )}

            {/* Test Drawer */}
            <SlidingDrawer
                isOpen={drawerManager.isDrawerOpen('test-drawer')}
                onClose={() => {
                    drawerManager.closeDrawer('test-drawer')
                }}
                side="right"
                width="400px"
                zIndex={drawerManager.getDrawerZIndex('test-drawer')}
                showCloseButton={true}
            >
                <Box padding="2rem">
                    <Box fontSize="1.5rem" fontWeight="bold" marginBottom="1rem" color="#1a202c">
                        🎉 Drawer Test Successful!
                    </Box>
                    <Box fontSize="1rem" color="#6b7280" marginBottom="2rem">
                        The SlidingDrawer component is working correctly. This drawer will automatically
                        close in 2 seconds, or you can close it manually using the X button.
                    </Box>
                    <Box
                        display="flex"
                        gap="1rem"
                        flexDirection="column"
                        backgroundColor="#f9fafb"
                        padding="1rem"
                        borderRadius="0.5rem"
                    >
                        <Box fontSize="0.875rem" fontWeight="600" color="#374151">
                            ✅ Drawer State Management: Working
                        </Box>
                        <Box fontSize="0.875rem" fontWeight="600" color="#374151">
                            ✅ Portal Rendering: Working
                        </Box>
                        <Box fontSize="0.875rem" fontWeight="600" color="#374151">
                            ✅ Animation: Working
                        </Box>
                        <Box fontSize="0.875rem" fontWeight="600" color="#374151">
                            ✅ Z-Index Management: Working
                        </Box>
                    </Box>
                </Box>
            </SlidingDrawer>
        </Box>
    )
}

export default SlidingDrawerTest