'use client';

import { ReactNode, useEffect } from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  // Optimize edilmiş sayfa yükleme performansı
  useEffect(() => {
    // RequestAnimationFrame ile daha verimli DOM güncellemesi
    requestAnimationFrame(() => {
      // Tek seferde DOM güncellemesi
      document.documentElement.classList.add('loaded');
      
      // Loader'ı doğrudan CSS ile gizle
      const loader = document.querySelector('.loading');
      if (loader) {
        loader.setAttribute('style', 'display:none; opacity:0');
      }
    });
  }, []);

  return (
    <Box 
      component="div"
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          contain: 'content'
        }}
        className="main-content"
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
} 