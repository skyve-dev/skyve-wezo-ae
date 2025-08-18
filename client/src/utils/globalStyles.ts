/**
 * Global styling utilities for the application
 */

/**
 * Apply global styles to ensure consistent styling across the application
 */
export const applyGlobalStyles = (): void => {
  // Check if global styles are already applied
  const existingGlobalStyles = document.querySelector('#wezo-global-styles');
  if (existingGlobalStyles) {
    return;
  }

  // Create style element
  const styleElement = document.createElement('style');
  styleElement.id = 'wezo-global-styles';
  styleElement.textContent = `
    /* ===== CSS RESET ===== */
    
    /* Remove default margins, paddings, and borders from all elements */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      border: 0;
      box-sizing: border-box;
      vertical-align: baseline;
    }
    
    /* Reset HTML5 display-role for older browsers */
    article, aside, details, figcaption, figure, 
    footer, header, hgroup, menu, nav, section {
      display: block;
    }
    
    /* Reset body line height and font */
    body {
      line-height: 1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-size: 16px;
      color: #000;
      background: #fff;
    }
    
    /* Reset HTML and body to full height */
    html, body {
      height: 100%;
      width: 100%;
      display : flex;
      flex-direction : column;
      overflow : auto;
      margin: 0;
      padding: 0;
    }
    
    /* Remove list styles */
    ol, ul {
      list-style: none;
    }
    
    /* Remove quotes from blockquotes */
    blockquote, q {
      quotes: none;
    }
    
    blockquote:before, blockquote:after,
    q:before, q:after {
      content: '';
      content: none;
    }
    
    /* Reset table styles */
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    
    /* Reset form elements */
    input, button, textarea, select {
      margin: 0;
      padding: 0;
      border: none;
      outline: none;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      color: inherit;
      background: transparent;
    }
    
    /* Reset button styles */
    button {
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      margin: 0;
    }
    
    /* Reset link styles */
    a {
      text-decoration: none;
      color: inherit;
    }
    
    /* Reset heading styles with minimal line-height */
    h1, h2, h3, h4, h5, h6 {
      font-size: inherit;
      font-weight: inherit;
      line-height: 1;
      margin: 0;
      padding: 0;
    }
    
    /* Reset paragraph styles with minimal line-height */
    p {
      line-height: 1;
      margin: 0;
      padding: 0;
    }
    
    /* Reset other text elements */
    span, div, section, article, aside, header, footer, nav, main {
      line-height: 1;
      margin: 0;
      padding: 0;
    }
    
    /* Reset emphasis elements */
    em, strong, b, i {
      font-style: inherit;
      font-weight: inherit;
    }
    
    /* Reset code elements */
    code, pre {
      font-family: monospace;
      line-height: 1;
    }
    
    /* Reset image styles */
    img {
      max-width: 100%;
      height: auto;
      border: none;
      display: block;
    }
    
    /* Reset SVG styles */
    svg {
      display: block;
      max-width: 100%;
      height: auto;
    }
    
    /* Remove focus outline (add back with custom styles as needed) */
    *:focus {
      outline: none;
    }
    
    /* Reset fieldset and legend */
    fieldset {
      border: none;
      margin: 0;
      padding: 0;
    }
    
    legend {
      display: table;
      max-width: 100%;
      white-space: normal;
    }
    
    /* Reset progress and meter */
    progress, meter {
      -webkit-appearance: none;
      appearance: none;
    }
    
    /* Reset textarea resize */
    textarea {
      resize: vertical;
      overflow: auto;
    }
    
    /* Ensure consistent text rendering */
    body, input, textarea, button, select {
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Remove tap highlight on mobile */
    * {
      -webkit-tap-highlight-color: transparent;
    }
    
    /* Root element consistency */
    #root {
      height: 100%;
      width: 100%;
      line-height: 1;
      overflow : auto;
    }
    
    /* ===== MOBILE OPTIMIZATIONS ===== */
    
    /* Prevent double-tap zoom on mobile */
    * {
      touch-action: manipulation;
    }
    
    /* Prevent text size adjustment on mobile */
    body {
      -webkit-text-size-adjust: 100%;
      -moz-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }
    
    /* Prevent overscroll behavior */
    html, body {
      overscroll-behavior: none;
      overflow-x: hidden;
    }
    
    /* Smooth scrolling for better mobile experience */
    html {
      scroll-behavior: smooth;
    }
    
    /* Optimize mobile button interactions */
    button, [role="button"] {
      touch-action: manipulation;
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
    }
    
    /* Prevent callout on long press */
    * {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    /* Allow text selection for specific elements */
    input, textarea, [contenteditable] {
      -webkit-user-select: text;
      -moz-user-select: text;
      user-select: text;
    }
    
    /* Prevent zoom on form inputs on iOS */
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"],
    input[type="tel"],
    input[type="url"],
    input[type="search"],
    textarea,
    select {
      font-size: 16px;
    }
    
    /* Improve mobile performance */
    * {
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
    
    /* Safe area handling for devices with notches */
    @supports (padding: max(0px)) {
      body {
        padding-left: max(0px, env(safe-area-inset-left));
        padding-right: max(0px, env(safe-area-inset-right));
      }
    }
    
    /* ===== ANIMATIONS ===== */
    
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;
  
  // Append to document head
  document.head.appendChild(styleElement);
};

/**
 * Remove global styles (useful for cleanup or testing)
 */
export const removeGlobalStyles = (): void => {
  const existingGlobalStyles = document.querySelector('#wezo-global-styles');
  if (existingGlobalStyles) {
    document.head.removeChild(existingGlobalStyles);
  }
};