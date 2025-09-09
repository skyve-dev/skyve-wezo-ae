import React, { useState } from 'react';
import { Box } from '@/components/base/Box';
import { Button } from '@/components/base/Button';
import { useAppDispatch } from '@/store';
import { sendMessage } from '@/store/slices/bookingDetailsSlice';
import { 
  IoMail,
  IoSend,
  IoPerson,
  IoTime,
  IoAttach
} from 'react-icons/io5';

interface MessagingSectionProps {
  booking: any;
  userRole: string;
  messages: any[];
}

const MessagingSection: React.FC<MessagingSectionProps> = ({ booking, userRole, messages }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const dispatch = useAppDispatch();
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    try {
      await dispatch(sendMessage({
        bookingId: booking.id,
        message: newMessage.trim()
      }));
      setNewMessage('');
    } catch (error) {
      // Error handled by Redux
    } finally {
      setIsSending(false);
    }
  };
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-AE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-AE', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  const getMessageSenderLabel = (message: any) => {
    if (message.senderType === 'Tenant') {
      return 'Guest';
    } else if (message.senderType === 'HomeOwner') {
      return 'Host';
    } else if (message.senderType === 'Manager') {
      return 'Wezo Support';
    }
    return message.sender?.username || 'User';
  };
  
  return (
    <Box
      backgroundColor="white"
      borderRadius="12px"
      padding="1.5rem"
      border="1px solid #e5e7eb"
    >
      <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1.5rem">
        <IoMail color="#059669" size={16} />
        <Box fontSize="1.125rem" fontWeight="600" color="#111827">
          Messages
        </Box>
        {messages.length > 0 && (
          <Box
            backgroundColor="#f3f4f6"
            color="#6b7280"
            padding="0.25rem 0.5rem"
            borderRadius="12px"
            fontSize="0.75rem"
            fontWeight="500"
          >
            {messages.length} message{messages.length > 1 ? 's' : ''}
          </Box>
        )}
      </Box>
      
      {/* Messages List */}
      {messages.length > 0 ? (
        <Box 
          maxHeight="400px" 
          overflowY="auto" 
          marginBottom="1.5rem"
          border="1px solid #e5e7eb"
          borderRadius="8px"
          padding="1rem"
        >
          {messages.map((message) => (
            <Box key={message.id} marginBottom="1rem">
              <Box display="flex" alignItems="flex-start" gap="0.75rem">
                {/* Avatar */}
                <Box
                  width="32px"
                  height="32px"
                  borderRadius="50%"
                  backgroundColor={
                    message.senderType === 'Tenant' ? '#dbeafe' :
                    message.senderType === 'HomeOwner' ? '#dcfce7' : '#fef3c7'
                  }
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="0.875rem"
                  fontWeight="600"
                  color={
                    message.senderType === 'Tenant' ? '#1e40af' :
                    message.senderType === 'HomeOwner' ? '#166534' : '#92400e'
                  }
                  flexShrink={0}
                >
                  <IoPerson size={14} />
                </Box>
                
                {/* Message Content */}
                <Box flex="1">
                  <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
                    <Box fontSize="0.875rem" fontWeight="600" color="#111827">
                      {getMessageSenderLabel(message)}
                    </Box>
                    <Box display="flex" alignItems="center" gap="0.25rem" fontSize="0.75rem" color="#6b7280">
                      <IoTime size={10} />
                      {formatMessageTime(message.createdAt)}
                    </Box>
                  </Box>
                  
                  <Box fontSize="0.875rem" color="#374151" lineHeight="1.5">
                    {message.content}
                  </Box>
                  
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <Box marginTop="0.5rem" display="flex" flexWrap="wrap" gap="0.5rem">
                      {message.attachments.map((attachment: any) => (
                        <Box
                          key={attachment.id}
                          display="flex"
                          alignItems="center"
                          gap="0.25rem"
                          padding="0.25rem 0.5rem"
                          backgroundColor="#f3f4f6"
                          borderRadius="4px"
                          fontSize="0.75rem"
                          color="#6b7280"
                        >
                          <IoAttach size={10} />
                          {attachment.fileName}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box 
          textAlign="center" 
          padding="2rem"
          backgroundColor="#f9fafb"
          borderRadius="8px"
          marginBottom="1.5rem"
        >
          <IoMail size={32} color="#9ca3af" style={{ marginBottom: '1rem' }} />
          <Box fontSize="0.875rem" color="#6b7280" marginBottom="0.5rem">
            No messages yet
          </Box>
          <Box fontSize="0.75rem" color="#9ca3af">
            Start a conversation with the {userRole === 'Tenant' ? 'host' : 'guest'}
          </Box>
        </Box>
      )}
      
      {/* Message Input */}
      <Box>
        <Box marginBottom="0.75rem">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Send a message to the ${userRole === 'Tenant' ? 'host' : 'guest'}...`}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              resize: 'vertical',
              minHeight: '80px',
              fontFamily: 'inherit'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box fontSize="0.75rem" color="#6b7280">
            Press Ctrl+Enter to send
          </Box>
          
          <Box display="flex" gap="0.75rem">
            <Button
              label="Attach File"
              icon={<IoAttach />}
              variant="normal"
              size="small"
              onClick={() => {
                // TODO: Implement file attachment
                console.log('Attach file functionality');
              }}
              style={{ backgroundColor: 'transparent', border: '1px solid #d1d5db' }}
            />
            
            <Button
              label={isSending ? "Sending..." : "Send"}
              icon={<IoSend />}
              onClick={handleSendMessage}
              variant="promoted"
              size="small"
              disabled={!newMessage.trim() || isSending}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MessagingSection;