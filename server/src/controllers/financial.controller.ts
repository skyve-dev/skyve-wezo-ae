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

export const getBankDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bankDetails = await financialService.getBankDetails(req.user.id);

    res.json(bankDetails);
  } catch (error: any) {
    console.error('Get bank details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBankDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bankDetailsData = req.body;

    const bankDetails = await financialService.updateBankDetails(
      req.user.id,
      bankDetailsData
    );

    res.json({
      message: 'Bank details updated successfully',
      bankDetails: {
        ...bankDetails,
        accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
      },
    });
  } catch (error: any) {
    console.error('Update bank details error:', error);
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