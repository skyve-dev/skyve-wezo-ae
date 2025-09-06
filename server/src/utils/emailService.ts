// Email service utility for sending booking notifications
// This is a placeholder for future SendGrid integration

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  cc?: string[]
  bcc?: string[]
}

// Mock email service for development
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    console.log('📧 Mock Email Service - Email Details:')
    console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('HTML Content:', options.html)
    
    if (options.cc) {
      console.log(`CC: ${options.cc.join(', ')}`)
    }
    
    if (options.bcc) {
      console.log(`BCC: ${options.bcc.join(', ')}`)
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('✅ Email sent successfully (mock)')
    return true
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return false
  }
}

// Email template generators
export const generateBookingConfirmationEmail = (reservation: any) => {
  return {
    to: reservation.guest.email,
    subject: `Booking Confirmed - ${reservation.ratePlan.property.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #D52122; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .amount { font-size: 24px; color: #059669; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Thank you for choosing Wezo.ae</p>
          </div>
          <div class="content">
            <p>Dear ${reservation.guest.firstName || 'Guest'},</p>
            <p>Your booking has been confirmed! Here are your booking details:</p>
            
            <div class="booking-details">
              <h3 style="margin-top: 0; color: #D52122;">${reservation.ratePlan.property.name}</h3>
              
              <div class="detail-row">
                <strong>Booking ID:</strong>
                <span>${reservation.id}</span>
              </div>
              
              <div class="detail-row">
                <strong>Check-in:</strong>
                <span>${new Date(reservation.checkInDate).toLocaleDateString()}</span>
              </div>
              
              <div class="detail-row">
                <strong>Check-out:</strong>
                <span>${new Date(reservation.checkOutDate).toLocaleDateString()}</span>
              </div>
              
              <div class="detail-row">
                <strong>Guests:</strong>
                <span>${reservation.numGuests} guest${reservation.numGuests > 1 ? 's' : ''}</span>
              </div>
              
              <div class="detail-row">
                <strong>Rate Plan:</strong>
                <span>${reservation.ratePlan.name}</span>
              </div>
              
              ${reservation.guestRequests ? `
              <div class="detail-row">
                <strong>Special Requests:</strong>
                <span>${reservation.guestRequests}</span>
              </div>
              ` : ''}
              
              <div class="detail-row" style="border-bottom: 2px solid #059669; padding-top: 20px;">
                <strong>Total Amount:</strong>
                <span class="amount">AED ${Math.round(parseFloat(reservation.totalPrice))}</span>
              </div>
            </div>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Save this confirmation email for your records</li>
              <li>Contact the property owner if you have any questions</li>
              <li>Arrive at your check-in time and enjoy your stay!</li>
            </ul>
            
            <p>If you need to cancel or modify your booking, please contact us as soon as possible.</p>
            
            <p>We hope you have a wonderful stay!</p>
            <p>Best regards,<br>The Wezo.ae Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 Wezo.ae. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const generateOwnerNotificationEmail = (ownerEmail: string, reservation: any) => {
  return {
    to: ownerEmail,
    subject: `New Booking - ${reservation.ratePlan.property.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .amount { font-size: 20px; color: #059669; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Booking Received</h1>
            <p>Your property has a new booking!</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have received a new booking for your property. Here are the details:</p>
            
            <div class="booking-details">
              <h3 style="margin-top: 0; color: #059669;">${reservation.ratePlan.property.name}</h3>
              
              <div class="detail-row">
                <strong>Guest Name:</strong>
                <span>${reservation.guest.firstName} ${reservation.guest.lastName}</span>
              </div>
              
              <div class="detail-row">
                <strong>Guest Email:</strong>
                <span>${reservation.guest.email}</span>
              </div>
              
              <div class="detail-row">
                <strong>Check-in:</strong>
                <span>${new Date(reservation.checkInDate).toLocaleDateString()}</span>
              </div>
              
              <div class="detail-row">
                <strong>Check-out:</strong>
                <span>${new Date(reservation.checkOutDate).toLocaleDateString()}</span>
              </div>
              
              <div class="detail-row">
                <strong>Guests:</strong>
                <span>${reservation.numGuests}</span>
              </div>
              
              ${reservation.guestRequests ? `
              <div class="detail-row">
                <strong>Special Requests:</strong>
                <span>${reservation.guestRequests}</span>
              </div>
              ` : ''}
              
              <div class="detail-row" style="border-bottom: 2px solid #059669;">
                <strong>Booking Value:</strong>
                <span class="amount">AED ${Math.round(parseFloat(reservation.totalPrice))}</span>
              </div>
            </div>
            
            <p>Please prepare for your guest's arrival and ensure the property is ready for check-in.</p>
            
            <p>Best regards,<br>The Wezo.ae Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const generateCancellationEmail = (reservation: any) => {
  return {
    to: reservation.guest.email,
    subject: `Booking Cancelled - ${reservation.ratePlan.property.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Cancellation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Booking Cancelled</h1>
            <p>Your booking has been cancelled</p>
          </div>
          <div class="content">
            <p>Dear ${reservation.guest.firstName || 'Guest'},</p>
            <p>Your booking has been successfully cancelled. Here are the details:</p>
            
            <div class="booking-details">
              <h3 style="margin-top: 0;">${reservation.ratePlan.property.name}</h3>
              <p><strong>Booking ID:</strong> ${reservation.id}</p>
              <p><strong>Original Check-in:</strong> ${new Date(reservation.checkInDate).toLocaleDateString()}</p>
              <p><strong>Original Check-out:</strong> ${new Date(reservation.checkOutDate).toLocaleDateString()}</p>
              <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>If you have any questions about your cancellation or refund, please contact our support team.</p>
            
            <p>We hope to serve you again in the future!</p>
            <p>Best regards,<br>The Wezo.ae Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}