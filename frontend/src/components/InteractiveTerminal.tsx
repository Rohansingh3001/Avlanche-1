import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { keyframes } from '@mui/system';

// Terminal cursor animation
const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

// Typing effect animation
const typing = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

interface TerminalCommand {
  command: string;
  output: string[];
  delay?: number;
}

const terminalCommands: TerminalCommand[] = [
  {
    command: "avalanche subnet create mySubnet",
    output: [
      "✓ Creating new subnet...",
      "✓ Generating genesis file...",
      "✓ Deploying to Fuji testnet...",
      "[SUCCESS] Subnet created successfully!",
      "ID: 2bRCr6B4MiEfSjidDwxDpdCyviwnfUVqB2HGwhm947w9YYqb7"
    ],
    delay: 2000
  },
  {
    command: "avalanche subnet deploy mySubnet",
    output: [
      "✓ Validating subnet configuration...",
      "✓ Starting deployment process...",
      "✓ Subnet is now live on Fuji!",
      "RPC URL: https://api.avax-test.network/ext/bc/2bRCr6B4MiEfSjidDwxDpdCyviwnfUVqB2HGwhm947w9YYqb7/rpc"
    ],
    delay: 3000
  },
  {
    command: "avalanche network status",
    output: [
      "[INFO] Network Status:",
      "• Validators: 1,247 active",
      "• Subnets: 42 deployed",
      "• TPS: 4,500+ transactions/sec",
      "• Finality: <2 seconds"
    ],
    delay: 2500
  }
];

export const InteractiveTerminal: React.FC = () => {
  const theme = useTheme();
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [currentOutput, setCurrentOutput] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runCommands = async () => {
      for (let i = 0; i < terminalCommands.length; i++) {
        setCurrentCommandIndex(i);
        setIsTyping(true);

        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsTyping(false);

        // Show output line by line
        const command = terminalCommands[i];
        for (let j = 0; j < command.output.length; j++) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setCurrentOutput(prev => [...prev, command.output[j]]);
        }

        // Wait before next command
        await new Promise(resolve => setTimeout(resolve, command.delay || 2000));
        setCurrentOutput([]);
      }

      // Restart the sequence
      setTimeout(() => {
        setCurrentCommandIndex(0);
        setCurrentOutput([]);
        runCommands();
      }, 3000);
    };

    runCommands();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [currentOutput]);

  return (
    <Paper
      elevation={24}
      sx={{
        background: `linear-gradient(145deg, 
          ${alpha(theme.palette.grey[900], 0.95)}, 
          ${alpha('#000', 0.9)})`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        borderRadius: 3,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        maxWidth: 800,
        mx: 'auto',
        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      {/* Terminal Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          background: `linear-gradient(90deg, 
            ${alpha(theme.palette.primary.main, 0.1)}, 
            ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#FF5F57',
            }}
          />
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#FFBD2E',
            }}
          />
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#28CA42',
            }}
          />
        </Box>
        <Chip
          label="Avalanche CLI"
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            color: theme.palette.primary.main,
            fontFamily: 'monospace',
            fontSize: '0.75rem',
          }}
        />
      </Box>

      {/* Terminal Content */}
      <Box
        ref={terminalRef}
        sx={{
          p: 3,
          minHeight: 300,
          maxHeight: 400,
          overflow: 'auto',
          fontFamily: '"Fira Code", "Cascadia Code", monospace',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          color: theme.palette.primary.light,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: 3,
          },
        }}
      >
        {terminalCommands.slice(0, currentCommandIndex + 1).map((cmd, cmdIndex) => (
          <Box key={cmdIndex} sx={{ mb: 2 }}>
            {/* Command Line */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography
                component="span"
                sx={{
                  color: theme.palette.secondary.main,
                  mr: 1,
                  fontWeight: 'bold',
                }}
              >
                ❯
              </Typography>
              <Typography
                component="span"
                sx={{
                  color: '#fff',
                  animation: cmdIndex === currentCommandIndex && isTyping ?
                    `${typing} 1s ease-out` : 'none',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {cmd.command}
              </Typography>
              {cmdIndex === currentCommandIndex && (
                <Box
                  component="span"
                  sx={{
                    ml: 0.5,
                    width: 2,
                    height: 20,
                    bgcolor: theme.palette.primary.main,
                    animation: `${blink} 1s infinite`,
                  }}
                />
              )}
            </Box>

            {/* Command Output */}
            {(cmdIndex < currentCommandIndex ||
              (cmdIndex === currentCommandIndex && !isTyping)) && (
                <Box sx={{ pl: 3 }}>
                  {(cmdIndex < currentCommandIndex ? cmd.output : currentOutput).map((line, lineIndex) => (
                    <Typography
                      key={lineIndex}
                      sx={{
                        color: line.includes('✓') ? '#28CA42' :
                          line.includes('[SUCCESS]') ? theme.palette.secondary.main :
                            line.includes('[INFO]') ? theme.palette.info.main :
                              line.includes('•') ? theme.palette.primary.light :
                                '#fff',
                        mb: 0.5,
                        opacity: 0,
                        animation: 'fadeIn 0.5s ease-out forwards',
                        animationDelay: `${lineIndex * 0.1}s`,
                        '@keyframes fadeIn': {
                          from: { opacity: 0, transform: 'translateY(10px)' },
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
                      }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Box>
              )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default InteractiveTerminal;
