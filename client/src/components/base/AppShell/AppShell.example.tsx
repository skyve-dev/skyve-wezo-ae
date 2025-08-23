import React, { useState } from 'react'
import { AppShell, AppShellProvider, createRoutes, useAppShell } from './index'
import { Box } from '../Box'
import { Button } from '../Button'
import { Input } from '../Input'
import {
  FaHome,
  FaUser,
  FaCog,
  FaChartBar,
  FaBell,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaRocket,
  FaHeart,
  FaStar,
  FaShieldAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa'

// Example Components for Different Routes
const HomePage: React.FC = () => {
  const { alertDialog, setLoading } = useAppShell()

  const handleQuickAction = async () => {
    await alertDialog({
      icon: <FaRocket />,
      title: 'Quick Action',
      text: 'This demonstrates the async dialog system. Choose an action below.',
      buttons: [
        {
          label: 'Show Loading',
          variant: 'primary',
          onClick: async () => {
            setLoading(true)
            await new Promise(resolve => setTimeout(resolve, 2000))
            setLoading(false)
          }
        },
        {
          label: 'Cancel',
          onClick: async () => {
            console.log('Action cancelled')
          }
        }
      ]
    })
  }

  return (
    <Box padding="2rem" maxWidth="800px" margin="0 auto">
      <Box marginBottom="2rem">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🏠 Welcome Home
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          This is the home page of the AppShell example. Here you can see how the navigation system works 
          and test various features like the async dialog system.
        </p>
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1.5rem" marginBottom="2rem">
        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#3b82f6' }}>
            📱 Responsive Design
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Try resizing your browser window to see how the navigation adapts between mobile, tablet, and desktop layouts.
          </p>
        </Box>

        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#10b981' }}>
            🎯 Type-Safe Navigation
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Navigation is fully type-safe. Components receive props with proper TypeScript validation.
          </p>
        </Box>

        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>
            💬 Dialog System
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Async alert dialogs with customizable buttons and promise-based handling.
          </p>
        </Box>
      </Box>

      <Box display="flex" gap="1rem" flexWrap="wrap">
        <Button
          label="Test Dialog System"
          icon={<FaRocket />}
          onClick={handleQuickAction}
          variant="promoted"
        />
        
        <Button
          label="Open Side Navigation"
          icon={<FaBars />}
          onClick={() => {
            // This won't work here because we're not in the context scope
            // The button is just for demonstration
            console.log('Side navigation would open')
          }}
          variant="normal"
        />
      </Box>
    </Box>
  )
}

const ProfilePage: React.FC<{ userId?: string; tab?: string }> = ({ 
  userId = 'demo-user', 
  tab = 'info' 
}) => {
  const { alertDialog, navigateTo } = useAppShell<typeof routes>()
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software developer passionate about creating great user experiences.'
  })

  const handleSaveProfile = async () => {
    await alertDialog({
      icon: <FaCheckCircle />,
      title: 'Save Profile',
      text: 'Do you want to save your profile changes?',
      buttons: [
        {
          label: 'Save',
          variant: 'primary',
          onClick: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            setEditing(false)
          }
        },
        {
          label: 'Cancel',
          onClick: async () => {
            setEditing(false)
          }
        }
      ]
    })
  }

  return (
    <Box padding="2rem" maxWidth="800px" margin="0 auto">
      <Box marginBottom="2rem">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          👤 User Profile
        </h1>
        <p style={{ color: '#6b7280' }}>
          User ID: {userId} | Active Tab: {tab}
        </p>
      </Box>

      <Box backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" padding="2rem">
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="2rem">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Profile Information</h2>
          <Button
            label={editing ? 'Cancel' : 'Edit'}
            icon={editing ? <FaTimes /> : <FaEdit />}
            onClick={() => setEditing(!editing)}
            variant="normal"
            size="small"
          />
        </Box>

        <Box display="flex" flexDirection="column" gap="1.5rem">
          <Box>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Name
            </label>
            {editing ? (
              <Input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                width="100%"
              />
            ) : (
              <p style={{ color: '#374151' }}>{profile.name}</p>
            )}
          </Box>

          <Box>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Email
            </label>
            {editing ? (
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                width="100%"
              />
            ) : (
              <p style={{ color: '#374151' }}>{profile.email}</p>
            )}
          </Box>

          <Box>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Bio
            </label>
            {editing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                }}
              />
            ) : (
              <p style={{ color: '#374151' }}>{profile.bio}</p>
            )}
          </Box>

          {editing && (
            <Box display="flex" gap="1rem">
              <Button
                label="Save Changes"
                onClick={handleSaveProfile}
                variant="promoted"
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box marginTop="2rem">
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Navigation Examples
        </h3>
        <Box display="flex" gap="1rem" flexWrap="wrap">
          <Button
            label="View Settings Tab"
            onClick={() => navigateTo('profile', { userId, tab: 'settings' })}
            variant="normal"
            size="small"
          />
          <Button
            label="View Activity Tab"
            onClick={() => navigateTo('profile', { userId, tab: 'activity' })}
            variant="normal"
            size="small"
          />
          <Button
            label="Go to Dashboard"
            onClick={() => navigateTo('dashboard', {})}
            variant="normal"
            size="small"
          />
        </Box>
      </Box>
    </Box>
  )
}

