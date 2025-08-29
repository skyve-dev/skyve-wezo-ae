import React, { useState } from 'react'
import Tab, { TabItem } from './Tab'
import { Box } from './Box'
import { Button } from './Button'
import { Input } from './Input'
import {
    FaHome,
    FaUser,
    FaCog,
    FaChartBar,
    FaChartLine,
    FaFileAlt,
    FaInbox,
    FaEdit,
    FaPaperPlane,
    FaPalette,
    FaCode,
    FaMobileAlt,
    FaDesktop,
    FaTabletAlt,
    FaShoppingCart,
    FaHeart,
    FaStar
} from 'react-icons/fa'

const TabExample: React.FC = () => {
    // State for different tab examples
    const [basicTab, setBasicTab] = useState('overview')
    const [iconTab, setIconTab] = useState('home')
    const [badgeTab, setBadgeTab] = useState('inbox')
    const [verticalTab, setVerticalTab] = useState('dashboard')
    const [pillsTab, setPillsTab] = useState('design')
    const [underlineTab, setUnderlineTab] = useState('mobile')
    const [customTab, setCustomTab] = useState('products')
    const [formTab, setFormTab] = useState('personal')

    // Form state for form tabs example
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    })

    // Basic tabs
    const basicTabs: TabItem[] = [
        {
            id: 'overview',
            label: 'Overview',
            content: (
                <Box padding="2rem" backgroundColor="#f8fafc" borderRadius="8px">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
                        Project Overview
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        This is the overview section containing general information about the project.
                        Here you can find key metrics, recent activity, and important updates.
                    </p>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
                        <Box padding="1rem" backgroundColor="white" borderRadius="6px" border="1px solid #e5e7eb">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Total Users</h4>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>1,234</p>
                        </Box>
                        <Box padding="1rem" backgroundColor="white" borderRadius="6px" border="1px solid #e5e7eb">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Active Sessions</h4>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>567</p>
                        </Box>
                        <Box padding="1rem" backgroundColor="white" borderRadius="6px" border="1px solid #e5e7eb">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Revenue</h4>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>AED 12,345</p>
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            id: 'details',
            label: 'Details',
            content: (
                <Box padding="2rem" backgroundColor="#f8fafc" borderRadius="8px">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
                        Detailed Information
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Detailed breakdown of metrics, analytics, and performance indicators.
                    </p>
                    <Box marginBottom="1.5rem">
                        <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Recent Activity</h4>
                        <Box display="flex" flexDirection="column" gap="0.75rem">
                            {[
                                'User john@example.com signed up',
                                'New order #1234 received',
                                'Payment processed for order #1233',
                                'Product inventory updated'
                            ].map((activity, index) => (
                                <Box 
                                    key={index}
                                    padding="0.75rem" 
                                    backgroundColor="white" 
                                    borderRadius="6px" 
                                    border="1px solid #e5e7eb"
                                    display="flex"
                                    alignItems="center"
                                    gap="0.75rem"
                                >
                                    <Box 
                                        width="8px" 
                                        height="8px" 
                                        borderRadius="50%" 
                                        backgroundColor="#3b82f6"
                                    />
                                    <span style={{ color: '#374151' }}>{activity}</span>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            id: 'settings',
            label: 'Settings',
            content: (
                <Box padding="2rem" backgroundColor="#f8fafc" borderRadius="8px">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
                        Configuration Settings
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Manage your application settings and preferences.
                    </p>
                    <Box display="flex" flexDirection="column" gap="1.5rem">
                        <Box>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Project Name
                            </label>
                            <Input 
                                type="text" 
                                placeholder="Enter project name" 
                                width="100%" 
                                defaultValue="My Awesome Project"
                            />
                        </Box>
                        <Box>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Description
                            </label>
                            <textarea
                                placeholder="Enter project description"
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    fontFamily: 'inherit'
                                }}
                                defaultValue="A comprehensive project management solution"
                            />
                        </Box>
                        <Button label="Save Settings" variant="promoted" />
                    </Box>
                </Box>
            )
        }
    ]

    // Tabs with icons
    const iconTabs: TabItem[] = [
        {
            id: 'home',
            label: 'Home',
            icon: <FaHome />,
            content: (
                <Box padding="2rem" textAlign="center">
                    <Box fontSize="3rem" marginBottom="1rem" color="#3b82f6">
                        <FaHome />
                    </Box>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Welcome Home</h3>
                    <p style={{ color: '#6b7280' }}>
                        This is your home dashboard where you can see an overview of all your activities.
                    </p>
                </Box>
            )
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: <FaUser />,
            content: (
                <Box padding="2rem" textAlign="center">
                    <Box fontSize="3rem" marginBottom="1rem" color="#10b981">
                        <FaUser />
                    </Box>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>User Profile</h3>
                    <p style={{ color: '#6b7280' }}>
                        Manage your profile information, avatar, and personal preferences.
                    </p>
                </Box>
            )
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: <FaCog />,
            content: (
                <Box padding="2rem" textAlign="center">
                    <Box fontSize="3rem" marginBottom="1rem" color="#f59e0b">
                        <FaCog />
                    </Box>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Application Settings</h3>
                    <p style={{ color: '#6b7280' }}>
                        Configure application settings, themes, and system preferences.
                    </p>
                </Box>
            )
        }
    ]

    // Tabs with badges
    const badgeTabs: TabItem[] = [
        {
            id: 'inbox',
            label: 'Inbox',
            icon: <FaInbox />,
            badge: 5,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Inbox Messages</h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>You have 5 unread messages.</p>
                    <Box display="flex" flexDirection="column" gap="0.75rem">
                        {[
                            { from: 'John Doe', subject: 'Project Update', time: '2 min ago' },
                            { from: 'Jane Smith', subject: 'Meeting Tomorrow', time: '1 hour ago' },
                            { from: 'Team Lead', subject: 'Code Review', time: '3 hours ago' },
                            { from: 'HR Department', subject: 'Policy Update', time: '1 day ago' },
                            { from: 'Client', subject: 'Feedback Required', time: '2 days ago' }
                        ].map((message, index) => (
                            <Box 
                                key={index}
                                padding="1rem" 
                                backgroundColor="white" 
                                borderRadius="6px" 
                                border="1px solid #e5e7eb"
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="0.5rem">
                                    <h4 style={{ fontWeight: '600', fontSize: '0.875rem' }}>{message.from}</h4>
                                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{message.time}</span>
                                </Box>
                                <p style={{ color: '#374151', fontSize: '0.875rem' }}>{message.subject}</p>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )
        },
        {
            id: 'drafts',
            label: 'Drafts',
            icon: <FaEdit />,
            badge: '2',
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Draft Messages</h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>You have 2 draft messages.</p>
                    <Box display="flex" flexDirection="column" gap="0.75rem">
                        <Box padding="1rem" backgroundColor="white" borderRadius="6px" border="1px solid #e5e7eb">
                            <h4 style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Re: Project Timeline
                            </h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Thanks for the update. I'll review the timeline and get back to you...
                            </p>
                        </Box>
                        <Box padding="1rem" backgroundColor="white" borderRadius="6px" border="1px solid #e5e7eb">
                            <h4 style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Weekly Report
                            </h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Here's the weekly progress report for our team...
                            </p>
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            id: 'sent',
            label: 'Sent',
            icon: <FaPaperPlane />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Sent Messages</h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Your recently sent messages.</p>
                    <Box display="flex" flexDirection="column" gap="0.75rem">
                        <Box padding="1rem" backgroundColor="white" borderRadius="6px" border="1px solid #e5e7eb">
                            <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="0.5rem">
                                <h4 style={{ fontWeight: '600', fontSize: '0.875rem' }}>To: team@company.com</h4>
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Yesterday</span>
                            </Box>
                            <p style={{ color: '#374151', fontSize: '0.875rem' }}>Weekly Team Standup Notes</p>
                        </Box>
                    </Box>
                </Box>
            )
        }
    ]

    // Vertical tabs
    const verticalTabs: TabItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <FaChartBar />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Dashboard Overview</h3>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1rem">
                        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb">
                            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Monthly Revenue</h4>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem' }}>
                                AED 24,567
                            </p>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>+12% from last month</span>
                        </Box>
                        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb">
                            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>New Customers</h4>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem' }}>
                                1,234
                            </p>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>+8% from last month</span>
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: <FaChartLine />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Analytics Report</h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Detailed analytics and performance metrics for your business.
                    </p>
                    <Box backgroundColor="#f8fafc" padding="2rem" borderRadius="8px" textAlign="center">
                        <FaChartLine style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem' }} />
                        <p style={{ color: '#6b7280' }}>Analytics charts and graphs would be displayed here.</p>
                    </Box>
                </Box>
            )
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: <FaFileAlt />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Generated Reports</h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Download and view your generated reports.
                    </p>
                    <Box display="flex" flexDirection="column" gap="0.75rem">
                        {[
                            'Monthly Sales Report - December 2024',
                            'Customer Analytics Report - Q4 2024',
                            'Performance Summary - 2024'
                        ].map((report, index) => (
                            <Box 
                                key={index}
                                padding="1rem" 
                                backgroundColor="white" 
                                borderRadius="6px" 
                                border="1px solid #e5e7eb"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <span style={{ fontWeight: '500' }}>{report}</span>
                                <Button label="Download" variant="normal" size="small" />
                            </Box>
                        ))}
                    </Box>
                </Box>
            )
        }
    ]

    // Pills variant tabs
    const pillsTabs: TabItem[] = [
        {
            id: 'design',
            label: 'Design',
            icon: <FaPalette />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Design System</h3>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
                        <Box padding="1.5rem" backgroundColor="#fef3c7" borderRadius="8px" textAlign="center">
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#f59e0b', borderRadius: '50%', margin: '0 auto 1rem' }} />
                            <h4 style={{ fontWeight: '600' }}>Yellow</h4>
                            <p style={{ fontSize: '0.875rem', color: '#92400e' }}>#f59e0b</p>
                        </Box>
                        <Box padding="1.5rem" backgroundColor="#dbeafe" borderRadius="8px" textAlign="center">
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 1rem' }} />
                            <h4 style={{ fontWeight: '600' }}>Blue</h4>
                            <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>#3b82f6</p>
                        </Box>
                        <Box padding="1.5rem" backgroundColor="#d1fae5" borderRadius="8px" textAlign="center">
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#10b981', borderRadius: '50%', margin: '0 auto 1rem' }} />
                            <h4 style={{ fontWeight: '600' }}>Green</h4>
                            <p style={{ fontSize: '0.875rem', color: '#047857' }}>#10b981</p>
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            id: 'development',
            label: 'Development',
            icon: <FaCode />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Development Guidelines</h3>
                    <Box 
                        padding="1.5rem" 
                        backgroundColor="#1f2937" 
                        borderRadius="8px" 
                        color="white"
                        fontFamily="monospace"
                        fontSize="0.875rem"
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#60a5fa' }}>const</span> <span style={{ color: '#d1d5db' }}>component</span> = <span style={{ color: '#34d399' }}>'Tab'</span>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#60a5fa' }}>export</span> <span style={{ color: '#60a5fa' }}>default</span> <span style={{ color: '#d1d5db' }}>component</span>
                        </div>
                        <div style={{ color: '#9ca3af' }}>// Accessible and responsive tabs</div>
                    </Box>
                </Box>
            )
        }
    ]

    // Underline variant tabs
    const underlineTabs: TabItem[] = [
        {
            id: 'mobile',
            label: 'Mobile',
            icon: <FaMobileAlt />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Mobile Experience</h3>
                    <Box display="flex" flexDirection="column" gap="1rem">
                        <Box padding="1rem" backgroundColor="#f8fafc" borderRadius="8px">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Touch Optimized</h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Designed for touch interfaces with appropriate spacing and sizing.
                            </p>
                        </Box>
                        <Box padding="1rem" backgroundColor="#f8fafc" borderRadius="8px">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Responsive Design</h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Adapts seamlessly to different screen sizes and orientations.
                            </p>
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            id: 'tablet',
            label: 'Tablet',
            icon: <FaTabletAlt />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Tablet Experience</h3>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1rem">
                        <Box padding="1rem" backgroundColor="#f8fafc" borderRadius="8px">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Split View</h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Optimized for tablet split-screen usage.
                            </p>
                        </Box>
                        <Box padding="1rem" backgroundColor="#f8fafc" borderRadius="8px">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Landscape Mode</h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Enhanced experience in landscape orientation.
                            </p>
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            id: 'desktop',
            label: 'Desktop',
            icon: <FaDesktop />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Desktop Experience</h3>
                    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="1rem">
                        <Box padding="1rem" backgroundColor="#f8fafc" borderRadius="8px" textAlign="center">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Keyboard Navigation</h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Full keyboard support with arrow keys.
                            </p>
                        </Box>
                        <Box padding="1rem" backgroundColor="#f8fafc" borderRadius="8px" textAlign="center">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Mouse Interactions</h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Hover effects and click interactions.
                            </p>
                        </Box>
                        <Box padding="1rem" backgroundColor="#f8fafc" borderRadius="8px" textAlign="center">
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Large Screens</h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Utilizes available screen real estate.
                            </p>
                        </Box>
                    </Box>
                </Box>
            )
        }
    ]

    // Custom styled tabs
    const customTabs: TabItem[] = [
        {
            id: 'products',
            label: 'Products',
            icon: <FaShoppingCart />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#10b981' }}>Our Products</h3>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem">
                        {['Laptop', 'Smartphone', 'Headphones'].map((product, index) => (
                            <Box key={index} padding="1.5rem" backgroundColor="white" borderRadius="8px" border="2px solid #10b981" textAlign="center">
                                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{product}</h4>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Premium quality {product.toLowerCase()}</p>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )
        },
        {
            id: 'favorites',
            label: 'Favorites',
            icon: <FaHeart />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#10b981' }}>Your Favorites</h3>
                    <Box textAlign="center" padding="3rem">
                        <FaHeart style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }} />
                        <p style={{ color: '#6b7280' }}>No favorites yet. Start adding items to your favorites!</p>
                    </Box>
                </Box>
            )
        },
        {
            id: 'reviews',
            label: 'Reviews',
            icon: <FaStar />,
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#10b981' }}>Customer Reviews</h3>
                    <Box display="flex" flexDirection="column" gap="1rem">
                        {[
                            { rating: 5, text: 'Excellent product quality!', author: 'John D.' },
                            { rating: 4, text: 'Very satisfied with the purchase.', author: 'Sarah M.' },
                            { rating: 5, text: 'Highly recommend this product.', author: 'Mike R.' }
                        ].map((review, index) => (
                            <Box key={index} padding="1rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb">
                                <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <FaStar key={i} style={{ color: '#f59e0b', fontSize: '0.875rem' }} />
                                    ))}
                                    <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{review.author}</span>
                                </Box>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{review.text}</p>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )
        }
    ]

    // Form tabs with validation
    const formTabs: TabItem[] = [
        {
            id: 'personal',
            label: 'Personal Info',
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Personal Information</h3>
                    <Box display="flex" flexDirection="column" gap="1rem">
                        <Box>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Full Name *
                            </label>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter your full name"
                                width="100%"
                                required
                            />
                        </Box>
                        <Box>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Email Address *
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Enter your email"
                                width="100%"
                                required
                            />
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            id: 'company',
            label: 'Company',
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Company Information</h3>
                    <Box>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Company Name
                        </label>
                        <Input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            placeholder="Enter company name"
                            width="100%"
                        />
                    </Box>
                </Box>
            )
        },
        {
            id: 'message',
            label: 'Message',
            content: (
                <Box padding="2rem">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Additional Message</h3>
                    <Box>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Enter your message"
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </Box>
                    <Box marginTop="1.5rem">
                        <Button 
                            label="Submit Form" 
                            variant="promoted" 
                            onClick={() => console.log('Form submitted:', formData)}
                        />
                    </Box>
                </Box>
            )
        }
    ]

    return (
        <Box padding="2rem" maxWidth="1200px" margin="0 auto">
            <Box marginBottom="3rem">
                <h1 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: 'bold' }}>
                    Tab Component Examples
                </h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    Interactive examples showcasing different Tab component configurations, animations, and use cases.
                </p>
            </Box>

            {/* Basic Tabs */}
            <Box marginBottom="4rem">
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    Basic Tabs (Default Variant)
                </h2>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                    Simple tabs with smooth animated focus ring transitions between selections.
                </p>
                <Tab
                    items={basicTabs}
                    activeTab={basicTab}
                    onTabChange={setBasicTab}
                    variant="default"
                    size="medium"
                />
            </Box>

            {/* Icon Tabs */}
            <Box marginBottom="4rem">
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    Tabs with Icons
                </h2>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                    Tabs featuring icons alongside labels for enhanced visual navigation.
                </p>
                <Tab
                    items={iconTabs}
                    activeTab={iconTab}
                    onTabChange={setIconTab}
                    variant="default"
                    size="medium"
                />
            </Box>

            {/* Badge Tabs */}
            <Box marginBottom="4rem">
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    Tabs with Badges
                </h2>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                    Tabs with notification badges showing unread counts or status indicators.
                </p>
                <Tab
                    items={badgeTabs}
                    activeTab={badgeTab}
                    onTabChange={setBadgeTab}
                    variant="default"
                    size="medium"
                />
            </Box>

            {/* Vertical Tabs */}
            <Box marginBottom="4rem">
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    Vertical Tabs Layout
                </h2>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                    Vertical orientation perfect for sidebar navigation and settings panels.
                </p>
                <Tab
                    items={verticalTabs}
                    activeTab={verticalTab}
                    onTabChange={setVerticalTab}
                    orientation="vertical"
                    variant="default"
                    size="medium"
                />
            </Box>

            {/* Pills Variant */}
            <Box marginBottom="4rem">
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    Pills Variant
                </h2>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                    Rounded pill-style tabs with filled active state and smooth transitions.
                </p>
                <Tab
                    items={pillsTabs}
                    activeTab={pillsTab}
                    onTabChange={setPillsTab}
                    variant="pills"
                    size="medium"
                    backgroundColor="#f1f5f9"
                />
            </Box>

            {/* Underline Variant */}
            <Box marginBottom="4rem">
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    Underline Variant (Full Width)
                </h2>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                    Clean underline indicator that slides between tabs, perfect for navigation headers.
                </p>
                <Tab
                    items={underlineTabs}
                    activeTab={underlineTab}
                    onTabChange={setUnderlineTab}
                    variant="underline"
                    size="medium"
                    fullWidth
                />
            </Box>

            {/* Custom Styled Tabs */}
            <Box marginBottom="4rem">
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    Custom Styled Tabs
                </h2>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                    Tabs with custom colors, larger size, and extended animation duration.
                </p>
                <Tab
                    items={customTabs}
                    activeTab={customTab}
                    onTabChange={setCustomTab}
                    variant="pills"
                    size="large"
                    activeColor="#10b981"
                    inactiveColor="#64748b"
                    backgroundColor="#f0fdf4"
                    animationDuration={400}
                />
            </Box>

            {/* Form Tabs */}
            <Box marginBottom="4rem">
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    Multi-Step Form Tabs
                </h2>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                    Perfect for breaking complex forms into manageable steps with progress indication.
                </p>
                <Tab
                    items={formTabs}
                    activeTab={formTab}
                    onTabChange={setFormTab}
                    variant="underline"
                    size="medium"
                    fullWidth
                />
            </Box>

            {/* Feature Highlights */}
            <Box 
                marginTop="4rem" 
                padding="2rem" 
                backgroundColor="#f8fafc" 
                borderRadius="12px"
                border="1px solid #e2e8f0"
            >
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    ✨ Key Features Demonstrated
                </h2>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1.5rem">
                    <Box>
                        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#3b82f6' }}>
                            🎯 Animated Focus Ring
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Smooth sliding animation provides clear visual feedback when switching tabs
                        </p>
                    </Box>
                    <Box>
                        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#10b981' }}>
                            ⌨️ Keyboard Navigation
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Full keyboard support with arrow keys, Home, End, Enter, and Space
                        </p>
                    </Box>
                    <Box>
                        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#f59e0b' }}>
                            📱 Responsive Design
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Seamlessly adapts to mobile, tablet, and desktop screen sizes
                        </p>
                    </Box>
                    <Box>
                        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#8b5cf6' }}>
                            🎨 Multiple Variants
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Default, pills, underline, and minimal styles for different use cases
                        </p>
                    </Box>
                    <Box>
                        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#ef4444' }}>
                            🔔 Badge Support
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Show notification counts and status indicators on tabs
                        </p>
                    </Box>
                    <Box>
                        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#06b6d4' }}>
                            ♿ Accessibility
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            ARIA attributes, focus management, and screen reader support
                        </p>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default TabExample