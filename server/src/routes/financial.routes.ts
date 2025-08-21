import { Router } from 'express';
import * as financialController from '../controllers/financial.controller';
import { authenticate } from '../middleware/auth';
import {
  validateBankDetails,
  validateDateRange,
} from '../middleware/financial.validation';

const router = Router();

router.get(
  '/financial/earnings',
  authenticate,
  validateDateRange,
  financialController.getEarnings
);

router.get(
  '/financial/statements',
  authenticate,
  validateDateRange,
  financialController.getFinancialStatements
);

router.get(
  '/financial/invoices',
  authenticate,
  financialController.getInvoices
);

router.get(
  '/financial/invoices/:invoiceId',
  authenticate,
  financialController.getInvoice
);

router.get(
  '/financial/bank-details',
  authenticate,
  financialController.getBankDetails
);

router.put(
  '/financial/bank-details',
  authenticate,
  validateBankDetails,
  financialController.updateBankDetails
);

router.post(
  '/security/report',
  authenticate,
  financialController.reportSecurityBreach
);

export default router;