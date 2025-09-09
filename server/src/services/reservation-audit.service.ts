import prisma from '../config/database';
import { UserRole } from '@prisma/client';

interface ChangeData {
  field?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

interface AuditFilters {
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  field?: string;
}

interface SystemAuditFilters extends AuditFilters {
  propertyId?: string;
  reservationId?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface PaginatedAuditLog {
  auditLogs: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export class ReservationAuditService {
  /**
   * Log a reservation change
   */
  async logChange(
    reservationId: string,
    userId: string,
    userRole: UserRole,
    action: string,
    changes: ChangeData
  ): Promise<any> {
    const description = await this.formatChangeDescription(action, changes);

    const auditLog = await prisma.reservationAuditLog.create({
      data: {
        reservationId,
        userId,
        userRole,
        action,
        field: changes.field,
        oldValue: changes.oldValue ? JSON.stringify(changes.oldValue) : null,
        newValue: changes.newValue ? JSON.stringify(changes.newValue) : null,
        description
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    });

    return auditLog;
  }

  /**
   * Log multiple changes in a single transaction
   */
  async logMultipleChanges(
    reservationId: string,
    userId: string,
    userRole: UserRole,
    changes: Array<{
      action: string;
      field?: string;
      oldValue?: any;
      newValue?: any;
    }>
  ): Promise<any[]> {
    const auditLogs = await Promise.all(
      changes.map(async (change) => {
        const description = await this.formatChangeDescription(change.action, change);
        
        return prisma.reservationAuditLog.create({
          data: {
            reservationId,
            userId,
            userRole,
            action: change.action,
            field: change.field,
            oldValue: change.oldValue ? JSON.stringify(change.oldValue) : null,
            newValue: change.newValue ? JSON.stringify(change.newValue) : null,
            description
          }
        });
      })
    );

    return auditLogs;
  }

  /**
   * Get audit trail for a specific reservation
   */
  async getAuditTrail(
    reservationId: string,
    userId: string,
    filters: AuditFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedAuditLog> {
    // Validate access
    await this.validateAuditAccess(reservationId, userId);

    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { reservationId };

    if (filters.action) {
      whereClause.action = filters.action;
    }

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.field) {
      whereClause.field = filters.field;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [auditLogs, totalCount] = await prisma.$transaction([
      prisma.reservationAuditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.reservationAuditLog.count({ where: whereClause })
    ]);

    return {
      auditLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit
      }
    };
  }

  /**
   * Get system-wide audit logs (Manager only)
   */
  async getSystemAuditLog(
    userId: string,
    filters: SystemAuditFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedAuditLog> {
    // Validate manager access
    const userRole = await this.getUserRole(userId);
    if (userRole !== 'Manager') {
      throw new Error('Only managers can access system-wide audit logs');
    }

    const { page = 1, limit = 100 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    if (filters.reservationId) {
      whereClause.reservationId = filters.reservationId;
    }

    if (filters.action) {
      whereClause.action = filters.action;
    }

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.field) {
      whereClause.field = filters.field;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Filter by property if specified
    if (filters.propertyId) {
      whereClause.reservation = {
        OR: [
          { propertyId: filters.propertyId },
          {
            ratePlan: {
              propertyId: filters.propertyId
            }
          }
        ]
      };
    }

    const [auditLogs, totalCount] = await prisma.$transaction([
      prisma.reservationAuditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true
            }
          },
          reservation: {
            include: {
              property: {
                select: {
                  propertyId: true,
                  name: true
                }
              },
              ratePlan: {
                include: {
                  property: {
                    select: {
                      propertyId: true,
                      name: true
                    }
                  }
                }
              },
              guest: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.reservationAuditLog.count({ where: whereClause })
    ]);

    return {
      auditLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit
      }
    };
  }

  /**
   * Export audit log data
   */
  async exportAuditLog(
    reservationId: string,
    userId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    await this.validateAuditAccess(reservationId, userId);

    const auditData = await this.getAuditTrail(reservationId, userId, {}, { page: 1, limit: 1000 });

    const exportData = {
      reservationId,
      auditLogs: auditData.auditLogs,
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: userId,
        role: await this.getUserRole(userId)
      },
      format
    };

    if (format === 'csv') {
      // In real implementation, convert to CSV format
      return this.convertAuditLogToCSV(auditData.auditLogs);
    }

    return exportData;
  }

  /**
   * Get audit statistics for a reservation
   */
  async getAuditStats(reservationId: string, userId: string): Promise<{
    totalChanges: number;
    changesByAction: Record<string, number>;
    changesByUser: Record<string, number>;
    changesByField: Record<string, number>;
    mostRecentChange: any;
    timeline: Array<{
      date: string;
      count: number;
    }>;
  }> {
    await this.validateAuditAccess(reservationId, userId);

    // Get all audit logs for the reservation
    const auditLogs = await prisma.reservationAuditLog.findMany({
      where: { reservationId },
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalChanges = auditLogs.length;
    const changesByAction: Record<string, number> = {};
    const changesByUser: Record<string, number> = {};
    const changesByField: Record<string, number> = {};
    const timelineCounts: Record<string, number> = {};

    // Process statistics
    for (const log of auditLogs) {
      // By action
      changesByAction[log.action] = (changesByAction[log.action] || 0) + 1;
      
      // By user
      const username = log.user?.username || 'Unknown';
      changesByUser[username] = (changesByUser[username] || 0) + 1;
      
      // By field
      if (log.field) {
        changesByField[log.field] = (changesByField[log.field] || 0) + 1;
      }
      
      // Timeline (by date)
      const date = log.createdAt.toISOString().split('T')[0];
      timelineCounts[date] = (timelineCounts[date] || 0) + 1;
    }

    // Convert timeline to array
    const timeline = Object.entries(timelineCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalChanges,
      changesByAction,
      changesByUser,
      changesByField,
      mostRecentChange: auditLogs[0] || null,
      timeline
    };
  }

  /**
   * Get audit summary for multiple reservations (HomeOwner/Manager)
   */
  async getReservationsAuditSummary(
    userId: string,
    reservationIds?: string[]
  ): Promise<{
    totalReservations: number;
    totalChanges: number;
    mostActiveReservations: Array<{
      reservationId: string;
      changeCount: number;
      lastChange: string;
    }>;
    recentActivity: any[];
  }> {
    const userRole = await this.getUserRole(userId);
    
    // Build base where clause based on user role
    let baseWhereClause: any = {};
    
    if (userRole === 'HomeOwner') {
      baseWhereClause = {
        reservation: {
          OR: [
            {
              property: {
                ownerId: userId
              }
            },
            {
              ratePlan: {
                property: {
                  ownerId: userId
                }
              }
            }
          ]
        }
      };
    } else if (userRole !== 'Manager') {
      throw new Error('Insufficient permissions');
    }

    // Add reservation filter if specified
    if (reservationIds) {
      baseWhereClause.reservationId = {
        in: reservationIds
      };
    }

    // Get audit data
    const [auditLogs, reservationCounts] = await prisma.$transaction([
      // Recent activity
      prisma.reservationAuditLog.findMany({
        where: baseWhereClause,
        include: {
          user: {
            select: {
              username: true
            }
          },
          reservation: {
            select: {
              id: true,
              checkInDate: true,
              property: {
                select: {
                  name: true
                }
              },
              ratePlan: {
                select: {
                  property: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      }),
      // Count by reservation
      prisma.reservationAuditLog.groupBy({
        by: ['reservationId'],
        where: baseWhereClause,
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Get most recent change for each reservation
    const mostActiveReservations = await Promise.all(
      reservationCounts.map(async (item) => {
        const lastChange = await prisma.reservationAuditLog.findFirst({
          where: { reservationId: item.reservationId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        });

        return {
          reservationId: item.reservationId,
          changeCount: (item._count as any)?.id || 0,
          lastChange: lastChange?.createdAt.toISOString() || ''
        };
      })
    );

    return {
      totalReservations: new Set(auditLogs.map(log => log.reservationId)).size,
      totalChanges: auditLogs.length,
      mostActiveReservations,
      recentActivity: auditLogs.slice(0, 20)
    };
  }

  // ===== HELPER METHODS =====

  async formatChangeDescription(action: string, changes: ChangeData): Promise<string> {
    switch (action) {
      case 'created':
        return 'Reservation created';
      
      case 'modified':
        if (changes.field) {
          return `${changes.field} changed from ${changes.oldValue} to ${changes.newValue}`;
        }
        return 'Reservation modified';
      
      case 'status_changed':
        return `Status changed from ${changes.oldValue} to ${changes.newValue}`;
      
      case 'cancelled':
        return `Reservation cancelled. Reason: ${changes.newValue || 'Not specified'}`;
      
      case 'notes_updated':
        return 'Private notes updated';
      
      case 'fee_breakdown_updated':
        return 'Fee breakdown recalculated';
      
      case 'payout_created':
        return `Payout scheduled for ${changes.newValue}`;
      
      case 'payout_status_changed':
        return `Payout status changed from ${changes.oldValue} to ${changes.newValue}`;
      
      case 'message_sent':
        return 'Message sent to guest';
      
      case 'message_received':
        return 'Message received from guest';
      
      default:
        return `Action performed: ${action}`;
    }
  }

  async validateAuditAccess(reservationId: string, userId: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    
    // Tenants cannot view audit trails
    if (userRole === 'Tenant') {
      throw new Error('Tenants cannot view audit trails');
    }

    // Managers can access all audit trails
    if (userRole === 'Manager') {
      return true;
    }

    // HomeOwners can only access their property reservations
    if (userRole === 'HomeOwner') {
      const reservation = await prisma.reservation.findFirst({
        where: {
          id: reservationId,
          OR: [
            {
              property: {
                ownerId: userId
              }
            },
            {
              ratePlan: {
                property: {
                  ownerId: userId
                }
              }
            }
          ]
        }
      });

      if (!reservation) {
        throw new Error('Reservation not found or you do not have permission to view its audit trail');
      }
      
      return true;
    }

    throw new Error('Invalid user role');
  }

  private async getUserRole(userId: string): Promise<UserRole> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.role;
  }

  private convertAuditLogToCSV(auditLogs: any[]): string {
    const headers = [
      'Date',
      'User',
      'Role', 
      'Action',
      'Field',
      'Old Value',
      'New Value',
      'Description'
    ];

    const rows = auditLogs.map(log => [
      log.createdAt.toISOString(),
      log.user?.username || 'Unknown',
      log.userRole,
      log.action,
      log.field || '',
      log.oldValue || '',
      log.newValue || '',
      log.description
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Archive old audit logs (cleanup utility)
   */
  async archiveOldAuditLogs(
    olderThanDays: number = 365
  ): Promise<{ archivedCount: number; deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // For now, just delete old logs
    // In production, you might want to move them to an archive table first
    const deletedLogs = await prisma.reservationAuditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return {
      archivedCount: 0, // Not implemented
      deletedCount: deletedLogs.count
    };
  }
}

export default new ReservationAuditService();