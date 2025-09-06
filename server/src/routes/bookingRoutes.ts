import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { 
  sendEmail, 
  generateBookingConfirmationEmail, 
  generateOwnerNotificationEmail,
  generateCancellationEmail 
} from '../utils/emailService'
import crypto from 'crypto'

const router = express.Router()
const prisma = new PrismaClient()

// OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expires: Date; verified: boolean }>()

// Generate OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP for email verification
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const otpCode = generateOTP()
    const expires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store OTP
    otpStore.set(email, { code: otpCode, expires, verified: false })

    // Send OTP email (for now, we'll just log it)
    console.log(`📧 OTP for ${email}: ${otpCode}`)
    
    return res.json({ message: 'OTP sent successfully', expires })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return res.status(500).json({ message: 'Failed to send OTP' })
  }
})

// Verify OTP code
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otpCode } = req.body

    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and OTP code are required' })
    }

    const storedOtp = otpStore.get(email)

    if (!storedOtp) {
      return res.status(400).json({ message: 'No OTP found for this email' })
    }

    if (storedOtp.expires < new Date()) {
      otpStore.delete(email)
      return res.status(400).json({ message: 'OTP has expired' })
    }

    if (storedOtp.code !== otpCode) {
      return res.status(400).json({ message: 'Invalid OTP code' })
    }

    // Mark as verified
    storedOtp.verified = true
    otpStore.set(email, storedOtp)

    return res.json({ message: 'Email verified successfully', verified: true })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return res.status(500).json({ message: 'Failed to verify OTP' })
  }
})

// Create booking
router.post('/create', authenticate, async (req, res) => {
  try {
    const {
      propertyId,
      ratePlanId,
      checkInDate,
      checkOutDate,
      numGuests,
      guestName,
      guestEmail,
      specialRequests,
      totalPrice
    } = req.body

    // Verify OTP was completed
    const storedOtp = otpStore.get(guestEmail)
    if (!storedOtp || !storedOtp.verified) {
      return res.status(400).json({ message: 'Email verification required' })
    }

    // Create or find guest user
    let guestUser = await prisma.user.findUnique({
      where: { email: guestEmail }
    })

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          username: guestEmail,
          email: guestEmail,
          firstName: guestName.split(' ')[0],
          lastName: guestName.split(' ').slice(1).join(' '),
          password: crypto.randomBytes(32).toString('hex'), // Random password
          role: 'Tenant'
        }
      })
    }

    // Check rate plan exists
    const ratePlan = await prisma.ratePlan.findUnique({
      where: { id: ratePlanId },
      include: { 
        property: {
          include: {
            owner: true
          }
        }
      }
    })

    if (!ratePlan || ratePlan.propertyId !== propertyId) {
      return res.status(400).json({ message: 'Invalid rate plan' })
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        ratePlanId,
        guestId: guestUser.id,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        numGuests,
        totalPrice: parseFloat(totalPrice.toString()),
        status: 'Pending',
        paymentStatus: 'Pending',
        guestRequests: specialRequests || null
      },
      include: {
        ratePlan: {
          include: {
            property: {
              include: {
                owner: true
              }
            }
          }
        },
        guest: true
      }
    })

    // Clean up OTP
    otpStore.delete(guestEmail)

    return res.json({ 
      message: 'Booking created successfully', 
      bookingId: reservation.id,
      reservation 
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return res.status(500).json({ message: 'Failed to create booking' })
  }
})

