import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { useAppShell } from '@/components/base/AppShell'
import { Box } from '@/components/base/Box'
import { Button } from '@/components/base/Button'
import { SecuredPage } from '@/components/SecuredPage'
import { 
  fetchReviews, 
  fetchGuestReviews, 
  fetchPendingReviews, 
  fetchReviewStats,
  respondToReview,
  updateReviewResponse,
  deleteReviewResponse,
  clearError 
} from '@/store/slices/reviewSlice'
import { 
  IoStar,
  IoStarOutline,
  IoCalendar,
  IoPerson,
  IoHome,
  IoCreate,
  IoTrash,
  IoSave,
  IoClose,
  IoRefresh,
  IoFilter,
  IoTrendingUp
} from 'react-icons/io5'

// Review Card Component for HomeOwner view
const ReviewCard: React.FC<{ 
  review: any; 
  userRole: string; 
  onRespond: (reviewId: string, response: string) => void;
  onUpdateResponse: (reviewId: string, response: string) => void;
  onDeleteResponse: (reviewId: string) => void;
}> = ({ review, userRole, onRespond, onUpdateResponse, onDeleteResponse }) => {
  const [isResponding, setIsResponding] = useState(false)
  const [responseText, setResponseText] = useState(review.response || '')
  const [isEditing, setIsEditing] = useState(false)

  const renderStars = (rating: number) => {
    return [...Array(10)].map((_, index) => (
      index < rating ? (
        <IoStar key={index} size={16} color="#f59e0b" />
      ) : (
        <IoStarOutline key={index} size={16} color="#d1d5db" />
      )
    ))
  }

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return
    
    if (review.response && isEditing) {
      await onUpdateResponse(review.id, responseText.trim())
    } else {
      await onRespond(review.id, responseText.trim())
    }
    
    setIsResponding(false)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
      marginBottom="1rem"
    >
      {/* Review Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom="1rem">
        <Box flex="1">
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <IoPerson size={16} color="#6b7280" />
            <Box fontSize="1rem" fontWeight="600">
              {review.guest?.firstName} {review.guest?.lastName}
            </Box>
            <Box display="flex" alignItems="center" gap="0.25rem">
              {renderStars(review.rating)}
              <Box fontSize="0.875rem" color="#6b7280" marginLeft="0.5rem">
                {review.rating}/10
              </Box>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap="1rem" fontSize="0.75rem" color="#6b7280">
            <Box display="flex" alignItems="center" gap="0.25rem">
              <IoHome size={12} />
              {review.property?.name}
            </Box>
            <Box display="flex" alignItems="center" gap="0.25rem">
              <IoCalendar size={12} />
              {formatDate(review.reviewedAt)}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Review Content */}
      {review.comment && (
        <Box
          padding="1rem"
          backgroundColor="#f9fafb"
          borderRadius="8px"
          marginBottom="1rem"
        >
          <Box fontSize="0.875rem" color="#374151" lineHeight="1.6">
            {review.comment}
          </Box>
        </Box>
      )}

      {/* Response Section */}
      {userRole === 'HomeOwner' && (
        <Box>
          {review.response && !isEditing && !isResponding && (
            <Box
              padding="1rem"
              backgroundColor="#f0f9ff"
              borderRadius="8px"
              marginBottom="1rem"
            >
              <Box fontSize="0.75rem" fontWeight="600" color="#0369a1" marginBottom="0.5rem">
                Your Response:
              </Box>
              <Box fontSize="0.875rem" color="#374151" lineHeight="1.6">
                {review.response}
              </Box>
              <Box display="flex" gap="0.5rem" marginTop="0.75rem">
                <Button
                  label="Edit"
                  icon={<IoCreate />}
                  onClick={() => {
                    setIsEditing(true)
                    setResponseText(review.response)
                  }}
                  variant="normal"
                  size="small"
                />
                <Button
                  label="Delete"
                  icon={<IoTrash />}
                  onClick={() => onDeleteResponse(review.id)}
                  variant="normal"
                  size="small"
                  style={{ 
                    backgroundColor: '#fee2e2', 
                    color: '#dc2626', 
                    border: '1px solid #fecaca' 
                  }}
                />
              </Box>
            </Box>
          )}

          {(isResponding || isEditing || (!review.response && !isResponding)) && (
            <Box>
              {!isResponding && !isEditing && (
                <Button
                  label="Respond to Review"
                  icon={<IoCreate />}
                  onClick={() => setIsResponding(true)}
                  variant="promoted"
                  size="small"
                />
              )}

              {(isResponding || isEditing) && (
                <Box>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response to this review..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      marginBottom: '0.75rem',
                      fontFamily: 'inherit'
                    }}
                  />
                  <Box display="flex" gap="0.5rem">
                    <Button
                      label={isEditing ? "Update Response" : "Post Response"}
                      icon={<IoSave />}
                      onClick={handleSubmitResponse}
                      variant="promoted"
                      size="small"
                      disabled={!responseText.trim()}
                    />
                    <Button
                      label="Cancel"
                      icon={<IoClose />}
                      onClick={() => {
                        setIsResponding(false)
                        setIsEditing(false)
                        setResponseText(review.response || '')
                      }}
                      variant="normal"
                      size="small"
                    />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

// Guest Review Card for Tenant view
const GuestReviewCard: React.FC<{ review: any }> = ({ review }) => {
  const renderStars = (rating: number) => {
    return [...Array(10)].map((_, index) => (
      index < rating ? (
        <IoStar key={index} size={16} color="#f59e0b" />
      ) : (
        <IoStarOutline key={index} size={16} color="#d1d5db" />
      )
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
      marginBottom="1rem"
    >
      {/* Review Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom="1rem">
        <Box flex="1">
          <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
            <IoHome size={16} color="#6b7280" />
            <Box fontSize="1rem" fontWeight="600">
              {review.property?.name}
            </Box>
            <Box display="flex" alignItems="center" gap="0.25rem">
              {renderStars(review.rating)}
              <Box fontSize="0.875rem" color="#6b7280" marginLeft="0.5rem">
                {review.rating}/10
              </Box>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap="1rem" fontSize="0.75rem" color="#6b7280">
            <Box display="flex" alignItems="center" gap="0.25rem">
              <IoCalendar size={12} />
              Stayed: {formatDate(review.reservation?.checkInDate)} - {formatDate(review.reservation?.checkOutDate)}
            </Box>
            <Box display="flex" alignItems="center" gap="0.25rem">
              <IoCalendar size={12} />
              Reviewed: {formatDate(review.reviewedAt)}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Review Content */}
      {review.comment && (
        <Box
          padding="1rem"
          backgroundColor="#f9fafb"
          borderRadius="8px"
          marginBottom="1rem"
        >
          <Box fontSize="0.875rem" color="#374151" lineHeight="1.6">
            {review.comment}
          </Box>
        </Box>
      )}

      {/* Host Response */}
      {review.response && (
        <Box
          padding="1rem"
          backgroundColor="#f0f9ff"
          borderRadius="8px"
        >
          <Box fontSize="0.75rem" fontWeight="600" color="#0369a1" marginBottom="0.5rem">
            Host Response:
          </Box>
          <Box fontSize="0.875rem" color="#374151" lineHeight="1.6">
            {review.response}
          </Box>
        </Box>
      )}
    </Box>
  )
}

// Main Reviews Component
const Reviews: React.FC = () => {
  const dispatch = useAppDispatch()
  const { addToast } = useAppShell()
  
  const { user, currentRoleMode } = useAppSelector((state) => state.auth)
  const userRole = currentRoleMode || user?.role || 'Tenant'
  
  const {
    reviews,
    guestReviews,
    pendingReviews,
    stats,
    loading,
    statsLoading,
    error,
    filters
  } = useAppSelector((state) => state.reviews)

  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [filterResponse, setFilterResponse] = useState<boolean | null>(null)

  useEffect(() => {
    if (userRole === 'HomeOwner' || userRole === 'Manager') {
      const cleanFilters = {
        propertyId: filters.propertyId || undefined,
        rating: filters.rating || undefined,
        hasResponse: filters.hasResponse ?? undefined,
        sortBy: filters.sortBy
      }
      dispatch(fetchReviews(cleanFilters))
      dispatch(fetchReviewStats(undefined))
    } else if (userRole === 'Tenant') {
      dispatch(fetchGuestReviews({}))
      dispatch(fetchPendingReviews())
    }
  }, [dispatch, userRole, filters])

  useEffect(() => {
    if (error) {
      addToast(error, { type: 'error', autoHide: true, duration: 4000 })
      dispatch(clearError())
    }
  }, [error, addToast, dispatch])

  const handleRefresh = () => {
    if (userRole === 'HomeOwner' || userRole === 'Manager') {
      const cleanFilters = {
        propertyId: filters.propertyId || undefined,
        rating: filters.rating || undefined,
        hasResponse: filters.hasResponse ?? undefined,
        sortBy: filters.sortBy
      }
      dispatch(fetchReviews(cleanFilters))
      dispatch(fetchReviewStats(undefined))
    } else {
      dispatch(fetchGuestReviews({}))
      dispatch(fetchPendingReviews())
    }
  }

  const handleRespond = async (reviewId: string, responseText: string) => {
    try {
      await dispatch(respondToReview({ reviewId, responseText }))
      addToast('Response posted successfully', { type: 'success', autoHide: true })
    } catch (error) {
      // Error handled by Redux and displayed via toast
    }
  }

  const handleUpdateResponse = async (reviewId: string, responseText: string) => {
    try {
      await dispatch(updateReviewResponse({ reviewId, responseText }))
      addToast('Response updated successfully', { type: 'success', autoHide: true })
    } catch (error) {
      // Error handled by Redux and displayed via toast
    }
  }

  const handleDeleteResponse = async (reviewId: string) => {
    try {
      await dispatch(deleteReviewResponse(reviewId))
      addToast('Response deleted successfully', { type: 'success', autoHide: true })
    } catch (error) {
      // Error handled by Redux and displayed via toast
    }
  }

  const applyFilters = () => {
    const cleanFilters = {
      propertyId: filters.propertyId || undefined,
      rating: filterRating || undefined,
      hasResponse: filterResponse ?? undefined,
      sortBy: filters.sortBy
    }
    dispatch(fetchReviews(cleanFilters))
  }

  if (loading && !reviews.length && !guestReviews.length) {
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
          <p style={{ color: '#6b7280', margin: 0 }}>Loading reviews...</p>
        </Box>
      </SecuredPage>
    )
  }

  return (
    <SecuredPage>
      <Box maxWidth="1200px" margin="0 auto" padding="1rem" paddingMd="2rem">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="2rem">
          <Box>
            <h1 style={{ fontSize: '2rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
              {userRole === 'Tenant' ? 'My Reviews' : 'Guest Reviews'}
            </h1>
            <Box fontSize="0.875rem" color="#666">
              {userRole === 'Tenant' 
                ? 'Reviews you\'ve submitted for your stays'
                : 'Reviews from your property guests'
              }
            </Box>
          </Box>
          
          <Button
            label=""
            icon={<IoRefresh />}
            onClick={handleRefresh}
            variant="normal"
            size="small"
            disabled={loading}
            title="Refresh reviews"
          />
        </Box>

        {/* Stats Section - HomeOwner only */}
        {(userRole === 'HomeOwner' || userRole === 'Manager') && (
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem" marginBottom="2rem">
            <Box 
              backgroundColor="white" 
              padding="1.5rem" 
              borderRadius="12px" 
              border="1px solid #e5e7eb"
            >
              <Box display="flex" alignItems="center" marginBottom="0.5rem">
                <IoStar color="#f59e0b" style={{ marginRight: '0.5rem' }} />
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Average Rating</span>
              </Box>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#059669' }}>
                {statsLoading ? '...' : stats.averageRating.toFixed(1)}
              </p>
            </Box>
            
            <Box 
              backgroundColor="white" 
              padding="1.5rem" 
              borderRadius="12px" 
              border="1px solid #e5e7eb"
            >
              <Box display="flex" alignItems="center" marginBottom="0.5rem">
                <IoTrendingUp color="#6366f1" style={{ marginRight: '0.5rem' }} />
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Total Reviews</span>
              </Box>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#059669' }}>
                {statsLoading ? '...' : stats.totalReviews}
              </p>
            </Box>
            
            <Box 
              backgroundColor="white" 
              padding="1.5rem" 
              borderRadius="12px" 
              border="1px solid #e5e7eb"
            >
              <Box display="flex" alignItems="center" marginBottom="0.5rem">
                <IoCreate color="#ef4444" style={{ marginRight: '0.5rem' }} />
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Pending Responses</span>
              </Box>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#dc2626' }}>
                {statsLoading ? '...' : stats.pendingResponses}
              </p>
            </Box>

            <Box 
              backgroundColor="white" 
              padding="1.5rem" 
              borderRadius="12px" 
              border="1px solid #e5e7eb"
            >
              <Box display="flex" alignItems="center" marginBottom="0.5rem">
                <IoCreate color="#059669" style={{ marginRight: '0.5rem' }} />
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Response Rate</span>
              </Box>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#059669' }}>
                {statsLoading ? '...' : `${stats.responseRate}%`}
              </p>
            </Box>
          </Box>
        )}

        {/* Filters Section - HomeOwner only */}
        {(userRole === 'HomeOwner' || userRole === 'Manager') && (
          <Box 
            backgroundColor="white" 
            padding="1.5rem" 
            borderRadius="12px" 
            border="1px solid #e5e7eb"
            marginBottom="2rem"
          >
            <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
              <IoFilter color="#6b7280" />
              <Box fontWeight="600">Filters</Box>
            </Box>
            
            <Box display="flex" gap="1rem" flexWrap="wrap" alignItems="center">
              <Box>
                <label style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>
                  Rating
                </label>
                <select
                  value={filterRating || ''}
                  onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">All ratings</option>
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(rating => (
                    <option key={rating} value={rating}>{rating} stars</option>
                  ))}
                </select>
              </Box>
              
              <Box>
                <label style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>
                  Response Status
                </label>
                <select
                  value={filterResponse === null ? '' : filterResponse.toString()}
                  onChange={(e) => setFilterResponse(e.target.value === '' ? null : e.target.value === 'true')}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">All reviews</option>
                  <option value="false">Needs response</option>
                  <option value="true">Responded</option>
                </select>
              </Box>
              
              <Box style={{ alignSelf: 'flex-end' }}>
                <Button
                  label="Apply Filters"
                  onClick={applyFilters}
                  variant="promoted"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Pending Reviews Section - Tenant only */}
        {userRole === 'Tenant' && pendingReviews.length > 0 && (
          <Box marginBottom="2rem">
            <Box 
              backgroundColor="#fef3c7" 
              border="1px solid #fde68a"
              borderRadius="12px" 
              padding="1.5rem"
            >
              <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
                <IoStar color="#d97706" />
                <Box fontSize="1.125rem" fontWeight="600" color="#92400e">
                  Pending Reviews ({pendingReviews.length})
                </Box>
              </Box>
              <Box fontSize="0.875rem" color="#92400e" marginBottom="1rem">
                You have {pendingReviews.length} completed stay{pendingReviews.length > 1 ? 's' : ''} waiting for your review.
              </Box>
              <Box display="flex" flexWrap="wrap" gap="0.75rem">
                {pendingReviews.map((reservation) => (
                  <Box key={reservation.id} fontSize="0.75rem" color="#92400e">
                    • {reservation.property.name}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Reviews List */}
        <Box>
          {userRole === 'HomeOwner' || userRole === 'Manager' ? (
            <>
              {reviews.length === 0 ? (
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'center'}
                  padding="3rem 1rem"
                  backgroundColor="white"
                  borderRadius="12px"
                  border="1px solid #e5e7eb"
                >
                  <IoStar size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                  <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem" color="#374151">
                    No Reviews Yet
                  </Box>
                  <Box fontSize="0.875rem" color="#6b7280">
                    Once guests stay at your properties and leave reviews, they'll appear here.
                  </Box>
                </Box>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    userRole={userRole}
                    onRespond={handleRespond}
                    onUpdateResponse={handleUpdateResponse}
                    onDeleteResponse={handleDeleteResponse}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {guestReviews.length === 0 ? (
                <Box 
                  textAlign="center" 
                  padding="3rem 1rem"
                  backgroundColor="white"
                  borderRadius="12px"
                  border="1px solid #e5e7eb"
                >
                  <IoStar size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                  <Box fontSize="1.25rem" fontWeight="600" marginBottom="1rem" color="#374151">
                    No Reviews Yet
                  </Box>
                  <Box fontSize="0.875rem" color="#6b7280">
                    Reviews you submit after your stays will appear here.
                  </Box>
                </Box>
              ) : (
                guestReviews.map((review) => (
                  <GuestReviewCard key={review.id} review={review} />
                ))
              )}
            </>
          )}
        </Box>
      </Box>
      
      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </SecuredPage>
  )
}

export default Reviews