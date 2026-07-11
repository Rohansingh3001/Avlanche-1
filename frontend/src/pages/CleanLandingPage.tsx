import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CleanLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const commandText = 'npm i -g @avalanche/subnet-wizard';

  const handleCopy = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box className="landing-light-mint" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Floating Robotic Hand (Sketch) & Pushed Block */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: -40,
          width: { xs: 200, md: 350 },
          height: { xs: 200, md: 350 },
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 1,
          transform: 'rotate(15deg) scaleX(-1)',
        }}
      >
        <img 
          src="/robot_hand_sketch.png" 
          alt="Technical sketch"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>

      {/* Floating Header Banner */}
      <Container maxWidth="xl" sx={{ pt: 4, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" className="font-serif-italic" sx={{ color: '#056B5D', fontSize: '1.4rem' }}>
            Avalanche Suite
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" className="font-space-mono" sx={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: '#056B5D', fontWeight: 700 }}>
            BUILD SUBNETS THAT ACT, RUN, DEPLOY AND MINT
          </Typography>
        </Box>
      </Container>

      {/* Main Hero Content */}
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', pt: 6, pb: 12, position: 'relative', zIndex: 5 }}>
        
        <Typography variant="subtitle2" className="font-space-mono" sx={{ color: '#056B5D', letterSpacing: '0.25em', textTransform: 'uppercase', mb: 3, fontWeight: 700 }}>
          🏔️ Supporting Avalanche Durango & EVM Subnets
        </Typography>

        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: { xs: '3.2rem', md: '5.8rem' }, 
            lineHeight: 1.1,
            mb: 4, 
            letterSpacing: '-0.02em',
            color: '#2C3A33'
          }}
        >
          <span className="font-serif-italic">Agentic Subnet</span>
          <br />
          <span className="font-serif-italic" style={{ color: '#0C8B7B' }}>Workspace</span>
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            color: '#5C6E64', 
            maxWidth: '620px', 
            mb: 6, 
            fontSize: '1.1rem', 
            lineHeight: 1.6 
          }}
        >
          Recreate the web3 workspace experience. Build, deploy, compile contracts, and monitor live testnets on Avalanche's highly scalable subnet framework.
        </Typography>

        {/* Copy Command & Launch Block */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 8,
            width: '100%',
            maxWidth: '560px'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: '#ffffff',
              border: '1px solid #D1DDD6', 
              borderRadius: '24px', 
              px: 3, 
              py: 1.5,
              flexGrow: 1,
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body2" className="font-space-mono" sx={{ color: '#056B5D', fontSize: '0.85rem' }}>
              $ {commandText}
            </Typography>
            <IconButton size="small" onClick={handleCopy} sx={{ ml: 1, color: '#0C8B7B' }}>
              {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
            </IconButton>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              background: '#056B5D',
              color: '#ffffff',
              borderRadius: '24px',
              px: 4,
              py: 1.8,
              fontSize: '0.92rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(5, 107, 93, 0.15)',
              '&:hover': {
                background: '#0C8B7B',
                boxShadow: '0 12px 32px rgba(12, 139, 123, 0.25)',
              }
            }}
          >
            Launch Workspace
          </Button>
        </Box>

        {/* Perks Section (Styled like $50,000 Rewards Box) */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" className="font-space-mono" sx={{ color: '#056B5D', opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Active Perks
          </Typography>
          <Typography 
            variant="h3" 
            className="font-space-mono" 
            sx={{ 
              color: '#0C8B7B', 
              fontWeight: 700, 
              fontSize: { xs: '2.5rem', md: '3.8rem' }, 
              my: 1,
              letterSpacing: '-0.02em'
            }}
          >
            Sub-Second Finality
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
            Custom GAS Token configurations enabled out-of-the-box
          </Typography>
        </Box>

      </Container>

      {/* SVG Wave Divider Separating Top and Bottom Ocean Sections */}
      <Box sx={{ position: 'relative', width: '100%', mt: 'auto', zIndex: 1 }}>
        <svg 
          viewBox="0 0 1440 220" 
          fill="none" 
          preserveAspectRatio="none"
          style={{ width: '100%', height: '140px', display: 'block' }}
        >
          <path 
            d="M0,96 C288,160 576,32 864,128 C1152,224 1344,96 1440,64 L1440,220 L0,220 Z" 
            fill="#056B5D"
          />
          <path 
            d="M0,128 C360,192 720,64 1080,160 C1260,208 1380,144 1440,128 L1440,220 L0,220 Z" 
            fill="#0C8B7B"
            opacity="0.3"
          />
        </svg>
      </Box>

      {/* Bottom Ocean Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(180deg, #056B5D 0%, #024F44 100%)', 
          py: 8, 
          color: '#ffffff',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Bottom Right Floating Robotic Hand (Sketch) & Pushed Block */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: -60,
            width: { xs: 200, md: 350 },
            height: { xs: 200, md: 350 },
            opacity: 0.15,
            pointerEvents: 'none',
            zIndex: 1,
            transform: 'rotate(-45deg)',
          }}
        >
          <img 
            src="/robot_hand_sketch.png" 
            alt="Technical sketch"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        <Container maxWidth="lg">
          {/* Stats Grid */}
          <Grid container spacing={4} sx={{ mb: 8, position: 'relative', zIndex: 5 }}>
            {[
              { value: '1,200+', label: 'Subnets Bootstrapped', icon: <StarIcon /> },
              { value: '75M+', label: 'Transactions Run', icon: <SpeedIcon /> },
              { value: '99.99%', label: 'Active Uptime', icon: <SecurityIcon /> },
              { value: 'Instant', label: 'EVM Compilation', icon: <TerminalIcon /> },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: 4, 
                    color: '#ffffff !important',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', color: '#a5d6a7', mb: 2 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" className="font-space-mono" sx={{ fontWeight: 700, mb: 1, color: '#ffffff !important' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8) !important', display: 'block' }}>
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Sponsors Footer */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: 4,
              pt: 4,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              position: 'relative', 
              zIndex: 5 
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.6, color: '#ffffff !important' }}>
              © 2026 Avalanche Subnet Workspace Suite. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, opacity: 0.8 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff !important' }}>Docs</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff !important' }}>GitHub</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff !important' }}>Subnets Explorer</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default CleanLandingPage;
