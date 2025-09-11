import React, { useEffect } from 'react'
import { useAppShell } from '@/components/base/AppShell'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchUserBookings, clearError } from '@/store/slices/bookingSlice'
import { Box } from '@/components/base/Box'
import { Button } from '@/components/base/Button'
import { SecuredPage } from '@/components/SecuredPage'
import { 
  IoCalendar,
  IoLocation,
  IoPeople,
  IoCard,
  IoCheckmarkCircle,
  IoTime,
  IoClose,
  IoRefresh,
  IoAdd,
  IoPerson,
  IoMail,
  IoBusiness
} from 'react-icons/io5'

interface BookingCardProps {
  booking: any
  onCancel: (bookingId: string) => void
  onViewDetails: (bookingId: string) => void
  userRole: string
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel, onViewDetails, userRole }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return { bg: '#dcfce7', color: '#166534', icon: <IoCheckmarkCircle /> }
      case 'pending': return { bg: '#fef3c7', color: '#92400e', icon: <IoTime /> }
      case 'cancelled': return { bg: '#fee2e2', color: '#dc2626', icon: <IoClose /> }
      case 'completed': return { bg: '#e0e7ff', color: '#3730a3', icon: <IoCheckmarkCircle /> }
      default: return { bg: '#f3f4f6', color: '#374151', icon: <IoTime /> }
    }
  }
  
  const statusStyle = getStatusColor(booking.status)
  
  const canCancel = booking.status?.toLowerCase() === 'confirmed' || booking.status?.toLowerCase() === 'pending'
  
  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
      marginBottom="1rem"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    >
      {/* Header with property and status */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom="1rem">
        <Box flex="1">
          <Box fontSize="1.125rem" fontWeight="600" marginBottom="0.5rem">
            {booking.propertyName || 'Property Name'}
          </Box>
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" color="#666">
            <IoLocation />
            {booking.propertyLocation || 'Location'}
          </Box>
        </Box>
        
        <Box
          backgroundColor={statusStyle.bg}
          color={statusStyle.color}
          padding="0.375rem 0.75rem"
          borderRadius="20px"
          fontSize="0.75rem"
          fontWeight="600"
          display="flex"
          alignItems="center"
          gap="0.25rem"
          textTransform="capitalize"
        >
          {statusStyle.icon}
          {booking.status || 'Confirmed'}
        </Box>
      </Box>
      
      {/* Booking details - Dynamic based on user role */}
      <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsSm="1fr 1fr" gap="1rem" marginBottom="1.5rem">
        {/* Guest Information - Show for HomeOwner and Manager */}
        {(userRole === 'HomeOwner' || userRole === 'Manager') && booking.guest && (
          <Box>
            <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" marginBottom="0.5rem">
              <IoPerson color="#059669" />
              <Box fontWeight="600">Guest</Box>
            </Box>
            <Box fontSize="0.875rem" color="#666" marginLeft="1.5rem">
              {booking.guest.name}
            </Box>
            {booking.guest.email && (
              <Box fontSize="0.75rem" color="#999" marginLeft="1.5rem">
                {booking.guest.email}
              </Box>
            )}
          </Box>
        )}

        {/* Property Owner Information - Show for Manager only */}
        {userRole === 'Manager' && booking.propertyOwner && (
          <Box>
            <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" marginBottom="0.5rem">
              <IoBusiness color="#059669" />
              <Box fontWeight="600">Property Owner</Box>
            </Box>
            <Box fontSize="0.875rem" color="#666" marginLeft="1.5rem">
              {booking.propertyOwner.name}
            </Box>
            <Box fontSize="0.75rem" color="#999" marginLeft="1.5rem">
              {booking.propertyOwner.email}
            </Box>
          </Box>
        )}
        
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" marginBottom="0.5rem">
            <IoCalendar color="#059669" />
            <Box fontWeight="600">Dates</Box>
          </Box>
          <Box fontSize="0.875rem" color="#666" marginLeft="1.5rem">
            {booking.checkInDate === booking.checkOutDate 
              ? `Half day on ${booking.checkInDate}`
              : `${booking.checkInDate} - ${booking.checkOutDate}`}
          </Box>
        </Box>
        
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" marginBottom="0.5rem">
            <IoPeople color="#059669" />
            <Box fontWeight="600">Guests</Box>
          </Box>
          <Box fontSize="0.875rem" color="#666" marginLeft="1.5rem">
            {booking.numGuests || 1} guest{(booking.numGuests || 1) > 1 ? 's' : ''}
          </Box>
        </Box>
        
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" marginBottom="0.5rem">
            <IoCard color="#059669" />
            <Box fontWeight="600">Total Amount</Box>
          </Box>
          <Box fontSize="1rem" fontWeight="bold" color="#059669" marginLeft="1.5rem">
            AED {Math.round(booking.totalPrice || 0)}
          </Box>
        </Box>
        
        <Box>
          <Box display="flex" alignItems="center" gap="0.5rem" fontSize="0.875rem" marginBottom="0.5rem">
            <IoTime color="#059669" />
            <Box fontWeight="600">Booked On</Box>
          </Box>
          <Box fontSize="0.875rem" color="#666" marginLeft="1.5rem">
            {new Date(booking.createdAt || Date.now()).toLocaleDateString()}
          </Box>
        </Box>
      </Box>
      
      {/* Action buttons - Role-specific */}
      <Box display="flex" gap="0.75rem" flexDirection="column" flexDirectionSm="row">
        <Button
          label="View Details"
          onClick={() => onViewDetails(booking.id)}
          variant="normal"
          size="small"
          style={{ flex: 1 }}
        />
        
        {/* Tenant-specific actions */}
        {userRole === 'Tenant' && canCancel && (
          <Button
            label="Cancel Booking"
            onClick={() => onCancel(booking.id)}
            variant="normal"
            size="small"
            style={{ 
              flex: 1,
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca'
            }}
          />
        )}
        
        {/* HomeOwner and Manager actions */}
        {(userRole === 'HomeOwner' || userRole === 'Manager') && booking.guest && (
          <Button
            label="Message Guest"
            icon={<IoMail />}
            onClick={() => {
              // TODO: Implement messaging functionality
              console.log('Message guest:', booking.guest.email)
            }}
            variant="normal"
            size="small"
            style={{ flex: 1 }}
          />
        )}
      </Box>
    </Box>
  )
}

