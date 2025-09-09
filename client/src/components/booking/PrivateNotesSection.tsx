import React, { useState } from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { useAppDispatch } from '@/store';
import { updatePrivateNotes } from '@/store/slices/bookingDetailsSlice';
import { 
  IoDocument,
  IoSave,
  IoCreate
} from 'react-icons/io5';

interface PrivateNotesSectionProps {
  booking: any;
  userRole: string;
}

const PrivateNotesSection: React.FC<PrivateNotesSectionProps> = ({ booking, userRole: _userRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(booking.privateNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useAppDispatch();
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dispatch(updatePrivateNotes({
        bookingId: booking.id,
        notes: notes.trim()
      }));
      setIsEditing(false);
    } catch (error) {
      // Error handled by Redux
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setNotes(booking.privateNotes || '');
    setIsEditing(false);
  };
  
  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1.5rem">
        <Box display="flex" alignItems="center" gap="0.5rem">
          <IoDocument color="#8b5cf6" size={16} />
          <Box fontSize="1.125rem" fontWeight="600" color="#111827">
            Private Notes
          </Box>
        </Box>
        
        {!isEditing && (
          <Button
            label="Edit"
            icon={<IoCreate />}
            onClick={() => setIsEditing(true)}
            variant="normal"
            size="small"
          />
        )}
      </Box>
      
      <Box marginBottom="1rem">
        <Box fontSize="0.75rem" color="#8b5cf6" marginBottom="0.5rem">
          📝 These notes are only visible to hosts and support staff
        </Box>
        
        {isEditing ? (
          <Box>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes about this booking or guest..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
            />
            
            <Box display="flex" gap="0.5rem" marginTop="0.75rem">
              <Button
                label={isSaving ? "Saving..." : "Save"}
                icon={<IoSave />}
                onClick={handleSave}
                variant="promoted"
                size="small"
                disabled={isSaving}
              />
              <Button
                label="Cancel"
                onClick={handleCancel}
                variant="normal"
                size="small"
                disabled={isSaving}
              />
            </Box>
          </Box>
        ) : (
          <Box>
            {booking.privateNotes ? (
              <Box
                padding="0.75rem"
                backgroundColor="#f9fafb"
                borderRadius="8px"
                border="1px solid #e5e7eb"
              >
                <Box fontSize="0.875rem" color="#374151" lineHeight="1.5" style={{ whiteSpace: 'pre-wrap' }}>
                  {booking.privateNotes}
                </Box>
              </Box>
            ) : (
              <Box
                padding="2rem"
                backgroundColor="#faf5ff"
                borderRadius="8px"
                textAlign="center"
                border="1px dashed #d8b4fe"
              >
                <IoDocument size={24} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
                <Box fontSize="0.875rem" color="#7c3aed" marginBottom="0.25rem">
                  No private notes yet
                </Box>
                <Box fontSize="0.75rem" color="#a855f7">
                  Click "Edit" to add internal notes about this booking
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      {booking.privateNotes && !isEditing && (
        <Box fontSize="0.75rem" color="#6b7280">
          Last updated: {new Date(booking.updatedAt || booking.createdAt).toLocaleDateString('en-AE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Box>
      )}
    </Box>
  );
};

export default PrivateNotesSection;