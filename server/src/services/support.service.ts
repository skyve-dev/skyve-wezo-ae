import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class SupportService {
  async createTicket(data: {
    userId: string;
    subject: string;
    description: string;
    category: string;
    priority?: string;
    attachments?: any;
    metadata?: any;
  }): Promise<any> {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: data.userId,
        subject: data.subject,
        description: data.description,
        category: data.category as any,
        priority: (data.priority as any) || 'Medium',
        attachments: data.attachments,
        metadata: data.metadata,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Auto-create initial system message
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: 'system',
        senderType: 'System',
        content: `Thank you for contacting Wezo.ae support. Your ticket has been created and assigned ID: ${ticket.id}. Our support team will respond to your inquiry within 24 hours.`,
        isInternal: false,
      },
    });

    return ticket;
  }

  async getTickets(
    userId: string,
    filters: {
      status?: string;
      category?: string;
      priority?: string;
    } = {},
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const whereClause: Prisma.SupportTicketWhereInput = {
      userId,
    };

    if (filters.status) {
      whereClause.status = filters.status as any;
    }

    if (filters.category) {
      whereClause.category = filters.category as any;
    }

    if (filters.priority) {
      whereClause.priority = filters.priority as any;
    }

    const skip = (page - 1) * limit;

    const [tickets, totalCount] = await prisma.$transaction([
      prisma.supportTicket.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          messages: {
            where: { isInternal: false },
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.supportTicket.count({ where: whereClause }),
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getTicket(ticketId: string, userId: string): Promise<any> {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        messages: {
          where: { isInternal: false },
          orderBy: { sentAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new Error('Support ticket not found or you do not have permission to view it');
    }

    return ticket;
  }

  async addMessage(
    ticketId: string,
    userId: string,
    content: string,
    attachments?: any
  ): Promise<any> {
    // Verify ticket belongs to user
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId,
      },
    });

    if (!ticket) {
      throw new Error('Support ticket not found or you do not have permission to add messages');
    }

    // Reopen ticket if it was closed
    if (ticket.status === 'Closed') {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'Open' },
      });
    }

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: userId,
        senderType: 'User',
        content,
        attachments,
        isInternal: false,
      },
    });

    return message;
  }

  async updateTicket(
    ticketId: string,
    userId: string,
    updates: {
      subject?: string;
      priority?: string;
      status?: string;
    }
  ): Promise<any> {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId,
      },
    });

    if (!ticket) {
      throw new Error('Support ticket not found or you do not have permission to update it');
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        subject: updates.subject,
        priority: updates.priority as any,
        status: updates.status as any,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return updatedTicket;
  }

  async closeTicket(ticketId: string, userId: string, resolution?: string): Promise<any> {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId,
      },
    });

    if (!ticket) {
      throw new Error('Support ticket not found or you do not have permission to close it');
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'Closed',
        resolvedAt: new Date(),
        resolution,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return updatedTicket;
  }

  async rateSatisfaction(
    ticketId: string,
    userId: string,
    satisfaction: number
  ): Promise<any> {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId,
      },
    });

    if (!ticket) {
      throw new Error('Support ticket not found or you do not have permission to rate it');
    }

    if (ticket.status !== 'Resolved' && ticket.status !== 'Closed') {
      throw new Error('Can only rate satisfaction for resolved or closed tickets');
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        satisfaction,
        updatedAt: new Date(),
      },
    });

    return updatedTicket;
  }

  async getFAQs(category?: string, searchTerm?: string): Promise<any> {
    const whereClause: Prisma.FAQWhereInput = {
      isPublished: true,
    };

    if (category) {
      whereClause.category = category;
    }

    if (searchTerm) {
      whereClause.OR = [
        { question: { contains: searchTerm, mode: 'insensitive' } },
        { answer: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } },
      ];
    }

    const faqs = await prisma.fAQ.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { orderIndex: 'asc' },
      ],
    });

    // Group by category
    const groupedFAQs = faqs.reduce((acc: any, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    }, {});

    return {
      faqs: groupedFAQs,
      totalCount: faqs.length,
    };
  }

  async getGuides(category?: string, searchTerm?: string): Promise<any> {
    const whereClause: Prisma.GuideWhereInput = {
      isPublished: true,
    };

    if (category) {
      whereClause.category = category;
    }

    if (searchTerm) {
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } },
      ];
    }

    const guides = await prisma.guide.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { orderIndex: 'asc' },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        tags: true,
        viewCount: true,
        likeCount: true,
        thumbnailUrl: true,
        videoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Group by category
    const groupedGuides = guides.reduce((acc: any, guide) => {
      if (!acc[guide.category]) {
        acc[guide.category] = [];
      }
      acc[guide.category].push(guide);
      return acc;
    }, {});

    return {
      guides: groupedGuides,
      totalCount: guides.length,
    };
  }

  async getGuideContent(guideId: string): Promise<any> {
    const guide = await prisma.guide.findFirst({
      where: {
        id: guideId,
        isPublished: true,
      },
    });

    if (!guide) {
      throw new Error('Guide not found');
    }

    // Increment view count and return updated guide
    const updatedGuide = await prisma.guide.update({
      where: { id: guideId },
      data: { viewCount: { increment: 1 } },
    });

    return updatedGuide;
  }

  async incrementFAQView(faqId: string): Promise<any> {
    const faq = await prisma.fAQ.findFirst({
      where: {
        id: faqId,
        isPublished: true,
      },
    });

    if (!faq) {
      throw new Error('FAQ not found');
    }

    // Increment view count and return updated FAQ
    const updatedFaq = await prisma.fAQ.update({
      where: { id: faqId },
      data: { viewCount: { increment: 1 } },
    });

    return updatedFaq;
  }

  async markFAQHelpful(faqId: string): Promise<any> {
    const faq = await prisma.fAQ.findFirst({
      where: {
        id: faqId,
        isPublished: true,
      },
    });

    if (!faq) {
      throw new Error('FAQ not found');
    }

    // Increment help count
    await prisma.fAQ.update({
      where: { id: faqId },
      data: { helpCount: { increment: 1 } },
    });

    return { message: 'Thank you for your feedback!' };
  }

  async likeGuide(guideId: string): Promise<any> {
    const guide = await prisma.guide.findFirst({
      where: {
        id: guideId,
        isPublished: true,
      },
    });

    if (!guide) {
      throw new Error('Guide not found');
    }

    // Increment like count
    await prisma.guide.update({
      where: { id: guideId },
      data: { likeCount: { increment: 1 } },
    });

    return { message: 'Thank you for your feedback!' };
  }
}

export default new SupportService();