// Process payment (mock)
router.post('/payment', authenticate, async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body

    // For mock payment, we'll just simulate success/failure
    const isSuccess = paymentMethod !== 'mock-fail'

    if (isSuccess) {
      // Update reservation status
      const reservation = await prisma.reservation.update({
        where: { id: bookingId },
        data: {
          status: 'Confirmed',
          paymentStatus: 'Paid'
        },
        include: {
          ratePlan: {
            include: {
              property: {
                include: {
                  owner: true
                }
              }
            }
          },
          guest: true
        }
      })

      // Block availability dates
      const startDate = new Date(reservation.checkInDate)
      const endDate = new Date(reservation.checkOutDate)
      const dates = []
      
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Create availability blocks
      for (const date of dates) {
        await prisma.availability.upsert({
          where: {
            propertyId_date: {
              propertyId: reservation.ratePlan.propertyId,
              date: date
            }
          },
          update: {
            isAvailable: false
          },
          create: {
            propertyId: reservation.ratePlan.propertyId,
            date: date,
            isAvailable: false
          }
        })
      }

      // Send confirmation emails
      try {
        // Send guest confirmation email
        const guestEmail = generateBookingConfirmationEmail(reservation)
        await sendEmail(guestEmail)
        
        // Send owner notification email  
        const property = reservation.ratePlan.property
        if (property && property.owner && property.owner.email) {
          const ownerEmail = generateOwnerNotificationEmail(property.owner.email, reservation)
          await sendEmail(ownerEmail)
        }
        
        // Send admin notification
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@wezo.ae'
        const adminNotification = generateOwnerNotificationEmail(adminEmail, reservation)
        await sendEmail({
          ...adminNotification,
          subject: `[ADMIN] New Booking - ${reservation.ratePlan.property.name}`
        })
      } catch (emailError) {
        console.error('Failed to send booking confirmation emails:', emailError)
        // Don't fail the booking if emails fail
      }

      return res.json({ 
        message: 'Payment processed successfully', 
        reservation,
        paymentStatus: 'completed' 
      })
    } else {
      return res.status(400).json({ 
        message: 'Payment failed', 
        paymentStatus: 'failed' 
      })
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return res.status(500).json({ message: 'Payment processing failed' })
  }
})

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId

    const reservations = await prisma.reservation.findMany({
      where: { guestId: userId },
      include: {
        ratePlan: {
          include: {
            property: {
              include: {
                address: true,
                photos: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data for frontend
    const bookings = reservations.map(reservation => ({
      id: reservation.id,
      propertyId: reservation.ratePlan.propertyId,
      propertyName: reservation.ratePlan.property.name,
      propertyLocation: reservation.ratePlan.property.address?.city || 'Location',
      checkInDate: reservation.checkInDate.toISOString().split('T')[0],
      checkOutDate: reservation.checkOutDate.toISOString().split('T')[0],
      numGuests: reservation.numGuests,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      paymentStatus: reservation.paymentStatus,
      createdAt: reservation.createdAt,
      ratePlanName: reservation.ratePlan.name,
      specialRequests: reservation.guestRequests
    }))

    return res.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return res.status(500).json({ message: 'Failed to fetch bookings' })
  }
})

// Cancel booking
router.post('/:bookingId/cancel', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params
    const userId = (req as any).user.userId

    // Find reservation
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: bookingId,
        guestId: userId
      },
      include: {
        ratePlan: {
          include: {
            property: {
              include: {
                owner: true
              }
            }
          }
        },
        guest: true
      }
    })

    if (!reservation) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (reservation.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' })
    }

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: bookingId },
      data: {
        status: 'Cancelled',
        paymentStatus: 'Cancelled'
      }
    })

    // Release availability blocks
    const startDate = new Date(reservation.checkInDate)
    const endDate = new Date(reservation.checkOutDate)
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      await prisma.availability.upsert({
        where: {
          propertyId_date: {
            propertyId: reservation.ratePlan.propertyId,
            date: new Date(currentDate)
          }
        },
        update: {
          isAvailable: true
        },
        create: {
          propertyId: reservation.ratePlan.propertyId,
          date: new Date(currentDate),
          isAvailable: true
        }
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Send cancellation email
    try {
      const cancellationEmail = generateCancellationEmail({
        ...reservation,
        guest: reservation.guest
      })
      await sendEmail(cancellationEmail)
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
      // Don't fail the cancellation if email fails
    }

    return res.json({ 
      message: 'Booking cancelled successfully',
      reservation: {
        ...updatedReservation,
        checkInDate: updatedReservation.checkInDate.toISOString().split('T')[0],
        checkOutDate: updatedReservation.checkOutDate.toISOString().split('T')[0]
      }
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return res.status(500).json({ message: 'Failed to cancel booking' })
  }
})

export default router