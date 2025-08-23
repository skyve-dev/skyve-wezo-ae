import {createFileRoute, Link, Outlet, useLocation} from '@tanstack/react-router'
import {Box} from '../components/base/Box'
import {
    FaArrowLeft,
    FaBox,
    FaCalendarAlt,
    FaCheckSquare,
    FaClock,
    FaComment,
    FaHome,
    FaMobileAlt,
    FaPuzzlePiece,
    FaFolderOpen,
    FaShieldAlt
} from 'react-icons/fa'

export const Route = createFileRoute('/examples')({
    component: ExamplesLayout,
})

function ExamplesLayout() {
    const location = useLocation()

    const navigationItems = [
        {path: '/examples', label: 'Overview', icon: <FaHome/>},
        {path: '/examples/selection-picker', label: 'SelectionPicker', icon: <FaCheckSquare/>},
        {path: '/examples/sliding-drawer', label: 'SlidingDrawer', icon: <FaMobileAlt/>},
        {path: '/examples/dialog', label: 'Dialog', icon: <FaComment/>},
        {path: '/examples/tab', label: 'Tab', icon: <FaFolderOpen/>},
        {path: '/examples/app-shell', label: 'AppShell', icon: <FaShieldAlt/>},
        {path: '/examples/date-picker', label: 'DatePicker', icon: <FaCalendarAlt/>},
        {path: '/examples/time-picker', label: 'TimePicker', icon: <FaClock/>},
        {path: '/examples/box', label: 'Box Component', icon: <FaBox/>}
    ]

    return (
        <Box minHeight="100vh" backgroundColor="#f8fafc">
            {/* Header Navigation */}
            <Box display={'flex'} flexDirection={'column'}  backgroundColor="white" borderBottom="1px solid #e5e7eb"
                 position="sticky" top="0" zIndex={10}>
                <Box margin="0 auto" padding="0 2rem">
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        gap="1rem"
                    >
                        {/* Logo/Title */}
                        <Box display="flex" alignItems="center" gap="1rem">
                            <Link
                                to="/examples"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    textDecoration: 'none',
                                    color: 'inherit'
                                }}
                            >
                                <Box>
                                    <Box fontSize="1.5rem">
                                        <FaPuzzlePiece/>
                                    </Box>
                                    <Box fontSize="1.25rem" fontWeight="bold" color="#1a202c">
                                        Examples
                                    </Box>
                                </Box>
                            </Link>
                        </Box>

                        {/* Navigation Links */}
                        <Box
                            display="flex"
                            alignItems="center"
                            gap="0.5rem"
                            flexWrap="wrap"
                        >
                            {navigationItems.map((item) => {
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '1rem',
                                            fontWeight: '500',
                                            textDecoration: 'none',
                                            backgroundColor: isActive ? '#3182ce' : 'transparent',
                                            color: isActive ? 'white' : '#6b7280'
                                        }}
                                    >
                                        <Box>
                                            <Box fontSize="1rem">{item.icon}</Box>
                                            <Box display={'block'}>
                                                {item.label}
                                            </Box>
                                        </Box>
                                    </Link>
                                )
                            })}
                        </Box>

                        {/* Back to App */}
                        <Link
                            to="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                textDecoration: 'none'
                            }}
                        >
                            <Box>
                                <Box fontSize="1rem">
                                    <FaArrowLeft/>
                                </Box>
                                <Box display={'block'}>
                                    Back to App
                                </Box>
                            </Box>
                        </Link>
                    </Box>
                </Box>
            </Box>

            {/* Page Content */}
            <Outlet/>

        </Box>
    )
}

export default ExamplesLayout