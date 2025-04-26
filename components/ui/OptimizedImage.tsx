import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { Box, Skeleton } from '@mui/material';

// Extended ImageProps with additional optimization options
interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onLoadingComplete'> {
  /**
   * Whether this image is considered a critical resource.
   * Critical images will load with priority and without lazy loading.
   */
  isCritical?: boolean;
  /**
   * Show a skeleton while loading
   */
  showSkeleton?: boolean;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Optional caption for the image
   */
  caption?: string;
}

/**
 * OptimizedImage component that handles loading images with proper
 * performance optimization and prevents layout shifts.
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  isCritical = false,
  showSkeleton = true,
  className = '',
  caption,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Set loading attributes based on whether image is critical
  const loadingAttribute = isCritical ? 'eager' : 'lazy';
  
  // Set fetchPriority based on whether image is critical
  const fetchPriority = isCritical ? 'high' : 'auto';
  
  // Handle image loading complete
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Handle image loading error
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // If width and height are not provided, use default aspect ratio
  // Convert width and height to numbers to fix TypeScript errors
  const numericWidth = typeof width === 'number' ? width : 0;
  const numericHeight = typeof height === 'number' ? height : 0;
  const aspectRatio = numericWidth && numericHeight ? numericWidth / numericHeight : 16 / 9;

  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: '100%',
        height: 'auto',
        aspectRatio: `${aspectRatio}`,
        overflow: 'hidden',
      }}
      className={`optimized-image-container ${className}`}
    >
      {/* Skeleton placeholder while loading */}
      {isLoading && showSkeleton && (
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height="100%" 
          animation="wave"
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        />
      )}
      
      {/* Actual image */}
      <Box
        component={Image}
        src={src}
        alt={alt || ''}
        width={width || 0}
        height={height || 0}
        loading={loadingAttribute}
        fetchPriority={fetchPriority as any}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        className={isCritical ? 'critical-image' : ''}
        sx={{ 
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        {...props}
      />
      
      {/* Optional caption */}
      {caption && !isLoading && (
        <Box 
          component="figcaption"
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            textAlign: 'center',
            mt: 1
          }}
        >
          {caption}
        </Box>
      )}
      
      {/* Fallback for error */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          {alt || 'Image could not be loaded'}
        </Box>
      )}
    </Box>
  );
};

export default OptimizedImage; 