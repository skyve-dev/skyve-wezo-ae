import React, { createContext, useContext, useState, useRef, ReactNode, useCallback, useMemo } from 'react'
import type { ContentOptions, MountedContent, VisibilityMode } from './types'

interface DynamicContentState {
    header: ReactNode | null
    sideNav: ReactNode | null
    footer: ReactNode | null
}

interface VisibilityState {
    header: VisibilityMode
    sideNav: VisibilityMode
    footer: VisibilityMode
}

interface MountFunction {
    (content: ReactNode, options?: ContentOptions): () => void
}

interface DynamicContentContextType {
    content: DynamicContentState
    visibility: VisibilityState
    mountHeader: MountFunction
    mountSideNav: MountFunction
    mountFooter: MountFunction
}

const DynamicContentContext = createContext<DynamicContentContextType | undefined>(undefined)

interface DynamicContentProviderProps {
    children: ReactNode
}

export const DynamicContentProvider: React.FC<DynamicContentProviderProps> = ({ children }) => {
    const [content, setContent] = useState<DynamicContentState>({
        header: null,
        sideNav: null,
        footer: null
    })

    const [visibility, setVisibility] = useState<VisibilityState>({
        header: 'auto',
        sideNav: 'auto', 
        footer: 'auto'
    })

    // Stack-based storage for each area with options
    const headerStack = useRef<MountedContent[]>([])
    const sideNavStack = useRef<MountedContent[]>([])
    const footerStack = useRef<MountedContent[]>([])

    const idCounter = useRef(0)

    // Default options
    const defaultOptions: ContentOptions = { visibility: 'auto' }

    // Helper function to get the topmost content from a stack
    const getTopContent = (stack: MountedContent[]): ReactNode | null => {
        return stack.length > 0 ? stack[stack.length - 1].content : null
    }

    // Helper function to get the topmost options from a stack
    const getTopOptions = (stack: MountedContent[]): ContentOptions => {
        return stack.length > 0 ? stack[stack.length - 1].options : defaultOptions
    }

    // Helper function to remove an item from stack by ID
    const removeFromStack = (stack: MountedContent[], id: string): MountedContent[] => {
        return stack.filter(item => item.id !== id)
    }

    const mountHeader: MountFunction = useCallback((headerContent: ReactNode, options?: ContentOptions) => {
        const mountId = `header-${++idCounter.current}`
        const mergedOptions = { ...defaultOptions, ...options }
        
        // Add to header stack with options
        const newItem: MountedContent = { 
            id: mountId, 
            content: headerContent,
            options: mergedOptions
        }
        headerStack.current = [...headerStack.current, newItem]
        
        // Update displayed content and visibility to topmost item
        setContent(prev => ({ ...prev, header: getTopContent(headerStack.current) }))
        setVisibility(prev => ({ 
            ...prev, 
            header: getTopOptions(headerStack.current).visibility || 'auto'
        }))

        // Return cleanup function
        return () => {
            // Remove this specific item from the stack
            headerStack.current = removeFromStack(headerStack.current, mountId)
            
            // Update displayed content and visibility to new topmost item
            setContent(prev => ({ ...prev, header: getTopContent(headerStack.current) }))
            setVisibility(prev => ({ 
                ...prev, 
                header: getTopOptions(headerStack.current).visibility || 'auto'
            }))
        }
    }, [])

    const mountSideNav: MountFunction = useCallback((sideNavContent: ReactNode, options?: ContentOptions) => {
        const mountId = `sidenav-${++idCounter.current}`
        const mergedOptions = { ...defaultOptions, ...options }
        
        // Add to sideNav stack with options
        const newItem: MountedContent = { 
            id: mountId, 
            content: sideNavContent,
            options: mergedOptions
        }
        sideNavStack.current = [...sideNavStack.current, newItem]
        
        // Update displayed content and visibility to topmost item
        setContent(prev => ({ ...prev, sideNav: getTopContent(sideNavStack.current) }))
        setVisibility(prev => ({ 
            ...prev, 
            sideNav: getTopOptions(sideNavStack.current).visibility || 'auto'
        }))

        // Return cleanup function
        return () => {
            // Remove this specific item from the stack
            sideNavStack.current = removeFromStack(sideNavStack.current, mountId)
            
            // Update displayed content and visibility to new topmost item
            setContent(prev => ({ ...prev, sideNav: getTopContent(sideNavStack.current) }))
            setVisibility(prev => ({ 
                ...prev, 
                sideNav: getTopOptions(sideNavStack.current).visibility || 'auto'
            }))
        }
    }, [])

    const mountFooter: MountFunction = useCallback((footerContent: ReactNode, options?: ContentOptions) => {
        const mountId = `footer-${++idCounter.current}`
        const mergedOptions = { ...defaultOptions, ...options }
        
        // Add to footer stack with options
        const newItem: MountedContent = { 
            id: mountId, 
            content: footerContent,
            options: mergedOptions
        }
        footerStack.current = [...footerStack.current, newItem]
        
        // Update displayed content and visibility to topmost item
        setContent(prev => ({ ...prev, footer: getTopContent(footerStack.current) }))
        setVisibility(prev => ({ 
            ...prev, 
            footer: getTopOptions(footerStack.current).visibility || 'auto'
        }))

        // Return cleanup function
        return () => {
            // Remove this specific item from the stack
            footerStack.current = removeFromStack(footerStack.current, mountId)
            
            // Update displayed content and visibility to new topmost item
            setContent(prev => ({ ...prev, footer: getTopContent(footerStack.current) }))
            setVisibility(prev => ({ 
                ...prev, 
                footer: getTopOptions(footerStack.current).visibility || 'auto'
            }))
        }
    }, [])

    const contextValue: DynamicContentContextType = useMemo(() => ({
        content,
        visibility,
        mountHeader,
        mountSideNav,
        mountFooter
    }), [content, visibility, mountHeader, mountSideNav, mountFooter])

    return (
        <DynamicContentContext.Provider value={contextValue}>
            {children}
        </DynamicContentContext.Provider>
    )
}

export const useDynamicContent = (): DynamicContentContextType => {
    const context = useContext(DynamicContentContext)
    if (!context) {
        throw new Error('useDynamicContent must be used within a DynamicContentProvider')
    }
    return context
}

export default DynamicContentProvider