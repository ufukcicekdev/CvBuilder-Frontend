import React, { useEffect, useState, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * Basitleştirilmiş LazyLoad bileşeni
 */
const LazyLoad = ({ children, height = 200, width = '100%' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Eğer intersection observer yoksa içeriği hemen göster
    if (!window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div ref={ref} style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}>
      {isVisible ? children : (
        <Box sx={{ width, my: 1 }}>
          <Skeleton variant="rectangular" width={width} height={height} animation="wave" />
        </Box>
      )}
    </div>
  );
};

export default LazyLoad; 