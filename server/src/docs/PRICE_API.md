# Price API Documentation

## Overview

The Price API provides comprehensive endpoints for managing pricing data for rate plans. It supports full CRUD operations, bulk operations, and advanced features like price copying and gap analysis.

## Authentication

All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL

All endpoints are prefixed with `/api`

## Endpoints

### 1. Get Prices for Rate Plan

**GET** `/rate-plans/{ratePlanId}/prices`

Retrieves prices for a specific rate plan with optional date filtering.

**Query Parameters:**
- `startDate` (optional): Filter prices from this date (YYYY-MM-DD)
- `endDate` (optional): Filter prices until this date (YYYY-MM-DD)
- `limit` (optional): Maximum number of prices to return (1-365, default: 365)
- `offset` (optional): Number of prices to skip (default: 0)

**Response Example:**
```json
{
  "message": "Prices retrieved successfully",
  "prices": [
    {
      "id": "price-uuid",
      "date": "2024-12-15T00:00:00.000Z",
      "amount": 250.00,
      "ratePlan": {
        "id": "rateplan-uuid",
        "name": "Standard Rate",
        "adjustmentType": "FixedPrice",
        "adjustmentValue": 250,
        "property": {
          "propertyId": "property-123",
          "name": "Villa Dubai Marina"
        }
      },
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "filters": {
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z",
    "limit": 365,
    "offset": 0
  }
}
```

### 2. Create/Update Single Price

**POST** `/rate-plans/{ratePlanId}/prices`

Creates a new price or updates existing price for a specific date (upsert operation).

**Request Body:**
```json
{
  "date": "2024-12-15",
  "amount": 250.50
}
```

