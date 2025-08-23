import { HistoryEntry, ScrollPosition } from './types.enhanced'

export type HistoryMode = 'history' | 'hash' | 'memory'
export type HistoryListener = (entry: HistoryEntry) => void

export class HistoryManager {
  private mode: HistoryMode
  private stack: HistoryEntry[] = []
  private currentIndex: number = -1
  private listeners: Set<HistoryListener> = new Set()
  private baseUrl: string
  private memoryPath: string = '/'

  constructor(mode: HistoryMode = 'history', baseUrl: string = '') {
    this.mode = mode
    this.baseUrl = baseUrl

    // Initialize with current location
    const currentEntry = this.createEntry(this.getCurrentPath())
    this.stack.push(currentEntry)
    this.currentIndex = 0

    // Setup browser event listeners
    if (mode !== 'memory') {
      this.setupBrowserListeners()
    }
  }

  private setupBrowserListeners(): void {
    window.addEventListener('popstate', this.handlePopState)
    
    // Intercept link clicks for SPA navigation
    document.addEventListener('click', this.handleLinkClick)
  }

  private handlePopState = (event: PopStateEvent): void => {
    const path = this.getCurrentPath()
    const entry = this.createEntry(path, event.state)
    
    // Find the entry in our stack
    const index = this.stack.findIndex(e => e.path === path)
    if (index !== -1) {
      this.currentIndex = index
    } else {
      // Add new entry if not found
      this.stack.push(entry)
      this.currentIndex = this.stack.length - 1
    }

    this.notifyListeners(entry)
  }

  private handleLinkClick = (event: MouseEvent): void => {
    // Check if it's a link click we should handle
    const link = (event.target as HTMLElement).closest('a')
    if (!link) return

    const href = link.getAttribute('href')
    if (!href || href.startsWith('http') || href.startsWith('#')) return

    // Prevent default and handle navigation
    event.preventDefault()
    this.push(this.createEntry(href))
  }

  getCurrentPath(): string {
    if (this.mode === 'memory') {
      return this.memoryPath
    }

    if (this.mode === 'hash') {
      return window.location.hash.slice(1) || '/'
    }

    const path = window.location.pathname + window.location.search
    return this.baseUrl ? path.replace(this.baseUrl, '') : path
  }

  getCurrentUrl(): URL {
    if (this.mode === 'memory') {
      return new URL(this.memoryPath, window.location.origin)
    }
    return new URL(window.location.href)
  }

  private createEntry(
    path: string,
    state: any = null,
    title?: string
  ): HistoryEntry {
    return {
      path,
      state,
      title: title || document.title,
      timestamp: Date.now(),
      scrollPosition: this.getScrollPosition()
    }
  }

  private getScrollPosition(): ScrollPosition {
    return {
      x: window.scrollX || 0,
      y: window.scrollY || 0
    }
  }

  private restoreScrollPosition(position?: ScrollPosition): void {
    if (position) {
      window.scrollTo(position.x, position.y)
    }
  }

  push(entry: HistoryEntry): void {
    // Remove forward history when pushing new entry
    this.stack = this.stack.slice(0, this.currentIndex + 1)
    
    // Add new entry
    this.stack.push(entry)
    this.currentIndex++

    // Update browser history
    this.updateBrowserHistory(entry, false)
    
    // Notify listeners
    this.notifyListeners(entry)
  }

  replace(entry: HistoryEntry): void {
    // Replace current entry
    this.stack[this.currentIndex] = entry

    // Update browser history
    this.updateBrowserHistory(entry, true)
    
    // Notify listeners
    this.notifyListeners(entry)
  }

  private updateBrowserHistory(entry: HistoryEntry, replace: boolean): void {
    if (this.mode === 'memory') {
      this.memoryPath = entry.path
      return
    }

    const url = this.buildUrl(entry.path)
    const state = { ...entry.state, _historyEntry: entry }

    if (replace) {
      window.history.replaceState(state, entry.title || '', url)
    } else {
      window.history.pushState(state, entry.title || '', url)
    }

    // Update document title
    if (entry.title) {
      document.title = entry.title
    }
  }

  private buildUrl(path: string): string {
    if (this.mode === 'hash') {
      return `#${path}`
    }
    return this.baseUrl + path
  }

  go(delta: number): boolean {
    const newIndex = this.currentIndex + delta
    
    if (newIndex < 0 || newIndex >= this.stack.length) {
      return false
    }

    this.currentIndex = newIndex
    const entry = this.stack[newIndex]

    if (this.mode !== 'memory') {
      window.history.go(delta)
    } else {
      this.memoryPath = entry.path
      this.notifyListeners(entry)
    }

    this.restoreScrollPosition(entry.scrollPosition)
    return true
  }

  back(): boolean {
    return this.go(-1)
  }

  forward(): boolean {
    return this.go(1)
  }

  canGoBack(): boolean {
    return this.currentIndex > 0
  }

  canGoForward(): boolean {
    return this.currentIndex < this.stack.length - 1
  }

  getLength(): number {
    return this.stack.length
  }

  getCurrent(): HistoryEntry | null {
    return this.stack[this.currentIndex] || null
  }

  getStack(): ReadonlyArray<HistoryEntry> {
    return [...this.stack]
  }

  getIndex(): number {
    return this.currentIndex
  }

  // Listener management
  subscribe(listener: HistoryListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(entry: HistoryEntry): void {
    this.listeners.forEach(listener => listener(entry))
  }

  // Save and restore scroll position
  saveScrollPosition(): void {
    const current = this.stack[this.currentIndex]
    if (current) {
      current.scrollPosition = this.getScrollPosition()
    }
  }

  // Parse current location into path and query
  parseLocation(): { path: string; search: string; hash: string } {
    const path = this.getCurrentPath()
    const url = new URL(path, window.location.origin)
    
    return {
      path: url.pathname,
      search: url.search,
      hash: url.hash
    }
  }

  // Build full URL from path and query
  buildFullUrl(path: string, query?: Record<string, any>): string {
    let url = path

    if (query && Object.keys(query).length > 0) {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      }
      url += '?' + params.toString()
    }

    return url
  }

  // Clean up
  destroy(): void {
    if (this.mode !== 'memory') {
      window.removeEventListener('popstate', this.handlePopState)
      document.removeEventListener('click', this.handleLinkClick)
    }
    this.listeners.clear()
  }
}