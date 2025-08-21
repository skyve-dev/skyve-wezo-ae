import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class ReviewService {
  async getReviews(
    userId: string,
    filters: {
      propertyId?: string;
      rating?: number;
      hasResponse?: boolean;
      startDate?: string;
      endDate?: string;
    } = {},
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const whereClause: Prisma.ReviewWhereInput = {
      property: {
        ownerId: userId,
      },
    };

    if (filters.propertyId) {
      whereClause.propertyId = filters.propertyId;
    }

    if (filters.rating) {
      whereClause.rating = filters.rating;
    }

    if (typeof filters.hasResponse === 'boolean') {
      if (filters.hasResponse) {
        whereClause.response = { not: null };
      } else {
        whereClause.response = null;
      }
    }

    if (filters.startDate || filters.endDate) {
      whereClause.reviewedAt = {};
      if (filters.startDate) {
        whereClause.reviewedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.reviewedAt.lte = new Date(filters.endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await prisma.$transaction([
      prisma.review.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { reviewedAt: 'desc' },
        include: {
          guest: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          property: {
            select: {
              propertyId: true,
              name: true,
            },
          },
          reservation: {
            select: {
              id: true,
              checkInDate: true,
              checkOutDate: true,
            },
          },
        },
      }),
      prisma.review.count({ where: whereClause }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getPropertyReviews(
    propertyId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        propertyId,
        ownerId: userId,
      },
    });

    if (!property) {
      throw new Error('Property not found or you do not have permission to view its reviews');
    }

    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await prisma.$transaction([
      prisma.review.findMany({
        where: { propertyId },
        skip,
        take: limit,
        orderBy: { reviewedAt: 'desc' },
        include: {
          guest: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          reservation: {
            select: {
              id: true,
              checkInDate: true,
              checkOutDate: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { propertyId } }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getReviewStats(userId: string, propertyId?: string): Promise<any> {
    const whereClause: Prisma.ReviewWhereInput = {
      property: {
        ownerId: userId,
      },
    };

    if (propertyId) {
      whereClause.propertyId = propertyId;
    }

    const [
      totalReviews,
      averageRating,
      ratingDistribution,
      reviewsWithResponse,
      recentReviews,
    ] = await prisma.$transaction([
      // Total reviews count
      prisma.review.count({ where: whereClause }),
      
      // Average rating
      prisma.review.aggregate({
        where: whereClause,
        _avg: { rating: true },
      }),
      
      // Rating distribution
      prisma.review.groupBy({
        by: ['rating'],
        where: whereClause,
        _count: { id: true },
        orderBy: { rating: 'desc' },
      }),
      
      // Reviews with response count
      prisma.review.count({
        where: {
          ...whereClause,
          response: { not: null },
        },
      }),
      
      // Recent reviews (last 30 days)
      prisma.review.count({
        where: {
          ...whereClause,
          reviewedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate response rate
    const responseRate = totalReviews > 0 ? (reviewsWithResponse / totalReviews) * 100 : 0;

    return {
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      responseRate: Math.round(responseRate * 100) / 100,
      recentReviews,
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item.rating,
        count: (item._count as any).id || 0,
      })),
    };
  }

  async respondToReview(
    reviewId: string,
    userId: string,
    response: string
  ): Promise<any> {
    // Check if review exists and user owns the property
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        property: {
          ownerId: userId,
        },
      },
      include: {
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
      },
    });

    if (!review) {
      throw new Error('Review not found or you do not have permission to respond');
    }

    if (review.response) {
      throw new Error('Review already has a response');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { response },
      include: {
        guest: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
      },
    });

    return updatedReview;
  }

  async updateResponse(
    reviewId: string,
    userId: string,
    response: string
  ): Promise<any> {
    // Check if review exists and user owns the property
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        property: {
          ownerId: userId,
        },
      },
    });

    if (!review) {
      throw new Error('Review not found or you do not have permission to update response');
    }

    if (!review.response) {
      throw new Error('Review does not have a response to update');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { response },
      include: {
        guest: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
      },
    });

    return updatedReview;
  }

  async deleteResponse(reviewId: string, userId: string): Promise<any> {
    // Check if review exists and user owns the property
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        property: {
          ownerId: userId,
        },
      },
    });

    if (!review) {
      throw new Error('Review not found or you do not have permission to delete response');
    }

    if (!review.response) {
      throw new Error('Review does not have a response to delete');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { response: null },
      include: {
        guest: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        property: {
          select: {
            propertyId: true,
            name: true,
          },
        },
      },
    });

    return updatedReview;
  }

  async getReviewInsights(userId: string, propertyId?: string): Promise<any> {
    const whereClause: Prisma.ReviewWhereInput = {
      property: {
        ownerId: userId,
      },
    };

    if (propertyId) {
      whereClause.propertyId = propertyId;
    }

    // Get reviews from last 6 months for trend analysis
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await prisma.review.groupBy({
      by: ['reviewedAt'],
      where: {
        ...whereClause,
        reviewedAt: { gte: sixMonthsAgo },
      },
      _avg: { rating: true },
      _count: { id: true },
    });

    // Group by month for trend analysis
    const trends = monthlyTrends.reduce((acc: any[], review) => {
      const month = new Date(review.reviewedAt).toISOString().slice(0, 7); // YYYY-MM
      const existing = acc.find(item => item.month === month);
      
      if (existing) {
        existing.averageRating = (existing.averageRating + (review._avg.rating || 0)) / 2;
        existing.count += review._count.id;
      } else {
        acc.push({
          month,
          averageRating: review._avg.rating || 0,
          count: review._count.id,
        });
      }
      
      return acc;
    }, []);

    // Get common keywords from recent reviews (simplified implementation)
    const recentReviews = await prisma.review.findMany({
      where: {
        ...whereClause,
        reviewedAt: { gte: sixMonthsAgo },
        comment: { not: null },
      },
      select: { comment: true },
      take: 100,
    });

    // Simple keyword extraction (in a real app, you'd use NLP)
    const commonWords = recentReviews
      .flatMap(r => r.comment?.toLowerCase().split(/\s+/) || [])
      .filter(word => word.length > 3 && !['the', 'and', 'was', 'were', 'very', 'really', 'good', 'great'].includes(word))
      .reduce((acc: Record<string, number>, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});

    const topKeywords = Object.entries(commonWords)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    return {
      monthlyTrends: trends.sort((a, b) => a.month.localeCompare(b.month)),
      topKeywords,
    };
  }
}

export default new ReviewService();