**Response Example:**
```json
{
  "message": "Price created successfully",
  "price": {
    "id": "price-uuid",
    "date": "2024-12-15T00:00:00.000Z",
    "amount": 250.50,
    "ratePlan": {
      "id": "rateplan-uuid",
      "name": "Standard Rate"
    },
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

### 3. Bulk Create/Update Prices

**POST** `/rate-plans/{ratePlanId}/prices/bulk`

Creates or updates multiple prices in a single operation.

**Request Body:**
```json
{
  "updates": [
    {
      "date": "2024-12-15",
      "amount": 250.00
    },
    {
      "date": "2024-12-16", 
      "amount": 275.00
    },
    {
      "date": "2024-12-17",
      "amount": 300.00
    }
  ]
}
```

**Response Example:**
```json
{
  "message": "All prices updated successfully",
  "summary": {
    "total": 3,
    "successful": 3,
    "skipped": 0,
    "failed": 0
  },
  "prices": [
    {
      "id": "price-uuid-1",
      "date": "2024-12-15T00:00:00.000Z",
      "amount": 250.00
    }
  ],
  "errors": []
}
```

### 4. Update Specific Price

**PUT** `/prices/{priceId}`

Updates an existing price by its ID.

**Request Body:**
```json
{
  "amount": 199.99
}
```

**Response Example:**
```json
{
  "message": "Price updated successfully",
  "price": {
    "id": "price-uuid",
    "date": "2024-12-15T00:00:00.000Z",
    "amount": 199.99,
    "ratePlan": {
      "id": "rateplan-uuid",
      "name": "Standard Rate"
    },
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T11:30:00.000Z"
  }
}
```

### 5. Delete Specific Price

**DELETE** `/prices/{priceId}`

Deletes a specific price by its ID.

**Response Example:**
```json
{
  "message": "Price deleted successfully"
}
```

### 6. Bulk Delete Prices

**DELETE** `/rate-plans/{ratePlanId}/prices/bulk`

Deletes all prices within a date range.

**Request Body:**
```json
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-31"
}
```

**Response Example:**
```json
{
  "message": "Successfully deleted 30 prices",
  "deletedCount": 30,
  "dateRange": {
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z"
  }
}
```

### 7. Get Price Statistics

**GET** `/rate-plans/{ratePlanId}/prices/stats`

Returns statistical information about prices for a rate plan.

**Query Parameters:**
- `startDate` (optional): Filter statistics from this date
- `endDate` (optional): Filter statistics until this date

**Response Example:**
```json
{
  "message": "Price statistics retrieved successfully",
  "statistics": {
    "totalPrices": 365,
    "averagePrice": 275.50,
    "minPrice": 200.00,
    "maxPrice": 500.00,
    "priceRange": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-12-31T00:00:00.000Z"
    }
  },
  "filters": {
    "startDate": null,
    "endDate": null
  }
}
```

### 8. Get Price Gaps

**GET** `/rate-plans/{ratePlanId}/prices/gaps`

Identifies dates within a range that don't have specific pricing set.

**Query Parameters (Required):**
- `startDate`: Start date for gap analysis (YYYY-MM-DD)
- `endDate`: End date for gap analysis (YYYY-MM-DD)

**Response Example:**
```json
{
  "message": "Found 5 dates without specific pricing",
  "gaps": [
    "2024-12-10T00:00:00.000Z",
    "2024-12-11T00:00:00.000Z",
    "2024-12-12T00:00:00.000Z",
    "2024-12-20T00:00:00.000Z",
    "2024-12-25T00:00:00.000Z"
  ],
  "gapCount": 5,
  "dateRange": {
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z"
  }
}
```

### 9. Copy Prices

**POST** `/rate-plans/{ratePlanId}/prices/copy`

Copies prices from one date range to another (useful for seasonal patterns).

**Request Body:**
```json
{
  "sourceStartDate": "2024-12-01",
  "sourceEndDate": "2024-12-07", 
  "targetStartDate": "2024-12-15"
}
```

**Response Example:**
```json
{
  "message": "All prices copied successfully",
  "copiedCount": 7,
  "errors": [],
  "sourceRange": {
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-07T00:00:00.000Z"
  },
  "targetStartDate": "2024-12-15T00:00:00.000Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Price amount must be greater than 0"
}
```

### 400 Bad Request (Validation Errors)
```json
{
  "errors": {
    "date": "Invalid date format. Use YYYY-MM-DD format",
    "amount": "Amount must be a valid number"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Rate plan not found or you do not have permission to access it"
}
```

### 207 Multi-Status (Partial Success)
```json
{
  "message": "Bulk price update completed with some errors",
  "summary": {
    "total": 5,
    "successful": 3,
    "skipped": 0,
    "failed": 2
  },
  "prices": [...],
  "errors": [
    {
      "date": "2024-12-01T00:00:00.000Z",
      "error": "Cannot set prices for past dates"
    }
  ]
}
```

## Business Rules

### Date Validation
- Prices cannot be set for past dates
- Date format must be YYYY-MM-DD
- Date ranges cannot exceed 365 days for bulk operations

### Amount Validation
- Amount must be greater than 0
- Amount cannot exceed AED 99,999.99
- Amount must be a valid decimal number

### Authorization
- Users can only access prices for their own properties
- All endpoints require JWT authentication
- Rate plan ownership is verified through property ownership

### Performance Limits
- Maximum 365 prices per bulk operation
- Maximum 365 days for gap analysis
- Maximum 365 days for bulk deletion
- Default pagination limit of 365 items

### Upsert Behavior
- Creating a price for an existing date will update the existing price
- No duplicate prices per rate plan per date
- Timestamps are updated on each modification

## Use Cases

### 1. Setting Seasonal Pricing
Use the bulk create endpoint to set different prices for peak/off-peak seasons.

### 2. Price Calendar Management
Use the get prices endpoint with date filtering to build pricing calendars.

### 3. Gap Analysis
Use the price gaps endpoint to identify dates that need pricing before going live.

### 4. Pattern Replication
Use the copy prices endpoint to replicate weekly or monthly pricing patterns.

### 5. Performance Analytics
Use the statistics endpoint to analyze pricing trends and performance.

### 6. Mass Price Updates
Use bulk operations for efficiency when updating many dates at once.