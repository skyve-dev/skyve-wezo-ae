import { configureStore } from '@reduxjs/toolkit'
import financeReducer, {
  fetchEarningsStats,
  fetchTransactions,
  fetchBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  verifyBankAccount,
  fetchPayouts,
  requestPayout,
  fetchInvoices,
  settleInvoice,
  clearError,
  setCurrentBankAccount,
  updateFilters,
  clearFilters,
  type BankAccount,
  type Transaction,
  type Payout,
  type EarningsStats,
  type Invoice
} from '../financeSlice'

// Mock API
jest.mock('../../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

import { api } from '../../../utils/api'

const mockApi = api as jest.Mocked<typeof api>

describe('financeSlice', () => {
  let store = configureStore({
    reducer: {
      finance: financeReducer
    }
  })

  beforeEach(() => {
    store = configureStore({
      reducer: {
        finance: financeReducer
      }
    })
    jest.clearAllMocks()
  })

  const mockBankAccount: BankAccount = {
    id: 'bank-1',
    accountHolderName: 'John Doe',
    bankName: 'Emirates NBD',
    iban: 'AE070331234567890123456',
    swiftCode: 'EBILAEAD',
    currency: 'AED',
    isDefault: true,
    isVerified: true,
    country: 'UAE',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  }

  const mockTransaction: Transaction = {
    id: 'txn-1',
    type: 'booking',
    description: 'Booking payment for reservation WZ-2024-001',
    amount: 1500,
    currency: 'AED',
    status: 'completed',
    reservationId: 'res-1',
    propertyId: 'prop-1',
    propertyName: 'Dubai Villa',
    guestName: 'Jane Smith',
    bookingReference: 'WZ-2024-001',
    paymentMethod: 'Credit Card',
    processingFee: 45,
    commissionRate: 15,
    netAmount: 1275,
    taxAmount: 0,
    createdAt: '2024-03-01T10:00:00Z',
    processedAt: '2024-03-01T10:05:00Z'
  }

  const mockEarningsStats: EarningsStats = {
    thisMonth: {
      gross: 5000,
      net: 4250,
      currency: 'AED',
      bookingCount: 3,
      averageBookingValue: 1666.67,
      growthPercent: 12.5
    },
    yearToDate: {
      gross: 25000,
      net: 21250,
      currency: 'AED',
      bookingCount: 15,
      growthPercent: 25.3
    },
    pendingPayout: {
      amount: 4250,
      currency: 'AED',
      nextPayoutDate: '2024-03-15',
      transactionCount: 3
    },
    totalEarnings: {
      gross: 50000,
      net: 42500,
      currency: 'AED'
    },
    monthlyBreakdown: [
      {
        month: '2024-03',
        gross: 5000,
        net: 4250,
        bookingCount: 3
      }
    ],
    topProperties: [
      {
        propertyId: 'prop-1',
        propertyName: 'Dubai Villa',
        earnings: 15000,
        bookingCount: 8
      }
    ]
  }

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().finance
      expect(state).toEqual({
        bankAccounts: [],
        currentBankAccount: null,
        transactions: [],
        payouts: [],
        invoices: [],
        stats: null,
        loading: false,
        error: null,
        filters: {
          transactionType: null,
          status: null,
          propertyId: null,
          dateRange: {
            start: null,
            end: null
          }
        }
      })
    })
  })

  describe('reducers', () => {
    it('should clear error', () => {
      store.dispatch(clearError())
      const state = store.getState().finance
      expect(state.error).toBeNull()
    })

    it('should set current bank account', () => {
      store.dispatch(setCurrentBankAccount(mockBankAccount))
      const state = store.getState().finance
      expect(state.currentBankAccount).toEqual(mockBankAccount)
    })

    it('should update filters', () => {
      const newFilters = {
        transactionType: 'booking',
        status: 'completed',
        dateRange: {
          start: '2024-03-01',
          end: '2024-03-31'
        }
      }

      store.dispatch(updateFilters(newFilters))

      const state = store.getState().finance
      expect(state.filters).toEqual({
        ...state.filters,
        ...newFilters
      })
    })

    it('should clear filters', () => {
      // First set some filters
      store.dispatch(updateFilters({
        transactionType: 'booking',
        propertyId: 'prop-1'
      }))

      // Then clear them
      store.dispatch(clearFilters())

      const state = store.getState().finance
      expect(state.filters).toEqual({
        transactionType: null,
        status: null,
        propertyId: null,
        dateRange: { start: null, end: null }
      })
    })
  })

  describe('fetchEarningsStats async thunk', () => {
    it('should fetch earnings stats successfully', async () => {
      mockApi.get.mockResolvedValue({ stats: mockEarningsStats })

      await store.dispatch(fetchEarningsStats({
        start: '2024-01-01',
        end: '2024-03-31'
      }))

      const state = store.getState().finance
      expect(state.stats).toEqual(mockEarningsStats)
      expect(state.loading).toBe(false)
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/finance/earnings/stats')
      )
    })

    it('should handle fetch earnings stats error', async () => {
      const errorMessage = 'Failed to fetch earnings stats'
      mockApi.get.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(fetchEarningsStats())

      const state = store.getState().finance
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('fetchTransactions async thunk', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = [mockTransaction]
      mockApi.get.mockResolvedValue({ transactions: mockTransactions, total: 1 })

      await store.dispatch(fetchTransactions({
        type: 'booking',
        status: 'completed',
        page: 1,
        limit: 10
      }))

      const state = store.getState().finance
      expect(state.transactions).toEqual(mockTransactions)
      expect(state.loading).toBe(false)
    })

    it('should handle fetch transactions error', async () => {
      const errorMessage = 'Failed to fetch transactions'
      mockApi.get.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      await store.dispatch(fetchTransactions({}))

      const state = store.getState().finance
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('bank account management', () => {
    it('should fetch bank accounts successfully', async () => {
      const mockBankAccounts = [mockBankAccount]
      mockApi.get.mockResolvedValue({ bankAccounts: mockBankAccounts })

      await store.dispatch(fetchBankAccounts())

      const state = store.getState().finance
      expect(state.bankAccounts).toEqual(mockBankAccounts)
      expect(state.currentBankAccount).toEqual(mockBankAccount) // Should set default as current
    })

    it('should add bank account successfully', async () => {
      const newBankAccount = { ...mockBankAccount, id: 'bank-2', isDefault: false }
      mockApi.post.mockResolvedValue({ bankAccount: newBankAccount })

      await store.dispatch(addBankAccount({
        accountHolderName: 'John Doe',
        bankName: 'ADCB',
        iban: 'AE070331234567890123457',
        currency: 'AED',
        isDefault: false,
        country: 'UAE'
      }))

      const state = store.getState().finance
      expect(state.bankAccounts).toContain(newBankAccount)
      expect(state.loading).toBe(false)
    })

    it('should update bank account successfully', async () => {
      // First add account to state
      store = configureStore({
        reducer: { finance: financeReducer },
        preloadedState: {
          finance: {
            ...store.getState().finance,
            bankAccounts: [mockBankAccount],
            currentBankAccount: mockBankAccount
          }
        }
      })

      const updatedAccount = { ...mockBankAccount, accountHolderName: 'John Updated' }
      mockApi.patch.mockResolvedValue({ bankAccount: updatedAccount })

      await store.dispatch(updateBankAccount({
        accountId: 'bank-1',
        updates: { accountHolderName: 'John Updated' }
      }))

      const state = store.getState().finance
      expect(state.bankAccounts[0].accountHolderName).toBe('John Updated')
      expect(state.currentBankAccount?.accountHolderName).toBe('John Updated')
    })

    it('should delete bank account successfully', async () => {
      // First add accounts to state
      const secondAccount = { ...mockBankAccount, id: 'bank-2', isDefault: false }
      store = configureStore({
        reducer: { finance: financeReducer },
        preloadedState: {
          finance: {
            ...store.getState().finance,
            bankAccounts: [mockBankAccount, secondAccount],
            currentBankAccount: mockBankAccount
          }
        }
      })

      mockApi.delete.mockResolvedValue({})

      await store.dispatch(deleteBankAccount('bank-2'))

      const state = store.getState().finance
      expect(state.bankAccounts).not.toContain(secondAccount)
      expect(state.bankAccounts).toHaveLength(1)
    })

    it('should verify bank account successfully', async () => {
      const verifiedAccount = { ...mockBankAccount, isVerified: true }
      mockApi.post.mockResolvedValue({ bankAccount: verifiedAccount })

      await store.dispatch(verifyBankAccount({
        accountId: 'bank-1',
        verificationData: { microDeposit1: 0.12, microDeposit2: 0.34 }
      }))

      const state = store.getState().finance
      expect(state.loading).toBe(false)
    })
  })

  describe('payout management', () => {
    it('should fetch payouts successfully', async () => {
      const mockPayouts: Payout[] = [{
        id: 'payout-1',
        bankAccountId: 'bank-1',
        amount: 4250,
        currency: 'AED',
        status: 'completed',
        scheduledDate: '2024-03-15',
        processedDate: '2024-03-15',
        transactionIds: ['txn-1', 'txn-2'],
        reference: 'PO-2024-001',
        fees: {
          platformFee: 212.5,
          processingFee: 10,
          taxAmount: 0
        },
        createdAt: '2024-03-10T10:00:00Z',
        updatedAt: '2024-03-15T14:30:00Z'
      }]

      mockApi.get.mockResolvedValue({ payouts: mockPayouts })

      await store.dispatch(fetchPayouts({
        status: 'completed',
        dateRange: {
          start: '2024-03-01',
          end: '2024-03-31'
        }
      }))

      const state = store.getState().finance
      expect(state.payouts).toEqual(mockPayouts)
    })

    it('should request payout successfully', async () => {
      const newPayout: Payout = {
        id: 'payout-2',
        bankAccountId: 'bank-1',
        amount: 2000,
        currency: 'AED',
        status: 'pending',
        scheduledDate: '2024-03-20',
        transactionIds: ['txn-3'],
        reference: 'PO-2024-002',
        fees: {
          platformFee: 100,
          processingFee: 5,
          taxAmount: 0
        },
        createdAt: '2024-03-15T10:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z'
      }

      mockApi.post.mockResolvedValue({ payout: newPayout })

      await store.dispatch(requestPayout({
        bankAccountId: 'bank-1',
        amount: 2000
      }))

      const state = store.getState().finance
      expect(state.payouts[0]).toEqual(newPayout) // Should be added to front
      expect(state.loading).toBe(false)
    })
  })

  describe('invoice management', () => {
    it('should fetch invoices successfully', async () => {
      const mockInvoices: Invoice[] = [{
        id: 'inv-1',
        invoiceNumber: 'INV-2024-001',
        type: 'commission',
        description: 'March 2024 Commission',
        amount: 750,
        currency: 'AED',
        taxAmount: 37.5,
        totalAmount: 787.5,
        status: 'sent',
        dueDate: '2024-04-15',
        downloadUrl: '/invoices/inv-1.pdf',
        reservationIds: ['res-1', 'res-2'],
        createdAt: '2024-03-31T10:00:00Z',
        updatedAt: '2024-03-31T10:00:00Z'
      }]

      mockApi.get.mockResolvedValue({ invoices: mockInvoices })

      await store.dispatch(fetchInvoices({
        status: 'sent',
        type: 'commission'
      }))

      const state = store.getState().finance
      expect(state.invoices).toEqual(mockInvoices)
    })

    it('should settle invoice successfully', async () => {
      const mockInvoice: Invoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-2024-001',
        type: 'commission',
        description: 'March 2024 Commission',
        amount: 750,
        currency: 'AED',
        taxAmount: 37.5,
        totalAmount: 787.5,
        status: 'sent',
        dueDate: '2024-04-15',
        reservationIds: ['res-1'],
        createdAt: '2024-03-31T10:00:00Z',
        updatedAt: '2024-03-31T10:00:00Z'
      }

      // Set initial state with invoice
      store = configureStore({
        reducer: { finance: financeReducer },
        preloadedState: {
          finance: {
            ...store.getState().finance,
            invoices: [mockInvoice]
          }
        }
      })

      const settledInvoice = { ...mockInvoice, status: 'paid' as const, paidDate: '2024-04-10' }
      mockApi.patch.mockResolvedValue({ invoice: settledInvoice })

      await store.dispatch(settleInvoice({
        invoiceId: 'inv-1',
        paymentReference: 'PAY-2024-001'
      }))

      const state = store.getState().finance
      expect(state.invoices[0].status).toBe('paid')
      expect(state.invoices[0].paidDate).toBe('2024-04-10')
    })
  })

  describe('edge cases', () => {
    it('should handle empty data gracefully', async () => {
      mockApi.get.mockResolvedValue({ bankAccounts: [] })
      await store.dispatch(fetchBankAccounts())

      const state = store.getState().finance
      expect(state.bankAccounts).toEqual([])
      expect(state.currentBankAccount).toBeNull()
    })

    it('should set first account as current when no default exists', async () => {
      const accounts = [
        { ...mockBankAccount, isDefault: false },
        { ...mockBankAccount, id: 'bank-2', isDefault: false }
      ]
      mockApi.get.mockResolvedValue({ bankAccounts: accounts })

      await store.dispatch(fetchBankAccounts())

      const state = store.getState().finance
      expect(state.currentBankAccount).toEqual(accounts[0])
    })

    it('should handle network errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await store.dispatch(fetchEarningsStats())

      const state = store.getState().finance
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Failed to fetch earnings stats')
    })

    it('should update current account when deleted if it was the current one', async () => {
      const accounts = [mockBankAccount, { ...mockBankAccount, id: 'bank-2', isDefault: false }]
      store = configureStore({
        reducer: { finance: financeReducer },
        preloadedState: {
          finance: {
            ...store.getState().finance,
            bankAccounts: accounts,
            currentBankAccount: mockBankAccount
          }
        }
      })

      mockApi.delete.mockResolvedValue({})

      await store.dispatch(deleteBankAccount('bank-1')) // Delete current account

      const state = store.getState().finance
      expect(state.currentBankAccount?.id).toBe('bank-2') // Should switch to remaining account
    })
  })
})