# Accommodation Property Data Model

This document outlines the data structure for a property listing on a booking platform, broken down by key enums and interfaces.

### Enums (Predefined Options)

These define a fixed set of choices for specific fields, ensuring data consistency.

* **`BedType`**: `TwinBed`, `FullBed`, `QueenBed`, `KingBed`, `BunkBed`, `SofaBed`, `FutonBed`
* **`RoomSpaceType`**: `Bedroom`, `LivingRoom`, `Kitchen`, `DiningRoom`, `Other`
* **`ParkingType`**: `YesFree`, `YesPaid`, `No`
* **`PetPolicy`**: `Yes`, `No`, `UponRequest`
* **`BookingType`**: `BookInstantly`, `NeedToRequestBook`
* **`PaymentType`**: `Online`, `ByCreditCardAtProperty`
* **`Currency`**: `AED`

### Interfaces (Data Structures)

These define the shape of objects within the main `Property` model.

* **`LatLong`**: An object containing `latitude` and `longitude` (both numbers).
* **`Address`**: Defines the property's location with fields like `countryOrRegion`, `city`, `zipCode`, and `latLong`.
* **`Bed`**: An object detailing the `typeOfBed` and `numberOfBed` in a room.
* **`Room`**: Describes a single room with its `spaceName` and a list of `beds`.
* **`CheckInOutTimes`**: Specifies the `from` and `until` times for check-in and check-out.
* **`Photo`**: Defines a single photo with a `url`, `altText`, and an optional `description`.
* **`Amenity`**: Defines a single amenity with its `name` and `category`.
* **`Promotion`**: An object for promotions with a `type`, `value`, and `description`.
* **`PricePerGroupSize`**: Specifies a `groupSize` and its corresponding `pricing`.

### `Property` (Main Data Model)

This is the central interface that combines all the data fields for a complete property listing.

| **Section** | **Field Name** | **Type** | **Description**                                 |
| :--- | :--- | :--- |:------------------------------------------------|
| **Details** | `propertyId` | `string` | Unique identifier for the property.             |
|  | `name` | `string` | The name of the property.                       |
|  | `address` | `Address` | The location of the property.                   |
| **Layout** | `rooms` | `Room[]` | A list of all rooms in the property.            |
|  | `maximumGuest` | `number` | The maximum number of guests allowed.           |
|  | `bathrooms` | `number` | The number of bathrooms.                        |
|  | `allowChildren` | `boolean` | Whether children are allowed.                   |
|  | `offerCribs` | `boolean` | Whether cribs are available.                    |
|  | `propertySizeSqMtr` | `number?` | Optional size of the property in square meters. |
| **Amenities** | `amenities` | `Amenity[]` | A list of all property features.                |
| **Services** | `serveBreakfast` | `boolean` | Whether breakfast is served.                    |
|  | `parking` | `ParkingType` | The type of parking available.                  |
|  | `languages` | `string[]` | Languages spoken by staff.                      |
| **Rules** | `smokingAllowed` | `boolean` | Whether smoking is permitted.                   |
|  | `partiesOrEventsAllowed` | `boolean` | Whether parties or events are permitted.        |
|  | `petsAllowed` | `PetPolicy` | The pet policy for the property.                |
|  | `checkIn` | `CheckInOutTimes` | Check-in time details.                          |
|  | `checkOut` | `CheckInOutTimes` | Check-out time details.                         |
| **Profile** | `aboutTheProperty` | `string` | A description of the property.                  |
|  | `aboutTheNeighborhood` | `string` | A description of the surrounding area.          |
| **Photos** | `photos` | `Photo[]` | A collection of images of the property.         |
| **Booking** | `bookingType` | `BookingType` | The method for making a reservation.            |
|  | `paymentType` | `PaymentType` | The payment method.                             |
| **Pricing** | `pricing.currency` | `Currency` | The currency for all pricing.                   |
|  | `pricing.ratePerNight` | `number` | The nightly rate.                               |
|  | `pricing.promotion` | `Promotion?` | Optional promotion details.                     |
|  | `pricing.pricePerGroupSize` | `PricePerGroupSize[]?` | Optional pricing based on group size.           |
|  | `pricing.discountPercentageNonRef..` | `number?` | Discount for non-refundable rate plan.          |
|  | `pricing.discountPercentageWeekly..` | `number?` | Discount for weekly rate plan.                  |
| **Cancellation** | `cancellation.daysBeforeArrivalFree..` | `number` | Days before arrival for free cancellation.      |
|  | `cancellation.waiveCancellationFee..` | `boolean` | Whether accidental booking fees are waived.     |
| **Availability** | `firstDateGuestCanCheckIn` | `string` | The first available check-in date (ISO 8601).   |
