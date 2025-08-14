import React from 'react';
import { Box } from '../../Box';

interface MobileMultiSelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface MobileMultiSelectProps {
  label: string;
  options: MobileMultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  error?: string;
  required?: boolean;
  maxColumns?: 1 | 2 | 3;
}

export const MobileMultiSelect: React.FC<MobileMultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  error,
  required,
  maxColumns = 2,
}) => {
  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const gridColumns = maxColumns === 1 ? '1fr' : maxColumns === 2 ? '1fr 1fr' : '1fr 1fr 1fr';

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
      
      <Box 
        display="grid" 
        gridTemplateColumns={gridColumns}
        gap="12px"
      >
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          
          return (
            <Box
              key={option.value}
              as="button"
              type="button"
              onClick={() => toggleOption(option.value)}
              minHeight="72px"
              padding="16px 12px"
              backgroundColor={isSelected ? '#f0fff4' : '#ffffff'}
              border={
                error && selectedValues.length === 0
                  ? '2px solid #e53e3e'
                  : isSelected 
                    ? '2px solid #38a169' 
                    : '2px solid #e2e8f0'
              }
              borderRadius="12px"
              cursor="pointer"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap="8px"
              style={{
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              whileHover={{ 
                backgroundColor: isSelected ? '#e6fffa' : '#f7fafc',
                borderColor: isSelected ? '#2f855a' : '#cbd5e0'
              }}
              whileTap={{ transform: 'scale(0.95)' }}
            >
              {/* Icon */}
              {option.icon && (
                <Box
                  fontSize="28px"
                  color={isSelected ? '#2f855a' : '#4a5568'}
                  style={{ transition: 'color 0.2s ease' }}
                >
                  {option.icon}
                </Box>
              )}

              {/* Label */}
              <Box
                fontSize="16px"
                fontWeight="600"
                color={isSelected ? '#2f855a' : '#1a202c'}
                textAlign="center"
                lineHeight="1.3"
                style={{ transition: 'color 0.2s ease' }}
              >
                {option.label}
              </Box>

              {/* Selection Indicator */}
              {isSelected && (
                <Box
                  width="20px"
                  height="20px"
                  borderRadius="50%"
                  backgroundColor="#38a169"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position="absolute"
                  top="8px"
                  right="8px"
                >
                  <Box
                    color="#ffffff"
                    fontSize="12px"
                    fontWeight="700"
                  >
                    ✓
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      
      {selectedValues.length > 0 && (
        <Box 
          fontSize="14px" 
          color="#4a5568" 
          marginTop="12px"
          fontWeight="500"
        >
          {selectedValues.length} selected
        </Box>
      )}
      
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