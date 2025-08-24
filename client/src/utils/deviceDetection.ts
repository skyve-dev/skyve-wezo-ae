/**
 * Device detection utilities for responsive routing
 */

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  // Check for mobile user agents
  const mobileUserAgents = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i
  ]

  const isMobileUserAgent = mobileUserAgents.some(regex => 
    navigator.userAgent.match(regex)
  )

  // Check for small screen size (additional check)
  const isSmallScreen = window.innerWidth <= 768

  // Check for touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Device is considered mobile if:
  // 1. It has a mobile user agent, OR
  // 2. It has a small screen AND is a touch device
  return isMobileUserAgent || (isSmallScreen && isTouchDevice)
}

export const getPropertyRegistrationRoute = (): string => {
  return '/register-property'
}