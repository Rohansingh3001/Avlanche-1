import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';
import { keyframes } from '@mui/system';

// Define animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(90deg); }
  50% { transform: translateY(-40px) rotate(180deg); }
  75% { transform: translateY(-20px) rotate(270deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6), 0 0 60px rgba(255, 107, 53, 0.3); }
`;

const drift = keyframes`
  0% { transform: translateX(-100px) translateY(-100px); }
  25% { transform: translateX(100px) translateY(-50px); }
  50% { transform: translateX(50px) translateY(100px); }
  75% { transform: translateX(-50px) translateY(50px); }
  100% { transform: translateX(-100px) translateY(-100px); }
`;

export const AnimatedBackground: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -2,
        background: `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${alpha('#0a0e27', 0.95)} 25%,
          ${alpha('#1a1a2e', 0.9)} 50%,
          ${alpha('#16213e', 0.95)} 75%,
          ${theme.palette.background.default} 100%)`,
      }}
    >
      {/* Animated gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${alpha('#7B68EE', 0.1)} 0%, transparent 50%)
          `,
          animation: `${drift} 20s ease-in-out infinite`,
        }}
      />

      {/* Floating geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: i % 2 === 0 ? '50%' : '4px',
            animation: `${float} ${8 + Math.random() * 8}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%',
              height: '60%',
              background: `linear-gradient(45deg, 
                ${alpha(theme.palette.primary.main, 0.1)}, 
                ${alpha(theme.palette.secondary.main, 0.1)})`,
              borderRadius: 'inherit',
              animation: `${pulse} ${3 + Math.random() * 3}s ease-in-out infinite`,
            },
          }}
        />
      ))}

      {/* Glowing orbs */}
      {[...Array(4)].map((_, i) => (
        <Box
          key={`orb-${i}`}
          sx={{
            position: 'absolute',
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
            width: `${60 + Math.random() * 80}px`,
            height: `${60 + Math.random() * 80}px`,
            background: `radial-gradient(circle, 
              ${alpha(theme.palette.primary.main, 0.4)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.2)} 50%,
              transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(2px)',
            animation: `${glow} ${6 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}

      {/* Grid lines */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(${alpha(theme.palette.primary.main, 0.05)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: `${drift} 30s linear infinite reverse`,
        }}
      />

      {/* Scanning line effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '2px',
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${theme.palette.primary.main} 50%, 
            transparent 100%)`,
          animation: `${keyframes`
            0% { left: -100%; top: 0%; }
            25% { left: 100%; top: 25%; }
            50% { left: -100%; top: 50%; }
            75% { left: 100%; top: 75%; }
            100% { left: -100%; top: 100%; }
          `} 8s ease-in-out infinite`,
          boxShadow: `0 0 20px ${theme.palette.primary.main}`,
        }}
      />

      {/* Corner accents */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
        <Box
          key={corner}
          sx={{
            position: 'absolute',
            ...(corner.includes('top') ? { top: 20 } : { bottom: 20 }),
            ...(corner.includes('left') ? { left: 20 } : { right: 20 }),
            width: 60,
            height: 60,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: 1,
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              background: theme.palette.primary.main,
            },
            '&::before': {
              ...(corner.includes('top') ? { top: -2 } : { bottom: -2 }),
              ...(corner.includes('left') ? { left: -2 } : { right: -2 }),
              width: 20,
              height: 2,
            },
            '&::after': {
              ...(corner.includes('top') ? { top: -2 } : { bottom: -2 }),
              ...(corner.includes('left') ? { left: -2 } : { right: -2 }),
              width: 2,
              height: 20,
            },
            animation: `${pulse} 4s ease-in-out infinite`,
            animationDelay: `${['top-left', 'top-right', 'bottom-left', 'bottom-right'].indexOf(corner) * 0.5}s`,
          }}
        />
      ))}
    </Box>
  );
};

export default AnimatedBackground;
