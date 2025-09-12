import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
`;

export const ErrorBoundary: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${alpha('#0a0e27', 0.95)} 50%,
          ${theme.palette.background.default} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Effects */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: 100,
          height: 100,
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(2px)',
          animation: `${float} 3s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 60,
          height: 60,
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.4)} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(1px)',
          animation: `${float} 4s ease-in-out infinite reverse`,
        }}
      />

      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: 6,
            textAlign: 'center',
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.9)} 0%, 
              ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Error Code */}
          <Typography
            variant="h1"
            sx={{
              fontSize: '8rem',
              fontWeight: 900,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          >
            404
          </Typography>

          {/* Error Message */}
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            Oops! Page Not Found
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            The page you're looking for seems to have vanished into the blockchain void. 
            Don't worry, let's get you back on track!
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s ease',
                px: 4,
                py: 1.5,
              }}
            >
              Back to Home
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
                transition: 'all 0.3s ease',
                px: 4,
                py: 1.5,
              }}
            >
              Go Back
            </Button>
          </Box>

          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              borderRadius: 1,
              animation: `${pulse} 3s ease-in-out infinite`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              width: 30,
              height: 30,
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
              borderRadius: '50%',
              animation: `${pulse} 2.5s ease-in-out infinite`,
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default ErrorBoundary;
