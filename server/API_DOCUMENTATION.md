# Wezo.ae REST API Documentation

## Overview
This document provides comprehensive documentation for the Wezo.ae platform's RESTful API, designed to serve the core functionalities for homeowners and property managers.

## Base URL
```
https://api.wezo.ae/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Property & Listing Management

### 1.1 Get Property Details
**GET** `/properties/{propertyId}`

**Response Example:**
```json
{
  "property": {
    "propertyId": "uuid",
    "name": "Luxury Dubai Villa",
    "address": {
      "city": "Dubai",
      "countryOrRegion": "UAE",
      "apartmentOrFloorNumber": "Villa 15",
      "zipCode": 12345,
      "latLong": {
        "latitude": 25.0657,
        "longitude": 55.1713
      }
    },
    "layout": {
      "maximumGuest": 6,
      "bathrooms": 3,
      "propertySizeSqMtr": 250,
      "rooms": [
        {
          "spaceName": "Master Bedroom",
          "beds": [
            {
              "typeOfBed": "KingBed",
              "numberOfBed": 1
            }
          ]
        }
      ]
    },
    "amenities": [
      {
        "name": "WiFi",
        "category": "Technology"
      },
      {
        "name": "Swimming Pool",
        "category": "Outdoor"
      }
    ],
    "photos": [
      {
        "id": "photo_uuid",
        "url": "/uploads/photos/villa-image.jpg",
        "altText": "Villa exterior view",
        "description": "Beautiful front view of the villa"
      }
    ],
    "pricing": {
      "currency": "AED",
      "ratePerNight": 1200,
      "ratePerNightWeekend": 1500
    }
  }
}
```

### 1.2 Update Property Details
**PUT** `/properties/{propertyId}`

**Request Example:**
```json
{
  "name": "Updated Villa Name",
  "aboutTheProperty": "Newly renovated luxury villa with modern amenities",
  "aboutTheNeighborhood": "Prime location in Downtown Dubai"
}
```

### 1.3 Upload Property Photos
**POST** `/properties/{propertyId}/photos`

**Content-Type:** `multipart/form-data`

**Response Example:**
```json
{
  "message": "Photos uploaded successfully",
  "photos": [
    {
      "id": "photo_uuid",
      "url": "/uploads/photos/property-12345-67890.jpg",
      "altText": null,
      "description": null
    }
  ]
}
```

### 1.4 Delete Property Photo
**DELETE** `/properties/{propertyId}/photos/{photoId}`

**Response Example:**
```json
{
  "message": "Photo deleted successfully"
}
```

### 1.5 Update Property Policies
**PUT** `/properties/{propertyId}/rules`

**Request Example:**
```json
{
  "smokingAllowed": false,
  "partiesOrEventsAllowed": true,
  "petsAllowed": "UponRequest",
  "checkInCheckout": {
    "checkInFrom": "15:00",
    "checkInUntil": "22:00",
    "checkOutFrom": "08:00",
    "checkOutUntil": "11:00"
  }
}
```

---

## 2. Availability & Rates Management

### 2.1 Get Property Availability
**GET** `/properties/{propertyId}/availability?startDate=2024-06-01&endDate=2024-06-30`

**Response Example:**
```json
{
  "propertyId": "uuid",
  "startDate": "2024-06-01",
  "endDate": "2024-06-30",
  "availability": [
    {
      "id": "avail_uuid",
      "date": "2024-06-01T00:00:00.000Z",
      "isAvailable": true
    },
    {
      "id": "avail_uuid",
      "date": "2024-06-02T00:00:00.000Z",
      "isAvailable": false
    }
  ]
}
```

### 2.2 Update Single Day Availability
**PUT** `/properties/{propertyId}/availability/{date}`

**Request Example:**
```json
{
  "isAvailable": false,
  "reason": "Property maintenance scheduled"
}
```

### 2.3 Bulk Update Availability
**PUT** `/properties/{propertyId}/availability/bulk`

**Request Example:**
```json
{
  "updates": [
    {
      "date": "2024-06-01",
      "isAvailable": true
    },
    {
      "date": "2024-06-02",
      "isAvailable": false,
      "reason": "Already booked"
    },
    {
      "date": "2024-06-03",
      "isAvailable": true
    }
  ]
}
```

### 2.4 Create Rate Plan
**POST** `/properties/{propertyId}/rate-plans`

**Request Example:**
```json
{
  "name": "Flexible Rate Plan",
  "type": "FullyFlexible",
  "description": "Fully flexible booking with free cancellation",
  "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
  "includesBreakfast": true,
  "restrictions": [
    {
      "type": "MinLengthOfStay",
      "value": 2,
      "startDate": "2024-06-01",
      "endDate": "2024-08-31"
    }
  ],
  "prices": [
    {
      "date": "2024-06-01",
      "basePrice": 1200,
      "currency": "AED"
    }
  ]
}
```

### 2.5 Get All Rate Plans
**GET** `/properties/{propertyId}/rate-plans`

**Response Example:**
```json
{
  "propertyId": "uuid",
  "ratePlans": [
    {
      "id": "rateplan_uuid",
      "name": "Flexible Rate Plan",
      "type": "FullyFlexible",
      "description": "Fully flexible booking with free cancellation",
      "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
      "includesBreakfast": true,
      "restrictions": [
        {
          "id": "restriction_uuid",
          "type": "MinLengthOfStay",
          "value": 2,
          "startDate": "2024-06-01T00:00:00.000Z",
          "endDate": "2024-08-31T00:00:00.000Z"
        }
      ],
      "prices": [
        {
          "id": "price_uuid",
          "date": "2024-06-01T00:00:00.000Z",
          "basePrice": 1200,
          "currency": "AED"
        }
      ],
      "_count": {
        "reservations": 5
      }
    }
  ]
}
```

### 2.6 Update Rate Plan Prices
**PUT** `/properties/{propertyId}/rate-plans/{ratePlanId}/prices`

**Request Example:**
```json
{
  "prices": [
    {
      "date": "2024-06-15",
      "basePrice": 1500,
      "currency": "AED"
    },
    {
      "date": "2024-06-16",
      "basePrice": 1800,
      "currency": "AED"
    }
  ]
}
```

### 2.7 Update Rate Plan Restrictions
**PUT** `/properties/{propertyId}/rate-plans/{ratePlanId}/restrictions`

**Request Example:**
```json
{
  "restrictions": [
    {
      "type": "MinLengthOfStay",
      "value": 3,
      "startDate": "2024-07-01",
      "endDate": "2024-08-31"
    },
    {
      "type": "AdvancedBookingDays",
      "value": 14
    }
  ]
}
```

### 2.8 Delete Rate Plan
**DELETE** `/properties/{propertyId}/rate-plans/{ratePlanId}`

**Response Example:**
```json
{
  "message": "Rate plan deleted successfully"
}
```

---

## 3. Reservations & Guest Management

### 3.1 Get All Reservations
**GET** `/reservations?status=Confirmed&startDate=2024-06-01&endDate=2024-06-30&page=1&limit=20`

**Response Example:**
```json
{
  "reservations": [
    {
      "id": "reservation_uuid",
      "checkInDate": "2024-06-01T00:00:00.000Z",
      "checkOutDate": "2024-06-05T00:00:00.000Z",
      "guestCount": 4,
      "totalPrice": 4800,
      "status": "Confirmed",
      "property": {
        "propertyId": "uuid",
        "name": "Luxury Dubai Villa",
        "address": {
          "city": "Dubai",
          "countryOrRegion": "UAE"
        }
      },
      "ratePlan": {
        "id": "rateplan_uuid",
        "name": "Flexible Rate Plan",
        "type": "FullyFlexible"
      },
      "guest": {
        "id": "guest_uuid",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "payment": {
        "id": "payment_uuid",
        "amount": 4800,
        "currency": "AED",
        "method": "CreditCard",
        "status": "Completed",
        "commissionAmount": 480
      },
      "_count": {
        "messages": 3
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 87,
    "limit": 20
  }
}
```

### 3.2 Get Specific Reservation
**GET** `/reservations/{reservationId}`

**Response Example:**
```json
{
  "id": "reservation_uuid",
  "checkInDate": "2024-06-01T00:00:00.000Z",
  "checkOutDate": "2024-06-05T00:00:00.000Z",
  "guestCount": 4,
  "totalPrice": 4800,
  "status": "Confirmed",
  "property": {
    "propertyId": "uuid",
    "name": "Luxury Dubai Villa",
    "address": {
      "city": "Dubai",
      "countryOrRegion": "UAE"
    }
  },
  "ratePlan": {
    "id": "rateplan_uuid",
    "name": "Flexible Rate Plan",
    "type": "FullyFlexible",
    "restrictions": [
      {
        "type": "MinLengthOfStay",
        "value": 2
      }
    ]
  },
  "guest": {
    "id": "guest_uuid",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "payment": {
    "amount": 4800,
    "currency": "AED",
    "method": "CreditCard",
    "status": "Completed"
  },
  "messages": [
    {
      "id": "message_uuid",
      "content": "Looking forward to staying at your property!",
      "sentAt": "2024-05-15T10:30:00.000Z",
      "senderType": "Tenant",
      "isRead": true
    }
  ],
  "review": {
    "id": "review_uuid",
    "rating": 9,
    "comment": "Amazing villa with excellent amenities!",
    "reviewedAt": "2024-06-06T14:20:00.000Z"
  }
}
```

### 3.3 Update Reservation
**PUT** `/reservations/{reservationId}`

**Request Example:**
```json
{
  "checkInDate": "2024-06-02",
  "checkOutDate": "2024-06-06",
  "guestCount": 5,
  "totalPrice": 5200,
  "status": "Confirmed"
}
```

### 3.4 Report Guest No-Show
**POST** `/reservations/{reservationId}/no-show`

**Request Example:**
```json
{
  "reason": "Guest failed to arrive at the property and did not respond to multiple contact attempts via phone and email.",
  "description": "Expected check-in was at 15:00 on June 1st. Called guest at 16:00, 18:00, and 20:00 with no response. Sent email confirmation reminder."
}
```

**Response Example:**
```json
{
  "message": "Guest no-show reported successfully",
  "commissionWaived": true,
  "reservation": {
    "id": "reservation_uuid",
    "status": "NoShow"
  }
}
```

### 3.5 Send Message to Guest
**POST** `/reservations/{reservationId}/messages`

**Request Example:**
```json
{
  "message": "Hello! Thank you for choosing our villa. Please let me know if you need any assistance during your stay. Check-in instructions have been sent to your email."
}
```

**Response Example:**
```json
{
  "message": "Message sent successfully",
  "messageData": {
    "id": "message_uuid",
    "content": "Hello! Thank you for choosing our villa...",
    "sentAt": "2024-05-20T09:15:00.000Z",
    "senderType": "HomeOwner",
    "recipientType": "Tenant",
    "isRead": false
  }
}
```

### 3.6 Get Reservation Messages
**GET** `/reservations/{reservationId}/messages`

**Response Example:**
```json
{
  "reservationId": "reservation_uuid",
  "messages": [
    {
      "id": "message_uuid",
      "content": "Looking forward to my stay!",
      "sentAt": "2024-05-15T10:30:00.000Z",
      "senderType": "Tenant",
      "recipientType": "HomeOwner",
      "isRead": true
    },
    {
      "id": "message_uuid",
      "content": "Welcome! Check-in is at 3 PM.",
      "sentAt": "2024-05-16T08:45:00.000Z",
      "senderType": "HomeOwner",
      "recipientType": "Tenant",
      "isRead": true
    }
  ]
}
```

### 3.7 Respond to Guest Review
**POST** `/reviews/{reviewId}/response`

**Request Example:**
```json
{
  "response": "Thank you so much for your wonderful review! We're delighted that you enjoyed your stay at our villa. Your feedback about the amenities is greatly appreciated, and we look forward to hosting you again soon."
}
```

**Response Example:**
```json
{
  "message": "Review response submitted successfully",
  "review": {
    "id": "review_uuid",
    "rating": 9,
    "comment": "Amazing villa with excellent amenities!",
    "response": "Thank you so much for your wonderful review!...",
    "reviewedAt": "2024-06-06T14:20:00.000Z",
    "property": {
      "propertyId": "uuid",
      "name": "Luxury Dubai Villa"
    },
    "guest": {
      "id": "guest_uuid",
      "username": "john_doe"
    }
  }
}
```

---

## 4. Financial & Security Operations

### 4.1 Get Earnings Summary
**GET** `/financial/earnings?startDate=2024-01-01&endDate=2024-12-31&propertyId=uuid`

**Response Example:**
```json
{
  "summary": {
    "totalEarnings": 125000,
    "totalCommission": 12500,
    "netEarnings": 112500,
    "reservationCount": 45
  },
  "byProperty": [
    {
      "propertyId": "uuid",
      "propertyName": "Luxury Dubai Villa",
      "totalEarnings": 85000,
      "totalCommission": 8500,
      "reservationCount": 30
    },
    {
      "propertyId": "uuid2",
      "propertyName": "Beachfront Apartment",
      "totalEarnings": 40000,
      "totalCommission": 4000,
      "reservationCount": 15
    }
  ],
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

### 4.2 Get Financial Statements
**GET** `/financial/statements?year=2024&month=6`

**Response Example:**
```json
{
  "period": {
    "year": 2024,
    "month": 6,
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-06-30T23:59:59.000Z"
  },
  "revenue": {
    "gross": 15600,
    "commission": 1560,
    "net": 14040
  },
  "transactions": [
    {
      "date": "2024-06-01T00:00:00.000Z",
      "reservationId": "reservation_uuid",
      "propertyName": "Luxury Dubai Villa",
      "amount": 4800,
      "commission": 480,
      "netAmount": 4320,
      "status": "Completed"
    },
    {
      "date": "2024-06-05T00:00:00.000Z",
      "reservationId": "reservation_uuid2",
      "propertyName": "Beachfront Apartment",
      "amount": 3200,
      "commission": 320,
      "netAmount": 2880,
      "status": "Completed"
    }
  ]
}
```

### 4.3 Get All Invoices
**GET** `/financial/invoices?status=Pending&page=1&limit=20`

**Response Example:**
```json
{
  "invoices": [
    {
      "id": "invoice_uuid",
      "invoiceNumber": "INV-2024-001",
      "amount": 1560,
      "currency": "AED",
      "issueDate": "2024-07-01T00:00:00.000Z",
      "dueDate": "2024-07-31T00:00:00.000Z",
      "paymentStatus": "Pending",
      "description": "Commission charges for June 2024"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 45,
    "limit": 20
  }
}
```

### 4.4 Get Specific Invoice
**GET** `/financial/invoices/{invoiceId}`

**Response Example:**
```json
{
  "id": "invoice_uuid",
  "invoiceNumber": "INV-2024-001",
  "amount": 1560,
  "currency": "AED",
  "issueDate": "2024-07-01T00:00:00.000Z",
  "dueDate": "2024-07-31T00:00:00.000Z",
  "paymentStatus": "Pending",
  "description": "Commission charges for June 2024",
  "pdfUrl": "/invoices/INV-2024-001.pdf"
}
```

### 4.5 Get Bank Details
**GET** `/financial/bank-details`

**Response Example:**
```json
{
  "id": "bank_details_uuid",
  "bankName": "Emirates NBD",
  "accountNumber": "****5678",
  "accountHolderName": "John Doe",
  "sortCode": "EBILAEAD",
  "currency": "AED",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-03-20T14:30:00.000Z"
}
```

### 4.6 Update Bank Details
**PUT** `/financial/bank-details`

**Request Example:**
```json
{
  "bankName": "Emirates NBD",
  "accountNumber": "1234567890123456",
  "accountHolderName": "John Doe",
  "sortCode": "EBILAEAD",
  "currency": "AED"
}
```

**Response Example:**
```json
{
  "message": "Bank details updated successfully",
  "bankDetails": {
    "id": "bank_details_uuid",
    "bankName": "Emirates NBD",
    "accountNumber": "****3456",
    "accountHolderName": "John Doe",
    "sortCode": "EBILAEAD",
    "currency": "AED"
  }
}
```

### 4.7 Report Security Breach
**POST** `/security/report`

**Request Example:**
```json
{
  "type": "DataBreach",
  "description": "Suspicious login attempts detected from multiple IP addresses attempting to access guest payment information. Unusual access patterns observed during late night hours.",
  "affectedData": {
    "dataTypes": ["guest_payment_info", "reservation_details"],
    "estimatedRecords": 15,
    "timeframe": "2024-06-15 22:00 - 2024-06-16 02:30",
    "ipAddresses": ["192.168.1.100", "10.0.0.50"],
    "actions_taken": "Immediately disabled affected user accounts and enabled additional security monitoring"
  }
}
```

**Response Example:**
```json
{
  "message": "Security breach reported successfully",
  "reportId": "security_report_uuid",
  "status": "OPEN"
}
```

---

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed: Rate plan name is required"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Property not found or you do not have permission to view it"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

API requests are rate-limited per user:
- **Guest users**: 100 requests per hour
- **HomeOwner users**: 1000 requests per hour
- **Admin users**: 5000 requests per hour

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1625097600
```

---

## Webhook Events

The API supports webhooks for real-time notifications:

### Available Events
- `reservation.created`
- `reservation.updated` 
- `reservation.cancelled`
- `payment.completed`
- `review.created`
- `message.received`

### Webhook Payload Example
```json
{
  "event": "reservation.created",
  "timestamp": "2024-06-01T10:00:00.000Z",
  "data": {
    "reservationId": "uuid",
    "propertyId": "uuid",
    "guestId": "uuid",
    "checkInDate": "2024-06-15",
    "totalPrice": 4800
  }
}
```