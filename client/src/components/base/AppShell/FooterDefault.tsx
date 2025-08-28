import Tab, { TabItem } from '../Tab'
import { BaseRoute } from './types'

interface FooterDefaultProps<T extends Record<string, BaseRoute>> {
    routes: T
    currentRoute: string
    navigateTo: (route: keyof T, params?: any) => void
    footerConfig?: {
        maxItems?: number
    }
    theme: {
        primaryColor: string
        backgroundColor: string
        navBackgroundColor: string
    }
}

export const FooterDefault = <T extends Record<string, BaseRoute>>({
    routes,
    currentRoute,
    navigateTo,
    footerConfig,
    theme
}: FooterDefaultProps<T>) => {
    const { maxItems = 3 } = footerConfig || {}

    // Get footer nav items (mobile only) - formatted as TabItem[]
    const footerNavItems: TabItem[] = Object.entries(routes)
        .filter(([_, route]) => route.showInFooter !== false)
        .slice(0, maxItems)
        .map(([path, route]) => ({
            id: path,
            label: route.label,
            icon: route.icon
            // content is optional since we're using tabBarOnly
        }))

    return (
        <Tab
            items={footerNavItems}
            activeTab={currentRoute}
            onTabChange={(tabId) => navigateTo(tabId as keyof T, {} as any)}
            variant="underline"
            size="small"
            fullWidth
            centered
            tabBarOnly
            iconSize={'1.5rem'}
            fontSize={'0.7rem'}
            iconLayout={'column'}
            activeColor={'rgba(255,255,255,1)'}
            inactiveColor="rgba(255,255,255,0.5)"
            tabBarStyle={{background:theme.primaryColor, borderRadius:0}}
        />
    )
}

export default FooterDefault