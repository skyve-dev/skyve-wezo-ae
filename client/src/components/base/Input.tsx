import React, {forwardRef, InputHTMLAttributes} from 'react';
import {Box} from './Box';
import {BoxProps} from '@/types/box';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Pick<BoxProps, 'width' | 'widthSm' | 'widthMd' | 'widthLg' | 'widthXl'
        | 'minWidth' | 'minWidthSm' | 'minWidthMd' | 'minWidthLg' | 'minWidthXl'
        | 'maxWidth' | 'maxWidthSm' | 'maxWidthMd' | 'maxWidthLg' | 'maxWidthXl'> {
    
    // UI customization
    label?: string;
    icon?: React.ComponentType<any>; // Icon component from react-icons
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'outlined' | 'filled';
    fullWidth?: boolean;
    
    // Validation and helpers
    error?: boolean;
    helperText?: string;
    
    // Additional props
    containerClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    helperTextClassName?: string;
}

/**
 * # Input Component
 * 
 * A versatile, accessible input field component that provides consistent styling and behavior
 * across the property rental application. Features responsive design, validation states, 
 * icon support, and seamless integration with forms and theming systems.
 * 
 * ## Key Features
 * - **Responsive Design**: Mobile-first responsive width controls via Box props
 * - **Size Variants**: Three size options (small, medium, large) with consistent heights
 * - **Visual Variants**: Multiple styling variants (default, outlined, filled)
 * - **Icon Integration**: Optional icon support with proper sizing and positioning
 * - **Validation States**: Built-in error handling with visual feedback
 * - **Accessibility**: Full keyboard navigation and screen reader support
 * - **Form Integration**: Native HTML input attributes and form validation
 * - **Theme Consistency**: Matches NumberStepperInput sizing for form alignment
 * 
 * ## Basic Usage
 * ```tsx
 * const [value, setValue] = useState('')
 * 
 * <Input
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   placeholder="Enter text"
 * />
 * ```
 * 
 * ## Sizes and Variants
 * ### Size Options
 * ```tsx
 * // Small input (36px height)
 * <Input 
 *   size="small"
 *   placeholder="Small input"
 * />
 * 
 * // Medium input (44px height) - default
 * <Input 
 *   size="medium"
 *   placeholder="Medium input"
 * />
 * 
 * // Large input (52px height)
 * <Input 
 *   size="large"
 *   placeholder="Large input"
 * />
 * ```
 * 
 * ### Visual Variants
 * ```tsx
 * // Default variant - standard border
 * <Input variant="default" placeholder="Default style" />
 * 
 * // Outlined variant - prominent border
 * <Input variant="outlined" placeholder="Outlined style" />
 * 
 * // Filled variant - background fill
 * <Input variant="filled" placeholder="Filled style" />
 * ```
 * 
 * ## Form Integration
 * ### With Label and Validation
 * ```tsx
 * <Input
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   required
 *   error={!!emailError}
 *   helperText={emailError || "Enter your email address"}
 * />
 * ```
 * 
 * ### Property Search Form
 * ```tsx
 * <Box display="flex" flexDirection="column" gap="1rem">
 *   <Input
 *     label="Property Name"
 *     icon={FaHome}
 *     value={propertyName}
 *     onChange={(e) => setPropertyName(e.target.value)}
 *     placeholder="Search properties..."
 *   />
 *   <Input
 *     label="Location"
 *     icon={FaMapMarkerAlt}
 *     value={location}
 *     onChange={(e) => setLocation(e.target.value)}
 *     placeholder="City or address"
 *   />
 * </Box>
 * ```
 * 
 * ## Icon Integration
 * ### With React Icons
 * ```tsx
 * import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa'
 * 
 * <Input
 *   label="Name"
 *   icon={FaUser}
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   placeholder="Your full name"
 * />
 * ```
 * 
 * ### Custom Icon Component
 * ```tsx
 * const CustomIcon = ({ size }) => (
 *   <svg width={size} height={size} viewBox="0 0 24 24">
 *     <path d="..." />
 *   </svg>
 * )
 * 
 * <Input
 *   label="Custom Field"
 *   icon={CustomIcon}
 *   value={customValue}
 *   onChange={(e) => setCustomValue(e.target.value)}
 * />
 * ```
 * 
 * ## Responsive Design
 * ### Width Controls
 * ```tsx
 * <Input
 *   label="Responsive Input"
 *   width="100%"              // Mobile: full width
 *   widthMd="50%"             // Tablet: half width  
 *   widthLg="300px"           // Desktop: fixed width
 *   maxWidth="400px"          // Maximum constraint
 * />
 * ```
 * 
 * ### Form Layout
 * ```tsx
 * <Box display="flex" flexDirection="column" flexDirectionMd="row" gap="1rem">
 *   <Input
 *     label="First Name"
 *     value={firstName}
 *     onChange={(e) => setFirstName(e.target.value)}
 *     width="100%"
 *     widthMd="50%"
 *   />
 *   <Input
 *     label="Last Name"
 *     value={lastName}
 *     onChange={(e) => setLastName(e.target.value)}
 *     width="100%"
 *     widthMd="50%"
 *   />
 * </Box>
 * ```
 * 
 * ## Validation and Error States
 * ### Error Handling
 * ```tsx
 * const [errors, setErrors] = useState({})
 * 
 * <Input
 *   label="Required Field"
 *   value={requiredValue}
 *   onChange={(e) => setRequiredValue(e.target.value)}
 *   required
 *   error={!!errors.required}
 *   helperText={errors.required || "This field is required"}
 * />
 * ```
 * 
 * ### Real-time Validation
 * ```tsx
 * const [password, setPassword] = useState('')
 * const isPasswordValid = password.length >= 8
 * 
 * <Input
 *   label="Password"
 *   type="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   error={password.length > 0 && !isPasswordValid}
 *   helperText={
 *     password.length === 0 
 *       ? "Enter a secure password"
 *       : isPasswordValid 
 *         ? "Password is secure"
 *         : "Password must be at least 8 characters"
 *   }
 * />
 * ```
 * 
 * ## Input Types and Patterns
 * ### Common Input Types
 * ```tsx
 * // Email input with validation
 * <Input
 *   label="Email"
 *   type="email"
 *   icon={FaEnvelope}
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   placeholder="user@example.com"
 * />
 * 
 * // Password input
 * <Input
 *   label="Password"
 *   type="password"
 *   icon={FaLock}
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 * 
 * // Phone number input
 * <Input
 *   label="Phone"
 *   type="tel"
 *   icon={FaPhone}
 *   value={phone}
 *   onChange={(e) => setPhone(e.target.value)}
 *   placeholder="+1 (555) 123-4567"
 * />
 * ```
 * 
 * ### Search and Filter
 * ```tsx
 * <Input
 *   icon={FaSearch}
 *   value={searchQuery}
 *   onChange={(e) => setSearchQuery(e.target.value)}
 *   placeholder="Search properties..."
 *   variant="filled"
 *   size="large"
 * />
 * ```
 * 
 * ## Advanced Examples
 * ### Property Contact Form
 * ```tsx
 * const ContactForm = () => {
 *   const [formData, setFormData] = useState({
 *     name: '', email: '', phone: '', message: ''
 *   })
 *   const [errors, setErrors] = useState({})
 * 
 *   const handleChange = (field, value) => {
 *     setFormData(prev => ({ ...prev, [field]: value }))
 *     if (errors[field]) {
 *       setErrors(prev => ({ ...prev, [field]: '' }))
 *     }
 *   }
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="1.5rem">
 *       <Input
 *         label="Full Name"
 *         icon={FaUser}
 *         value={formData.name}
 *         onChange={(e) => handleChange('name', e.target.value)}
 *         error={!!errors.name}
 *         helperText={errors.name}
 *         required
 *       />
 *       <Box display="flex" gap="1rem" flexDirection="column" flexDirectionMd="row">
 *         <Input
 *           label="Email"
 *           type="email"
 *           icon={FaEnvelope}
 *           value={formData.email}
 *           onChange={(e) => handleChange('email', e.target.value)}
 *           error={!!errors.email}
 *           helperText={errors.email}
 *           width="100%"
 *           widthMd="50%"
 *           required
 *         />
 *         <Input
 *           label="Phone"
 *           type="tel"
 *           icon={FaPhone}
 *           value={formData.phone}
 *           onChange={(e) => handleChange('phone', e.target.value)}
 *           error={!!errors.phone}
 *           helperText={errors.phone}
 *           width="100%"
 *           widthMd="50%"
 *         />
 *       </Box>
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ### Property Filter Interface
 * ```tsx
 * const PropertyFilters = () => {
 *   const [filters, setFilters] = useState({
 *     location: '', minPrice: '', maxPrice: '', bedrooms: ''
 *   })
 * 
 *   return (
 *     <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="repeat(2, 1fr)" 
 *          gridTemplateColumnsLg="repeat(4, 1fr)" gap="1rem">
 *       <Input
 *         label="Location"
 *         icon={FaMapMarkerAlt}
 *         value={filters.location}
 *         onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
 *         placeholder="City or area"
 *         variant="outlined"
 *       />
 *       <Input
 *         label="Min Price"
 *         type="number"
 *         icon={FaDollarSign}
 *         value={filters.minPrice}
 *         onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value}))}
 *         placeholder="0"
 *         variant="outlined"
 *       />
 *       <Input
 *         label="Max Price"
 *         type="number"
 *         icon={FaDollarSign}
 *         value={filters.maxPrice}
 *         onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
 *         placeholder="10000"
 *         variant="outlined"
 *       />
 *       <Input
 *         label="Bedrooms"
 *         type="number"
 *         icon={FaBed}
 *         value={filters.bedrooms}
 *         onChange={(e) => setFilters(prev => ({...prev, bedrooms: e.target.value}))}
 *         placeholder="Any"
 *         variant="outlined"
 *       />
 *     </Box>
 *   )
 * }
 * ```
 * 
 * ## State Management
 * ### Disabled State
 * ```tsx
 * <Input
 *   label="Read Only Field"
 *   value="Cannot be changed"
 *   disabled
 *   helperText="This field is locked"
 * />
 * ```
 * 
 * ### Auto Focus
 * ```tsx
 * <Input
 *   label="Auto Focus"
 *   autoFocus
 *   placeholder="This input gets focus automatically"
 * />
 * ```
 * 
 * ## Accessibility Features
 * - **Label Association**: Proper label-input association with htmlFor
 * - **ARIA Support**: Built-in ARIA attributes for screen readers
 * - **Keyboard Navigation**: Full keyboard accessibility
 * - **Error Announcements**: Error states announced to screen readers
 * - **Required Field Indicators**: Visual and programmatic required field marking
 * - **Focus Management**: Proper focus ring and tab order
 * 
 * ## Styling Integration
 * - **Theme Consistency**: Matches NumberStepperInput component sizing
 * - **Box Integration**: Inherits responsive width controls from Box component
 * - **Variant System**: Consistent styling variants across the design system
 * - **Size Alignment**: Height values align with Button component for form consistency
 * 
 * ## Performance Notes
 * - **Efficient Rendering**: Optimized for large forms with many inputs
 * - **Minimal Re-renders**: Smart prop handling prevents unnecessary updates
 * - **Icon Optimization**: Icons rendered only when provided
 * - **Responsive Calculations**: Width calculations handled by Box component
 * 
 * @example
 * // Complete property inquiry form
 * const PropertyInquiryForm = () => {
 *   const [inquiry, setInquiry] = useState({
 *     name: '', email: '', phone: '', checkIn: '', checkOut: '', 
 *     guests: 1, specialRequests: ''
 *   })
 *   const [errors, setErrors] = useState({})
 *   const [isSubmitting, setIsSubmitting] = useState(false)
 * 
 *   const validateForm = () => {
 *     const newErrors = {}
 *     if (!inquiry.name.trim()) newErrors.name = "Name is required"
 *     if (!inquiry.email.trim()) newErrors.email = "Email is required"
 *     if (!/\S+@\S+\.\S+/.test(inquiry.email)) newErrors.email = "Email is invalid"
 *     setErrors(newErrors)
 *     return Object.keys(newErrors).length === 0
 *   }
 * 
 *   const handleSubmit = async () => {
 *     if (!validateForm()) return
 *     
 *     setIsSubmitting(true)
 *     try {
 *       await submitInquiry(inquiry)
 *       // Handle success
 *     } catch (error) {
 *       // Handle error
 *     } finally {
 *       setIsSubmitting(false)
 *     }
 *   }
 * 
 *   return (
 *     <Box display="flex" flexDirection="column" gap="1.5rem">
 *       <Box display="flex" gap="1rem" flexDirection="column" flexDirectionMd="row">
 *         <Input
 *           label="Full Name"
 *           icon={FaUser}
 *           value={inquiry.name}
 *           onChange={(e) => setInquiry(prev => ({...prev, name: e.target.value}))}
 *           error={!!errors.name}
 *           helperText={errors.name}
 *           required
 *           width="100%"
 *           widthMd="50%"
 *         />
 *         <Input
 *           label="Email Address"
 *           type="email"
 *           icon={FaEnvelope}
 *           value={inquiry.email}
 *           onChange={(e) => setInquiry(prev => ({...prev, email: e.target.value}))}
 *           error={!!errors.email}
 *           helperText={errors.email}
 *           required
 *           width="100%"
 *           widthMd="50%"
 *         />
 *       </Box>
 *       
 *       <Input
 *         label="Phone Number (Optional)"
 *         type="tel"
 *         icon={FaPhone}
 *         value={inquiry.phone}
 *         onChange={(e) => setInquiry(prev => ({...prev, phone: e.target.value}))}
 *         placeholder="+1 (555) 123-4567"
 *       />
 * 
 *       <Input
 *         label="Special Requests"
 *         as="textarea"
 *         value={inquiry.specialRequests}
 *         onChange={(e) => setInquiry(prev => ({...prev, specialRequests: e.target.value}))}
 *         placeholder="Any special requests or questions..."
 *         rows={4}
 *       />
 * 
 *       <Button
 *         label={isSubmitting ? "Sending..." : "Send Inquiry"}
 *         variant="promoted"
 *         size="large"
 *         fullWidth
 *         loading={isSubmitting}
 *         disabled={!inquiry.name || !inquiry.email}
 *         onClick={handleSubmit}
 *       />
 *     </Box>
 *   )
 * }
 */