const MyBookings: React.FC = () => {
  const { navigateTo, addToast } = useAppShell()
  const dispatch = useAppDispatch()
  
  const { 
    userBookings, 
    userBookingsLoading, 
    isLoading, 
    error 
  } = useAppSelector((state) => state.booking)
  
  const { user, currentRoleMode } = useAppSelector((state) => state.auth)
  const userRole = currentRoleMode || user?.role || 'Tenant'
  
  useEffect(() => {
    dispatch(fetchUserBookings())
  }, [dispatch])
  
  useEffect(() => {
    if (error) {
      addToast(error, { type: 'error', autoHide: true, duration: 4000 })
      dispatch(clearError())
    }
  }, [error, addToast, dispatch])
  
  const handleCancelBooking = (bookingId: string) => {
    // Navigate to the cancellation page for proper cancellation flow with refund preview
    navigateTo('cancel-reservation', { id: bookingId })
  }
  
  const handleViewDetails = (bookingId: string) => {
    navigateTo('booking-details', { id: bookingId })
  }
  
  const handleRefresh = () => {
    dispatch(fetchUserBookings())
  }
  
  const handleNewBooking = () => {
    navigateTo('properties', {})
  }
  
  if (userBookingsLoading) {
    return (
      <SecuredPage>
        <Box padding="2rem" textAlign="center">
          <Box 
            width="40px" 
            height="40px" 
            border="4px solid #f3f4f6" 
            borderTop="4px solid #3b82f6" 
            borderRadius="50%" 
            margin="0 auto 1rem auto"
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <p style={{ color: '#6b7280', margin: 0 }}>Loading your bookings...</p>
        </Box>
      </SecuredPage>
    )
  }
  
  return (
    <SecuredPage>
      <Box maxWidth="800px" margin="0 auto" padding="1rem" paddingMd="2rem">
        {/* Header */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          marginBottom="2rem"
        >
          <Box>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
              {userRole === 'Tenant' 
                ? 'My Bookings' 
                : userRole === 'HomeOwner' 
                ? 'Property Reservations' 
                : 'All Reservations'}
            </h1>
            <Box fontSize="0.875rem" color="#666">
              {userRole === 'Tenant' 
                ? 'View and manage your property bookings' 
                : userRole === 'HomeOwner' 
                ? 'View and manage reservations for your properties' 
                : 'View and manage all reservations across all properties'}
            </Box>
          </Box>
          
          <Box display="flex" gap="0.75rem">
            <Button
              label=""
              icon={<IoRefresh />}
              onClick={handleRefresh}
              variant="normal"
              size="small"
              disabled={isLoading}
              title="Refresh bookings"
            />
            {/* Only show "New Booking" button for Tenants */}
            {userRole === 'Tenant' && (
              <Button
                label="New Booking"
                icon={<IoAdd />}
                onClick={handleNewBooking}
                variant="promoted"
                size="small"
              />
            )}
          </Box>
        </Box>
        
        {/* Bookings List */}
        {userBookings.length === 0 ? (
          <Box 
            textAlign="center" 
            padding="3rem 1rem"
            backgroundColor="white"
            borderRadius="12px"
            border="1px solid #e5e7eb"
          >
            <Box 
              display="flex" 
              justifyContent="center" 
              marginBottom="1.5rem"
            >
              <IoCalendar size={48} color="#9ca3af" />
            </Box>
            
            <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem" color="#374151">
              {userRole === 'Tenant' 
                ? 'No Bookings Yet' 
                : 'No Reservations Yet'}
            </Box>
            
            <Box fontSize="0.875rem" color="#666" marginBottom="2rem">
              {userRole === 'Tenant' 
                ? 'You haven\'t made any bookings yet. Start exploring properties and make your first booking!' 
                : userRole === 'HomeOwner' 
                ? 'No guests have booked your properties yet. Make sure your properties are live and visible to guests.'
                : 'No reservations found across all properties in the system.'}
            </Box>
            
            {/* Only show browse button for Tenants */}
            {userRole === 'Tenant' && (
              <Button
                label="Browse Properties"
                icon={<IoAdd />}
                onClick={handleNewBooking}
                variant="promoted"
              />
            )}
          </Box>
        ) : (
          <Box>
            {/* Summary stats */}
            <Box 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))" 
              gap="1rem" 
              marginBottom="2rem"
            >
              <Box 
                backgroundColor="white" 
                padding="1rem" 
                borderRadius="8px" 
                border="1px solid #e5e7eb"
                textAlign="center"
              >
                <Box fontSize="1.5rem" fontWeight="bold" color="#059669">
                  {userBookings.length}
                </Box>
                <Box fontSize="0.75rem" color="#666" textTransform="uppercase">
                  Total Bookings
                </Box>
              </Box>
              
              <Box 
                backgroundColor="white" 
                padding="1rem" 
                borderRadius="8px" 
                border="1px solid #e5e7eb"
                textAlign="center"
              >
                <Box fontSize="1.5rem" fontWeight="bold" color="#059669">
                  {userBookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}
                </Box>
                <Box fontSize="0.75rem" color="#666" textTransform="uppercase">
                  Confirmed
                </Box>
              </Box>
              
              <Box 
                backgroundColor="white" 
                padding="1rem" 
                borderRadius="8px" 
                border="1px solid #e5e7eb"
                textAlign="center"
              >
                <Box fontSize="1.5rem" fontWeight="bold" color="#d97706">
                  {userBookings.filter(b => b.status?.toLowerCase() === 'pending').length}
                </Box>
                <Box fontSize="0.75rem" color="#666" textTransform="uppercase">
                  Pending
                </Box>
              </Box>
            </Box>
            
            {/* Bookings cards */}
            {userBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                onViewDetails={handleViewDetails}
                userRole={userRole}
              />
            ))}
          </Box>
        )}
      </Box>
      
      {/* Custom CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </SecuredPage>
  )
}

export default MyBookings