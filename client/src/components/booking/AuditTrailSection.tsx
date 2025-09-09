import React from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { 
  IoTime as IoHistory,
  IoPerson,
  IoTime,
  IoCreate,
  IoSwapHorizontal,
  IoDocument
} from 'react-icons/io5';

interface AuditTrailSectionProps {
  booking: any;
  auditTrail: any[];
  userRole: string;
}

const AuditTrailSection: React.FC<AuditTrailSectionProps> = ({ 
  booking: _booking, 
  auditTrail, 
  userRole: _userRole 
}) => {
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return <IoPerson color="#059669" size={14} />;
      case 'modified':
      case 'updated':
        return <IoCreate color="#3b82f6" size={14} />;
      case 'status_changed':
        return <IoSwapHorizontal color="#f59e0b" size={14} />;
      case 'notes_updated':
        return <IoDocument color="#8b5cf6" size={14} />;
      default:
        return <IoTime color="#6b7280" size={14} />;
    }
  };
  
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return '#059669';
      case 'modified':
      case 'updated':
        return '#3b82f6';
      case 'status_changed':
        return '#f59e0b';
      case 'notes_updated':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-AE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getUserRoleLabel = (role: string) => {
    switch (role) {
      case 'Tenant':
        return 'Guest';
      case 'HomeOwner':
        return 'Host';
      case 'Manager':
        return 'Support';
      default:
        return role;
    }
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
          <IoHistory color="#059669" size={16} />
          <Box fontSize="1.125rem" fontWeight="600" color="#111827">
            Activity Log
          </Box>
          {auditTrail.length > 0 && (
            <Box
              backgroundColor="#f3f4f6"
              color="#6b7280"
              padding="0.25rem 0.5rem"
              borderRadius="12px"
              fontSize="0.75rem"
              fontWeight="500"
            >
              {auditTrail.length} entries
            </Box>
          )}
        </Box>
        
        <Button
          label="View Full Log"
          variant="normal"
          size="small"
          onClick={() => {
            // TODO: Implement full audit log view
            console.log('View full audit log');
          }}
        />
      </Box>
      
      {auditTrail.length > 0 ? (
        <Box>
          {auditTrail.slice(0, 5).map((entry, index) => (
            <Box key={entry.id || index} marginBottom="1rem">
              <Box display="flex" alignItems="flex-start" gap="0.75rem">
                {/* Timeline indicator */}
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Box
                    width="32px"
                    height="32px"
                    borderRadius="50%"
                    backgroundColor="#f3f4f6"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="2px solid"
                    borderColor={getActionColor(entry.action)}
                  >
                    {getActionIcon(entry.action)}
                  </Box>
                  {index < auditTrail.slice(0, 5).length - 1 && (
                    <Box 
                      width="2px" 
                      height="20px" 
                      backgroundColor="#e5e7eb" 
                      marginTop="0.5rem"
                    />
                  )}
                </Box>
                
                {/* Entry content */}
                <Box flex="1">
                  <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
                    <Box fontSize="0.875rem" fontWeight="600" color="#111827">
                      {entry.description || `${entry.action} action performed`}
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap="1rem" fontSize="0.75rem" color="#6b7280">
                    <Box display="flex" alignItems="center" gap="0.25rem">
                      <IoPerson size={10} />
                      {getUserRoleLabel(entry.userRole)} • {entry.user?.username || 'System'}
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap="0.25rem">
                      <IoTime size={10} />
                      {formatTimestamp(entry.createdAt)}
                    </Box>
                  </Box>
                  
                  {/* Show field changes if available */}
                  {entry.field && (entry.oldValue || entry.newValue) && (
                    <Box marginTop="0.5rem" padding="0.5rem" backgroundColor="#f9fafb" borderRadius="4px">
                      <Box fontSize="0.75rem" color="#6b7280" marginBottom="0.25rem">
                        Field: <span style={{ fontWeight: '500', color: '#374151' }}>{entry.field}</span>
                      </Box>
                      {entry.oldValue && (
                        <Box fontSize="0.75rem" color="#dc2626">
                          From: {entry.oldValue}
                        </Box>
                      )}
                      {entry.newValue && (
                        <Box fontSize="0.75rem" color="#059669">
                          To: {entry.newValue}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
          
          {auditTrail.length > 5 && (
            <Box textAlign="center" marginTop="1rem">
              <Button
                label={`View ${auditTrail.length - 5} more entries`}
                variant="normal"
                size="small"
                onClick={() => {
                  // TODO: Show more audit entries
                  console.log('Show more audit entries');
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Box 
          textAlign="center" 
          padding="2rem"
          backgroundColor="#f9fafb"
          borderRadius="8px"
        >
          <IoHistory size={32} color="#9ca3af" style={{ marginBottom: '1rem' }} />
          <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem">
            No activity yet
          </Box>
          <Box fontSize="0.75rem" color="#9ca3af">
            Changes to this booking will appear here
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AuditTrailSection;