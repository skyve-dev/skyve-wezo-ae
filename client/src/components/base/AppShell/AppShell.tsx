import React, { useState, useEffect, useRef } from 'react'
import { Box } from '../Box'
import { Button } from '../Button'
import SlidingDrawer from '../SlidingDrawer'
import Tab, { TabItem } from '../Tab'
import Dialog from '../Dialog'
import { useAppShell } from './AppShellContext.tsx'
import { AppShellConfig, SplashPhase } from './types'
import type { BaseRoute } from './types.enhanced'
import { FaBars, FaTimes } from 'react-icons/fa'

interface AppShellProps<T extends Record<string, BaseRoute>> {
  routes: T
  config?: AppShellConfig
  className?: string
  style?: React.CSSProperties
}

const AppShell = <T extends Record<string, BaseRoute>>({
  routes,
  config,
  className,
  style
}: AppShellProps<T>) => {
  // Context and state
  const { 
    navigateTo, 
    currentRoute, 
    isSideNavOpen, 
    setSideNavOpen,
    isLoading,
    dialogState,
    closeDialog,
    renderOutlet
  } = useAppShell<T>()

  // Splash screen state
  const [splashPhase, setSplashPhase] = useState<SplashPhase>('loading')
  const [showContent, setShowContent] = useState(false)
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false)
  const [, setIsTablet] = useState(false)
  
  // Refs
  const splashRef = useRef<HTMLDivElement>(null)

  // Configuration with defaults
  const {
    splash = {
      duration: 2000,
      text: 'Loading...'
    },
    header = {
      title: 'App',
      showQuickNav: true
    },
    footer = {
      showOnMobile: true,
      maxItems: 4
    },
    breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    },
    theme = {
      primaryColor: '#3b82f6',
      backgroundColor: '#f8fafc',
      navBackgroundColor: '#ffffff'
    }
  } = config || {}

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < breakpoints.mobile)
      setIsTablet(width >= breakpoints.mobile && width < breakpoints.desktop)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoints])

  // Splash screen effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashPhase('expanding')
      
      // Start the circle expansion animation
      setTimeout(() => {
        setSplashPhase('complete')
        setShowContent(true)
      }, 800) // Animation duration
    }, splash.duration)

    return () => clearTimeout(timer)
  }, [splash.duration])

  // Get current route component
  const currentRouteData = Object.values(routes).find(route => 
    route.path === currentRoute || route.fullPath === currentRoute
  )
  const CurrentComponent = currentRouteData?.component

  // Get navigation items
  const navItems = Object.entries(routes)
    .filter(([_, route]) => route.showInNav !== false)
    .map(([path, route]) => ({
      id: path,
      label: route.label,
      icon: route.icon,
      onClick: () => navigateTo(route.path || `/${path}`)
    }))

  // Get header quick nav items
  const headerNavItems: TabItem[] = Object.entries(routes)
    .filter(([_, route]) => route.showInHeader !== false && (!isMobile || route.showInFooter !== false))
    .slice(0, isMobile ? footer.maxItems : undefined)
    .map(([path, route]) => ({
      id: path,
      label: route.label,
      icon: route.icon,
      content: <></>
    }))

  // Get footer nav items (mobile only)
  const footerNavItems = Object.entries(routes)
    .filter(([_, route]) => route.showInFooter !== false)
    .slice(0, footer.maxItems)
    .map(([path, route]) => ({
      id: path,
      label: route.label,
      icon: route.icon,
      onClick: () => navigateTo(route.path || `/${path}`)
    }))

  // Handle dialog button clicks
  const handleDialogButton = async (onClick: () => Promise<void>) => {
    try {
      await onClick()
      if (closeDialog) {
        closeDialog()
      }
    } catch (error) {
      console.error('Dialog button error:', error)
      // Still close dialog on error
      if (closeDialog) {
        closeDialog()
      }
    }
  }

  return (
    <Box 
      className={className}
      style={style}
      minHeight="100vh"
      backgroundColor={theme.backgroundColor}
      position="relative"
      overflow="hidden"
    >
      {/* Splash Screen */}
      {splashPhase !== 'complete' && (
        <Box
          ref={splashRef}
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          backgroundColor="white"
          zIndex="9999"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          style={{
            transform: splashPhase === 'expanding' 
              ? 'scale(0)' 
              : 'scale(1)',
            transformOrigin: 'center center',
            transition: splashPhase === 'expanding' 
              ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
              : 'none',
            borderRadius: splashPhase === 'expanding' ? '50%' : '0%'
          }}
        >
          {/* Splash Logo */}
          {splash.logo && (
            <Box fontSize="4rem" marginBottom="2rem" color={theme.primaryColor}>
              {splash.logo}
            </Box>
          )}
          
          {/* Splash Text */}
          <Box 
            fontSize="1.5rem" 
            fontWeight="600"
            color="#374151"
            marginBottom="1rem"
          >
            {splash.text}
          </Box>
          
          {/* Loading Animation */}
          <Box
            width="40px"
            height="40px"
            border="4px solid #f3f4f6"
            borderTop={`4px solid ${theme.primaryColor}`}
            borderRadius="50%"
            animation="spin 1s linear infinite"
            style={{
              animation: 'spin 1s linear infinite'
            }}
          />
        </Box>
      )}

      {/* Main Content */}
      {showContent && (
        <>
          {/* Header */}
          <Box
            position="sticky"
            top="0"
            zIndex="100"
            backgroundColor={theme.navBackgroundColor}
            borderBottom="1px solid #e5e7eb"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          >
            <Box 
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding="1rem 1.5rem"
              maxWidth="1200px"
              margin="0 auto"
            >
              {/* Left: Menu Button + Logo/Title */}
              <Box display="flex" alignItems="center" gap="1rem">
                <Button
                  label=""
                  icon={<FaBars />}
                  onClick={() => setSideNavOpen(true)}
                  variant="normal"
                  size="small"
                  backgroundColor="transparent"
                  border="none"
                  color={theme.primaryColor}
                  aria-label="Open navigation menu"
                />
                
                {header.logo && (
                  <Box fontSize="1.5rem" color={theme.primaryColor}>
                    {header.logo}
                  </Box>
                )}
                
                {header.title && (
                  <Box 
                    fontSize="1.25rem" 
                    fontWeight="bold"
                    color="#1a202c"
                  >
                    {header.title}
                  </Box>
                )}
              </Box>

              {/* Center: Quick Navigation (Desktop/Tablet) */}
              {header.showQuickNav && !isMobile && headerNavItems.length > 0 && (
                <Box flex="1" maxWidth="600px" margin="0 2rem">
                  <Tab
                    items={headerNavItems}
                    activeTab={Object.keys(routes).find(key => 
                      routes[key].path === currentRoute || routes[key].fullPath === currentRoute
                    ) || String(currentRoute)}
                    onTabChange={(tabId) => {
                      const route = Object.values(routes).find(r => r.path === tabId || `/${tabId}` === r.path)
                      if (route) {
                        navigateTo(route.path)
                      }
                    }}
                    variant="minimal"
                    size="small"
                    fullWidth
                    centered
                  />
                </Box>
              )}

              {/* Right: Actions */}
              {header.actions && (
                <Box display="flex" alignItems="center" gap="0.5rem">
                  {header.actions}
                </Box>
              )}
            </Box>
          </Box>

          {/* Main Content Area */}
          <Box
            flex="1"
            paddingBottom={isMobile && footer.showOnMobile ? "4rem" : "0"}
            minHeight="calc(100vh - 4rem)"
          >
            {renderOutlet ? renderOutlet() : (CurrentComponent && <CurrentComponent />)}
          </Box>

          {/* Footer (Mobile Only) */}
          {isMobile && footer.showOnMobile && footerNavItems.length > 0 && (
            <Box
              position="fixed"
              bottom="0"
              left="0"
              right="0"
              backgroundColor={theme.navBackgroundColor}
              borderTop="1px solid #e5e7eb"
              zIndex="90"
              paddingY="0.5rem"
              boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
            >
              <Box 
                display="flex"
                justifyContent="space-around"
                alignItems="center"
                maxWidth="100%"
                margin="0 auto"
                paddingX="1rem"
              >
                {footerNavItems.map((item) => (
                  <Button
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    onClick={item.onClick}
                    variant="normal"
                    size="small"
                    backgroundColor="transparent"
                    border="none"
                    color={routes[item.id]?.path === currentRoute ? theme.primaryColor : '#6b7280'}
                    fontWeight={routes[item.id]?.path === currentRoute ? '600' : '400'}
                    fontSize="0.75rem"
                    flexDirection="column"
                    gap="0.25rem"
                    padding="0.5rem"
                    style={{
                      minWidth: 'auto',
                      flex: 1
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Side Navigation Drawer */}
          <SlidingDrawer
            isOpen={isSideNavOpen}
            onClose={() => setSideNavOpen(false)}
            side="left"
            width="280px"
            backgroundColor={theme.navBackgroundColor}
          >
            <Box padding="1.5rem">
              {/* Drawer Header */}
              <Box 
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                marginBottom="2rem"
                paddingBottom="1rem"
                borderBottom="1px solid #e5e7eb"
              >
                <Box display="flex" alignItems="center" gap="0.75rem">
                  {header.logo && (
                    <Box fontSize="1.5rem" color={theme.primaryColor}>
                      {header.logo}
                    </Box>
                  )}
                  <Box fontSize="1.25rem" fontWeight="bold" color="#1a202c">
                    {header.title || 'Navigation'}
                  </Box>
                </Box>
                
                <Button
                  label=""
                  icon={<FaTimes />}
                  onClick={() => setSideNavOpen(false)}
                  variant="normal"
                  size="small"
                  backgroundColor="transparent"
                  border="none"
                  color="#6b7280"
                  aria-label="Close navigation menu"
                />
              </Box>

              {/* Navigation Items */}
              <Box display="flex" flexDirection="column" gap="0.5rem">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    onClick={item.onClick}
                    variant="normal"
                    size="medium"
                    backgroundColor={routes[item.id]?.path === currentRoute ? `${theme.primaryColor}15` : 'transparent'}
                    border="none"
                    color={routes[item.id]?.path === currentRoute ? theme.primaryColor : '#374151'}
                    fontWeight={routes[item.id]?.path === currentRoute ? '600' : '500'}
                    justifyContent="flex-start"
                    width="100%"
                    borderRadius="8px"
                    padding="0.75rem 1rem"
                    textAlign="left"
                    whileHover={{
                      backgroundColor: routes[item.id]?.path === currentRoute 
                        ? `${theme.primaryColor}20` 
                        : `${theme.primaryColor}08`
                    }}
                  />
                ))}
              </Box>
            </Box>
          </SlidingDrawer>

          {/* Alert Dialog */}
          {dialogState?.isOpen && dialogState.options && (
            <Dialog
              isOpen={true}
              onClose={() => {
                if (closeDialog) {
                  closeDialog()
                }
              }}
              width="400px"
              disableBackdropClick
            >
              <Box padding="2rem" textAlign="center">
                {/* Icon */}
                {dialogState.options.icon && (
                  <Box 
                    fontSize="3rem" 
                    marginBottom="1rem"
                    color={theme.primaryColor}
                  >
                    {dialogState.options.icon}
                  </Box>
                )}

                {/* Title */}
                <Box 
                  fontSize="1.5rem" 
                  fontWeight="600"
                  marginBottom="1rem"
                  color="#1a202c"
                >
                  {dialogState.options.title}
                </Box>

                {/* Text */}
                <Box 
                  fontSize="1rem"
                  color="#6b7280"
                  marginBottom="2rem"
                  lineHeight="1.5"
                >
                  {dialogState.options.text}
                </Box>

                {/* Buttons */}
                <Box 
                  display="flex"
                  gap="1rem"
                  justifyContent="center"
                  flexWrap="wrap"
                >
                  {dialogState.options.buttons.map((button, index) => (
                    <Button
                      key={index}
                      label={button.label}
                      onClick={() => handleDialogButton(button.onClick)}
                      variant={button.variant === 'danger' ? 'normal' : button.variant || 'normal'}
                      size="medium"
                    />
                  ))}
                </Box>
              </Box>
            </Dialog>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <Box
              position="fixed"
              top="0"
              left="0"
              width="100%"
              height="100%"
              backgroundColor="rgba(0, 0, 0, 0.5)"
              zIndex="9998"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                backgroundColor="white"
                borderRadius="8px"
                padding="2rem"
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap="1rem"
              >
                <Box
                  width="40px"
                  height="40px"
                  border="4px solid #f3f4f6"
                  borderTop={`4px solid ${theme.primaryColor}`}
                  borderRadius="50%"
                  animation="spin 1s linear infinite"
                  style={{
                    animation: 'spin 1s linear infinite'
                  }}
                />
                <Box fontSize="1rem" color="#6b7280">
                  Loading...
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  )
}

export default AppShell