const DashboardPage: React.FC = () => {
  const { alertDialog } = useAppShell()

  const handleDeleteItem = async (itemName: string) => {
    await alertDialog({
      icon: <FaExclamationTriangle />,
      title: 'Delete Item',
      text: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      buttons: [
        {
          label: 'Delete',
          variant: 'danger',
          onClick: async () => {
            // Simulate deletion
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Show success message
            await alertDialog({
              icon: <FaCheckCircle />,
              title: 'Deleted Successfully',
              text: `"${itemName}" has been deleted.`,
              buttons: [
                {
                  label: 'OK',
                  variant: 'primary',
                  onClick: async () => {}
                }
              ]
            })
          }
        },
        {
          label: 'Cancel',
          onClick: async () => {
            console.log('Deletion cancelled')
          }
        }
      ]
    })
  }

  return (
    <Box padding="2rem" maxWidth="1000px" margin="0 auto">
      <Box marginBottom="2rem">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          📊 Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>
          Overview of your application data and quick actions.
        </p>
      </Box>

      {/* Stats Grid */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1.5rem" marginBottom="3rem">
        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" textAlign="center">
          <Box fontSize="2rem" color="#3b82f6" marginBottom="0.5rem">
            <FaUser />
          </Box>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>1,234</h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Users</p>
        </Box>

        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" textAlign="center">
          <Box fontSize="2rem" color="#10b981" marginBottom="0.5rem">
            <FaChartBar />
          </Box>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>$12,345</h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Revenue</p>
        </Box>

        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" textAlign="center">
          <Box fontSize="2rem" color="#f59e0b" marginBottom="0.5rem">
            <FaStar />
          </Box>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>4.8</h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Rating</p>
        </Box>

        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" textAlign="center">
          <Box fontSize="2rem" color="#ef4444" marginBottom="0.5rem">
            <FaHeart />
          </Box>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>567</h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Favorites</p>
        </Box>
      </Box>

      {/* Recent Items */}
      <Box backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" padding="2rem">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          Recent Items
        </h2>
        
        <Box display="flex" flexDirection="column" gap="1rem">
          {[
            { name: 'Project Alpha', type: 'Project', date: '2 hours ago' },
            { name: 'User Settings Update', type: 'Configuration', date: '5 hours ago' },
            { name: 'Database Backup', type: 'System', date: '1 day ago' },
            { name: 'Payment Processing', type: 'Transaction', date: '2 days ago' }
          ].map((item, index) => (
            <Box 
              key={index}
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              padding="1rem"
              backgroundColor="#f8fafc"
              borderRadius="6px"
            >
              <Box>
                <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</h4>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.type} • {item.date}</p>
              </Box>
              <Box display="flex" gap="0.5rem">
                <Button
                  label=""
                  icon={<FaEdit />}
                  onClick={() => console.log('Edit', item.name)}
                  variant="normal"
                  size="small"
                  backgroundColor="transparent"
                  border="none"
                  color="#3b82f6"
                  aria-label={`Edit ${item.name}`}
                />
                <Button
                  label=""
                  icon={<FaTrash />}
                  onClick={() => handleDeleteItem(item.name)}
                  variant="normal"
                  size="small"
                  backgroundColor="transparent"
                  border="none"
                  color="#ef4444"
                  aria-label={`Delete ${item.name}`}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

const SettingsPage: React.FC = () => {
  const { alertDialog, setLoading } = useAppShell()
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
    language: 'en'
  })

  const handleSaveSettings = async () => {
    await alertDialog({
      icon: <FaInfoCircle />,
      title: 'Save Settings',
      text: 'Do you want to save your settings changes?',
      buttons: [
        {
          label: 'Save',
          variant: 'primary',
          onClick: async () => {
            setLoading(true)
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1500))
              
              await alertDialog({
                icon: <FaCheckCircle />,
                title: 'Settings Saved',
                text: 'Your settings have been saved successfully.',
                buttons: [
                  {
                    label: 'OK',
                    variant: 'primary',
                    onClick: async () => {}
                  }
                ]
              })
            } catch (error) {
              await alertDialog({
                icon: <FaExclamationTriangle />,
                title: 'Save Failed',
                text: 'Failed to save settings. Please try again.',
                buttons: [
                  {
                    label: 'OK',
                    variant: 'primary',
                    onClick: async () => {}
                  }
                ]
              })
            } finally {
              setLoading(false)
            }
          }
        },
        {
          label: 'Cancel',
          onClick: async () => {
            console.log('Settings save cancelled')
          }
        }
      ]
    })
  }

  return (
    <Box padding="2rem" maxWidth="800px" margin="0 auto">
      <Box marginBottom="2rem">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          ⚙️ Settings
        </h1>
        <p style={{ color: '#6b7280' }}>
          Configure your application preferences and options.
        </p>
      </Box>

      <Box backgroundColor="white" borderRadius="8px" border="1px solid #e5e7eb" padding="2rem">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '2rem' }}>
          General Settings
        </h2>

        <Box display="flex" flexDirection="column" gap="2rem">
          {/* Notifications */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Notifications</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Receive notifications about important updates
              </p>
            </Box>
            <Button
              label={settings.notifications ? 'Enabled' : 'Disabled'}
              onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
              variant={settings.notifications ? 'promoted' : 'normal'}
              size="small"
            />
          </Box>

          {/* Dark Mode */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Dark Mode</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Use dark theme for the interface
              </p>
            </Box>
            <Button
              label={settings.darkMode ? 'On' : 'Off'}
              onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              variant={settings.darkMode ? 'promoted' : 'normal'}
              size="small"
            />
          </Box>

          {/* Auto Save */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Auto Save</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Automatically save changes as you work
              </p>
            </Box>
            <Button
              label={settings.autoSave ? 'Enabled' : 'Disabled'}
              onClick={() => setSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
              variant={settings.autoSave ? 'promoted' : 'normal'}
              size="small"
            />
          </Box>

          {/* Language */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Language</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Choose your preferred language
              </p>
            </Box>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </Box>
        </Box>

        <Box marginTop="2rem" paddingTop="2rem" borderTop="1px solid #e5e7eb">
          <Button
            label="Save Settings"
            icon={<FaCheckCircle />}
            onClick={handleSaveSettings}
            variant="promoted"
          />
        </Box>
      </Box>
    </Box>
  )
}

const NotificationsPage: React.FC = () => {
  const { alertDialog } = useAppShell<typeof routes>()

  const handleMarkAllRead = async () => {
    await alertDialog({
      icon: <FaCheckCircle />,
      title: 'Mark All as Read',
      text: 'This will mark all notifications as read. Continue?',
      buttons: [
        {
          label: 'Mark All Read',
          variant: 'primary',
          onClick: async () => {
            console.log('All notifications marked as read')
          }
        },
        {
          label: 'Cancel',
          onClick: async () => {}
        }
      ]
    })
  }

  return (
    <Box padding="2rem" maxWidth="800px" margin="0 auto">
      <Box marginBottom="2rem">
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            🔔 Notifications
          </h1>
          <Button
            label="Mark All Read"
            onClick={handleMarkAllRead}
            variant="normal"
            size="small"
          />
        </Box>
        <p style={{ color: '#6b7280' }}>
          Stay updated with the latest notifications and alerts.
        </p>
      </Box>

      <Box display="flex" flexDirection="column" gap="1rem">
        {[
          {
            title: 'New User Registration',
            message: 'John Doe has registered for an account',
            time: '5 minutes ago',
            unread: true,
            type: 'user'
          },
          {
            title: 'System Update Available',
            message: 'A new system update is available for installation',
            time: '1 hour ago',
            unread: true,
            type: 'system'
          },
          {
            title: 'Payment Received',
            message: 'Payment of $99.00 has been received',
            time: '3 hours ago',
            unread: false,
            type: 'payment'
          },
          {
            title: 'Backup Completed',
            message: 'Daily backup has been completed successfully',
            time: '1 day ago',
            unread: false,
            type: 'system'
          }
        ].map((notification, index) => (
          <Box
            key={index}
            padding="1.5rem"
            backgroundColor="white"
            borderRadius="8px"
            border="1px solid #e5e7eb"
            style={{
              borderLeft: notification.unread ? '4px solid #3b82f6' : '4px solid transparent'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="start" marginBottom="0.5rem">
              <h3 style={{ 
                fontWeight: notification.unread ? '600' : '500',
                color: notification.unread ? '#1a202c' : '#6b7280'
              }}>
                {notification.title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {notification.time}
              </span>
            </Box>
            <p style={{ 
              color: notification.unread ? '#374151' : '#9ca3af',
              fontSize: '0.875rem'
            }}>
              {notification.message}
            </p>
            {notification.unread && (
              <Box marginTop="0.5rem">
                <span style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  New
                </span>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Define the routes with type safety
const routes = createRoutes({
  home: {
    path: 'home',
    component: HomePage,
    icon: <FaHome />,
    label: 'Home',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  profile: {
    path: 'profile',
    component: ProfilePage,
    icon: <FaUser />,
    label: 'Profile',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  dashboard: {
    path: 'dashboard',
    component: DashboardPage,
    icon: <FaChartBar />,
    label: 'Dashboard',
    showInNav: true,
    showInHeader: true,
    showInFooter: true
  },
  settings: {
    path: 'settings',
    component: SettingsPage,
    icon: <FaCog />,
    label: 'Settings',
    showInNav: true,
    showInHeader: false,
    showInFooter: true
  },
  notifications: {
    path: 'notifications',
    component: NotificationsPage,
    icon: <FaBell />,
    label: 'Notifications',
    showInNav: true,
    showInHeader: false,
    showInFooter: false
  }
})

// Main Example Component
const AppShellExample: React.FC = () => {
  return (
    <Box minHeight="100vh" backgroundColor="#f8fafc">
      <AppShellProvider routes={routes} initialRoute="home">
        <AppShell 
          routes={routes}
          config={{
            splash: {
              duration: 1500,
              logo: <FaRocket />,
              text: 'Loading AppShell Demo...'
            },
            header: {
              title: 'AppShell Demo',
              logo: <FaShieldAlt />,
              showQuickNav: true,
              actions: [
                <Button
                  key="search"
                  label=""
                  icon={<FaSearch />}
                  onClick={() => console.log('Search clicked')}
                  variant="normal"
                  size="small"
                  backgroundColor="transparent"
                  border="none"
                  color="#6b7280"
                  aria-label="Search"
                />,
                <Button
                  key="add"
                  label=""
                  icon={<FaPlus />}
                  onClick={() => console.log('Add clicked')}
                  variant="promoted"
                  size="small"
                  borderRadius="50%"
                  width="2rem"
                  height="2rem"
                  padding="0"
                  aria-label="Add new item"
                  style={{ minWidth: 'auto' }}
                />
              ]
            },
            footer: {
              showOnMobile: true,
              maxItems: 4
            },
            theme: {
              primaryColor: '#3b82f6',
              backgroundColor: '#f8fafc',
              navBackgroundColor: '#ffffff'
            },
            breakpoints: {
              mobile: 768,
              tablet: 1024,
              desktop: 1200
            }
          }}
        />
      </AppShellProvider>
      
      {/* Instructions overlay for demo */}
      <Box
        position="fixed"
        bottom="1rem"
        right="1rem"
        backgroundColor="white"
        borderRadius="8px"
        padding="1rem"
        boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
        border="1px solid #e5e7eb"
        maxWidth="300px"
        zIndex="50"
        displaySm="none" // Hide on small screens to avoid overlap with footer
      >
        <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          🎮 Demo Instructions
        </h4>
        <ul style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, paddingLeft: '1rem' }}>
          <li>Resize window to test responsive behavior</li>
          <li>Try navigation between different sections</li>
          <li>Test the async dialog system</li>
          <li>Open side navigation menu</li>
          <li>Check mobile footer navigation</li>
        </ul>
      </Box>
    </Box>
  )
}

export default AppShellExample