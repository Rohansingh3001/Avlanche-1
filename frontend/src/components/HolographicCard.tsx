import React from 'react';
import { Card, CardProps, Box, useTheme, alpha } from '@mui/material';

interface HolographicCardProps extends CardProps {
  glowColor?: string;
  intensity?: number;
}

const HolographicCard = React.forwardRef<HTMLDivElement, HolographicCardProps>(({
  children,
  glowColor,
  intensity = 0.3,
  sx,
  ...props
}, ref) => {
  const theme = useTheme();
  const defaultGlowColor = glowColor || theme.palette.primary.main;

  return (
    <Card
      ref={ref}
      {...props}
      sx={{
        position: 'relative',
        background: `linear-gradient(145deg, 
          ${alpha('#ffffff', 0.95)} 0%, 
          ${alpha('#f8f9fa', 0.9)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(defaultGlowColor, 0.2)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, 
            ${alpha(defaultGlowColor, 0.1)} 0%, 
            transparent 50%, 
            ${alpha(defaultGlowColor, 0.05)} 100%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: `linear-gradient(45deg, 
            ${alpha(defaultGlowColor, intensity)}, 
            transparent, 
            ${alpha(defaultGlowColor, intensity)})`,
          borderRadius: 'inherit',
          zIndex: -1,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: `0 20px 40px ${alpha(defaultGlowColor, 0.3)}, 
                      0 0 60px ${alpha(defaultGlowColor, 0.2)}`,
          '&::before': {
            opacity: 1,
          },
          '&::after': {
            opacity: 1,
          },
        },
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
        }}
      >
        {children}
      </Box>
      
      {/* Scanning line effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${alpha(defaultGlowColor, 0.3)} 50%, 
            transparent 100%)`,
          animation: 'scan 3s ease-in-out infinite',
          '@keyframes scan': {
            '0%': {
              left: '-100%',
            },
            '100%': {
              left: '100%',
            },
          },
        }}
      />
    </Card>
  );
});

export default HolographicCard;
