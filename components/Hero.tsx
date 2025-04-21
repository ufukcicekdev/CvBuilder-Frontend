import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';

interface HeroProps {
  t: (key: string, defaultValue?: string) => string;
  isAuthenticated: boolean;
  user?: any;
}

const Hero = ({ t, isAuthenticated, user }: HeroProps) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography
                component="h1"
                variant="h2"
                color="text.primary"
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                {t('home.hero.title')}
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                paragraph
                sx={{ mb: 4, fontSize: { xs: '1rem', md: '1.25rem' } }}
              >
                {t('home.hero.subtitle')}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Button
                    component={Link}
                    href={user?.user_type === 'employer' ? '/dashboard/employer' : '/dashboard/create-cv'}
                    variant="contained"
                    size="large"
                    sx={{ 
                      px: 4, 
                      py: 1.5, 
                      borderRadius: '8px',
                      fontWeight: 'bold',
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    {t('home.hero.toDashboard')}
                  </Button>
                ) : (
                  <>
                    <Button
                      component={Link}
                      href="/register"
                      variant="contained"
                      size="large"
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        borderRadius: '8px',
                        fontWeight: 'bold',
                      }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      {t('home.hero.cta')}
                    </Button>
                    <Button
                      component={Link}
                      href="/login"
                      variant="outlined"
                      size="large"
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        borderRadius: '8px',
                        fontWeight: 'bold'
                      }}
                    >
                      {t('auth.login')}
                    </Button>
                  </>
                )}
              </Box>
              
              <Box sx={{ mt: 4 }}>
                {["home.hero.feature1", "home.hero.feature2", "home.hero.feature3"].map((feature, index) => (
                  <Box key={index} sx={{ mt: index > 0 ? 1 : 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {t(feature)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: '300px', md: '400px' },
                '& img': {
                  objectFit: 'contain'
                }
              }}
            >
              <Image
                src="/images/hero-image.svg" 
                alt="CV Builder Hero Image"
                layout="fill"
                priority={true}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero; 