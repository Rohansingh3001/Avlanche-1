import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Terrain as TerrainIcon, Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0E1A 0%, #0D1628 50%, #0A0E1A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background blobs */}
      <Box
        sx={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
            '50%': { transform: 'scale(1.1)', opacity: 1 },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)',
          bottom: '10%',
          right: '15%',
          animation: 'pulse 6s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            p: { xs: 4, md: 8 },
            borderRadius: 4,
            background: 'rgba(26, 31, 46, 0.6)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(255,107,53,0.15))',
              border: '1px solid rgba(0,212,255,0.2)',
              mb: 4,
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-12px)' },
              },
            }}
          >
            <TerrainIcon sx={{ fontSize: 48, color: '#00D4FF' }} />
          </Box>

          {/* 404 */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '6rem', md: '10rem' },
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              background: 'linear-gradient(45deg, #00D4FF, #FF6B35)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h4"
            sx={{ color: 'text.primary', fontWeight: 700, mb: 2 }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', mb: 5, maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}
          >
            Looks like this subnet doesn't exist on the network. The page you're looking for may have been removed, renamed, or is temporarily unavailable.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                px: 4,
                py: 1.5,
                background: 'linear-gradient(45deg, #00D4FF 30%, #FF6B35 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #33DDFF 30%, #FF8A65 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,212,255,0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Back to Home
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                px: 4,
                py: 1.5,
                borderColor: 'rgba(0,212,255,0.4)',
                color: '#00D4FF',
                '&:hover': {
                  borderColor: '#00D4FF',
                  backgroundColor: 'rgba(0,212,255,0.08)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
