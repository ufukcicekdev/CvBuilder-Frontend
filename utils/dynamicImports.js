import dynamic from 'next/dynamic';
import { Skeleton } from '@mui/material';
import { Box } from '@mui/material';

/**
 * Dynamically import a component with optimized loading
 * @param {Function} importFunc - The import function (e.g., () => import('../components/MyComponent'))
 * @param {Object} options - Additional options
 * @param {Boolean} options.ssr - Whether to use SSR (default: false)
 * @param {Boolean} options.loading - Custom loading component
 * @returns {React.ComponentType} Dynamically imported component
 */
export function dynamicComponent(importFunc, options = {}) {
  const {
    ssr = false,
    loading: LoadingComponent,
  } = options;

  return dynamic(importFunc, {
    ssr,
    loading: LoadingComponent || (() => (
      <Box sx={{ width: '100%', p: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={118} animation="wave" />
      </Box>
    )),
  });
}

/**
 * Dynamically import a page component with optimized loading
 * @param {Function} importFunc - The import function
 * @param {Boolean} ssr - Whether to use SSR (default: true for pages)
 * @returns {React.ComponentType} Dynamically imported page
 */
export function dynamicPage(importFunc, ssr = true) {
  return dynamic(importFunc, {
    ssr,
    loading: () => (
      <Box sx={{ width: '100%', p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={200} animation="wave" />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" width="60%" height={40} animation="wave" />
          <Skeleton variant="text" width="80%" animation="wave" />
          <Skeleton variant="text" width="70%" animation="wave" />
        </Box>
      </Box>
    ),
  });
} 