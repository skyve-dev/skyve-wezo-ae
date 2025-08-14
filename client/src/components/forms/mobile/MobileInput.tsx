import React from 'react';
import { Box } from '../../Box';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  required,
  ...inputProps
}) => {
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
        as="input"
        width="100%"
        minHeight="56px"
        padding="16px 20px"
        fontSize="18px"
        borderRadius="12px"
        border={error ? '2px solid #e53e3e' : '2px solid #e2e8f0'}
        backgroundColor="#ffffff"
        color="#1a202c"
        style={{
          outline: 'none',
          transition: 'all 0.2s ease',
          WebkitAppearance: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? '#e53e3e' : '#3182ce';
          e.target.style.boxShadow = error 
            ? '0 0 0 4px rgba(229, 62, 62, 0.2)' 
            : '0 0 0 4px rgba(49, 130, 206, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#e53e3e' : '#e2e8f0';
          e.target.style.boxShadow = 'none';
        }}
        {...inputProps}
      />
      
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