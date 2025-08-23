// Create routes configuration
import {createRoutes} from "@/components/base/AppShell";
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
    FaEdit
} from "react-icons/fa";

// Import page components
import Dashboard from "@/pages/Dashboard";
import PropertiesList from "@/pages/PropertiesList";
import PropertyEdit from "@/pages/PropertyEdit";
import Availability from "@/pages/Availability";
import Reservations from "@/pages/Reservations";
import Inbox from "@/pages/Inbox";
import Reviews from "@/pages/Reviews";
import Finance from "@/pages/Finance";
import Support from "@/pages/Support";
import LandingPage from "@/pages/LandingPage";

export const routes = createRoutes({
    home: {
        component: LandingPage,
        icon: <FaHome/>,
        label: 'Home',
        showInNav: true,
        showInHeader: true,
        showInFooter: true
    },
    dashboard: {
        component: Dashboard,
        icon: <FaTachometerAlt />,
        label: 'Dashboard',
        showInNav: true,
        showInHeader: true,
        showInFooter: true
    },
    properties: {
        component: PropertiesList,
        icon: <FaBuilding />,
        label: 'Properties',
        showInNav: true,
        showInHeader: true,
        showInFooter: true
    },
    'property-add': {
        component: PropertyEdit,
        icon: <FaPlus />,
        label: 'Add Property',
        showInNav: false,
        showInHeader: false,
        showInFooter: false
    },
    'property-edit': {
        component: PropertyEdit,
        icon: <FaEdit />,
        label: 'Edit Property',
        showInNav: false,
        showInHeader: false,
        showInFooter: false
    },
    availability: {
        component: Availability,
        icon: <FaCalendarAlt />,
        label: 'Availability',
        showInNav: true,
        showInHeader: true,
        showInFooter: false
    },
    reservations: {
        component: Reservations,
        icon: <FaClipboardList />,
        label: 'Reservations',
        showInNav: true,
        showInHeader: true,
        showInFooter: true
    },
    inbox: {
        component: Inbox,
        icon: <FaEnvelope />,
        label: 'Messages',
        showInNav: true,
        showInHeader: true,
        showInFooter: false
    },
    reviews: {
        component: Reviews,
        icon: <FaStar />,
        label: 'Reviews',
        showInNav: true,
        showInHeader: false,
        showInFooter: false
    },
    finance: {
        component: Finance,
        icon: <FaChartLine />,
        label: 'Finance',
        showInNav: true,
        showInHeader: false,
        showInFooter: false
    },
    support: {
        component: Support,
        icon: <FaQuestionCircle />,
        label: 'Support',
        showInNav: true,
        showInHeader: false,
        showInFooter: false
    }
})