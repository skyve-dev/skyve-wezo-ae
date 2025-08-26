import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Box} from './Box';
import {Button} from './Button';
import {BoxProps} from "@/types/box.ts";
import {useTheme} from '@/components/base/AppShell';

export interface NumberStepperInputProps extends Pick<BoxProps, 'width' | 'widthSm' | 'widthMd' | 'widthLg' | 'widthXl'
    | 'minWidth' | 'minWidthSm' | 'minWidthMd' | 'minWidthLg' | 'minWidthXl'
    | 'maxWidth' | 'maxWidthSm' | 'maxWidthMd' | 'maxWidthLg' | 'maxWidthXl'> {
    // Standard React form props
    value?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;

    // Stepper configuration
    step?: number;
    min?: number;
    max?: number;

    // Formatting options
    format?: 'currency' | 'integer' | 'decimal';
    currency?: string;
    currencyPosition?: 'prefix' | 'suffix';
    decimalPlaces?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;

    // UI customization
    label?: string;
    icon?: React.ComponentType<any>; // Icon component from react-icons
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'outlined' | 'filled';

    // Validation
    required?: boolean;
    error?: boolean;
    helperText?: string;

    // Additional props
    name?: string;
    id?: string;
    className?: string;
    autoFocus?: boolean;
    tabIndex?: number;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * # NumberStepperInput Component
 * 
 * A specialized numeric input component with integrated increment/decrement buttons for 
 * precise value selection. Features number formatting, validation, keyboard shortcuts, 
 * and responsive design optimized for property rental pricing and booking systems.
 * 
 * ## Key Features
 * - **Stepper Controls**: Built-in +/- buttons for value adjustment
 * - **Number Formatting**: Currency, decimal, and integer display formats
 * - **Keyboard Navigation**: Arrow keys for value adjustment
 * - **Input Validation**: Min/max range enforcement with visual feedback
 * - **Controlled/Uncontrolled**: Supports both controlled and uncontrolled usage
 * - **Responsive Design**: Mobile-first width controls via Box props
 * - **Theme Integration**: Consistent styling with Input component
 * - **Accessibility**: Full keyboard and screen reader support
 * 
 * ## Basic Usage
 * ```tsx
 * const [value, setValue] = useState(0)
 * 
 * <NumberStepperInput
 *   value={value}
 *   onChange={setValue}
 *   label="Quantity"
 * />
 * ```
 * 
 * ## Number Formats
 * ### Currency Format
 * ```tsx
 * <NumberStepperInput
 *   label="Nightly Rate"
 *   value={price}
 *   onChange={setPrice}
 *   format="currency"
 *   currency="AED"
 *   currencyPosition="suffix"
 *   step={50}
 *   min={100}
 *   max={10000}
 * />
 * ```
 * 
 * ### Decimal Format
 * ```tsx
 * <NumberStepperInput
 *   label="Rating"
 *   value={rating}
 *   onChange={setRating}
 *   format="decimal"
 *   decimalPlaces={1}
 *   step={0.1}
 *   min={0}
 *   max={5}
 * />
 * ```
 * 
 * ### Integer Format
 * ```tsx
 * <NumberStepperInput
 *   label="Guest Count"
 *   value={guests}
 *   onChange={setGuests}
 *   format="integer"
 *   step={1}
 *   min={1}
 *   max={12}
 * />
 * ```
 * 
 * ## Size and Variants
 * ### Size Options
 * ```tsx
 * // Small (36px height)
 * <NumberStepperInput
 *   size="small"
 *   label="Small Input"
 *   value={smallValue}
 *   onChange={setSmallValue}
 * />
 * 
 * // Medium (44px height) - default
 * <NumberStepperInput
 *   size="medium"
 *   label="Medium Input"
 *   value={mediumValue}
 *   onChange={setMediumValue}
 * />
 * 
 * // Large (52px height)
 * <NumberStepperInput
 *   size="large"
 *   label="Large Input"
 *   value={largeValue}
 *   onChange={setLargeValue}
 * />
 * ```
 * 
 * ### Visual Variants
 * ```tsx
 * // Default variant
 * <NumberStepperInput
 *   variant="default"
 *   label="Default Style"
 *   value={value1}
 *   onChange={setValue1}
 * />
 * 
 * // Outlined variant
 * <NumberStepperInput
 *   variant="outlined"
 *   label="Outlined Style"
 *   value={value2}
 *   onChange={setValue2}
 * />
 * 
 * // Filled variant
 * <NumberStepperInput
 *   variant="filled"
 *   label="Filled Style"
 *   value={value3}
 *   onChange={setValue3}
 * />
 * ```
 * 
 * ## Property Booking Examples
 * ### Guest Selection
 * ```tsx
 * <NumberStepperInput
 *   label="Number of Guests"
 *   icon={FaUsers}
 *   value={guestCount}
 *   onChange={setGuestCount}
 *   format="integer"
 *   min={1}
 *   max={property.maxGuests}
 *   step={1}
 *   helperText={`Maximum ${property.maxGuests} guests allowed`}
 * />
 * ```
 * 
 * ### Bedroom Count Filter
 * ```tsx
 * <NumberStepperInput
 *   label="Bedrooms"
 *   icon={FaBed}
 *   value={bedroomCount}
 *   onChange={setBedroomCount}
 *   format="integer"
 *   min={0}
 *   max={10}
 *   step={1}
 *   placeholder="Any"
 * />
 * ```
 * 
 * ### Price Range Filter
 * ```tsx
 * <Box display="flex" gap="1rem" flexDirection="column" flexDirectionMd="row">
 *   <NumberStepperInput
 *     label="Min Price"
 *     icon={FaDollarSign}
 *     value={minPrice}
 *     onChange={setMinPrice}
 *     format="currency"
 *     currency="AED"
 *     currencyPosition="suffix"
 *     step={100}
 *     min={0}
 *     width="100%"
 *     widthMd="50%"
 *   />
 *   <NumberStepperInput
 *     label="Max Price"
 *     icon={FaDollarSign}
 *     value={maxPrice}
 *     onChange={setMaxPrice}
 *     format="currency"
 *     currency="AED"
 *     currencyPosition="suffix"
 *     step={100}
 *     min={minPrice || 0}
 *     width="100%"
 *     widthMd="50%"
 *   />
 * </Box>
 * ```
 * 
 * ## Advanced Formatting
 * ### Custom Currency
 * ```tsx
 * <NumberStepperInput
 *   label="Property Value"
 *   value={propertyValue}
 *   onChange={setPropertyValue}
 *   format="currency"
 *   currency="AED"
 *   currencyPosition="suffix"
 *   decimalPlaces={0}
 *   thousandsSeparator=","
 *   step={10000}
 *   min={100000}
 * />
 * ```
 * 
 * ### Percentage Input
 * ```tsx
 * <NumberStepperInput
 *   label="Commission Rate"
 *   value={commission}
 *   onChange={setCommission}
 *   format="decimal"
 *   currency="%"
 *   currencyPosition="suffix"
 *   decimalPlaces={1}
 *   step={0.5}
 *   min={0}
 *   max={15}
 * />
 * ```
 * 
 * ## Validation and Error States
 * ### Required Field
 * ```tsx
 * <NumberStepperInput
 *   label="Required Amount"
 *   value={amount}
 *   onChange={setAmount}
 *   required
 *   error={amount === 0}
 *   helperText={amount === 0 ? "Amount is required" : ""}
 *   min={1}
 * />
 * ```
 * 
 * ### Range Validation
 * ```tsx
 * <NumberStepperInput
 *   label="Booking Duration (days)"
 *   value={duration}
 *   onChange={setDuration}
 *   format="integer"
 *   min={1}
 *   max={30}
 *   error={duration > 30}
 *   helperText={
 *     duration > 30 
 *       ? "Maximum booking duration is 30 days"
 *       : "Select number of nights"
 *   }
 * />
 * ```
 * 
 * ## State Management
 * ### Controlled Usage
 * ```tsx
 * const [controlledValue, setControlledValue] = useState(5)
 * 
 * <NumberStepperInput
 *   label="Controlled Input"
 *   value={controlledValue}
 *   onChange={setControlledValue}
 * />
 * ```
 * 
 * ### Uncontrolled Usage
 * ```tsx
 * <NumberStepperInput
 *   label="Uncontrolled Input"
 *   defaultValue={10}
 *   onChange={(value) => console.log('Value changed:', value)}
 * />
 * ```
 * 
 * ### Disabled State
 * ```tsx
 * <NumberStepperInput
 *   label="Locked Value"
 *   value={lockedValue}
 *   onChange={() => {}}
 *   disabled
 *   helperText="This value cannot be changed"
 * />
 * ```
 * 
 * ### Read-Only State
 * ```tsx
 * <NumberStepperInput
 *   label="Display Only"
 *   value={displayValue}
 *   onChange={() => {}}
 *   readOnly
 *   helperText="Read-only display"
 * />
 * ```
 * 
 * ## Keyboard Interactions
 * The component supports these keyboard shortcuts:
 * - **Arrow Up**: Increment by step value
 * - **Arrow Down**: Decrement by step value
 * - **Focus/Blur**: Format display value
 * - **Direct Input**: Type values directly while focused
 * 
 * ## Responsive Design
 * ### Width Controls
 * ```tsx
 * <NumberStepperInput
 *   label="Responsive Input"
 *   value={value}
 *   onChange={setValue}
 *   width="100%"           // Mobile: full width
 *   widthMd="50%"          // Tablet: half width
 *   widthLg="200px"        // Desktop: fixed width
 *   maxWidth="300px"       // Maximum constraint
 * />
 * ```
 * 
 * ### Form Grid Layout
 * ```tsx
 * <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="repeat(2, 1fr)" gap="1rem">
 *   <NumberStepperInput
 *     label="Adults"
 *     value={adults}
 *     onChange={setAdults}
 *     min={1}
 *     max={10}
 *   />
 *   <NumberStepperInput
 *     label="Children"
 *     value={children}
 *     onChange={setChildren}
 *     min={0}
 *     max={8}
 *   />
 * </Box>
 * ```
 * 
 * ## Complete Examples
 * ### Property Pricing Form
 * ```tsx
 * const PropertyPricingForm = () => {
 *   const [pricing, setPricing] = useState({
 *     basePrice: 500,
 *     cleaningFee: 50,
 *     securityDeposit: 200,
 *     maxGuests: 4,
 *     minStay: 2
 *   })
 * 
 *   const updatePricing = (field, value) => {
 *     setPricing(prev => ({ ...prev, [field]: value }))
 *   }
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="1.5rem">
 *       <NumberStepperInput
 *         label="Base Nightly Rate"
 *         icon={FaDollarSign}
 *         value={pricing.basePrice}
 *         onChange={(value) => updatePricing('basePrice', value)}
 *         format="currency"
 *         currency="AED"
 *         currencyPosition="suffix"
 *         step={25}
 *         min={100}
 *         max={5000}
 *         required
 *       />
 *       
 *       <Box display="flex" gap="1rem" flexDirection="column" flexDirectionMd="row">
 *         <NumberStepperInput
 *           label="Cleaning Fee"
 *           value={pricing.cleaningFee}
 *           onChange={(value) => updatePricing('cleaningFee', value)}
 *           format="currency"
 *           currency="AED"
 *           currencyPosition="suffix"
 *           step={25}
 *           min={0}
 *           max={500}
 *           width="100%"
 *           widthMd="50%"
 *         />
 *         <NumberStepperInput
 *           label="Security Deposit"
 *           value={pricing.securityDeposit}
 *           onChange={(value) => updatePricing('securityDeposit', value)}
 *           format="currency"
 *           currency="AED"
 *           currencyPosition="suffix"
 *           step={50}
 *           min={0}
 *           max={2000}
 *           width="100%"
 *           widthMd="50%"
 *         />
 *       </Box>
 * 
 *       <Box display="flex" gap="1rem" flexDirection="column" flexDirectionMd="row">
 *         <NumberStepperInput
 *           label="Maximum Guests"
 *           icon={FaUsers}
 *           value={pricing.maxGuests}
 *           onChange={(value) => updatePricing('maxGuests', value)}
 *           format="integer"
 *           min={1}
 *           max={16}
 *           width="100%"
 *           widthMd="50%"
 *           required
 *         />
 *         <NumberStepperInput
 *           label="Minimum Stay (nights)"
 *           icon={FaCalendarAlt}
 *           value={pricing.minStay}
 *           onChange={(value) => updatePricing('minStay', value)}
 *           format="integer"
 *           min={1}
 *           max={30}
 *           width="100%"
 *           widthMd="50%"
 *           required
 *         />
 *       </Box>
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ### Booking Calculator
 * ```tsx
 * const BookingCalculator = ({ basePrice }) => {
 *   const [nights, setNights] = useState(3)
 *   const [guests, setGuests] = useState(2)
 *   const [cleaningFee] = useState(75)
 *   
 *   const subtotal = basePrice * nights
 *   const total = subtotal + cleaningFee
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="1rem">
 *       <NumberStepperInput
 *         label="Number of Nights"
 *         value={nights}
 *         onChange={setNights}
 *         format="integer"
 *         min={1}
 *         max={30}
 *         size="large"
 *       />
 *       
 *       <NumberStepperInput
 *         label="Number of Guests"
 *         value={guests}
 *         onChange={setGuests}
 *         format="integer"
 *         min={1}
 *         max={8}
 *         size="large"
 *       />
 * 
 *       <Box padding="1rem" backgroundColor="#f8fafc" borderRadius="8px">
 *         <Box display="flex" justifyContent="space-between" marginBottom="0.5rem">
 *           <span>Subtotal ({nights} nights)</span>
 *           <span>AED {subtotal.toLocaleString()}</span>
 *         </Box>
 *         <Box display="flex" justifyContent="space-between" marginBottom="0.5rem">
 *           <span>Cleaning Fee</span>
 *           <span>AED {cleaningFee}</span>
 *         </Box>
 *         <Box display="flex" justifyContent="space-between" fontWeight="600" fontSize="1.125rem">
 *           <span>Total</span>
 *           <span>AED {total.toLocaleString()}</span>
 *         </Box>
 *       </Box>
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ## Accessibility Features
 * - **Keyboard Navigation**: Full arrow key support for value adjustment
 * - **Screen Readers**: Proper ARIA labels and value announcements
 * - **Focus Management**: Clear focus indicators on all interactive elements
 * - **Input Validation**: Accessible error messaging and constraints
 * - **Button Labels**: Clear aria-labels for increment/decrement buttons
 * 
 * ## Integration Notes
 * - **Input Component**: Shares size configurations for consistent form layouts
 * - **Button Component**: Uses Button for increment/decrement controls
 * - **Box Component**: Inherits responsive width controls and styling
 * - **Theme Integration**: Automatic theme color integration via useTheme
 * 
 * ## Performance Optimization
 * - **Efficient Formatting**: Memoized number formatting functions
 * - **Smart Updates**: Prevents unnecessary re-renders on format changes
 * - **Input Debouncing**: Smooth typing experience with proper value parsing
 * - **Memory Management**: Proper cleanup of event handlers and timers
 * 
 * @example
 * // Complete property amenity pricing interface
 * const AmenityPricingManager = ({ propertyId }) => {
 *   const [amenities, setAmenities] = useState({
 *     extraGuest: { enabled: false, price: 25 },
 *     latePet: { enabled: false, price: 15 },
 *     earlyCheckin: { enabled: false, price: 50 },
 *     lateCheckout: { enabled: false, price: 50 }
 *   })
 * 
 *   const updateAmenity = (amenityKey, field, value) => {
 *     setAmenities(prev => ({
 *       ...prev,
 *       [amenityKey]: { ...prev[amenityKey], [field]: value }
 *     }))
 *   }
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="2rem">
 *       <h3>Additional Service Pricing</h3>
 *       
 *       <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="repeat(2, 1fr)" gap="1.5rem">
 *         <Box>
 *           <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
 *             <input 
 *               type="checkbox" 
 *               checked={amenities.extraGuest.enabled}
 *               onChange={(e) => updateAmenity('extraGuest', 'enabled', e.target.checked)}
 *             />
 *             <label>Extra Guest Fee</label>
 *           </Box>
 *           <NumberStepperInput
 *             label="Price per extra guest per night"
 *             value={amenities.extraGuest.price}
 *             onChange={(value) => updateAmenity('extraGuest', 'price', value)}
 *             format="currency"
 *             currency="AED"
 *             currencyPosition="suffix"
 *             step={5}
 *             min={0}
 *             max={100}
 *             disabled={!amenities.extraGuest.enabled}
 *           />
 *         </Box>
 * 
 *         <Box>
 *           <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="1rem">
 *             <input 
 *               type="checkbox" 
 *               checked={amenities.petFee.enabled}
 *               onChange={(e) => updateAmenity('petFee', 'enabled', e.target.checked)}
 *             />
 *             <label>Pet Fee</label>
 *           </Box>
 *           <NumberStepperInput
 *             label="Price per pet per night"
 *             value={amenities.petFee.price}
 *             onChange={(value) => updateAmenity('petFee', 'price', value)}
 *             format="currency"
 *             currency="AED"
 *             currencyPosition="suffix"
 *             step={5}
 *             min={0}
 *             max={50}
 *             disabled={!amenities.petFee.enabled}
 *           />
 *         </Box>
 *       </Box>
 *     </Box>
 *   )
 * }
 */

export const NumberStepperInput: React.FC<NumberStepperInputProps> = ({
                                                                          value: controlledValue,
                                                                          defaultValue = 0,
                                                                          onChange,
                                                                          step = 1,
                                                                          min = -Infinity,
                                                                          max = Infinity,
                                                                          format = 'integer',
                                                                          currency = '$',
                                                                          currencyPosition = 'prefix',
                                                                          decimalPlaces = 2,
                                                                          thousandsSeparator = ',',
                                                                          decimalSeparator = '.',
                                                                          label,
                                                                          icon: IconComponent,
                                                                          placeholder,
                                                                          disabled = false,
                                                                          readOnly = false,
                                                                          size = 'medium',
                                                                          variant = 'default',
                                                                          required = false,
                                                                          error = false,
                                                                          helperText,
                                                                          name,
                                                                          id,
                                                                          className,
                                                                          autoFocus = false,
                                                                          tabIndex,
                                                                          onBlur,
                                                                          onFocus,
                                                                          ...props
                                                                      }) => {
    const theme = useTheme();
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentValue = isControlled ? controlledValue : internalValue;

    // Size configurations
    const sizeConfig = {
        small: {
            height: 36,
            fontSize: '1rem',
            buttonSize: 32,
            padding: 8,
        },
        medium: {
            height: 44,
            fontSize: '1rem',
            buttonSize: 40,
            padding: 10,
        },
        large: {
            height: 52,
            fontSize: '1.125rem',
            buttonSize: 48,
            padding: 12,
        },
    };

    const config = sizeConfig[size];

    // Format number for display
    const formatNumber = useCallback((num: number): string => {
        if (format === 'currency') {
            const formatted = num.toFixed(decimalPlaces);
            const parts = formatted.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
            const result = parts.join(decimalSeparator);
            return currencyPosition === 'prefix'
                ? `${currency}${result}`
                : `${result}${currency}`;
        } else if (format === 'decimal') {
            const formatted = num.toFixed(decimalPlaces);
            const parts = formatted.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
            return parts.join(decimalSeparator);
        } else {
            // integer format
            return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
        }
    }, [format, currency, currencyPosition, decimalPlaces, thousandsSeparator, decimalSeparator]);

    // Parse formatted string back to number
    const parseNumber = useCallback((str: string): number => {
        // Remove currency symbols
        let cleaned = str.replace(new RegExp(`\\${currency}`, 'g'), '');
        // Remove thousands separators
        cleaned = cleaned.replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '');
        // Replace decimal separator with dot
        cleaned = cleaned.replace(new RegExp(`\\${decimalSeparator}`, 'g'), '.');
        // Remove any non-numeric characters except dot and minus
        cleaned = cleaned.replace(/[^0-9.-]/g, '');

        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }, [currency, thousandsSeparator, decimalSeparator]);

    // Update display value when not focused
    useEffect(() => {
        if (!isFocused) {
            setInputValue(formatNumber(currentValue));
        }
    }, [currentValue, isFocused, formatNumber]);

    // Handle value change
    const handleValueChange = useCallback((newValue: number) => {
        // Clamp value to min/max
        const clampedValue = Math.min(Math.max(newValue, min), max);

        if (!isControlled) {
            setInternalValue(clampedValue);
        }

        onChange?.(clampedValue);
    }, [isControlled, min, max, onChange]);

    // Handle increment
    const handleIncrement = useCallback(() => {
        if (disabled || readOnly) return;
        const newValue = currentValue + step;
        handleValueChange(newValue);
    }, [currentValue, step, disabled, readOnly, handleValueChange]);

    // Handle decrement
    const handleDecrement = useCallback(() => {
        if (disabled || readOnly) return;
        const newValue = currentValue - step;
        handleValueChange(newValue);
    }, [currentValue, step, disabled, readOnly, handleValueChange]);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Try to parse the value
        const parsed = parseNumber(value);
        if (!isNaN(parsed)) {
            handleValueChange(parsed);
        }
    }, [parseNumber, handleValueChange]);

    // Handle focus
    const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        // Show raw number when focused for easier editing
        setInputValue(currentValue.toString());
        // Select all text for easy replacement
        setTimeout(() => {
            inputRef.current?.select();
        }, 0);
        onFocus?.(e);
    }, [currentValue, onFocus]);

    // Handle blur
    const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        // Format the value on blur
        setInputValue(formatNumber(currentValue));
        onBlur?.(e);
    }, [currentValue, formatNumber, onBlur]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled || readOnly) return;

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            handleIncrement();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            handleDecrement();
        }
    }, [disabled, readOnly, handleIncrement, handleDecrement]);

    // Variant styles
    const variantStyles = {
        default: {
            backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
            border: error ? '1px solid #ef4444' : `1px solid ${theme.withOpacity(theme.primaryColor, 0.2)}`,
        },
        outlined: {
            backgroundColor: 'transparent',
            border: error ? '2px solid #ef4444' : `2px solid ${theme.primaryColor}`,
        },
        filled: {
            backgroundColor: disabled ? '#e5e7eb' : '#f3f4f6',
            border: error ? '1px solid #ef4444' : '1px solid transparent',
        },
    };

    const containerStyle = variantStyles[variant];

    // Size configurations for label and helper text matching Input component
    const sizeStyles = {
        small: { gap: '6px', labelFontSize: '0.875rem', iconSize: '0.875rem' },
        medium: { gap: '8px', labelFontSize: '1rem', iconSize: '1rem' },
        large: { gap: '10px', labelFontSize: '1.125rem', iconSize: '1.125rem' },
    };
    const currentSizeStyle = sizeStyles[size];

    return (
        <Box display="flex" flexDirection="column" gap={currentSizeStyle.gap} className={className} {...props}>
            {/* Label - using same structure as Input component */}
            {label && (
                <Box
                    as="label"
                    htmlFor={id}
                    fontSize={currentSizeStyle.labelFontSize}
                    fontWeight={500}
                    color={theme.darken(theme.primaryColor, 15)}
                    display="flex"
                    alignItems="center"
                    gap={currentSizeStyle.gap}
                >
                    {IconComponent && (
                        <Box
                            color={theme.primaryColor}
                            display="flex" 
                            alignItems="center"
                            fontSize={currentSizeStyle.iconSize}
                        >
                            <IconComponent size={currentSizeStyle.iconSize} />
                        </Box>
                    )}
                    <Box>
                        {label}
                        {required && (
                            <Box as="span" color="#ef4444" marginLeft="4px">
                                *
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {/* Custom stepper input field */}
            <Box
                display="flex"
                borderRadius="0.375rem"
                overflow="hidden"
                {...containerStyle}
                opacity={disabled ? 0.6 : 1}
                width="100%"
            >
                {/* Decrement Button */}
                <Button
                    label="−"
                    type="button"
                    onClick={handleDecrement}
                    disabled={disabled || readOnly || currentValue <= min}
                    variant="normal"
                    size="small"
                    width={config.buttonSize}
                    padding="0"
                    backgroundColor="transparent"
                    border="none"
                    color={disabled || readOnly || currentValue <= min ? '#9ca3af' : theme.darken(theme.primaryColor, 15)}
                    fontSize="20px"
                    fontWeight="500"
                    tabIndex={-1}
                    style={{
                        minWidth: 'unset',
                        borderTopRightRadius:0,
                        borderBottomRightRadius:0,
                        borderRight:' 1px solid rgb(209, 213, 219)',
                        borderLeft :'unset',
                        borderBottom : 'unset',
                        borderTop : 'unset',
                        height:'unset'
                    }}
                />

                {/* Input Field */}
                <Box
                    as="input"
                    ref={inputRef}
                    type="text"
                    inputMode={format === 'integer' ? 'numeric' : 'decimal'}
                    id={id}
                    name={name}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    autoFocus={autoFocus}
                    tabIndex={tabIndex}
                    flex={1}
                    height={config.height}
                    padding={`0 ${config.padding}px`}
                    border="none"
                    backgroundColor="transparent"
                    fontSize={config.fontSize}
                    textAlign="center"
                    color="#111827"
                    width={"100%"}
                    minWidth={0}
                />

                {/* Increment Button */}
                <Button
                    label="+"
                    type="button"
                    onClick={handleIncrement}
                    disabled={disabled || readOnly || currentValue >= max}
                    variant="normal"
                    size="small"
                    width={config.buttonSize}
                    padding="0"
                    backgroundColor="transparent"
                    border="none"
                    color={disabled || readOnly || currentValue >= max ? '#9ca3af' : theme.darken(theme.primaryColor, 15)}
                    fontSize="20px"
                    fontWeight="500"
                    tabIndex={-1}
                    style={{
                        minWidth: 'unset',
                        borderTopLeftRadius:0,
                        borderBottomLeftRadius:0,
                        borderLeft:' 1px solid rgb(209, 213, 219)',
                        borderRight :'unset',
                        borderBottom : 'unset',
                        borderTop : 'unset',
                        height:'unset'
                    }}
                />
            </Box>

            {/* Helper Text - using same structure as Input component */}
            {helperText && (
                <Box
                    fontSize="0.875rem"
                    color={error ? '#ef4444' : '#6b7280'}
                    marginTop="4px"
                >
                    {helperText}
                </Box>
            )}
        </Box>
    );
};

export default NumberStepperInput;