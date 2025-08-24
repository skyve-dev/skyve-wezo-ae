import { Request, Response, NextFunction } from 'express';

// Helper interface for validation errors
interface ValidationErrors {
  [field: string]: string;
}

// Helper function to collect and return validation errors
const validateAndCollectErrors = (validations: Array<() => string | null>): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  validations.forEach(validation => {
    const result = validation();
    if (result) {
      const [field, message] = result.split(':', 2);
      errors[field] = message.trim();
    }
  });
  
  return errors;
};

// Helper function to return validation response
const returnValidationResponse = (res: Response, errors: ValidationErrors): void => {
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors });
  }
};

export const validatePropertyCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { name, address, layout, bookingType, paymentType, firstDateGuestCanCheckIn } = req.body;

  const validations = [
    () => !name ? 'name: Property name is required' : null,
    () => !address ? 'address: Address is required' : null,
    () => !layout ? 'layout: Layout information is required' : null,
    () => !bookingType ? 'bookingType: Booking type is required' : null,
    () => !paymentType ? 'paymentType: Payment type is required' : null,
    () => !firstDateGuestCanCheckIn ? 'firstDateGuestCanCheckIn: First check-in date is required' : null,
    
    // Address validations
    () => address && !address.countryOrRegion ? 'countryOrRegion: Country or region is required' : null,
    () => address && !address.city ? 'city: City is required' : null,
    () => address && !address.zipCode ? 'zipCode: Zip code is required' : null,
    
    // Layout validations
    () => layout && !layout.maximumGuest ? 'maximumGuest: Maximum guest count is required' : null,
    () => layout && !layout.bathrooms ? 'bathrooms: Number of bathrooms is required' : null,
    () => layout && typeof layout.allowChildren !== 'boolean' ? 'allowChildren: Allow children must be true or false' : null,
    () => layout && typeof layout.offerCribs !== 'boolean' ? 'offerCribs: Offer cribs must be true or false' : null,
    
    // Booking type validation
    () => {
      if (bookingType) {
        const validBookingTypes = ['BookInstantly', 'NeedToRequestBook'];
        return !validBookingTypes.includes(bookingType) ? 'bookingType: Must be either BookInstantly or NeedToRequestBook' : null;
      }
      return null;
    },
    
    // Payment type validation
    () => {
      if (paymentType) {
        const validPaymentTypes = ['Online', 'ByCreditCardAtProperty'];
        return !validPaymentTypes.includes(paymentType) ? 'paymentType: Must be either Online or ByCreditCardAtProperty' : null;
      }
      return null;
    },
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validatePropertyUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { bookingType, paymentType } = req.body;

  const validations = [
    () => {
      if (bookingType) {
        const validBookingTypes = ['BookInstantly', 'NeedToRequestBook'];
        return !validBookingTypes.includes(bookingType) ? 'bookingType: Must be either BookInstantly or NeedToRequestBook' : null;
      }
      return null;
    },
    () => {
      if (paymentType) {
        const validPaymentTypes = ['Online', 'ByCreditCardAtProperty'];
        return !validPaymentTypes.includes(paymentType) ? 'paymentType: Must be either Online or ByCreditCardAtProperty' : null;
      }
      return null;
    },
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateLayoutUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { maximumGuest, bathrooms, allowChildren, offerCribs } = req.body;

  const validations = [
    () => !maximumGuest ? 'maximumGuest: Maximum guest count is required' : null,
    () => !bathrooms ? 'bathrooms: Number of bathrooms is required' : null,
    () => typeof maximumGuest !== 'number' ? 'maximumGuest: Must be a number' : null,
    () => typeof bathrooms !== 'number' ? 'bathrooms: Must be a number' : null,
    () => typeof allowChildren !== 'boolean' ? 'allowChildren: Must be true or false' : null,
    () => typeof offerCribs !== 'boolean' ? 'offerCribs: Must be true or false' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateAmenitiesUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { amenities } = req.body;
  const errors: ValidationErrors = {};

  if (!amenities) {
    errors['amenities'] = 'Amenities list is required';
  } else if (!Array.isArray(amenities)) {
    errors['amenities'] = 'Must be an array';
  } else {
    // Check each amenity
    amenities.forEach((amenity, index) => {
      if (!amenity.name) {
        errors[`amenities[${index}].name`] = 'Amenity name is required';
      }
      if (!amenity.category) {
        errors[`amenities[${index}].category`] = 'Amenity category is required';
      }
    });
  }
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateServicesUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { serveBreakfast, parking, languages } = req.body;

  const validations = [
    () => typeof serveBreakfast !== 'boolean' ? 'serveBreakfast: Must be true or false' : null,
    () => {
      if (parking) {
        const validParkingTypes = ['YesFree', 'YesPaid', 'No'];
        return !validParkingTypes.includes(parking) ? 'parking: Must be YesFree, YesPaid, or No' : null;
      }
      return null;
    },
    () => !languages ? 'languages: Languages list is required' : null,
    () => !Array.isArray(languages) ? 'languages: Must be an array' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validateRulesUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { smokingAllowed, partiesOrEventsAllowed, petsAllowed } = req.body;

  const validations = [
    () => typeof smokingAllowed !== 'boolean' ? 'smokingAllowed: Must be true or false' : null,
    () => typeof partiesOrEventsAllowed !== 'boolean' ? 'partiesOrEventsAllowed: Must be true or false' : null,
    () => {
      if (petsAllowed) {
        const validPetPolicies = ['Yes', 'No', 'UponRequest'];
        return !validPetPolicies.includes(petsAllowed) ? 'petsAllowed: Must be Yes, No, or UponRequest' : null;
      }
      return null;
    },
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};

export const validatePricingUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { currency, ratePerNight, ratePerNightWeekend } = req.body;

  const validations = [
    () => !currency ? 'currency: Currency is required' : null,
    () => currency && currency !== 'AED' ? 'currency: Must be AED' : null,
    () => typeof ratePerNight !== 'number' ? 'ratePerNight: Must be a number' : null,
    () => ratePerNight <= 0 ? 'ratePerNight: Must be greater than 0' : null,
    () => typeof ratePerNightWeekend !== 'number' ? 'ratePerNightWeekend: Must be a number' : null,
    () => ratePerNightWeekend <= 0 ? 'ratePerNightWeekend: Must be greater than 0' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
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

  const validations = [
    () => typeof daysBeforeArrivalFreeToCancel !== 'number' ? 'daysBeforeArrivalFreeToCancel: Must be a number' : null,
    () => daysBeforeArrivalFreeToCancel < 0 ? 'daysBeforeArrivalFreeToCancel: Must be 0 or greater' : null,
    () => typeof waiveCancellationFeeAccidentalBookings !== 'boolean' ? 'waiveCancellationFeeAccidentalBookings: Must be true or false' : null,
  ];

  const errors = validateAndCollectErrors(validations);
  
  if (Object.keys(errors).length > 0) {
    returnValidationResponse(res, errors);
    return;
  }

  next();
};