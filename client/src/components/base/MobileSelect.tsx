import {useCallback, useState} from 'react'
import {Box} from '@/components'
import SlidingDrawer from '@/components/base/SlidingDrawer.tsx'
import SelectionPicker from '@/components/base/SelectionPicker.tsx'
import Button from '@/components/base/Button.tsx'
import {IoIosCheckmark, IoIosArrowDown} from 'react-icons/io'

interface SelectOption<T = string> {
    value: T
    label: string
    disabled?: boolean
}

interface MobileSelectProps<T = string> {
    label: string
    value?: T
    options: SelectOption<T>[]
    onChange: (value: T) => void
    placeholder?: string
    disabled?: boolean
    helperText?: string
}

function MobileSelect<T = string>({ 
    label, 
    value, 
    options, 
    onChange, 
    placeholder = "Select an option",
    disabled = false,
    helperText 
}: MobileSelectProps<T>) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState<T | undefined>(value)

    // Find the current selected option for display
    const selectedOption = options.find(opt => opt.value === selectedValue)

    const handleDrawerOpen = useCallback(() => {
        if (!disabled) {
            setIsDrawerOpen(true)
        }
    }, [disabled])

    const handleDrawerClose = useCallback(() => {
        setIsDrawerOpen(false)
    }, [])

    const handleSelectionChange = useCallback((selectedIds: string | number | (string | number)[]) => {
        // Get the first selected ID since we're in single-select mode
        const selectedId = Array.isArray(selectedIds) ? selectedIds[0] : selectedIds
        const selectedOption = options.find(opt => String(opt.value) === String(selectedId))
        
        if (selectedOption) {
            setSelectedValue(selectedOption.value)
            onChange(selectedOption.value)
            setIsDrawerOpen(false)
        }
    }, [options, onChange])

    const handleConfirm = useCallback(() => {
        setIsDrawerOpen(false)
    }, [])

    return (
        <>
            <Box >
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    {label}
                </label>
                <Box
                    as="button"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    padding="0.75rem"
                    border={disabled ? "1px solid #e5e7eb" : "1px solid #d1d5db"}
                    borderRadius="4px"
                    backgroundColor={disabled ? "#f9fafb" : "white"}
                    color={disabled ? "#9ca3af" : selectedOption ? "#111827" : "#6b7280"}
                    cursor={disabled ? "not-allowed" : "pointer"}
                    onClick={handleDrawerOpen}
                    style={{
                        fontSize: '0.875rem',
                        textAlign: 'left'
                    }}
                >
                    <span>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <IoIosArrowDown 
                        style={{
                            fontSize: '0.75rem',
                            color: disabled ? '#9ca3af' : '#6b7280',
                            transform: isDrawerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                        }}
                    />
                </Box>
                {helperText && (
                    <Box fontSize="0.75rem" color="#6b7280" marginTop="0.25rem">
                        {helperText}
                    </Box>
                )}
            </Box>

            <SlidingDrawer
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
                side="bottom"
                contentStyles={{maxWidth:600,marginLeft:'auto',marginRight:'auto',borderTopLeftRadius:'1rem',borderTopRightRadius:'1rem'}}
                height="60%"
            >
                <Box padding="1rem" height="100%" display="flex" flexDirection="column">
                    <Box flex="1" overflowY="auto">
                        <SelectionPicker
                            data={options}
                            idAccessor={(option) => String(option.value)}
                            labelAccessor={(option) => option.label}
                            value={selectedValue ? String(selectedValue) : undefined}
                            onChange={handleSelectionChange}
                            isMultiSelect={false}
                            isItemDisabled={(option) => option.disabled || false}
                            width="100%"
                            itemStyles={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minHeight: '3rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            selectedItemStyles={{
                                backgroundColor: '#eff6ff',
                                borderColor: '#3b82f6',
                                color: '#1d4ed8'
                            }}
                            renderItem={(option, isSelected) => (
                                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                    <span style={{ 
                                        fontWeight: isSelected ? '600' : '400',
                                        color: option.disabled ? '#9ca3af' : (isSelected ? '#1d4ed8' : '#374151')
                                    }}>
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <IoIosCheckmark style={{ color: '#3b82f6', fontSize: '0.875rem' }} />
                                    )}
                                </Box>
                            )}
                        />
                    </Box>
                    
                    <Box paddingTop="1rem" borderTop="1px solid #e5e7eb">
                        <Button
                            label="Confirm Selection"
                            onClick={handleConfirm}
                            variant="promoted"
                            width="100%"
                        />
                    </Box>
                </Box>
            </SlidingDrawer>
        </>
    )
}

export default MobileSelect