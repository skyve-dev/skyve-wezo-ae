import { Router } from 'express';
import * as financialController from '../controllers/financial.controller';
import { authenticate } from '../middleware/auth';
import {
  validateBankDetails,
  validateDateRange,
} from '../middleware/financial.validation';

const router = Router();

// Earnings and Stats endpoints (matching frontend expectations)
router.get(
  '/finance/earnings/stats',
  authenticate,
  validateDateRange,
  financialController.getEarningsStats
);

router.get(
  '/finance/earnings',
  authenticate,
  validateDateRange,
  financialController.getEarnings
);

// Transaction endpoints  
router.get(
  '/finance/transactions',
  authenticate,
  validateDateRange,
  financialController.getTransactions
);

// Bank Account endpoints (matching frontend expectations)
router.get(
  '/finance/bank-accounts',
  authenticate,
  financialController.getBankAccounts
);

router.post(
  '/finance/bank-accounts',
  authenticate,
  validateBankDetails,
  financialController.addBankAccount
);

router.patch(
  '/finance/bank-accounts/:accountId',
  authenticate,
  validateBankDetails,
  financialController.updateBankAccount
);

router.delete(
  '/finance/bank-accounts/:accountId',
  authenticate,
  financialController.deleteBankAccount
);

router.post(
  '/finance/bank-accounts/:accountId/verify',
  authenticate,
  financialController.verifyBankAccount
);

// Payout endpoints
router.get(
  '/finance/payouts',
  authenticate,
  validateDateRange,
  financialController.getPayouts
);

router.post(
  '/finance/payouts/request',
  authenticate,
  financialController.requestPayout
);

// Invoice endpoints
router.get(
  '/finance/invoices',
  authenticate,
  financialController.getInvoices
);

router.get(
  '/finance/invoices/:invoiceId',
  authenticate,
  financialController.getInvoice
);

router.get(
  '/finance/invoices/:invoiceId/download',
  authenticate,
  financialController.downloadInvoice
);

router.patch(
  '/finance/invoices/:invoiceId/settle',
  authenticate,
  financialController.settleInvoice
);

// Financial Statements (legacy endpoint)
router.get(
  '/financial/statements',
  authenticate,
  validateDateRange,
  financialController.getFinancialStatements
);

// Security reporting
router.post(
  '/security/report',
  authenticate,
  financialController.reportSecurityBreach
);

export default router;