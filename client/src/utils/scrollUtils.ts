/**
 * Scroll utility functions for preventing iOS background scrolling
 * Used by SlidingDrawer and PromiseDialogProvider to prevent page scroll
 * when modals/drawers are open
 */

const disableStyleId = 'disable-scroll-style'

/**
 * Disables page scrolling by adding overflow:hidden to html, body, and #root
 * This prevents iOS Safari from allowing background scrolling behind modals
 */
export function disableScroller(): void {
    // Don't add duplicate styles
    if (document.getElementById(disableStyleId)) {
        return
    }
    
    const style = document.createElement('style');
    style.id = disableStyleId;
    style.innerText = `html,body,#root{height:100%;overflow:hidden}`;
    document.head.append(style);
}

/**
 * Re-enables page scrolling by removing the overflow:hidden styles
 */
export function enableScroller(): void {
    const style = document.getElementById(disableStyleId);
    if (style) {
        style.remove();
    }
}

/**
 * Saves the current scroll position to a data attribute on the specified element
 * @param element - Element to save scroll position on
 * @param attributeName - Name of data attribute (default: 'data-scroll-y')
 */
export function saveScrollPosition(element: HTMLElement, attributeName: string = 'data-scroll-y'): void {
    element.setAttribute(attributeName, window.scrollY.toString())
}

/**
 * Restores scroll position from a data attribute on the specified element
 * @param element - Element to restore scroll position from
 * @param attributeName - Name of data attribute (default: 'data-scroll-y')
 */
export function restoreScrollPosition(element: HTMLElement, attributeName: string = 'data-scroll-y'): void {
    const savedPosition = element.getAttribute(attributeName)
    if (savedPosition) {
        window.scrollTo({
            top: parseInt(savedPosition, 10),
            behavior: 'instant'
        })
        element.removeAttribute(attributeName)
    }
}

/**
 * Combined function to save scroll position and disable scrolling
 * @param element - Element to save scroll position on
 */
export function disableScrollerWithSave(element: HTMLElement): void {
    saveScrollPosition(element)
    disableScroller()
}

/**
 * Combined function to enable scrolling and restore scroll position
 * @param element - Element to restore scroll position from
 */
export function enableScrollerWithRestore(element: HTMLElement): void {
    enableScroller()
    restoreScrollPosition(element)
}