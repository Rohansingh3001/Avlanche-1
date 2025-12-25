import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';

// Define animations
const pulse = keyframes`
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6), 0 0 60px rgba(255, 107, 53, 0.3); }
`;

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading Avalanche Suite...",
  progress,
  showProgress = false,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${alpha('#0a0e27', 0.95)} 50%,
          ${theme.palette.background.default} 100%)`,
        zIndex: 9999,
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
          top: '60%',
          right: '15%',
          width: 60,
          height: 60,
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.4)} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(1px)',
          animation: `${float} 4s ease-in-out infinite reverse`,
        }}
      />

      {/* Main Loading Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        {/* Avalanche Logo/Icon */}
        <Box
          sx={{
            position: 'relative',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${glow} 3s ease-in-out infinite`,
              '&::before': {
                content: '"⛰"',
                fontSize: '2.5rem',
                filter: 'brightness(1.5)',
              },
            }}
          />
          
          {/* Rotating Ring */}
          <CircularProgress
            size={100}
            thickness={2}
            sx={{
              position: 'absolute',
              top: -10,
              left: -10,
              color: theme.palette.primary.main,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
        </Box>

        {/* Loading Text */}
        <Box sx={{ minHeight: 60 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          >
            Avalanche
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              opacity: 0.8,
              animation: `${pulse} 2.5s ease-in-out infinite`,
            }}
          >
            {message}
          </Typography>
        </Box>

        {/* Progress Bar */}
        {showProgress && (
          <Box sx={{ width: 300, mt: 2 }}>
            <LinearProgress
              variant={progress !== undefined ? "determinate" : "indeterminate"}
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: 3,
                },
              }}
            />
            {progress !== undefined && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: 'block', textAlign: 'center' }}
              >
                {Math.round(progress)}%
              </Typography>
            )}
          </Box>
        )}

        {/* Loading Dots */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: theme.palette.primary.main,
                animation: `${pulse} 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Bottom Branding */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ opacity: 0.6 }}
        >
          Building the future of Web3 infrastructure
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
