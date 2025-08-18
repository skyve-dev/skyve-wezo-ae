import React, { forwardRef, InputHTMLAttributes } from 'react';
import { Box } from './Box';
import { BoxProps } from '@/types/box';

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
                            color="#6b7280" 
                            display="flex" 
                            alignItems="center"
                            fontSize={config.iconSize}
                        >
                            <IconComponent size={config.iconSize} />
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