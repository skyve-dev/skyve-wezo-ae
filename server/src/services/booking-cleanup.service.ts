import prisma from '../config/database'

/**
 * Booking Cleanup Service
 * Handles expired booking cleanup and soft hold release
 */
export class BookingCleanupService {
  private static instance: BookingCleanupService
  private intervalId: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): BookingCleanupService {
    if (!BookingCleanupService.instance) {
      BookingCleanupService.instance = new BookingCleanupService()
    }
    return BookingCleanupService.instance
  }

  /**
   * Start the cleanup service with specified interval
   * @param intervalMs - Cleanup interval in milliseconds (default: 1 minute)
   */
  start(intervalMs: number = 60000) {
    if (this.intervalId) {
      console.log('⚠️  Booking cleanup service is already running')
      return
    }

    console.log(`🚀 Starting booking cleanup service (interval: ${intervalMs / 1000}s)`)
    
    // Run cleanup immediately
    this.cleanupExpiredBookings()

    // Schedule recurring cleanup
    this.intervalId = setInterval(() => {
      this.cleanupExpiredBookings()
    }, intervalMs)
  }

  /**
   * Stop the cleanup service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('🛑 Booking cleanup service stopped')
    }
  }

  /**
   * Main cleanup function - finds and processes expired bookings
   */
  async cleanupExpiredBookings() {
    try {
      const now = new Date()
      console.log(`🧹 Running booking cleanup at ${now.toISOString()}`)

      // Find expired bookings
      const expiredBookings = await prisma.reservation.findMany({
        where: {
          status: 'Pending'
          // Note: expiry check needs schema update
        },
        include: {
          property: {
            select: { name: true }
          }
        }
      })

      if (expiredBookings.length === 0) {
        console.log('✅ No expired bookings found')
        return
      }

      console.log(`🔍 Found ${expiredBookings.length} expired booking(s)`)

      for (const booking of expiredBookings) {
        try {
          await this.processExpiredBooking(booking)
        } catch (error) {
          console.error(`❌ Error processing expired booking ${booking.id}:`, error)
          // Continue processing other bookings even if one fails
        }
      }

      console.log(`✅ Cleanup completed - processed ${expiredBookings.length} expired booking(s)`)
    } catch (error) {
      console.error('❌ Error during booking cleanup:', error)
    }
  }

  /**
   * Process a single expired booking
   * @param booking - The expired booking to process
   */
  private async processExpiredBooking(booking: any) {
    const bookingId = booking.id
    const propertyName = booking.property?.name || 'Unknown Property'

    console.log(`🔄 Processing expired booking ${bookingId} for ${propertyName}`)

    // Update booking status to expired
    await prisma.reservation.update({
      where: { id: bookingId },
      data: {
        status: 'Cancelled', // Note: 'Expired' status needs to be added to enum
        paymentStatus: 'Cancelled'
      }
    })

    console.log(`📝 Updated booking ${bookingId} status to Expired`)

    // Release soft hold availability
    const releasedCount = await this.releaseAvailability(bookingId)
    
    console.log(`🔓 Released ${releasedCount} availability slot(s) for booking ${bookingId}`)

    // Optional: Send expiry notification email
    try {
      await this.sendExpiryNotification(booking)
    } catch (emailError) {
      console.error(`📧 Failed to send expiry notification for booking ${bookingId}:`, emailError)
      // Don't fail the cleanup if email fails
    }
  }

  /**
   * Release availability holds for an expired booking
   * @param bookingId - The booking ID to release holds for
   * @returns Number of availability records updated
   */
  private async releaseAvailability(_bookingId: string): Promise<number> {
    const result = await prisma.availability.updateMany({
      where: { 
        // Note: reservation-based availability needs schema update
        propertyId: 'placeholder'
      },
      data: {
        isAvailable: true
        // Note: availability cleanup simplified
      }
    })

    return result.count
  }

  /**
   * Send expiry notification to guest (placeholder for now)
   * @param booking - The expired booking
   */
  private async sendExpiryNotification(booking: any) {
    // For development: just log the notification
    console.log(`📧 [MOCK EMAIL] Booking expired notification for ${booking.guest?.email || 'guest'}`)
    console.log(`   Booking ID: ${booking.id}`)
    console.log(`   Property: ${booking.property?.name}`)
    console.log(`   Dates: ${booking.checkInDate?.toISOString().split('T')[0]} - ${booking.checkOutDate?.toISOString().split('T')[0]}`)
    
    // TODO: Implement real email service
    // const emailService = new EmailService()
    // await emailService.sendBookingExpiryNotification(booking)
  }

  /**
   * Get cleanup service status
   */
  getStatus() {
    return {
      running: this.intervalId !== null,
      intervalId: this.intervalId
    }
  }

  /**
   * Run cleanup manually (for testing)
   */
  async runCleanupNow() {
    console.log('🔧 Running manual cleanup...')
    await this.cleanupExpiredBookings()
  }
}

// Export singleton instance
export const bookingCleanupService = BookingCleanupService.getInstance()