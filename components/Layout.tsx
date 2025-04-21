'use client';

import { ReactNode } from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const Layout = ({ 
  children, 
  title = 'CV Builder', 
  maxWidth = 'lg' 
}: LayoutProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="CV Builder - Profesyonel özgeçmişinizi oluşturun" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/og-image.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/images/hero-image.svg" as="image" type="image/svg+xml" />
        
        {/* Font display optimization */}
        <style>
          {`
            @font-face {
              font-family: 'CustomFont';
              font-display: swap;
            }
            /* Avoid layout shifts */
            body {
              overflow-x: hidden;
            }
            /* Optimize JS load */
            .js-loading * {
              -webkit-transition: none !important;
              -moz-transition: none !important;
              -ms-transition: none !important;
              -o-transition: none !important;
            }
          `}
        </style>
        
        {/* Preconnect to required domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
      </Head>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          // Sayfa boyutunu önceden ayarlayarak layout shift'i azalt
          width: '100%', 
          overflow: 'hidden'
        }}
      >
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
          <Container 
            maxWidth={maxWidth}
            sx={{
              // İçerik bölgesini önceden ayarlayarak layout shift'i azalt
              minHeight: '80vh',
            }}
          >
            {children}
          </Container>
        </Box>
        <Footer />
      </Box>
    </>
  );
};

export default Layout; 