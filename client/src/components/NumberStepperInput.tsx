import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Box} from './Box';
import {BoxProps} from "@/types/box.ts";

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
            fontSize: 16,
            buttonSize: 32,
            padding: 8,
        },
        medium: {
            height: 44,
            fontSize: 16,
            buttonSize: 40,
            padding: 10,
        },
        large: {
            height: 52,
            fontSize: 18,
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
            border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
        },
        outlined: {
            backgroundColor: 'transparent',
            border: error ? '2px solid #ef4444' : '2px solid #3b82f6',
        },
        filled: {
            backgroundColor: disabled ? '#e5e7eb' : '#f3f4f6',
            border: error ? '1px solid #ef4444' : '1px solid transparent',
        },
    };

    const containerStyle = variantStyles[variant];

    return (
        <Box display="flex" flexDirection="column" gap={4} className={className} {...props}>
            {label && (
                <Box
                    as="label"
                    htmlFor={id}
                    fontSize={'1rem'}
                    fontWeight={700}
                    color="#374151"
                    marginBottom={4}
                    display="flex"
                    alignItems="center"
                    gap={8}
                >
                    {IconComponent && (
                        <Box color="#374151">
                            <IconComponent size="1rem"/>
                        </Box>
                    )}
                    <Box>
                        {label}
                        {required && <Box as="span" color="#ef4444" marginLeft={4}>*</Box>}
                    </Box>
                </Box>
            )}

            <Box
                display="flex"
                alignItems="center"
                borderRadius={8}
                overflow="hidden"
                {...containerStyle}
                opacity={disabled ? 0.6 : 1}
            >
                {/* Decrement Button */}
                <Box
                    as="button"
                    type="button"
                    onClick={handleDecrement}
                    disabled={disabled || readOnly || currentValue <= min}
                    width={config.buttonSize}
                    height={config.height}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="transparent"
                    border="none"
                    cursor={disabled || readOnly || currentValue <= min ? 'not-allowed' : 'pointer'}
                    color={disabled || readOnly || currentValue <= min ? '#9ca3af' : '#374151'}
                    fontSize={20}
                    fontWeight={500}
                    whileHover={
                        !disabled && !readOnly && currentValue > min
                            ? {backgroundColor: '#f3f4f6'}
                            : undefined
                    }
                    whileTap={
                        !disabled && !readOnly && currentValue > min
                            ? {transform: 'scale(0.95)'}
                            : undefined
                    }
                    tabIndex={-1}
                >
                    −
                </Box>

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
                <Box
                    as="button"
                    type="button"
                    onClick={handleIncrement}
                    disabled={disabled || readOnly || currentValue >= max}
                    width={config.buttonSize}
                    height={config.height}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="transparent"
                    border="none"
                    cursor={disabled || readOnly || currentValue >= max ? 'not-allowed' : 'pointer'}
                    color={disabled || readOnly || currentValue >= max ? '#9ca3af' : '#374151'}
                    fontSize={20}
                    fontWeight={500}
                    whileHover={
                        !disabled && !readOnly && currentValue < max
                            ? {backgroundColor: '#f3f4f6'}
                            : undefined
                    }
                    whileTap={
                        !disabled && !readOnly && currentValue < max
                            ? {transform: 'scale(0.95)'}
                            : undefined
                    }
                    tabIndex={-1}
                >
                    +
                </Box>
            </Box>

            {helperText && (
                <Box
                    fontSize={'1rem'}
                    color={error ? '#ef4444' : '#6b7280'}
                    marginTop={4}
                >
                    {helperText}
                </Box>
            )}
        </Box>
    );
};

export default NumberStepperInput;