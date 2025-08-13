import { Request, Response, NextFunction } from 'express';

export const validatePropertyCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { name, address, layout, bookingType, paymentType, firstDateGuestCanCheckIn } = req.body;

  if (!name || !address || !layout || !bookingType || !paymentType || !firstDateGuestCanCheckIn) {
    res.status(400).json({
      error: 'Required fields: name, address, layout, bookingType, paymentType, firstDateGuestCanCheckIn',
    });
    return;
  }

  if (!address.countryOrRegion || !address.city || !address.zipCode) {
    res.status(400).json({
      error: 'Address must include countryOrRegion, city, and zipCode',
    });
    return;
  }

  if (!layout.maximumGuest || !layout.bathrooms) {
    res.status(400).json({
      error: 'Layout must include maximumGuest and bathrooms',
    });
    return;
  }

  if (typeof layout.allowChildren !== 'boolean' || typeof layout.offerCribs !== 'boolean') {
    res.status(400).json({
      error: 'Layout must include allowChildren and offerCribs as boolean values',
    });
    return;
  }

  const validBookingTypes = ['BookInstantly', 'NeedToRequestBook'];
  if (!validBookingTypes.includes(bookingType)) {
    res.status(400).json({
      error: 'Invalid bookingType. Must be either BookInstantly or NeedToRequestBook',
    });
    return;
  }

  const validPaymentTypes = ['Online', 'ByCreditCardAtProperty'];
  if (!validPaymentTypes.includes(paymentType)) {
    res.status(400).json({
      error: 'Invalid paymentType. Must be either Online or ByCreditCardAtProperty',
    });
    return;
  }

  next();
};

export const validatePropertyUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { bookingType, paymentType } = req.body;

  if (bookingType) {
    const validBookingTypes = ['BookInstantly', 'NeedToRequestBook'];
    if (!validBookingTypes.includes(bookingType)) {
      res.status(400).json({
        error: 'Invalid bookingType. Must be either BookInstantly or NeedToRequestBook',
      });
      return;
    }
  }

  if (paymentType) {
    const validPaymentTypes = ['Online', 'ByCreditCardAtProperty'];
    if (!validPaymentTypes.includes(paymentType)) {
      res.status(400).json({
        error: 'Invalid paymentType. Must be either Online or ByCreditCardAtProperty',
      });
      return;
    }
  }

  next();
};

export const validateLayoutUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { maximumGuest, bathrooms, allowChildren, offerCribs } = req.body;

  if (!maximumGuest || !bathrooms) {
    res.status(400).json({
      error: 'Layout must include maximumGuest and bathrooms',
    });
    return;
  }

  if (typeof allowChildren !== 'boolean' || typeof offerCribs !== 'boolean') {
    res.status(400).json({
      error: 'Layout must include allowChildren and offerCribs as boolean values',
    });
    return;
  }

  next();
};

export const validateAmenitiesUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { amenities } = req.body;

  if (!amenities || !Array.isArray(amenities)) {
    res.status(400).json({
      error: 'Amenities must be an array',
    });
    return;
  }

  for (const amenity of amenities) {
    if (!amenity.name || !amenity.category) {
      res.status(400).json({
        error: 'Each amenity must have a name and category',
      });
      return;
    }
  }

  next();
};

export const validateServicesUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { serveBreakfast, parking, languages } = req.body;

  if (typeof serveBreakfast !== 'boolean') {
    res.status(400).json({
      error: 'serveBreakfast must be a boolean value',
    });
    return;
  }

  const validParkingTypes = ['YesFree', 'YesPaid', 'No'];
  if (!validParkingTypes.includes(parking)) {
    res.status(400).json({
      error: 'Invalid parking type. Must be YesFree, YesPaid, or No',
    });
    return;
  }

  if (!languages || !Array.isArray(languages)) {
    res.status(400).json({
      error: 'Languages must be an array',
    });
    return;
  }

  next();
};

export const validateRulesUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { smokingAllowed, partiesOrEventsAllowed, petsAllowed } = req.body;

  if (typeof smokingAllowed !== 'boolean') {
    res.status(400).json({
      error: 'smokingAllowed must be a boolean value',
    });
    return;
  }

  if (typeof partiesOrEventsAllowed !== 'boolean') {
    res.status(400).json({
      error: 'partiesOrEventsAllowed must be a boolean value',
    });
    return;
  }

  const validPetPolicies = ['Yes', 'No', 'UponRequest'];
  if (!validPetPolicies.includes(petsAllowed)) {
    res.status(400).json({
      error: 'Invalid petsAllowed value. Must be Yes, No, or UponRequest',
    });
    return;
  }

  next();
};

export const validatePricingUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { currency, ratePerNight, ratePerNightWeekend } = req.body;

  if (!currency || currency !== 'AED') {
    res.status(400).json({
      error: 'Currency must be AED',
    });
    return;
  }

  if (typeof ratePerNight !== 'number' || ratePerNight <= 0) {
    res.status(400).json({
      error: 'ratePerNight must be a positive number',
    });
    return;
  }

  if (typeof ratePerNightWeekend !== 'number' || ratePerNightWeekend <= 0) {
    res.status(400).json({
      error: 'ratePerNightWeekend must be a positive number',
    });
    return;
  }

  next();
};

export const validateCancellationUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { daysBeforeArrivalFreeToCancel, waiveCancellationFeeAccidentalBookings } = req.body;

  if (
    typeof daysBeforeArrivalFreeToCancel !== 'number' ||
    daysBeforeArrivalFreeToCancel < 0
  ) {
    res.status(400).json({
      error: 'daysBeforeArrivalFreeToCancel must be a non-negative number',
    });
    return;
  }

  if (typeof waiveCancellationFeeAccidentalBookings !== 'boolean') {
    res.status(400).json({
      error: 'waiveCancellationFeeAccidentalBookings must be a boolean value',
    });
    return;
  }

  next();
};