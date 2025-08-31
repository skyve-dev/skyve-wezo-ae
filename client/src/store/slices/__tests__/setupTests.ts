// Jest setup file for Redux slice tests

import '@testing-library/jest-dom'

// Mock import.meta.env for Vite environment variables
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_BASE_URL: 'http://localhost:3000',
        VITE_APP_ENV: 'test',
        // Add other environment variables as needed
      }
    }
  },
  configurable: true
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock window.location
delete (window as any).location
// @ts-ignore
window.location = {
  ...window.location,
  reload: jest.fn(),
  assign: jest.fn(),
  replace: jest.fn()
}

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console outputs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock File and FileList for file upload tests
global.File = class MockFile {
  name: string
  size: number
  type: string
  lastModified: number

  constructor(bits: any[], filename: string, options: any = {}) {
    this.name = filename
    this.size = bits.reduce((acc, bit) => acc + (bit?.length || 0), 0)
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
  }
} as any

global.FileList = class MockFileList extends Array {
  item(index: number) {
    return this[index] || null
  }
} as any

// Mock FormData
global.FormData = class MockFormData {
  private data: Map<string, any> = new Map()

  append(name: string, value: any, _?: string) {
    this.data.set(name, value)
  }

  get(name: string) {
    return this.data.get(name)
  }

  getAll(name: string) {
    return [this.data.get(name)]
  }

  has(name: string) {
    return this.data.has(name)
  }

  delete(name: string) {
    this.data.delete(name)
  }

  entries() {
    return this.data.entries()
  }

  keys() {
    return this.data.keys()
  }

  values() {
    return this.data.values()
  }

  forEach(callback: (value: any, key: string) => void) {
    this.data.forEach(callback)
  }
} as any

// Setup timezone for consistent date testing
process.env.TZ = 'UTC'

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(a: number, b: number): R
    }
  }
}

// Custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
} as any

// Suppress specific warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()
})

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'HomeOwner',
  isAdmin: false,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  ...overrides
})

export const createMockProperty = (overrides = {}) => ({
  propertyId: 'prop-1',
  name: 'Test Villa',
  status: 'Live',
  address: {
    countryOrRegion: 'UAE',
    city: 'Dubai',
    zipCode: 12345
  },
  maximumGuest: 6,
  bathrooms: 3,
  allowChildren: true,
  offerCribs: false,
  amenities: [
    { id: 'wifi', name: 'WiFi', category: 'Technology' },
    { id: 'pool', name: 'Pool', category: 'Recreation' }
  ],
  photos: [],
  bookingType: 'BookInstantly',
  paymentType: 'Online',
  ownerId: 'user-1',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  ...overrides
})

export const createMockReservation = (overrides = {}) => ({
  id: 'res-1',
  propertyId: 'prop-1',
  propertyName: 'Test Villa',
  guestName: 'John Doe',
  guestEmail: 'john@example.com',
  checkIn: '2024-03-15',
  checkOut: '2024-03-20',
  numberOfGuests: 4,
  status: 'Confirmed',
  totalAmount: 1500,
  currency: 'AED',
  paymentStatus: 'paid',
  bookingReference: 'WZ-2024-001',
  createdAt: '2024-03-01T10:00:00Z',
  updatedAt: '2024-03-01T10:00:00Z',
  ...overrides
})

// Export test utilities
export { localStorageMock, sessionStorageMock }