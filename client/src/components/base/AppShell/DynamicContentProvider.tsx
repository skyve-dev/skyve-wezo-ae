import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react'

interface DynamicContentState {
    header: ReactNode | null
    sideNav: ReactNode | null
    footer: ReactNode | null
}

interface MountFunction {
    (content: ReactNode): () => void
}

interface DynamicContentContextType {
    content: DynamicContentState
    mountHeader: MountFunction
    mountSideNav: MountFunction
    mountFooter: MountFunction
}

interface StackItem {
    id: string
    content: ReactNode
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

    // Stack-based storage for each area
    const headerStack = useRef<StackItem[]>([])
    const sideNavStack = useRef<StackItem[]>([])
    const footerStack = useRef<StackItem[]>([])

    const idCounter = useRef(0)

    // Helper function to get the topmost content from a stack
    const getTopContent = (stack: StackItem[]): ReactNode | null => {
        return stack.length > 0 ? stack[stack.length - 1].content : null
    }

    // Helper function to remove an item from stack by ID
    const removeFromStack = (stack: StackItem[], id: string): StackItem[] => {
        return stack.filter(item => item.id !== id)
    }

    const mountHeader: MountFunction = useCallback((headerContent: ReactNode) => {
        const mountId = `header-${++idCounter.current}`
        
        // Add to header stack
        const newItem: StackItem = { id: mountId, content: headerContent }
        headerStack.current = [...headerStack.current, newItem]
        
        // Update displayed content to topmost item
        setContent(prev => ({ ...prev, header: getTopContent(headerStack.current) }))

        // Return cleanup function
        return () => {
            // Remove this specific item from the stack
            headerStack.current = removeFromStack(headerStack.current, mountId)
            
            // Update displayed content to new topmost item (or null if stack empty)
            setContent(prev => ({ ...prev, header: getTopContent(headerStack.current) }))
        }
    }, [])

    const mountSideNav: MountFunction = useCallback((sideNavContent: ReactNode) => {
        const mountId = `sidenav-${++idCounter.current}`
        
        // Add to sideNav stack
        const newItem: StackItem = { id: mountId, content: sideNavContent }
        sideNavStack.current = [...sideNavStack.current, newItem]
        
        // Update displayed content to topmost item
        setContent(prev => ({ ...prev, sideNav: getTopContent(sideNavStack.current) }))

        // Return cleanup function
        return () => {
            // Remove this specific item from the stack
            sideNavStack.current = removeFromStack(sideNavStack.current, mountId)
            
            // Update displayed content to new topmost item (or null if stack empty)
            setContent(prev => ({ ...prev, sideNav: getTopContent(sideNavStack.current) }))
        }
    }, [])

    const mountFooter: MountFunction = useCallback((footerContent: ReactNode) => {
        const mountId = `footer-${++idCounter.current}`
        
        // Add to footer stack
        const newItem: StackItem = { id: mountId, content: footerContent }
        footerStack.current = [...footerStack.current, newItem]
        
        // Update displayed content to topmost item
        setContent(prev => ({ ...prev, footer: getTopContent(footerStack.current) }))

        // Return cleanup function
        return () => {
            // Remove this specific item from the stack
            footerStack.current = removeFromStack(footerStack.current, mountId)
            
            // Update displayed content to new topmost item (or null if stack empty)
            setContent(prev => ({ ...prev, footer: getTopContent(footerStack.current) }))
        }
    }, [])

    const contextValue: DynamicContentContextType = {
        content,
        mountHeader,
        mountSideNav,
        mountFooter
    }

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