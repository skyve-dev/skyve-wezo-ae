import { Request, Response } from 'express';
import supportService from '../services/support.service';

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { subject, description, category, priority, attachments, metadata } = req.body;

    const ticket = await supportService.createTicket({
      userId,
      subject,
      description,
      category,
      priority,
      attachments,
      metadata,
    });

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket,
    });
  } catch (error: any) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { status, category, priority, page = 1, limit = 20 } = req.query;

    const filters: any = {};
    if (status) filters.status = status as string;
    if (category) filters.category = category as string;
    if (priority) filters.priority = priority as string;

    const result = await supportService.getTickets(
      userId,
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { ticketId } = req.params;

    const ticket = await supportService.getTicket(ticketId, userId);

    res.json(ticket);
  } catch (error: any) {
    console.error('Get support ticket error:', error);
    if (error.message === 'Support ticket not found or you do not have permission to view it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { ticketId } = req.params;
    const { content, attachments } = req.body;

    const message = await supportService.addMessage(ticketId, userId, content, attachments);

    res.status(201).json({
      message: 'Message added successfully',
      messageData: message,
    });
  } catch (error: any) {
    console.error('Add support message error:', error);
    if (error.message === 'Support ticket not found or you do not have permission to add messages') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { ticketId } = req.params;
    const { subject, priority, status } = req.body;

    const updatedTicket = await supportService.updateTicket(ticketId, userId, {
      subject,
      priority,
      status,
    });

    res.json({
      message: 'Support ticket updated successfully',
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error('Update support ticket error:', error);
    if (error.message === 'Support ticket not found or you do not have permission to update it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const closeTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { ticketId } = req.params;
    const { resolution } = req.body;

    const closedTicket = await supportService.closeTicket(ticketId, userId, resolution);

    res.json({
      message: 'Support ticket closed successfully',
      ticket: closedTicket,
    });
  } catch (error: any) {
    console.error('Close support ticket error:', error);
    if (error.message === 'Support ticket not found or you do not have permission to close it') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rateSatisfaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { ticketId } = req.params;
    const { satisfaction } = req.body;

    const ratedTicket = await supportService.rateSatisfaction(ticketId, userId, satisfaction);

    res.json({
      message: 'Satisfaction rating submitted successfully',
      ticket: ratedTicket,
    });
  } catch (error: any) {
    console.error('Rate satisfaction error:', error);
    if (error.message === 'Support ticket not found or you do not have permission to rate it') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Can only rate satisfaction for resolved or closed tickets') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFAQs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;

    const result = await supportService.getFAQs(
      category as string,
      search as string
    );

    res.json(result);
  } catch (error: any) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGuides = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;

    const result = await supportService.getGuides(
      category as string,
      search as string
    );

    res.json(result);
  } catch (error: any) {
    console.error('Get guides error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGuideContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guideId } = req.params;

    const guide = await supportService.getGuideContent(guideId);

    res.json(guide);
  } catch (error: any) {
    console.error('Get guide content error:', error);
    if (error.message === 'Guide not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const incrementFAQView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faqId } = req.params;

    const faq = await supportService.incrementFAQView(faqId);

    res.json(faq);
  } catch (error: any) {
    console.error('Increment FAQ view error:', error);
    if (error.message === 'FAQ not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markFAQHelpful = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faqId } = req.params;

    const result = await supportService.markFAQHelpful(faqId);

    res.json(result);
  } catch (error: any) {
    console.error('Mark FAQ helpful error:', error);
    if (error.message === 'FAQ not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const likeGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guideId } = req.params;

    const result = await supportService.likeGuide(guideId);

    res.json(result);
  } catch (error: any) {
    console.error('Like guide error:', error);
    if (error.message === 'Guide not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};