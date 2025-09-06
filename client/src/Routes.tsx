// Create routes configuration
import {createRoutes, useAppShell} from "@/components/base/AppShell";
import {
    FaHome,
    FaTachometerAlt,
    FaBuilding,
    FaCalendarAlt,
    FaClipboardList,
    FaEnvelope,
    FaStar,
    FaChartLine,
    FaQuestionCircle,
    FaPlus,
    FaEdit,
    FaDollarSign,
    FaTags,
    FaShoppingCart,
    FaCreditCard,
    FaHistory
} from "react-icons/fa";

// Import page components
import Dashboard from "@/pages/Dashboard";
import PropertiesList from "@/pages/PropertiesList";
import PropertyManager from "@/pages/property/PropertyManager";
import AvailabilityManager from "@/pages/availability/AvailabilityManager";
import Reservations from "@/pages/Reservations";
import Inbox from "@/pages/Inbox";
import Reviews from "@/pages/Reviews";
import Finance from "@/pages/Finance";
import Support from "@/pages/Support";
import LandingPage from "@/pages/LandingPage";
import PropertyDetail from "@/pages/PropertyDetail";

// Revenue management pages
import RatePlans from "@/pages/revenue/RatePlans";
import PricingCalendar from "@/pages/pricing/PricingCalendar";
import RatePlanManager from "@/pages/revenue/RatePlanManager";

// Booking pages
import BookingConfirmation from "@/pages/booking/BookingConfirmation";
import BookingPayment from "@/pages/booking/BookingPayment";
import MyBookings from "@/pages/booking/MyBookings";

export const routes = createRoutes({
    home: {
        component: LandingPage,
        icon: <FaHome/>,
        label: 'Home',
        showInNav: true,
        showInHeader: false,
        showInFooter: true,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // Public page - all roles
    },
    dashboard: {
        component: Dashboard,
        icon: <FaTachometerAlt />,
        label: 'Dashboard',
        showInNav: true,
        showInHeader: true,
        showInFooter: true,
        roles: ['HomeOwner', 'Manager']  // Property managers only
    },
    properties: {
        component: PropertiesList,
        icon: <FaBuilding />,
        label: 'Properties',
        showInNav: true,
        showInHeader: true,
        showInFooter: true,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // All roles can browse (with different capabilities)
    },
    'property-view': {
        component: ({ id }: { id: string }) => <PropertyDetail propertyId={id} />,
        icon: <FaBuilding />,
        label: 'Property Details',
        showInNav: false,
        showInHeader: false,
        showInFooter: false,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // All roles can view property details
    },
    'property-create': {
        component: () => <PropertyManager propertyId="new" />,
        icon: <FaPlus />,
        label: 'Create Property',
        showInNav: false,
        showInHeader: false,
        showInFooter: false,
        roles: ['HomeOwner', 'Manager']  // Only homeowners and managers can create
    },
    'property-edit': {
        component: ({ id }: { id: string }) => <PropertyManager propertyId={id} />,
        icon: <FaEdit />,
        label: 'Edit Property',
        showInNav: false,
        showInHeader: false,
        showInFooter: false,
        roles: ['HomeOwner', 'Manager']  // Only homeowners and managers can edit
    },
    availability: {
        component: AvailabilityManager,
        icon: <FaCalendarAlt />,
        label: 'Availability',
        showInNav: true,
        showInHeader: true,
        showInFooter: false,
        roles: ['HomeOwner', 'Manager']  // Host-only feature
    },
    reservations: {
        component: Reservations,
        icon: <FaClipboardList />,
        label: 'Reservations',
        showInNav: true,
        showInHeader: false,
        showInFooter: true,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // All roles (different views)
    },
    inbox: {
        component: Inbox,
        icon: <FaEnvelope />,
        label: 'Messages',
        showInNav: true,
        showInHeader: false,
        showInFooter: false,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // All roles can message
    },
    reviews: {
        component: Reviews,
        icon: <FaStar />,
        label: 'Reviews',
        showInNav: true,
        showInHeader: false,
        showInFooter: false,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // All roles can view/manage reviews
    },
    finance: {
        component: Finance,
        icon: <FaChartLine />,
        label: 'Finance',
        showInNav: true,
        showInHeader: false,
        showInFooter: false,
        roles: ['HomeOwner', 'Manager']  // Host/Manager financial data only
    },
    support: {
        component: Support,
        icon: <FaQuestionCircle />,
        label: 'Support',
        showInNav: true,
        showInHeader: false,
        showInFooter: false,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // All roles can access support
    },
    'rate-plans': {
        component: RatePlans,
        icon: <FaTags />,
        label: 'Rate Plans',
        showInNav: true,
        showInHeader: true,
        showInFooter: false,
        roles: ['HomeOwner', 'Manager']  // Revenue management - Host/Manager only
    },
    'pricing-calendar': {
        component: PricingCalendar,
        icon: <FaDollarSign />,
        label: 'Pricing',
        showInNav: true,
        showInHeader: true,
        showInFooter: false,
        roles: ['HomeOwner', 'Manager']  // Pricing management - Host/Manager only
    },
    'rate-plan-create': {
        component: () => <RatePlanManager ratePlanId="new" />,
        icon: <FaPlus />,
        label: 'Create Rate Plan',
        showInNav: false,
        showInHeader: false,
        showInFooter: false,
        roles: ['HomeOwner', 'Manager']  // Revenue management - Host/Manager only
    },
    'rate-plan-edit': {
        component: ({ id }: { id: string }) => <RatePlanManager ratePlanId={id} />,
        icon: <FaEdit />,
        label: 'Edit Rate Plan',
        showInNav: false,
        showInHeader: false,
        showInFooter: false,
        roles: ['HomeOwner', 'Manager']  // Revenue management - Host/Manager only
    },
    'booking-confirmation': {
        component: BookingConfirmation,
        icon: <FaShoppingCart />,
        label: 'Booking Confirmation',
        showInNav: false,
        showInHeader: false,
        showInFooter: false,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // All roles can make bookings
    },
    'booking-payment': {
        component: BookingPayment,
        icon: <FaCreditCard />,
        label: 'Payment',
        showInNav: false,
        showInHeader: false,
        showInFooter: false,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // All roles can make bookings
    },
    'my-bookings': {
        component: MyBookings,
        icon: <FaHistory />,
        label: 'My Bookings',
        showInNav: true,
        showInHeader: false,
        showInFooter: true,
        roles: ['Tenant', 'HomeOwner', 'Manager']  // All roles can view their bookings
    }
})

export const useAppShellRoutes = () => {
    return useAppShell<typeof routes>()
}