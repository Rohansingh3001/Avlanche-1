import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, useTheme, alpha } from '@mui/material';
import { PlayArrow, ArrowForward } from '@mui/icons-material';

interface Cube {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  size: number;
  opacity: number;
  speed: number;
}

const AnimatedHeroSection: React.FC<{
  onGetStarted: () => void;
  onTryDemo: () => void;
}> = ({ onGetStarted, onTryDemo }) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cubes, setCubes] = useState<Cube[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize cubes
    const initialCubes: Cube[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      z: Math.random() * 1000,
      rotationX: Math.random() * 360,
      rotationY: Math.random() * 360,
      rotationZ: Math.random() * 360,
      size: Math.random() * 40 + 20,
      opacity: Math.random() * 0.3 + 0.1,
      speed: Math.random() * 0.5 + 0.2,
    }));

    setCubes(initialCubes);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      setCubes(prevCubes => 
        prevCubes.map(cube => {
          const newCube = {
            ...cube,
            rotationX: cube.rotationX + cube.speed * 0.5,
            rotationY: cube.rotationY + cube.speed * 0.7,
            rotationZ: cube.rotationZ + cube.speed * 0.3,
            z: cube.z - cube.speed * 20,
          };

          // Reset cube if it's too close
          if (newCube.z <= 0) {
            newCube.z = 1000;
            newCube.x = Math.random() * canvas.offsetWidth;
            newCube.y = Math.random() * canvas.offsetHeight;
          }

          // Draw cube
          const perspective = 1000;
          const scale = perspective / (perspective + newCube.z);
          const screenX = newCube.x * scale + canvas.offsetWidth / 2 * (1 - scale);
          const screenY = newCube.y * scale + canvas.offsetHeight / 2 * (1 - scale);
          const size = newCube.size * scale;

          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate((newCube.rotationX * Math.PI) / 180);
          
          // Create gradient
          const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
          gradient.addColorStop(0, `rgba(0, 212, 255, ${newCube.opacity * scale})`);
          gradient.addColorStop(1, `rgba(255, 107, 53, ${newCube.opacity * scale * 0.5})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.strokeRect(-size/2, -size/2, size, size);
          
          // Add inner glow
          ctx.shadowColor = '#00D4FF';
          ctx.shadowBlur = 10 * scale;
          ctx.strokeRect(-size/2, -size/2, size, size);
          
          ctx.restore();

          return newCube;
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at center, 
          ${alpha(theme.palette.primary.main, 0.1)} 0%, 
          ${alpha(theme.palette.background.default, 0.8)} 70%, 
          ${theme.palette.background.default} 100%)`,
      }}
    >
      {/* 3D Canvas Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />
      
      {/* Grid Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 2,
          opacity: 0.3,
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          maxWidth: '900px',
          px: 3,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '3rem', md: '5rem', lg: '7rem' },
            fontWeight: 900,
            mb: 2,
            background: `linear-gradient(45deg, 
              ${theme.palette.primary.main}, 
              ${theme.palette.secondary.main}, 
              ${theme.palette.primary.light})`,
            backgroundSize: '200% 200%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 3s ease-in-out infinite',
            textShadow: `0 0 50px ${alpha(theme.palette.primary.main, 0.3)}`,
            '@keyframes gradientShift': {
              '0%, 100%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
            },
          }}
        >
          AVALANCHE
        </Typography>
        
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '1.5rem', md: '2.5rem', lg: '3.5rem' },
            fontWeight: 700,
            mb: 3,
            color: theme.palette.text.primary,
            textShadow: `0 0 20px ${alpha(theme.palette.text.primary, 0.3)}`,
            animation: 'fadeInUp 1s ease-out 0.3s both',
            '@keyframes fadeInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          Subnet Infrastructure
        </Typography>
        
        <Typography
          variant="h5"
          sx={{
            mb: 5,
            color: theme.palette.text.secondary,
            maxWidth: '700px',
            mx: 'auto',
            lineHeight: 1.6,
            animation: 'fadeInUp 1s ease-out 0.6s both',
            fontSize: { xs: '1.1rem', md: '1.3rem' },
          }}
        >
          Build the future of decentralized applications with lightning-fast 
          performance, enterprise security, and unmatched scalability.
        </Typography>
        
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          justifyContent="center"
          sx={{
            animation: 'fadeInUp 1s ease-out 0.9s both',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            endIcon={<ArrowForward />}
            onClick={onGetStarted}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: 3,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: `0 15px 40px ${alpha(theme.palette.primary.main, 0.6)}`,
                background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
              },
              '&:active': {
                transform: 'translateY(-1px) scale(1.02)',
              },
            }}
          >
            Get Started
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<PlayArrow />}
            onClick={onTryDemo}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              borderWidth: 2,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              background: alpha(theme.palette.primary.main, 0.05),
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: theme.palette.primary.light,
                color: theme.palette.primary.light,
                background: alpha(theme.palette.primary.main, 0.1),
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
          >
            Try Demo
          </Button>
        </Stack>
        
        {/* Floating indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 40, md: 80 },
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': {
                transform: 'translateX(-50%) translateY(0)',
              },
              '40%': {
                transform: 'translateX(-50%) translateY(-10px)',
              },
              '60%': {
                transform: 'translateX(-50%) translateY(-5px)',
              },
            },
          }}
        >
          <Box
            sx={{
              width: 2,
              height: 40,
              background: `linear-gradient(to bottom, ${theme.palette.primary.main}, transparent)`,
              margin: '0 auto',
            }}
          />
        </Box>
      </Box>

      {/* Floating orbs */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: 60, md: 100 },
            height: { xs: 60, md: 100 },
            borderRadius: '50%',
            background: `radial-gradient(circle, 
              ${alpha(theme.palette.primary.main, 0.2)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.1)} 50%, 
              transparent 100%)`,
            filter: 'blur(1px)',
            animation: `float${i} ${8 + i * 2}s ease-in-out infinite`,
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
            zIndex: 1,
            [`@keyframes float${i}`]: {
              '0%, 100%': {
                transform: 'translateY(0px) rotate(0deg)',
                opacity: 0.3,
              },
              '50%': {
                transform: `translateY(-${20 + i * 10}px) rotate(180deg)`,
                opacity: 0.6,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default AnimatedHeroSection;
