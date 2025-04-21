import Head from 'next/head';
import { Box, Container, CssBaseline } from '@mui/material';

const Layout = ({ 
  children, 
  title = 'CV Builder', 
  maxWidth = 'lg' 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="CV Builder - Profesyonel özgeçmişinizi oluşturun" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/og-image.svg" as="image" type="image/svg+xml" />
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
      </Box>
    </>
  );
};

export default Layout; 