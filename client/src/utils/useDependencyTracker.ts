import { useRef, useEffect } from 'react'

interface DependencyTrackerOptions {
    /** Optional label to identify which hook/component is being tracked */
    label?: string
    /** Whether to log unchanged dependencies (default: false) */
    logUnchanged?: boolean
    /** Whether to use console.group for cleaner output (default: true) */
    useGroup?: boolean
}

/**
 * Debug hook to track which dependencies are causing re-renders
 * 
 * @param dependencies Object with named dependencies to track
 * @param options Configuration options
 * 
 * @example
 * ```tsx
 * useDependencyTracker({
 *   currentStep,
 *   totalSteps,
 *   handleNext,
 *   steps
 * }, { label: 'WizardContent useEffect' })
 * ```
 */
export const useDependencyTracker = (
    dependencies: Record<string, any>,
    options: DependencyTrackerOptions = {}
) => {
    const {
        label = 'Dependencies',
        logUnchanged = false,
        useGroup = true
    } = options

    const previousDeps = useRef<Record<string, any>>({})
    const renderCount = useRef(0)

    useEffect(() => {
        renderCount.current++
        const changes: Array<{
            name: string
            changed: boolean
            previousValue: any
            currentValue: any
        }> = []

        // Compare each dependency
        Object.keys(dependencies).forEach(key => {
            const currentValue = dependencies[key]
            const previousValue = previousDeps.current[key]
            const changed = !Object.is(previousValue, currentValue)

            changes.push({
                name: key,
                changed,
                previousValue,
                currentValue
            })
        })

        // Filter changes based on options
        const changedDeps = changes.filter(change => change.changed)
        const unchangedDeps = changes.filter(change => !change.changed)

        // Only log if there are changes or if this is the first render
        if (changedDeps.length > 0 || renderCount.current === 1) {
            const groupLabel = `🔄 [${label}] Render #${renderCount.current} - ${changedDeps.length} dependencies changed`

            if (useGroup) {
                console.group(groupLabel)
            } else {

            }



            // Log unchanged dependencies if requested
            if (logUnchanged && unchangedDeps.length > 0) {
                unchangedDeps.forEach(({ name, currentValue }) => {
                    console.log(
                        `%c✅ ${name}:%c ${getValueDescription(currentValue)} %c(unchanged)`,
                        'color: #10b981; font-weight: bold',
                        'color: #374151',
                        'color: #6b7280'
                    )
                })
            }

            if (useGroup) {
                console.groupEnd()
            }
        }

        // Update previous dependencies
        previousDeps.current = { ...dependencies }
    })
}

/**
 * Helper function to get a readable description of a value
 */
function getValueDescription(value: any): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'function') return '[Function]'
    if (Array.isArray(value)) return `[Array(${value.length})]`
    if (typeof value === 'object') return '[Object]'
    if (typeof value === 'string') return `"${value}"`
    return String(value)
}

export default useDependencyTracker