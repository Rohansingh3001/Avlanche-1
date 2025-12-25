import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';

interface TerminalProps {
  commands: string[];
  prompt?: string;
  typingSpeed?: number;
  pauseDuration?: number;
}

const Terminal: React.FC<TerminalProps> = ({
  commands,
  prompt = '$',
  typingSpeed = 50,
  pauseDuration = 1000,
}) => {
  const theme = useTheme();
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cursor blinking
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (commands.length === 0) return;

    const typeCommand = async () => {
      const command = commands[currentCommandIndex];
      setIsTyping(true);
      setCurrentText('');

      // Type each character
      for (let i = 0; i <= command.length; i++) {
        setCurrentText(command.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, typingSpeed));
      }

      setIsTyping(false);

      // Pause before next command
      await new Promise(resolve => setTimeout(resolve, pauseDuration));

      // Move to next command
      setCurrentCommandIndex(prev => (prev + 1) % commands.length);
    };

    typeCommand();
  }, [currentCommandIndex, commands, typingSpeed, pauseDuration]);

  return (
    <Box
      ref={terminalRef}
      sx={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 2,
        p: 3,
        fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
        fontSize: '0.9rem',
        color: '#00ff41',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 200,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 30,
          background: 'linear-gradient(90deg, #333 0%, #555 50%, #333 100%)',
          borderBottom: '1px solid #666',
        },
      }}
    >
      {/* Terminal header */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 16,
          display: 'flex',
          gap: 1,
          zIndex: 1,
        }}
      >
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27ca3f' }} />
      </Box>

      <Typography
        sx={{
          fontSize: '0.8rem',
          color: '#888',
          mb: 1,
          mt: 3,
        }}
      >
        avalanche-subnet-cli v2.1.0
      </Typography>

      {/* Command history */}
      <Box sx={{ mb: 2 }}>
        {commands.slice(0, currentCommandIndex).map((cmd, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography component="span" sx={{ color: '#4c6ef5', fontWeight: 'bold' }}>
              {prompt}
            </Typography>
            <Typography component="span" sx={{ ml: 1, color: '#00ff41' }}>
              {cmd}
            </Typography>
            <Box sx={{ mt: 0.5, color: '#888', fontSize: '0.8rem' }}>
              ✓ Command executed successfully
            </Box>
          </Box>
        ))}
      </Box>

      {/* Current typing command */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography component="span" sx={{ color: '#4c6ef5', fontWeight: 'bold' }}>
          {prompt}
        </Typography>
        <Typography component="span" sx={{ ml: 1, color: '#00ff41' }}>
          {currentText}
        </Typography>
        <Box
          sx={{
            width: 2,
            height: 16,
            backgroundColor: showCursor ? '#00ff41' : 'transparent',
            ml: 0.5,
            transition: 'opacity 0.1s',
          }}
        />
      </Box>

      {/* Scanlines effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${alpha('#00ff41', 0.03)} 2px,
            ${alpha('#00ff41', 0.03)} 4px
          )`,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

export default Terminal;
