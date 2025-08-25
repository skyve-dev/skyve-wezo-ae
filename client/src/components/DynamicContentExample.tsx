import React, { useEffect, useState } from 'react'
import { Box } from './base/Box'
import { Button } from './base/Button'
import { useAppShell } from './base/AppShell'
import { FaSearch, FaBell, FaShoppingCart } from 'react-icons/fa'

// Header components for stacking demo
const HeaderA: React.FC = () => (
    <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        padding="1rem 2rem"
        backgroundColor="#4338ca"
        color="white"
        width="100%"
    >
        <Box display="flex" alignItems="center" gap="1rem">
            <FaSearch size={20} />
            <Box fontSize="1.5rem" fontWeight="bold">Header A - Search</Box>
        </Box>
        <Button 
            label="Action A"
            variant="plain"
            style={{ color: 'white', border: '1px solid white' }}
        />
    </Box>
)

const HeaderB: React.FC = () => (
    <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        padding="1rem 2rem"
        backgroundColor="#dc2626"
        color="white"
        width="100%"
    >
        <Box display="flex" alignItems="center" gap="1rem">
            <FaBell size={20} />
            <Box fontSize="1.5rem" fontWeight="bold">Header B - Notifications</Box>
        </Box>
        <Button 
            label="Action B"
            variant="plain"
            style={{ color: 'white', border: '1px solid white' }}
        />
    </Box>
)

const HeaderC: React.FC = () => (
    <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        padding="1rem 2rem"
        backgroundColor="#059669"
        color="white"
        width="100%"
    >
        <Box display="flex" alignItems="center" gap="1rem">
            <FaShoppingCart size={20} />
            <Box fontSize="1.5rem" fontWeight="bold">Header C - Shopping</Box>
        </Box>
        <Button 
            label="Action C"
            variant="plain"
            style={{ color: 'white', border: '1px solid white' }}
        />
    </Box>
)

