import React from 'react';
import { Box } from '../../Box';

interface MobileCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  icon?: string;
  error?: string;
}

export const MobileCheckbox: React.FC<MobileCheckboxProps> = ({
  label,
  checked,
  onChange,
  description,
  icon,
  error,
}) => {
  return (
    <Box marginBottom="16px">
      <Box
        as="button"
        type="button"
        onClick={() => onChange(!checked)}
        width="100%"
        minHeight="64px"
        padding="16px 20px"
        backgroundColor={checked ? '#f0fff4' : '#ffffff'}
        border={
          error 
            ? '2px solid #e53e3e'
            : checked 
              ? '2px solid #38a169' 
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
          backgroundColor: checked ? '#e6fffa' : '#f7fafc',
          borderColor: checked ? '#2f855a' : '#cbd5e0'
        }}
        whileTap={{ transform: 'scale(0.98)' }}
      >
        {/* Checkbox Indicator */}
        <Box
          width="28px"
          height="28px"
          borderRadius="6px"
          border={checked ? '2px solid #38a169' : '2px solid #cbd5e0'}
          backgroundColor={checked ? '#38a169' : '#ffffff'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink="0"
          style={{ transition: 'all 0.2s ease' }}
        >
          {checked && (
            <Box
              color="#ffffff"
              fontSize="18px"
              fontWeight="700"
              style={{ 
                fontFamily: 'system-ui, sans-serif',
                lineHeight: '1'
              }}
            >
              ✓
            </Box>
          )}
        </Box>

        {/* Icon (if provided) */}
        {icon && (
          <Box
            fontSize="28px"
            flexShrink="0"
          >
            {icon}
          </Box>
        )}

        {/* Content */}
        <Box flex="1">
          <Box
            fontSize="18px"
            fontWeight="600"
            color={checked ? '#2f855a' : '#1a202c'}
            marginBottom={description ? "4px" : "0"}
          >
            {label}
          </Box>
          {description && (
            <Box
              fontSize="14px"
              color={checked ? '#2f855a' : '#718096'}
              lineHeight="1.4"
            >
              {description}
            </Box>
          )}
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