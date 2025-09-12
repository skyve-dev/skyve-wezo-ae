import { Request, Response } from 'express';
import financialService from '../services/financial.service';

export const getEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate, propertyId } = req.query;

    const earnings = await financialService.getEarnings(
      req.user.id,
      {
        startDate: startDate as string,
        endDate: endDate as string,
        propertyId: propertyId as string,
      }
    );

    res.json(earnings);
  } catch (error: any) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEarningsStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;

    const stats = await financialService.getEarningsStats(
      req.user.id,
      {
        startDate: startDate as string,
        endDate: endDate as string,
      }
    );

    res.json({ stats });
  } catch (error: any) {
    console.error('Get earnings stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type, status, propertyId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const transactions = await financialService.getTransactions(
      req.user.id,
      {
        type: type as string,
        status: status as string,
        propertyId: propertyId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: Number(page),
        limit: Number(limit),
      }
    );

    res.json(transactions);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFinancialStatements = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { year, month } = req.query;

    const statements = await financialService.getFinancialStatements(
      req.user.id,
      Number(year || new Date().getFullYear()),
      month ? Number(month) : undefined
    );

    res.json(statements);
  } catch (error: any) {
    console.error('Get financial statements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, page = 1, limit = 20 } = req.query;

    const invoices = await financialService.getInvoices(
      req.user.id,
      status as string,
      Number(page),
      Number(limit)
    );

    res.json(invoices);
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { invoiceId } = req.params;

    const invoice = await financialService.getInvoice(invoiceId, req.user.id);

    res.json(invoice);
  } catch (error: any) {
    console.error('Get invoice error:', error);
    if (error.message === 'Invoice not found or you do not have permission to view it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBankAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bankAccounts = await financialService.getBankAccounts(req.user.id);

    res.json({ bankAccounts });
  } catch (error: any) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bankAccount = await financialService.addBankAccount(req.user.id, req.body);

    res.status(201).json({ 
      message: 'Bank account added successfully',
      bankAccount 
    });
  } catch (error: any) {
    console.error('Add bank account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { accountId } = req.params;
    const bankAccount = await financialService.updateBankAccount(
      req.user.id, 
      accountId, 
      req.body
    );

    res.json({
      message: 'Bank account updated successfully',
      bankAccount
    });
  } catch (error: any) {
    console.error('Update bank account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { accountId } = req.params;
    await financialService.deleteBankAccount(req.user.id, accountId);

    res.json({ message: 'Bank account deleted successfully' });
  } catch (error: any) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { accountId } = req.params;
    const bankAccount = await financialService.verifyBankAccount(
      req.user.id, 
      accountId, 
      req.body
    );

    res.json({
      message: 'Bank account verified successfully',
      bankAccount
    });
  } catch (error: any) {
    console.error('Verify bank account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPayouts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, startDate, endDate } = req.query;

    const payouts = await financialService.getPayouts(
      req.user.id,
      {
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      }
    );

    res.json({ payouts });
  } catch (error: any) {
    console.error('Get payouts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestPayout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { bankAccountId, amount } = req.body;

    const payout = await financialService.requestPayout(
      req.user.id,
      {
        bankAccountId,
        amount,
      }
    );

    res.status(201).json({
      message: 'Payout requested successfully',
      payout
    });
  } catch (error: any) {
    console.error('Request payout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downloadInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { invoiceId } = req.params;
    const downloadUrl = await financialService.generateInvoiceDownload(invoiceId, req.user.id);

    res.json({ downloadUrl });
  } catch (error: any) {
    console.error('Download invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const settleInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { invoiceId } = req.params;
    const { paymentReference } = req.body;

    const invoice = await financialService.settleInvoice(
      invoiceId, 
      req.user.id,
      paymentReference
    );

    res.json({
      message: 'Invoice settled successfully',
      invoice
    });
  } catch (error: any) {
    console.error('Settle invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reportSecurityBreach = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type, description, affectedData } = req.body;

    const report = await financialService.reportSecurityBreach(
      req.user.id,
      type,
      description,
      affectedData
    );

    res.status(201).json({
      message: 'Security breach reported successfully',
      reportId: report.id,
      status: report.status,
    });
  } catch (error: any) {
    console.error('Report security breach error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};