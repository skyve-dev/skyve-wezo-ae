import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const messageController = new MessageController();

// All routes require authentication
router.use(authenticate);

// Conversation management
router.get('/conversations', messageController.getConversations);
router.get('/conversations/:conversationId', messageController.getConversationMessages);
router.post('/conversations', messageController.startConversation);
router.delete('/conversations/:conversationId', messageController.deleteConversation);

// Message management
router.post('/', messageController.sendMessage);
router.put('/mark-read', messageController.markAsRead);
router.get('/search', messageController.searchMessages);
router.get('/unread-count', messageController.getUnreadCount);

export default router;