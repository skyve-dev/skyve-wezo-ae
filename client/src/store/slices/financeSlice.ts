import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../utils/api'

// Types
export interface BankAccount {
  id: string
  accountHolderName: string
  bankName: string
  iban: string
  swiftCode?: string
  currency: string
  isDefault: boolean
  isVerified: boolean
  country: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  type: 'booking' | 'payout' | 'refund' | 'fee' | 'adjustment' | 'commission'
  description: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  reservationId?: string
  propertyId?: string
  propertyName?: string
  guestName?: string
  bookingReference?: string
  paymentMethod?: string
  processingFee?: number
  commissionRate?: number
  netAmount: number
  taxAmount?: number
  createdAt: string
  processedAt?: string
  failureReason?: string
}

export interface Payout {
  id: string
  bankAccountId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  scheduledDate: string
  processedDate?: string
  transactionIds: string[]
  reference: string
  fees: {
    platformFee: number
    processingFee: number
    taxAmount: number
  }
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface EarningsStats {
  thisMonth: {
    gross: number
    net: number
    currency: string
    bookingCount: number
    averageBookingValue: number
    growthPercent: number
  }
  yearToDate: {
    gross: number
    net: number
    currency: string
    bookingCount: number
    growthPercent: number
  }
  pendingPayout: {
    amount: number
    currency: string
    nextPayoutDate: string
    transactionCount: number
  }
  totalEarnings: {
    gross: number
    net: number
    currency: string
  }
  monthlyBreakdown: {
    month: string
    gross: number
    net: number
    bookingCount: number
  }[]
  topProperties: {
    propertyId: string
    propertyName: string
    earnings: number
    bookingCount: number
  }[]
}

export interface Invoice {
  id: string
  invoiceNumber: string
  type: 'commission' | 'fee' | 'tax' | 'adjustment'
  description: string
  amount: number
  currency: string
  taxAmount: number
  totalAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidDate?: string
  downloadUrl?: string
  reservationIds: string[]
  createdAt: string
  updatedAt: string
}

export interface FinanceState {
  bankAccounts: BankAccount[]
  currentBankAccount: BankAccount | null
  transactions: Transaction[]
  payouts: Payout[]
  invoices: Invoice[]
  stats: EarningsStats | null
  loading: boolean
  error: string | null
  filters: {
    transactionType: string | null
    status: string | null
    propertyId: string | null
    dateRange: {
      start: string | null
      end: string | null
    }
  }
}

const initialState: FinanceState = {
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
}

// Async thunks
export const fetchEarningsStats = createAsyncThunk(
  'finance/fetchEarningsStats',
  async (period: { start: string; end: string } | undefined = undefined, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (period?.start) {
        params.append('startDate', period.start)
      }
      if (period?.end) {
        params.append('endDate', period.end)
      }

      const response = await api.get<{ stats: EarningsStats }>(`/api/finance/earnings/stats?${params}`)
      return response.stats
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch earnings stats')
    }
  }
)

export const fetchTransactions = createAsyncThunk(
  'finance/fetchTransactions',
  async (filters: { 
    type?: string
    status?: string
    propertyId?: string
    dateRange?: { start: string; end: string }
    page?: number
    limit?: number
  } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.type) {
        params.append('type', filters.type)
      }
      if (filters?.status) {
        params.append('status', filters.status)
      }
      if (filters?.propertyId) {
        params.append('propertyId', filters.propertyId)
      }
      if (filters?.dateRange?.start) {
        params.append('startDate', filters.dateRange.start)
      }
      if (filters?.dateRange?.end) {
        params.append('endDate', filters.dateRange.end)
      }
      if (filters?.page) {
        params.append('page', filters.page.toString())
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString())
      }

      const response = await api.get<{ transactions: Transaction[]; total: number }>(`/api/finance/transactions?${params}`)
      return response.transactions
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transactions')
    }
  }
)

export const fetchBankAccounts = createAsyncThunk(
  'finance/fetchBankAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ bankAccounts: BankAccount[] }>('/api/finance/bank-accounts')
      return response.bankAccounts
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bank accounts')
    }
  }
)

export const addBankAccount = createAsyncThunk(
  'finance/addBankAccount',
  async (bankAccountData: Omit<BankAccount, 'id' | 'isVerified' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post<{ bankAccount: BankAccount }>('/api/finance/bank-accounts', bankAccountData)
      return response.bankAccount
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add bank account')
    }
  }
)

export const updateBankAccount = createAsyncThunk(
  'finance/updateBankAccount',
  async ({ accountId, updates }: { accountId: string; updates: Partial<BankAccount> }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ bankAccount: BankAccount }>(`/api/finance/bank-accounts/${accountId}`, updates)
      return response.bankAccount
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update bank account')
    }
  }
)

export const deleteBankAccount = createAsyncThunk(
  'finance/deleteBankAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/finance/bank-accounts/${accountId}`)
      return accountId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete bank account')
    }
  }
)

