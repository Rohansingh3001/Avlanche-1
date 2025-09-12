import React, { useState, useEffect } from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface GlitchTextProps extends Omit<TypographyProps, 'children'> {
  text: string;
  glitchIntensity?: number;
  glitchDuration?: number;
  glitchInterval?: number;
}

const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  glitchIntensity = 0.1,
  glitchDuration = 100,
  glitchInterval = 3000,
  ...typographyProps
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

  const applyGlitch = (originalText: string): string => {
    return originalText
      .split('')
      .map(char => {
        if (Math.random() < glitchIntensity) {
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        return char;
      })
      .join('');
  };

  useEffect(() => {
    const startGlitch = () => {
      setIsGlitching(true);
      let glitchStep = 0;
      const maxSteps = 5;

      const glitchTimer = setInterval(() => {
        if (glitchStep < maxSteps) {
          setDisplayText(applyGlitch(text));
          glitchStep++;
        } else {
          setDisplayText(text);
          setIsGlitching(false);
          clearInterval(glitchTimer);
        }
      }, glitchDuration / maxSteps);

      return () => clearInterval(glitchTimer);
    };

    const intervalId = setInterval(startGlitch, glitchInterval);
    return () => clearInterval(intervalId);
  }, [text, glitchIntensity, glitchDuration, glitchInterval]);

  return (
    <Typography
      {...typographyProps}
      sx={{
        ...typographyProps.sx,
        fontFamily: 'monospace',
        position: 'relative',
        display: 'inline-block',
        ...(isGlitching && {
          animation: 'glitchShake 0.1s infinite',
          '@keyframes glitchShake': {
            '0%': { transform: 'translateX(0)' },
            '25%': { transform: 'translateX(-2px)' },
            '50%': { transform: 'translateX(2px)' },
            '75%': { transform: 'translateX(-1px)' },
            '100%': { transform: 'translateX(0)' },
          },
        }),
      }}
    >
      {displayText}
      {isGlitching && (
        <>
          <Typography
            component="span"
            sx={{
              position: 'absolute',
              top: 0,
              left: 2,
              color: '#ff0000',
              opacity: 0.8,
              mixBlendMode: 'multiply',
              zIndex: -1,
            }}
          >
            {displayText}
          </Typography>
          <Typography
            component="span"
            sx={{
              position: 'absolute',
              top: 0,
              left: -2,
              color: '#00ffff',
              opacity: 0.8,
              mixBlendMode: 'multiply',
              zIndex: -1,
            }}
          >
            {displayText}
          </Typography>
        </>
      )}
    </Typography>
  );
};

export default GlitchText;