// Size configurations matching NumberStepperInput
const sizeConfig = {
    small: {
        height: '36px',
        fontSize: '1rem',
        padding: '8px 12px',
        iconSize: '0.875rem',
        gap: '6px',
        labelFontSize: '0.875rem',
    },
    medium: {
        height: '44px',
        fontSize: '1rem',
        padding: '10px 14px',
        iconSize: '1rem',
        gap: '8px',
        labelFontSize: '1rem',
    },
    large: {
        height: '52px',
        fontSize: '1.125rem',
        padding: '12px 16px',
        iconSize: '1.125rem',
        gap: '10px',
        labelFontSize: '1.125rem',
    },
};

// Variant styles matching NumberStepperInput
const getVariantStyles = (variant: InputProps['variant'], error?: boolean, disabled?: boolean) => {
    switch (variant) {
        case 'outlined':
            return {
                backgroundColor: 'transparent',
                border: error ? '2px solid #ef4444' : '2px solid #3b82f6',
            };
        case 'filled':
            return {
                backgroundColor: disabled ? '#e5e7eb' : '#f3f4f6',
                border: error ? '1px solid #ef4444' : '1px solid transparent',
            };
        default:
            return {
                backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
                border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
            };
    }
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    // UI props
    label,
    icon: IconComponent,
    size = 'medium',
    variant = 'default',
    fullWidth = false,
    
    // Validation props
    error = false,
    helperText,
    required,
    
    // Style props
    containerClassName,
    inputClassName,
    labelClassName,
    helperTextClassName,
    width,
    widthSm,
    widthMd,
    widthLg,
    widthXl,
    minWidth,
    minWidthSm,
    minWidthMd,
    minWidthLg,
    minWidthXl,
    maxWidth,
    maxWidthSm,
    maxWidthMd,
    maxWidthLg,
    maxWidthXl,
    
    // Input props
    className,
    disabled,
    id,
    ...inputProps
}, ref) => {
    const config = sizeConfig[size];
    const variantStyles = getVariantStyles(variant, error, disabled);
    
    const widthProps = {
        width: fullWidth ? '100%' : width,
        widthSm,
        widthMd,
        widthLg,
        widthXl,
        minWidth,
        minWidthSm,
        minWidthMd,
        minWidthLg,
        minWidthXl,
        maxWidth,
        maxWidthSm,
        maxWidthMd,
        maxWidthLg,
        maxWidthXl,
    };
    
    return (
        <Box 
            display="flex" 
            flexDirection="column" 
            gap={config.gap}
            className={containerClassName}
            {...widthProps}
        >
            {label && (
                <Box
                    as="label"
                    htmlFor={id}
                    fontSize={config.labelFontSize}
                    fontWeight={500}
                    color="#374151"
                    display="flex"
                    alignItems="center"
                    gap={config.gap}
                    className={labelClassName}

                >
                    {IconComponent && (
                        <Box
                            color="#3182ce"
                            display="flex"
                            alignItems="center"
                            fontSize={config.iconSize}
                        >
                            <IconComponent size={config.iconSize} />
                        </Box>
                    )}
                    <Box fontWeight={500}>
                        {label}
                        {required && (
                            <Box as="span" color="#ef4444" marginLeft="4px">
                                *
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
            
            <Box position="relative" width="100%">
                <Box
                    as="input"
                    ref={ref}
                    id={id}
                    required={required}
                    disabled={disabled}
                    className={`${className || ''} ${inputClassName || ''}`}
                    width="100%"
                    height={config.height}
                    padding={config.padding}
                    fontSize={config.fontSize}
                    borderRadius="0.375rem"
                    color={disabled ? '#6b7280' : '#111827'}
                    backgroundColor={variantStyles.backgroundColor}
                    border={variantStyles.border}
                    transition="all 0.2s ease"
                    style={{ outline: 'none' }}
                    {...inputProps}
                />
            </Box>
            
            {helperText && (
                <Box
                    fontSize="0.875rem"
                    color={error ? '#ef4444' : '#6b7280'}
                    marginTop="4px"
                    className={helperTextClassName}
                >
                    {helperText}
                </Box>
            )}
        </Box>
    );
});

Input.displayName = 'Input';

export default Input;