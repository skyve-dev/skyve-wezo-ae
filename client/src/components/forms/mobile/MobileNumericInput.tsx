import React from 'react';
import { Box } from '../../Box';

interface MobileNumericInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
}

export const MobileNumericInput: React.FC<MobileNumericInputProps> = ({
  label,
  value,
  min = 0,
  max = 99,
  step = 1,
  unit = '',
  onChange,
  error,
  required,
}) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  return (
    <Box marginBottom="24px">
      <Box 
        as="label"
        display="block"
        fontSize="18px"
        fontWeight="600"
        color="#1a202c"
        marginBottom="12px"
        lineHeight="1.4"
      >
        {label}
        {required && (
          <Box as="span" color="#e53e3e" marginLeft="4px" fontSize="18px">
            *
          </Box>
        )}
      </Box>
      
      <Box 
        display="flex" 
        alignItems="center" 
        backgroundColor="#ffffff"
        borderRadius="12px"
        border={error ? '2px solid #e53e3e' : '2px solid #e2e8f0'}
        padding="4px"
        style={{ transition: 'border-color 0.2s ease' }}
      >
        {/* Decrement Button */}
        <Box
          as="button"
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          minWidth="56px"
          minHeight="56px"
          borderRadius="8px"
          backgroundColor={value <= min ? '#f7fafc' : '#edf2f7'}
          border="none"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="24px"
          fontWeight="600"
          color={value <= min ? '#a0aec0' : '#2d3748'}
          cursor={value <= min ? 'not-allowed' : 'pointer'}
          style={{
            transition: 'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          whileHover={value > min ? { backgroundColor: '#e2e8f0' } : {}}
          whileTap={value > min ? { transform: 'scale(0.95)' } : {}}
        >
          −
        </Box>

        {/* Value Display */}
        <Box
          flex="1"
          textAlign="center"
          fontSize="20px"
          fontWeight="600"
          color="#1a202c"
          padding="16px 8px"
          minHeight="56px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {value} {unit}
        </Box>

        {/* Increment Button */}
        <Box
          as="button"
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          minWidth="56px"
          minHeight="56px"
          borderRadius="8px"
          backgroundColor={value >= max ? '#f7fafc' : '#edf2f7'}
          border="none"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="24px"
          fontWeight="600"
          color={value >= max ? '#a0aec0' : '#2d3748'}
          cursor={value >= max ? 'not-allowed' : 'pointer'}
          style={{
            transition: 'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          whileHover={value < max ? { backgroundColor: '#e2e8f0' } : {}}
          whileTap={value < max ? { transform: 'scale(0.95)' } : {}}
        >
          +
        </Box>
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