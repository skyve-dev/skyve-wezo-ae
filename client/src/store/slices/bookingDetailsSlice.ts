import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/utils/api';

interface BookingDetails {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  ratePlanName?: string;
  specialRequests?: string;
  privateNotes?: string;
  
  // Related data
  guest?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  property?: {
    id: string;
    name: string;
    address: any;
    photos: any[];
    owner?: {
      id: string;
      name: string;
      email: string;
    };
  };
  ratePlan?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    role: string;
  };
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
}

interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

interface FeeBreakdown {
  subtotal: number;
  serviceFee: number;
  taxes: number;
  total: number;
  commission?: number;
  homeownerPayout?: number;
  breakdown: Array<{
    name: string;
    amount: number;
    description?: string;
  }>;
}

interface BookingStatistics {
  totalChanges: number;
  messageCount: number;
  lastActivity: string;
  changesByAction: Record<string, number>;
  changesByUser: Record<string, number>;
}

interface BookingDetailsState {
  currentBooking: BookingDetails | null;
  feeBreakdown: FeeBreakdown | null;
  messages: Message[];
  auditTrail: AuditLogEntry[];
  statistics: BookingStatistics | null;
  
  // Loading states
  loading: boolean;
  messagesLoading: boolean;
  auditLoading: boolean;
  actionLoading: boolean;
  
  // Error states
  error: string | null;
  
  // UI states
  activeTab: 'overview' | 'messages' | 'audit' | 'fees';
  showFullAuditTrail: boolean;
}

const initialState: BookingDetailsState = {
  currentBooking: null,
  feeBreakdown: null,
  messages: [],
  auditTrail: [],
  statistics: null,
  
  loading: false,
  messagesLoading: false,
  auditLoading: false,
  actionLoading: false,
  
  error: null,
  
  activeTab: 'overview',
  showFullAuditTrail: false,
};

