import React, { useState } from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { 
  IoStar,
  IoStarOutline,
  IoCheckmarkCircle,
  IoClose
} from 'react-icons/io5';

interface ReviewSubmissionFormProps {
  reservation: {
    id: string;
    propertyId: string;
    propertyName: string;
    checkInDate: string;
    checkOutDate: string;
  };
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
}

const ReviewSubmissionForm: React.FC<ReviewSubmissionFormProps> = ({
  reservation,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    try {
      await onSubmit(rating, comment);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (value: number) => {
    if (value <= 2) return 'Poor';
    if (value <= 4) return 'Fair';
    if (value <= 6) return 'Good';
    if (value <= 8) return 'Very Good';
    return 'Excellent';
  };

  const formatDateRange = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    
    return `${checkInDate.toLocaleDateString('en-AE', options)} - ${checkOutDate.toLocaleDateString('en-AE', options)}`;
  };

  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="2rem"
      maxWidth="600px"
      margin="0 auto"
    >
      {/* Header */}
      <Box marginBottom="2rem">
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
            Write a Review
          </h2>
          <Button
            label=""
            icon={<IoClose />}
            onClick={onCancel}
            variant="normal"
            size="small"
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280'
            }}
          />
        </Box>
        
        {/* Property Info */}
        <Box
          padding="1rem"
          backgroundColor="#f9fafb"
          borderRadius="8px"
          marginBottom="1rem"
        >
          <Box fontSize="1.125rem" fontWeight="600" marginBottom="0.5rem">
            {reservation.propertyName}
          </Box>
          <Box fontSize="0.875rem" color="#6b7280">
            Stayed: {formatDateRange(reservation.checkInDate, reservation.checkOutDate)}
          </Box>
        </Box>
      </Box>

      {/* Rating Section */}
      <Box marginBottom="2rem">
        <Box fontSize="1rem" fontWeight="600" marginBottom="1rem">
          How was your stay?
        </Box>
        
        <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.5rem">
          {[...Array(10)].map((_, index) => {
            const starValue = index + 1;
            const isFilled = starValue <= (hoveredRating || rating);
            
            return (
              <Box
                key={index}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoveredRating(starValue)}
                onMouseLeave={() => setHoveredRating(0)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  transform: isFilled ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {isFilled ? (
                  <IoStar size={28} color="#f59e0b" />
                ) : (
                  <IoStarOutline size={28} color="#d1d5db" />
                )}
              </Box>
            );
          })}
        </Box>
        
        {(hoveredRating || rating) > 0 && (
          <Box fontSize="0.875rem" color="#6b7280">
            {hoveredRating || rating}/10 - {getRatingLabel(hoveredRating || rating)}
          </Box>
        )}
      </Box>

      {/* Comment Section */}
      <Box marginBottom="2rem">
        <Box fontSize="1rem" fontWeight="600" marginBottom="0.75rem">
          Tell us more about your experience (optional)
        </Box>
        
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like? What could be improved? Share your thoughts with future guests..."
          rows={6}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            resize: 'vertical',
            minHeight: '120px',
            fontFamily: 'inherit'
          }}
        />
        
        <Box fontSize="0.75rem" color="#6b7280" marginTop="0.5rem">
          Your review will help other guests make informed decisions
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Box 
          padding="0.75rem"
          backgroundColor="#fee2e2"
          borderRadius="8px"
          marginBottom="1rem"
        >
          <Box fontSize="0.875rem" color="#dc2626">
            {error}
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box display="flex" gap="1rem" justifyContent="flex-end">
        <Button
          label="Cancel"
          onClick={onCancel}
          variant="normal"
          disabled={isSubmitting}
        />
        <Button
          label={isSubmitting ? "Submitting..." : "Submit Review"}
          icon={isSubmitting ? undefined : <IoCheckmarkCircle />}
          onClick={handleSubmit}
          variant="promoted"
          disabled={isSubmitting || rating === 0}
        />
      </Box>
    </Box>
  );
};

export default ReviewSubmissionForm;