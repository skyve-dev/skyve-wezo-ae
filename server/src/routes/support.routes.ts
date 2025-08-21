import { Router } from 'express';
import * as supportController from '../controllers/support.controller';
import { authenticate } from '../middleware/auth';
import {
  validateCreateTicket,
  validateTicketFilters,
  validateAddMessage,
  validateUpdateTicket,
  validateCloseTicket,
  validateSatisfactionRating,
  validateFAQFilters,
  validateGuideFilters,
  validateGuideId,
  validateFAQId,
} from '../middleware/support.validation';

const router = Router();

// Support ticket endpoints
router.post(
  '/support/tickets',
  authenticate,
  validateCreateTicket,
  supportController.createTicket
);

router.get(
  '/support/tickets',
  authenticate,
  validateTicketFilters,
  supportController.getTickets
);

router.get(
  '/support/tickets/:ticketId',
  authenticate,
  supportController.getTicket
);

router.post(
  '/support/tickets/:ticketId/messages',
  authenticate,
  validateAddMessage,
  supportController.addMessage
);

router.put(
  '/support/tickets/:ticketId',
  authenticate,
  validateUpdateTicket,
  supportController.updateTicket
);

router.post(
  '/support/tickets/:ticketId/close',
  authenticate,
  validateCloseTicket,
  supportController.closeTicket
);

router.post(
  '/support/tickets/:ticketId/satisfaction',
  authenticate,
  validateSatisfactionRating,
  supportController.rateSatisfaction
);

// FAQ endpoints
router.get(
  '/support/faqs',
  validateFAQFilters,
  supportController.getFAQs
);

router.post(
  '/support/faqs/:faqId/view',
  validateFAQId,
  supportController.incrementFAQView
);

router.post(
  '/support/faqs/:faqId/helpful',
  validateFAQId,
  supportController.markFAQHelpful
);

// Guide endpoints
router.get(
  '/support/guides',
  validateGuideFilters,
  supportController.getGuides
);

router.get(
  '/support/guides/:guideId',
  validateGuideId,
  supportController.getGuideContent
);

router.post(
  '/support/guides/:guideId/like',
  validateGuideId,
  supportController.likeGuide
);

export default router;