// Async thunks
export const fetchBookingDetails = createAsyncThunk(
  'bookingDetails/fetchBookingDetails',
  async (params: { bookingId: string; include?: string[] }, { rejectWithValue }) => {
    try {
      const includeParam = params.include ? `?include=${params.include.join(',')}` : '';
      const response = await api.get(`/api/booking/reservations/${params.bookingId}/details${includeParam}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch booking details');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'bookingDetails/fetchMessages',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/booking/reservations/${bookingId}/messages`);
      return response.messages;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'bookingDetails/sendMessage',
  async (params: { bookingId: string; message: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/booking/reservations/${params.bookingId}/messages`, {
        message: params.message
      });
      return response.messageData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

export const fetchAuditTrail = createAsyncThunk(
  'bookingDetails/fetchAuditTrail',
  async (params: { bookingId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: String(params.page || 1),
        limit: String(params.limit || 50)
      });
      const response = await api.get(`/api/booking/reservations/${params.bookingId}/audit-log?${queryParams}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit trail');
    }
  }
);

export const fetchFeeBreakdown = createAsyncThunk(
  'bookingDetails/fetchFeeBreakdown',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/booking/reservations/${bookingId}/fee-breakdown`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch fee breakdown');
    }
  }
);

export const updateReservationStatus = createAsyncThunk(
  'bookingDetails/updateReservationStatus',
  async (params: { bookingId: string; status: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/booking/reservations/${params.bookingId}/status`, {
        status: params.status,
        reason: params.reason
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update status');
    }
  }
);

export const modifyReservation = createAsyncThunk(
  'bookingDetails/modifyReservation',
  async (params: { bookingId: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/booking/reservations/${params.bookingId}/modify`, params.data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to modify reservation');
    }
  }
);

export const updatePrivateNotes = createAsyncThunk(
  'bookingDetails/updatePrivateNotes',
  async (params: { bookingId: string; notes: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/booking/reservations/${params.bookingId}/notes`, {
        notes: params.notes
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update notes');
    }
  }
);

export const reportNoShow = createAsyncThunk(
  'bookingDetails/reportNoShow',
  async (params: { bookingId: string; reason: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/booking/reservations/${params.bookingId}/no-show`, {
        reason: params.reason,
        description: params.description
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to report no-show');
    }
  }
);

export const createPayout = createAsyncThunk(
  'bookingDetails/createPayout',
  async (params: { bookingId: string; amount: number; payoutDate: string; bankDetails?: any }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/booking/reservations/${params.bookingId}/payout`, {
        amount: params.amount,
        payoutDate: params.payoutDate,
        bankDetails: params.bankDetails
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create payout');
    }
  }
);

const bookingDetailsSlice = createSlice({
  name: 'bookingDetails',
  initialState,
  reducers: {
    clearBookingDetails: (state) => {
      state.currentBooking = null;
      state.feeBreakdown = null;
      state.messages = [];
      state.auditTrail = [];
      state.statistics = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setActiveTab: (state, action: PayloadAction<'overview' | 'messages' | 'audit' | 'fees'>) => {
      state.activeTab = action.payload;
    },
    toggleFullAuditTrail: (state) => {
      state.showFullAuditTrail = !state.showFullAuditTrail;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.unshift(action.payload);
    },
    updateBookingInList: (state, action: PayloadAction<Partial<BookingDetails>>) => {
      if (state.currentBooking && state.currentBooking.id === action.payload.id) {
        state.currentBooking = { ...state.currentBooking, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch booking details
      .addCase(fetchBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.booking;
        if (action.payload.feeBreakdown) {
          state.feeBreakdown = action.payload.feeBreakdown;
        }
        if (action.payload.booking.messages) {
          state.messages = action.payload.booking.messages;
        }
        if (action.payload.auditTrail) {
          state.auditTrail = action.payload.auditTrail.auditLogs || [];
        }
        if (action.payload.statistics) {
          state.statistics = action.payload.statistics;
        }
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.unshift(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload as string;
      })

      // Fetch audit trail
      .addCase(fetchAuditTrail.pending, (state) => {
        state.auditLoading = true;
      })
      .addCase(fetchAuditTrail.fulfilled, (state, action) => {
        state.auditLoading = false;
        state.auditTrail = action.payload.auditLogs || [];
      })
      .addCase(fetchAuditTrail.rejected, (state, action) => {
        state.auditLoading = false;
        state.error = action.payload as string;
      })

      // Fetch fee breakdown
      .addCase(fetchFeeBreakdown.fulfilled, (state, action) => {
        state.feeBreakdown = action.payload;
      })
      .addCase(fetchFeeBreakdown.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Update reservation status
      .addCase(updateReservationStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.currentBooking) {
          state.currentBooking.status = action.payload.reservation.status;
          state.currentBooking.paymentStatus = action.payload.reservation.paymentStatus;
          state.currentBooking.updatedAt = action.payload.reservation.updatedAt;
        }
        // Add audit log entry
        if (action.payload.auditLog) {
          state.auditTrail.unshift(action.payload.auditLog);
        }
      })
      .addCase(updateReservationStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // Modify reservation
      .addCase(modifyReservation.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(modifyReservation.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.currentBooking) {
          state.currentBooking = { ...state.currentBooking, ...action.payload.reservation };
        }
        // Add audit log entry
        if (action.payload.auditLog) {
          state.auditTrail.unshift(action.payload.auditLog);
        }
      })
      .addCase(modifyReservation.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // Update private notes
      .addCase(updatePrivateNotes.fulfilled, (state, action) => {
        if (state.currentBooking) {
          state.currentBooking.privateNotes = action.payload.reservation.privateNotes;
          state.currentBooking.updatedAt = action.payload.reservation.updatedAt;
        }
        // Add audit log entry
        if (action.payload.auditLog) {
          state.auditTrail.unshift(action.payload.auditLog);
        }
      })
      .addCase(updatePrivateNotes.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Report no-show
      .addCase(reportNoShow.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(reportNoShow.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.currentBooking) {
          state.currentBooking.status = action.payload.reservation.status;
          state.currentBooking.updatedAt = action.payload.reservation.updatedAt;
        }
      })
      .addCase(reportNoShow.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // Create payout
      .addCase(createPayout.fulfilled, (_state, _action) => {
        // Handle payout creation success
      })
      .addCase(createPayout.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearBookingDetails,
  clearError,
  setActiveTab,
  toggleFullAuditTrail,
  addMessage,
  updateBookingInList,
} = bookingDetailsSlice.actions;

export default bookingDetailsSlice.reducer;