import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box } from '@/components/Box';
import { NumberStepperInput } from '@/components/NumberStepperInput';
import { 
  FaDollarSign, 
  FaUsers, 
  FaShoppingCart, 
  FaPercent, 
  FaClock, 
  FaWeight,
  FaRuler,
  FaThermometerHalf,
  FaTachometerAlt,
  FaBatteryHalf
} from 'react-icons/fa';

function NumberStepperExample() {
  // State for controlled examples
  const [controlledValue1, setControlledValue1] = useState(100);
  const [controlledValue2, setControlledValue2] = useState(25.50);
  const [controlledValue3, setControlledValue3] = useState(1000);
  const [controlledValue4, setControlledValue4] = useState(5);
  const [controlledValue5, setControlledValue5] = useState(0);
  const [controlledValue6, setControlledValue6] = useState(50);
  
  // Form submission example
  const [formData, setFormData] = useState<Record<string, number>>({});
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const values: Record<string, number> = {};
    
    // Collect form values
    values.quantity = controlledValue4;
    values.price = controlledValue2;
    values.discount = controlledValue6;
    
    setFormData(values);
  };
  
  return (
    <Box padding={20} paddingMd={40} maxWidth={1200} margin="0 auto">
      {/* Header */}
      <Box marginBottom={40}>
        <Box
          as="h1"
          fontSize={28}
          fontSizeMd={36}
          fontWeight={700}
          color="#1a202c"
          marginBottom={12}
        >
          NumberStepperInput Component
        </Box>
        <Box color="#718096" fontSize={16} lineHeight={1.6}>
          A comprehensive, mobile-friendly number input component with increment/decrement buttons,
          flexible formatting options, and full form integration support.
        </Box>
      </Box>
      
      {/* Basic Examples */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Basic Examples
        </Box>
        
        <Box display="grid" gridTemplateColumnsMd="1fr 1fr" gap={24}>
          {/* Default Integer */}
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Default Integer Stepper
            </Box>
            <NumberStepperInput
              defaultValue={10}
              step={1}
              min={0}
              max={100}
              label="Quantity"
              icon={FaShoppingCart}
              helperText="Select a quantity between 0 and 100"
            />
          </Box>
          
          {/* Controlled Value */}
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Controlled Value (Current: {controlledValue1})
            </Box>
            <NumberStepperInput
              value={controlledValue1}
              onChange={setControlledValue1}
              step={5}
              min={0}
              max={500}
              label="Controlled Input"
            />
          </Box>
        </Box>
      </Box>
      
      {/* Currency Formatting */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Currency Formatting
        </Box>
        
        <Box display="grid" gridTemplateColumnsMd="1fr 1fr" gap={24}>
          {/* USD Currency */}
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              USD Price Input
            </Box>
            <NumberStepperInput
              value={controlledValue2}
              onChange={setControlledValue2}
              format="currency"
              currency="$"
              currencyPosition="prefix"
              decimalPlaces={2}
              step={0.5}
              min={0}
              max={999.99}
              label="Product Price"
              size="large"
            />
          </Box>
          
          {/* EUR Currency with Suffix */}
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              EUR Price with Suffix Position
            </Box>
            <NumberStepperInput
              defaultValue={49.99}
              format="currency"
              currency="€"
              currencyPosition="suffix"
              decimalPlaces={2}
              step={1}
              min={0}
              label="European Price"
              size="large"
            />
          </Box>
          
          {/* Custom Currency */}
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              AED Currency
            </Box>
            <NumberStepperInput
              defaultValue={250}
              format="currency"
              currency="AED "
              currencyPosition="prefix"
              decimalPlaces={0}
              step={10}
              min={0}
              label="UAE Dirham"
            />
          </Box>
          
          {/* Large Numbers with Thousands Separator */}
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Large Number Formatting
            </Box>
            <NumberStepperInput
              value={controlledValue3}
              onChange={setControlledValue3}
              format="integer"
              thousandsSeparator=","
              step={100}
              min={0}
              max={1000000}
              label="Annual Revenue"
            />
          </Box>
        </Box>
      </Box>
      
      {/* Decimal Numbers */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Decimal Numbers
        </Box>
        
        <Box display="grid" gridTemplateColumnsMd="1fr 1fr 1fr" gap={24}>
          {/* Decimal with 1 place */}
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              1 Decimal Place
            </Box>
            <NumberStepperInput
              defaultValue={4.5}
              format="decimal"
              decimalPlaces={1}
              step={0.1}
              min={0}
              max={10}
              label="Rating"
            />
          </Box>
          
          {/* Decimal with 3 places */}
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              3 Decimal Places
            </Box>
            <NumberStepperInput
              defaultValue={1.234}
              format="decimal"
              decimalPlaces={3}
              step={0.001}
              min={0}
              label="Precision Value"
            />
          </Box>
          
          {/* Custom Separators */}
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              European Format (comma decimal)
            </Box>
            <NumberStepperInput
              defaultValue={1234.56}
              format="decimal"
              decimalPlaces={2}
              thousandsSeparator="."
              decimalSeparator=","
              step={0.01}
              label="European Number"
            />
          </Box>
        </Box>
      </Box>
      
      {/* Different Sizes */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Size Variations
        </Box>
        
        <Box display="grid" gridTemplateColumnsMd="1fr 1fr 1fr" gap={24}>
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Small Size
            </Box>
            <NumberStepperInput
              defaultValue={5}
              size="small"
              step={1}
              label="Small Input"
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Medium Size (Default)
            </Box>
            <NumberStepperInput
              defaultValue={10}
              size="medium"
              step={1}
              label="Medium Input"
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Large Size
            </Box>
            <NumberStepperInput
              defaultValue={15}
              size="large"
              step={1}
              label="Large Input"
            />
          </Box>
        </Box>
      </Box>
      
      {/* Different Variants */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Style Variants
        </Box>
        
        <Box display="grid" gridTemplateColumnsMd="1fr 1fr 1fr" gap={24}>
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Default Variant
            </Box>
            <NumberStepperInput
              defaultValue={20}
              variant="default"
              step={1}
              label="Default Style"
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Outlined Variant
            </Box>
            <NumberStepperInput
              defaultValue={30}
              variant="outlined"
              step={1}
              label="Outlined Style"
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Filled Variant
            </Box>
            <NumberStepperInput
              defaultValue={40}
              variant="filled"
              step={1}
              label="Filled Style"
            />
          </Box>
        </Box>
      </Box>
      
      {/* Step Variations */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Different Step Values
        </Box>
        
        <Box display="grid" gridTemplateColumnsMd="1fr 1fr 1fr" gap={24}>
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Step by 0.25
            </Box>
            <NumberStepperInput
              defaultValue={1}
              step={0.25}
              format="decimal"
              decimalPlaces={2}
              min={0}
              max={10}
              label="Quarter Steps"
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Step by 10
            </Box>
            <NumberStepperInput
              defaultValue={50}
              step={10}
              min={0}
              max={200}
              label="Tens"
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Step by 100
            </Box>
            <NumberStepperInput
              defaultValue={500}
              step={100}
              min={0}
              max={10000}
              label="Hundreds"
            />
          </Box>
        </Box>
      </Box>
      
      {/* States */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Different States
        </Box>
        
        <Box display="grid" gridTemplateColumnsMd="1fr 1fr 1fr" gap={24}>
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Disabled State
            </Box>
            <NumberStepperInput
              defaultValue={50}
              disabled
              label="Disabled Input"
              helperText="This input is disabled"
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Read-only State
            </Box>
            <NumberStepperInput
              defaultValue={75}
              readOnly
              label="Read-only Input"
              helperText="This input is read-only"
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Error State
            </Box>
            <NumberStepperInput
              defaultValue={-5}
              error
              label="Error Input"
              helperText="Value must be positive"
            />
          </Box>
        </Box>
      </Box>
      
      {/* Boundaries Example */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Min/Max Boundaries
        </Box>
        
        <Box display="grid" gridTemplateColumnsMd="1fr 1fr" gap={24}>
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Percentage (0-100)
            </Box>
            <NumberStepperInput
              value={controlledValue6}
              onChange={setControlledValue6}
              step={5}
              min={0}
              max={100}
              format="integer"
              label="Completion Percentage"
              helperText={`Current: ${controlledValue6}%`}
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Age Range (18-120)
            </Box>
            <NumberStepperInput
              defaultValue={25}
              step={1}
              min={18}
              max={120}
              label="Age"
              helperText="Must be 18 or older"
            />
          </Box>
        </Box>
      </Box>
      
      {/* Form Integration Example */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Form Integration Example
        </Box>
        
        <Box
          as="form"
          onSubmit={handleFormSubmit}
          backgroundColor="#f7fafc"
          padding={24}
          borderRadius={8}
          border="1px solid #e2e8f0"
        >
          <Box display="grid" gridTemplateColumnsMd="1fr 1fr 1fr" gap={20} marginBottom={20}>
            <NumberStepperInput
              value={controlledValue4}
              onChange={setControlledValue4}
              name="quantity"
              label="Quantity"
              icon={FaUsers}
              step={1}
              min={1}
              max={100}
              required
            />
            
            <NumberStepperInput
              value={controlledValue2}
              onChange={setControlledValue2}
              name="price"
              label="Unit Price"
              format="currency"
              currency="$"
              decimalPlaces={2}
              step={0.5}
              min={0}
              required
            />
            
            <NumberStepperInput
              value={controlledValue6}
              onChange={setControlledValue6}
              name="discount"
              label="Discount %"
              step={5}
              min={0}
              max={100}
            />
          </Box>
          
          <Box display="flex" alignItems="center" gap={16}>
            <Box
              as="button"
              type="submit"
              padding="10px 20px"
              backgroundColor="#3b82f6"
              color="white"
              border="none"
              borderRadius={6}
              fontSize={16}
              fontWeight={500}
              cursor="pointer"
              whileHover={{ backgroundColor: '#2563eb' }}
            >
              Submit Order
            </Box>
            
            {Object.keys(formData).length > 0 && (
              <Box fontSize={16} color="#059669">
                Submitted: Qty: {formData.quantity}, Price: ${formData.price?.toFixed(2)}, Discount: {formData.discount}%
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Keyboard Navigation */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Features & Keyboard Navigation
        </Box>
        
        <Box backgroundColor="#f0f9ff" padding={20} borderRadius={8} border="1px solid #bfdbfe">
          <Box as="ul" style={{ paddingLeft: '1.25rem' }}>
            <Box as="li" marginBottom={8} color="#1e40af">
              <strong>Arrow Up/Down:</strong> Increment/decrement value when input is focused
            </Box>
            <Box as="li" marginBottom={8} color="#1e40af">
              <strong>Click +/- buttons:</strong> Increment/decrement by step value
            </Box>
            <Box as="li" marginBottom={8} color="#1e40af">
              <strong>Direct input:</strong> Type values directly, automatically formatted on blur
            </Box>
            <Box as="li" marginBottom={8} color="#1e40af">
              <strong>Min/Max boundaries:</strong> Automatically enforced, buttons disabled at limits
            </Box>
            <Box as="li" marginBottom={8} color="#1e40af">
              <strong>Mobile optimized:</strong> Large touch targets, appropriate input modes
            </Box>
            <Box as="li" color="#1e40af">
              <strong>Accessible:</strong> Full keyboard navigation, ARIA attributes, label associations
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Negative Numbers */}
      <Box marginBottom={40}>
        <Box
          as="h2"
          fontSize={20}
          fontSizeMd={24}
          fontWeight={600}
          color="#2d3748"
          marginBottom={20}
        >
          Negative Numbers Support
        </Box>
        
        <Box display="grid" gridTemplateColumnsMd="1fr 1fr" gap={24}>
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Temperature (-50 to 50)
            </Box>
            <NumberStepperInput
              value={controlledValue5}
              onChange={setControlledValue5}
              step={1}
              min={-50}
              max={50}
              format="integer"
              label="Temperature °C"
              helperText={`Current: ${controlledValue5}°C`}
            />
          </Box>
          
          <Box>
            <Box fontSize={16} fontWeight={500} color="#4a5568" marginBottom={8}>
              Profit/Loss
            </Box>
            <NumberStepperInput
              defaultValue={-250.50}
              step={10}
              min={-10000}
              max={10000}
              format="currency"
              currency="$"
              decimalPlaces={2}
              label="P&L Statement"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export const Route = createFileRoute('/examples/number-stepper')({
  component: NumberStepperExample,
});