export const verifyBankAccount = createAsyncThunk(
  'finance/verifyBankAccount',
  async ({ accountId, verificationData }: { accountId: string; verificationData: any }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ bankAccount: BankAccount }>(`/api/finance/bank-accounts/${accountId}/verify`, verificationData)
      return response.bankAccount
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to verify bank account')
    }
  }
)

export const fetchPayouts = createAsyncThunk(
  'finance/fetchPayouts',
  async (filters: { status?: string; dateRange?: { start: string; end: string } } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) {
        params.append('status', filters.status)
      }
      if (filters?.dateRange?.start) {
        params.append('startDate', filters.dateRange.start)
      }
      if (filters?.dateRange?.end) {
        params.append('endDate', filters.dateRange.end)
      }

      const response = await api.get<{ payouts: Payout[] }>(`/api/finance/payouts?${params}`)
      return response.payouts
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch payouts')
    }
  }
)

export const requestPayout = createAsyncThunk(
  'finance/requestPayout',
  async ({ bankAccountId, amount }: { bankAccountId: string; amount?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ payout: Payout }>('/api/finance/payouts/request', {
        bankAccountId,
        amount // Optional - if not provided, pays out all available funds
      })
      return response.payout
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to request payout')
    }
  }
)

export const fetchInvoices = createAsyncThunk(
  'finance/fetchInvoices',
  async (filters: { status?: string; type?: string; dateRange?: { start: string; end: string } } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) {
        params.append('status', filters.status)
      }
      if (filters?.type) {
        params.append('type', filters.type)
      }
      if (filters?.dateRange?.start) {
        params.append('startDate', filters.dateRange.start)
      }
      if (filters?.dateRange?.end) {
        params.append('endDate', filters.dateRange.end)
      }

      const response = await api.get<{ invoices: Invoice[] }>(`/api/finance/invoices?${params}`)
      return response.invoices
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch invoices')
    }
  }
)

export const downloadInvoice = createAsyncThunk(
  'finance/downloadInvoice',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ downloadUrl: string }>(`/api/finance/invoices/${invoiceId}/download`)
      return response.downloadUrl
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to generate download link')
    }
  }
)

export const settleInvoice = createAsyncThunk(
  'finance/settleInvoice',
  async ({ invoiceId, paymentReference }: { invoiceId: string; paymentReference?: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ invoice: Invoice }>(`/api/finance/invoices/${invoiceId}/settle`, {
        paymentReference,
        paidDate: new Date().toISOString()
      })
      return response.invoice
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to settle invoice')
    }
  }
)

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentBankAccount: (state, action: PayloadAction<BankAccount | null>) => {
      state.currentBankAccount = action.payload
    },
    updateFilters: (state, action: PayloadAction<Partial<FinanceState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        transactionType: null,
        status: null,
        propertyId: null,
        dateRange: { start: null, end: null }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch earnings stats
      .addCase(fetchEarningsStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEarningsStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchEarningsStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch bank accounts
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.bankAccounts = action.payload
        // Set default account as current if none selected
        if (!state.currentBankAccount && action.payload.length > 0) {
          state.currentBankAccount = action.payload.find(acc => acc.isDefault) || action.payload[0]
        }
      })
      
      // Add bank account
      .addCase(addBankAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addBankAccount.fulfilled, (state, action) => {
        state.loading = false
        state.bankAccounts.push(action.payload)
        // Set as current if first account
        if (state.bankAccounts.length === 1) {
          state.currentBankAccount = action.payload
        }
      })
      .addCase(addBankAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update bank account
      .addCase(updateBankAccount.fulfilled, (state, action) => {
        const index = state.bankAccounts.findIndex(acc => acc.id === action.payload.id)
        if (index !== -1) {
          state.bankAccounts[index] = action.payload
        }
        if (state.currentBankAccount?.id === action.payload.id) {
          state.currentBankAccount = action.payload
        }
      })
      
      // Delete bank account
      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        state.bankAccounts = state.bankAccounts.filter(acc => acc.id !== action.payload)
        if (state.currentBankAccount?.id === action.payload) {
          state.currentBankAccount = state.bankAccounts.find(acc => acc.isDefault) || state.bankAccounts[0] || null
        }
      })
      
      // Verify bank account
      .addCase(verifyBankAccount.fulfilled, (state, action) => {
        const index = state.bankAccounts.findIndex(acc => acc.id === action.payload.id)
        if (index !== -1) {
          state.bankAccounts[index] = action.payload
        }
        if (state.currentBankAccount?.id === action.payload.id) {
          state.currentBankAccount = action.payload
        }
      })
      
      // Fetch payouts
      .addCase(fetchPayouts.fulfilled, (state, action) => {
        state.payouts = action.payload
      })
      
      // Request payout
      .addCase(requestPayout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(requestPayout.fulfilled, (state, action) => {
        state.loading = false
        state.payouts.unshift(action.payload)
      })
      .addCase(requestPayout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch invoices
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload
      })
      
      // Settle invoice
      .addCase(settleInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(inv => inv.id === action.payload.id)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
      })
  }
})

export const {
  clearError,
  setCurrentBankAccount,
  updateFilters,
  clearFilters
} = financeSlice.actions

export default financeSlice.reducer