// Main example component demonstrating stacking behavior
const DynamicContentExample: React.FC = () => {
    const { mountHeader } = useAppShell()
    const [cleanupFunctions, setCleanupFunctions] = useState<{
        headerA?: () => void
        headerB?: () => void  
        headerC?: () => void
    }>({})
    
    const [mountedComponents, setMountedComponents] = useState<{
        headerA: boolean
        headerB: boolean
        headerC: boolean
    }>({
        headerA: false,
        headerB: false,
        headerC: false
    })

    const mountHeaderA = () => {
        if (!mountedComponents.headerA) {
            const cleanup = mountHeader(<HeaderA />)
            setCleanupFunctions(prev => ({ ...prev, headerA: cleanup }))
            setMountedComponents(prev => ({ ...prev, headerA: true }))
        }
    }

    const mountHeaderB = () => {
        if (!mountedComponents.headerB) {
            const cleanup = mountHeader(<HeaderB />)
            setCleanupFunctions(prev => ({ ...prev, headerB: cleanup }))
            setMountedComponents(prev => ({ ...prev, headerB: true }))
        }
    }

    const mountHeaderC = () => {
        if (!mountedComponents.headerC) {
            const cleanup = mountHeader(<HeaderC />)
            setCleanupFunctions(prev => ({ ...prev, headerC: cleanup }))
            setMountedComponents(prev => ({ ...prev, headerC: true }))
        }
    }

    const unmountHeaderA = () => {
        if (cleanupFunctions.headerA) {
            cleanupFunctions.headerA()
            setCleanupFunctions(prev => ({ ...prev, headerA: undefined }))
            setMountedComponents(prev => ({ ...prev, headerA: false }))
        }
    }

    const unmountHeaderB = () => {
        if (cleanupFunctions.headerB) {
            cleanupFunctions.headerB()
            setCleanupFunctions(prev => ({ ...prev, headerB: undefined }))
            setMountedComponents(prev => ({ ...prev, headerB: false }))
        }
    }

    const unmountHeaderC = () => {
        if (cleanupFunctions.headerC) {
            cleanupFunctions.headerC()
            setCleanupFunctions(prev => ({ ...prev, headerC: undefined }))
            setMountedComponents(prev => ({ ...prev, headerC: false }))
        }
    }

    // Cleanup all on unmount
    useEffect(() => {
        return () => {
            Object.values(cleanupFunctions).forEach(cleanup => cleanup?.())
        }
    }, [cleanupFunctions])

    return (
        <Box padding="2rem" maxWidth="900px" margin="0 auto">
            <Box fontSize="2rem" fontWeight="bold" marginBottom="2rem">
                Stack-Based Dynamic Content Demo
            </Box>
            
            <Box marginBottom="2rem" lineHeight="1.6" color="#4b5563">
                This demo shows the new <strong>stack-based mounting system</strong>. 
                Components can mount headers in any order, and they stack on top of each other. 
                When a header is unmounted, the previous one automatically restores.
            </Box>

            <Box 
                padding="1.5rem"
                backgroundColor="#f3f4f6"
                borderRadius="8px"
                marginBottom="2rem"
            >
                <Box fontSize="1.25rem" fontWeight="bold" marginBottom="1rem">
                    Current Stack State:
                </Box>
                <Box display="flex" flexDirection="column" gap="0.5rem">
                    <Box>📚 <strong>Stack Order (bottom to top):</strong></Box>
                    {mountedComponents.headerA && (
                        <Box paddingLeft="1rem">1️⃣ Header A - Search (Blue)</Box>
                    )}
                    {mountedComponents.headerB && (
                        <Box paddingLeft="1rem">2️⃣ Header B - Notifications (Red)</Box>
                    )}
                    {mountedComponents.headerC && (
                        <Box paddingLeft="1rem">3️⃣ Header C - Shopping (Green)</Box>
                    )}
                    {!mountedComponents.headerA && !mountedComponents.headerB && !mountedComponents.headerC && (
                        <Box paddingLeft="1rem" fontStyle="italic" color="#6b7280">Default header is showing</Box>
                    )}
                </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap="2rem">
                {/* Header A Controls */}
                <Box 
                    padding="1rem"
                    border="2px solid #4338ca"
                    borderRadius="8px"
                    backgroundColor={mountedComponents.headerA ? "rgba(67, 56, 202, 0.1)" : "white"}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
                        <Box fontSize="1.1rem" fontWeight="bold" color="#4338ca">
                            Header A - Search (Blue)
                        </Box>
                        <Box 
                            fontSize="0.9rem" 
                            fontWeight="bold"
                            color={mountedComponents.headerA ? "#059669" : "#6b7280"}
                        >
                            {mountedComponents.headerA ? "✅ MOUNTED" : "❌ NOT MOUNTED"}
                        </Box>
                    </Box>
                    <Box display="flex" gap="1rem">
                        <Button
                            label="Mount Header A"
                            onClick={mountHeaderA}
                            variant={mountedComponents.headerA ? "normal" : "promoted"}
                            disabled={mountedComponents.headerA}
                        />
                        <Button
                            label="Unmount Header A"
                            onClick={unmountHeaderA}
                            variant="normal"
                            disabled={!mountedComponents.headerA}
                        />
                    </Box>
                </Box>

                {/* Header B Controls */}
                <Box 
                    padding="1rem"
                    border="2px solid #dc2626"
                    borderRadius="8px"
                    backgroundColor={mountedComponents.headerB ? "rgba(220, 38, 38, 0.1)" : "white"}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
                        <Box fontSize="1.1rem" fontWeight="bold" color="#dc2626">
                            Header B - Notifications (Red)
                        </Box>
                        <Box 
                            fontSize="0.9rem" 
                            fontWeight="bold"
                            color={mountedComponents.headerB ? "#059669" : "#6b7280"}
                        >
                            {mountedComponents.headerB ? "✅ MOUNTED" : "❌ NOT MOUNTED"}
                        </Box>
                    </Box>
                    <Box display="flex" gap="1rem">
                        <Button
                            label="Mount Header B"
                            onClick={mountHeaderB}
                            variant={mountedComponents.headerB ? "normal" : "promoted"}
                            disabled={mountedComponents.headerB}
                        />
                        <Button
                            label="Unmount Header B"
                            onClick={unmountHeaderB}
                            variant="normal"
                            disabled={!mountedComponents.headerB}
                        />
                    </Box>
                </Box>

                {/* Header C Controls */}
                <Box 
                    padding="1rem"
                    border="2px solid #059669"
                    borderRadius="8px"
                    backgroundColor={mountedComponents.headerC ? "rgba(5, 150, 105, 0.1)" : "white"}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
                        <Box fontSize="1.1rem" fontWeight="bold" color="#059669">
                            Header C - Shopping (Green)
                        </Box>
                        <Box 
                            fontSize="0.9rem" 
                            fontWeight="bold"
                            color={mountedComponents.headerC ? "#059669" : "#6b7280"}
                        >
                            {mountedComponents.headerC ? "✅ MOUNTED" : "❌ NOT MOUNTED"}
                        </Box>
                    </Box>
                    <Box display="flex" gap="1rem">
                        <Button
                            label="Mount Header C"
                            onClick={mountHeaderC}
                            variant={mountedComponents.headerC ? "normal" : "promoted"}
                            disabled={mountedComponents.headerC}
                        />
                        <Button
                            label="Unmount Header C"
                            onClick={unmountHeaderC}
                            variant="normal"
                            disabled={!mountedComponents.headerC}
                        />
                    </Box>
                </Box>
            </Box>

            <Box 
                marginTop="2rem"
                padding="1rem"
                backgroundColor="#fef3c7"
                borderLeft="4px solid #f59e0b"
                borderRadius="0 4px 4px 0"
            >
                <Box fontSize="0.9rem" color="#92400e">
                    <Box fontWeight="bold" marginBottom="0.5rem">💡 Try These Scenarios:</Box>
                    1. Mount A, then B, then C → C displays (stack: [A,B,C])<br />
                    2. Unmount C → B displays (stack: [A,B])<br />
                    3. Unmount A → B still displays (stack: [B])<br />
                    4. Mount C again → C displays (stack: [B,C])<br />
                    5. Unmount B → C still displays (stack: [C])
                </Box>
            </Box>
        </Box>
    )
}

export default DynamicContentExample