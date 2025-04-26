// This script only loads polyfills for browsers that need them
// Add this to your app's entry point or as a script tag in _document.js

(function() {
  const hasOptionalChaining = (function() {
    try {
      // Test for optional chaining
      const obj = {};
      return obj?.property !== undefined;
    } catch (e) {
      return false;
    }
  })();

  const hasNullishCoalescing = (function() {
    try {
      // Test for nullish coalescing operator
      const val = null ?? 'default';
      return val === 'default';
    } catch (e) {
      return false;
    }
  })();

  const hasIntersectionObserver = (function() {
    try {
      return 'IntersectionObserver' in window && 'IntersectionObserverEntry' in window;
    } catch (e) {
      return false;
    }
  })();

  // Load polyfills only if needed
  if (!hasOptionalChaining || !hasNullishCoalescing || !hasIntersectionObserver) {
    // Create a script element for polyfills
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es2020%2CIntersectionObserver';
    script.async = true;
    document.head.appendChild(script);
  }
})(); 