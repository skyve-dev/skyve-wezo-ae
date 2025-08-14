import React from 'react';
import { Box } from '../../Box';

interface MobileRadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface MobileRadioGroupProps {
  label: string;
  value: string;
  options: MobileRadioOption[];
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const MobileRadioGroup: React.FC<MobileRadioGroupProps> = ({
  label,
  value,
  options,
  onChange,
  error,
  required,
}) => {
  return (
    <Box marginBottom="24px">
      <Box 
        as="label"
        display="block"
        fontSize="18px"
        fontWeight="600"
        color="#1a202c"
        marginBottom="16px"
        lineHeight="1.4"
      >
        {label}
        {required && (
          <Box as="span" color="#e53e3e" marginLeft="4px" fontSize="18px">
            *
          </Box>
        )}
      </Box>
      
      <Box display="flex" flexDirection="column" gap="12px">
        {options.map((option) => (
          <Box
            key={option.value}
            as="button"
            type="button"
            onClick={() => onChange(option.value)}
            width="100%"
            minHeight="64px"
            padding="16px 20px"
            backgroundColor={value === option.value ? '#ebf8ff' : '#ffffff'}
            border={
              error && !value 
                ? '2px solid #e53e3e'
                : value === option.value 
                  ? '2px solid #3182ce' 
                  : '2px solid #e2e8f0'
            }
            borderRadius="12px"
            cursor="pointer"
            textAlign="left"
            display="flex"
            alignItems="center"
            gap="16px"
            style={{
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
            whileHover={{ 
              backgroundColor: value === option.value ? '#bee3f8' : '#f7fafc',
              borderColor: value === option.value ? '#2c5aa0' : '#cbd5e0'
            }}
            whileTap={{ transform: 'scale(0.98)' }}
          >
            {/* Radio Indicator */}
            <Box
              width="24px"
              height="24px"
              borderRadius="50%"
              border={value === option.value ? '2px solid #3182ce' : '2px solid #cbd5e0'}
              backgroundColor={value === option.value ? '#3182ce' : '#ffffff'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink="0"
              style={{ transition: 'all 0.2s ease' }}
            >
              {value === option.value && (
                <Box
                  width="8px"
                  height="8px"
                  borderRadius="50%"
                  backgroundColor="#ffffff"
                />
              )}
            </Box>

            {/* Icon (if provided) */}
            {option.icon && (
              <Box
                fontSize="28px"
                flexShrink="0"
              >
                {option.icon}
              </Box>
            )}

            {/* Content */}
            <Box flex="1">
              <Box
                fontSize="18px"
                fontWeight="600"
                color={value === option.value ? '#2b6cb0' : '#1a202c'}
                marginBottom={option.description ? "4px" : "0"}
              >
                {option.label}
              </Box>
              {option.description && (
                <Box
                  fontSize="14px"
                  color={value === option.value ? '#2c5aa0' : '#718096'}
                  lineHeight="1.4"
                >
                  {option.description}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
      
      {error && (
        <Box 
          fontSize="16px" 
          color="#e53e3e" 
          marginTop="8px"
          fontWeight="500"
        >
          {error}
        </Box>
      )}
    </Box>
  );
};