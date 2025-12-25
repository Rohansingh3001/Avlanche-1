import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Paper,
  IconButton,
  Fab,
  Tooltip,
  Fade,
  Grow,
  useTheme,
  alpha,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Rocket,
  Speed,
  Security,
  Code,
  Dashboard,
  Analytics,
  PlayArrow,
  GitHub,
  Twitter,
  LinkedIn,
  ArrowForward,
  Star,
  Verified,
  RocketLaunch,
  FlashOn,
  Shield,
  AutoAwesome,
  Memory,
  NetworkCheck,
  Timeline,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import ParticleSystem from '../components/ParticleSystem';
import InteractiveTerminal from '../components/InteractiveTerminal';
import FloatingActionMenu from '../components/FloatingActionMenu';

// Enhanced Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  featured?: boolean;
}> = ({ icon, title, description, delay, featured = false }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Grow in={true} timeout={1000} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: '100%',
          background: featured
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha('#ffffff', 0.1)} 0%, ${alpha('#f8f9fa', 0.05)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: featured
            ? `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: isHovered
            ? `0 25px 50px ${alpha(theme.palette.primary.main, 0.25)}, 0 0 80px ${alpha(theme.palette.primary.main, 0.1)}`
            : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, transparent 30%, ${alpha(theme.palette.primary.main, 0.1)} 50%, transparent 70%)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
          },
        }}
      >
        {featured && (
          <Chip
            label="Featured"
            size="small"
            icon={<Star />}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '& .MuiChip-icon': {
                color: theme.palette.primary.contrastText,
              },
            }}
          />
        )}

        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: featured ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                color: featured ? theme.palette.primary.contrastText : theme.palette.primary.main,
                width: 56,
                height: 56,
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
              }}
            >
              {icon}
            </Avatar>
          </Box>

          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            {description}
          </Typography>
        </CardContent>

        {/* Animated scanning line */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: isHovered ? 0 : '-100%',
            width: '100%',
            height: '3px',
            background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
            transition: 'left 0.6s ease',
          }}
        />
      </Card>
    </Grow>
  );
};

// Stat Counter Component
const StatCounter: React.FC<{
  value: string;
  label: string;
  icon: React.ReactNode;
  delay: number;
}> = ({ value, label, icon, delay }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={isVisible} timeout={1000}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        <Box sx={{ color: theme.palette.primary.main, mb: 1 }}>
          {icon}
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Paper>
    </Fade>
  );
};

const CleanLandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Rocket />,
      title: 'Lightning Fast Deployment',
      description: 'Deploy your Avalanche subnets in minutes with our optimized infrastructure and automated setup process.',
      featured: true,
    },
    {
      icon: <Security />,
      title: 'Enterprise Security',
      description: 'Bank-grade security with multi-signature wallets, encrypted communications, and decentralized validation.',
    },
    {
      icon: <Speed />,
      title: 'High Performance',
      description: 'Experience sub-second finality and thousands of transactions per second with Avalanche consensus.',
    },
    {
      icon: <Code />,
      title: 'Developer Friendly',
      description: 'Comprehensive APIs, SDKs, and documentation to build and scale your decentralized applications.',
    },
    {
      icon: <Analytics />,
      title: 'Real-time Analytics',
      description: 'Monitor your subnet performance with detailed metrics, transaction analysis, and network insights.',
    },
    {
      icon: <AutoAwesome />,
      title: 'Smart Automation',
      description: 'AI-powered optimization and automated scaling to ensure optimal performance at all times.',
    },
  ];

  const tools = [
    {
      icon: <Code />,
      title: 'Subnet Wizard CLI',
      description: 'Interactive command-line tool for creating and managing Avalanche subnets with guided setup.',
      action: () => navigate('/cli'),
    },
    {
      icon: <Dashboard />,
      title: 'Management Dashboard',
      description: 'Comprehensive web interface for monitoring, managing, and scaling your subnet infrastructure.',
      action: () => navigate('/dashboard'),
    },
    {
      icon: <Shield />,
      title: 'Security Center',
      description: 'Advanced security features including multi-sig wallets, audit tools, and threat monitoring.',
      action: () => navigate('/security'),
    },
  ];

  const stats = [
    { value: '1000+', label: 'Subnets Deployed', icon: <NetworkCheck /> },
    { value: '50M+', label: 'Transactions Processed', icon: <Timeline /> },
    { value: '99.9%', label: 'Uptime Guarantee', icon: <Shield /> },
    { value: '24/7', label: 'Support Available', icon: <Verified /> },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.default, 0.95)} 0%, 
          ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Enhanced Animated Background */}
      <AnimatedBackground />

      {/* Interactive Particle System */}
      <ParticleSystem
        particleCount={60}
        colors={[theme.palette.primary.main, theme.palette.secondary.main, '#7B68EE', '#32CD32']}
        speed={0.6}
        size={2}
        connections={true}
      />

      {/* Animated Background Grid */}
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
          opacity: 0.3,
          animation: 'gridMove 20s linear infinite',
          '@keyframes gridMove': {
            '0%': { transform: 'translate(0, 0)' },
            '100%': { transform: 'translate(50px, 50px)' },
          },
        }}
      />

      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => (
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

      {/* Hero Section */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            pt: { xs: 12, md: 16 },
            pb: { xs: 8, md: 12 },
            textAlign: 'center',
          }}
        >
          <Fade in timeout={1000}>
            <Box>
              <Chip
                icon={<RocketLaunch />}
                label="Now Supporting Avalanche Durango"
                variant="outlined"
                sx={{
                  mb: 3,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  backdropFilter: 'blur(10px)',
                  background: alpha(theme.palette.primary.main, 0.05),
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '3rem', md: '4.5rem', lg: '6rem' },
                  mb: 1,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}`,
                  animation: 'glow 2s ease-in-out infinite alternate',
                  '@keyframes glow': {
                    '0%': { textShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}` },
                    '100%': { textShadow: `0 0 60px ${alpha(theme.palette.primary.main, 0.8)}` },
                  },
                }}
              >
                AVALANCHE
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem', lg: '4rem' },
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                Subnet Infrastructure
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: theme.palette.text.secondary,
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                }}
              >
                Build, deploy, and scale Avalanche subnets with enterprise-grade tools,
                lightning-fast performance, and unmatched developer experience.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mb: 6 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                >
                  Get Started
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Code />}
                  onClick={() => navigate('/cli')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Try CLI Tool
                </Button>
              </Stack>
            </Box>
          </Fade>

          {/* Stats Section */}
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <StatCounter
                  value={stat.value}
                  label={stat.label}
                  icon={stat.icon}
                  delay={index * 200}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            Powerful Features
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
          >
            Everything you need to build and scale enterprise-grade blockchain applications
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={feature.title}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
                featured={feature.featured}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Tools Section */}
      <Container maxWidth="xl" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            Developer Tools
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
          >
            Comprehensive toolkit for seamless development and deployment
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {tools.map((tool, index) => (
            <Grid item xs={12} md={4} key={tool.title}>
              <Grow in timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }}
                  onClick={tool.action}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        width: 64,
                        height: 64,
                        mb: 2,
                      }}
                    >
                      {tool.icon}
                    </Avatar>

                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {tool.title}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {tool.description}
                    </Typography>

                    <Button
                      variant="outlined"
                      fullWidth
                      endIcon={<ArrowForward />}
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      Explore
                    </Button>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Interactive Terminal Section */}
      <Container maxWidth="xl" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Experience the Power
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
          >
            See how easy it is to create and deploy your own Avalanche subnet with our powerful CLI tools
          </Typography>
        </Box>

        <InteractiveTerminal />
      </Container>

      {/* CTA Section */}
      <Container maxWidth="xl" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            Ready to Build the Future?
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
          >
            Join thousands of developers building the next generation of decentralized applications
            on Avalanche's robust subnet infrastructure.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Rocket />}
              onClick={() => navigate('/dashboard')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Start Building
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<GitHub />}
              href="https://github.com"
              target="_blank"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              View on GitHub
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              href="https://twitter.com"
              target="_blank"
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Twitter />
            </IconButton>
            <IconButton
              href="https://linkedin.com"
              target="_blank"
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <LinkedIn />
            </IconButton>
            <IconButton
              href="https://github.com"
              target="_blank"
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <GitHub />
            </IconButton>
          </Stack>
        </Paper>
      </Container>

      {/* Enhanced Floating Action Menu */}
      <FloatingActionMenu />
    </Box>
  );
};

export default CleanLandingPage;
