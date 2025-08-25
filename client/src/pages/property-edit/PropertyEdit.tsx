import React, { useMemo, useCallback } from 'react'
import { WizardMode, WizardStep } from '@/components/base/Wizard'
import TabMode from './TabMode'
import { useAppShellRoutes } from "@/Routes.tsx"
import {
    FaBed,
    FaBuilding,
    FaCamera,
    FaCog,
    FaDollarSign,
    FaGavel,
    FaMapMarkerAlt,
    FaWifi
} from 'react-icons/fa'

// Import tab components for wizard steps
import DetailsTab from './DetailsTab'
import LocationTab from './LocationTab'
import LayoutTab from './LayoutTab'
import AmenitiesTab from './AmenitiesTab'
import PhotosTab from './PhotosTab'
import ServicesTab from './ServicesTab'
import RulesTab from './RulesTab'
import PricingTab from './PricingTab'

type TabId = 'details' | 'location' | 'layout' | 'amenities' | 'photos' | 'services' | 'rules' | 'pricing'

interface PropertyEditProps {
    propertyId?: string
    tab?: TabId
    mode?: 'view' | 'edit'
}

const PropertyEdit: React.FC<PropertyEditProps> = (props) => {
    const { navigateTo, currentParams } = useAppShellRoutes()

    // Combine props from navigation and URL query parameters
    const params = { ...props, ...currentParams }

    // Define wizard steps configuration - memoized to prevent re-renders
    const wizardSteps = useMemo((): WizardStep[] => [
        {
            id: 'details',
            title: 'Property Details',
            description: 'Basic information about your property',
            icon: <FaBuilding />,
            component: DetailsTab,
            isRequired: true
        },
        {
            id: 'location',
            title: 'Location',
            description: 'Where is your property located?',
            icon: <FaMapMarkerAlt />,
            component: LocationTab,
            isRequired: true
        },
        {
            id: 'layout',
            title: 'Layout & Rooms',
            description: 'Bedrooms, bathrooms, and layout details',
            icon: <FaBed />,
            component: LayoutTab,
            isRequired: true
        },
        {
            id: 'amenities',
            title: 'Amenities',
            description: 'What amenities does your property offer?',
            icon: <FaWifi />,
            component: AmenitiesTab,
            isRequired: true
        },
        {
            id: 'photos',
            title: 'Photos',
            description: 'Upload photos of your property (optional)',
            icon: <FaCamera />,
            component: PhotosTab,
            isOptional: true
        },
        {
            id: 'services',
            title: 'Services',
            description: 'Additional services you provide',
            icon: <FaCog />,
            component: ServicesTab,
            isRequired: true
        },
        {
            id: 'rules',
            title: 'House Rules',
            description: 'Set rules and policies for guests',
            icon: <FaGavel />,
            component: RulesTab,
            isRequired: true
        },
        {
            id: 'pricing',
            title: 'Pricing',
            description: 'Set your rental rates and pricing',
            icon: <FaDollarSign />,
            component: PricingTab,
            isRequired: true
        }
    ], [])

    const handleWizardComplete = useCallback((propertyId: string) => {
        // Navigate to edit mode with the new property ID
        navigateTo('property-edit', { propertyId })
    }, [navigateTo])

    const handleWizardCancel = useCallback(() => {
        // Navigate back to properties list
        navigateTo('properties', {})
    }, [navigateTo])

    const handleTabModeBack = useCallback(() => {
        // Navigate back to properties list
        navigateTo('properties', {})
    }, [navigateTo])

    // Route between WizardMode (creation) and TabMode (editing)
    if (params.propertyId === 'new') {
        // Creation Mode: Use Wizard
        return (
            <WizardMode
                steps={wizardSteps}
                propertyId={params.propertyId}
                onComplete={handleWizardComplete}
                onBack={handleWizardCancel}
                onCancel={handleWizardCancel}
            />
        )
    } else {
        // Editing Mode: Use Tabs
        return (
            <TabMode
                propertyId={params.propertyId || ''}
                initialTab={params.tab}
                onBack={handleTabModeBack}
            />
        )
    }
}

export default PropertyEdit