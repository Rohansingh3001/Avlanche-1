import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Stack,
  Paper,
  IconButton,
  Fade,
  Grow,
  useTheme,
  alpha,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Rocket,
  Speed,
  Security,
  Code,
  Dashboard,
  CloudUpload,
  AutoGraph,
  AccountBalanceWallet,
  TrendingUp,
  ElectricBolt,
  Memory,
  DeveloperMode,
  PlayArrow,
  GitHub,
  Twitter,
  LinkedIn,
  ArrowForward,
  StarBorder,
  Star,
  Verified,
  FlashOn,
  Shield,
  Architecture,
  Analytics,
  Timeline,
  CloudDownload,
  Build,
  Storage,
  NetworkCheck,
  AutoAwesome,
  Layers,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import InteractiveParticles from '../components/InteractiveParticles';
import GlitchText from '../components/GlitchText';
import Terminal from '../components/Terminal';
import AnimatedHeroSection from '../components/AnimatedHeroSection';
import FloatingActionMenu from '../components/FloatingActionMenu';
import NotificationProvider, { useNotification } from '../components/NotificationProvider';

// Enhanced Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  featured?: boolean;
  color?: string;
}> = ({ icon, title, description, delay, featured = false, color = 'primary' }) => {
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
          '&::after': featured ? {
            content: '""',
            position: 'absolute',
            top: -1,
            left: -1,
            right: -1,
            bottom: -1,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            borderRadius: 'inherit',
            zIndex: -1,
            animation: 'borderGlow 3s ease-in-out infinite',
            '@keyframes borderGlow': {
              '0%, 100%': { opacity: 0.5 },
              '50%': { opacity: 1 },
            },
          } : {},
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

const EnhancedLandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleTryDemo = () => {
    navigate('/cli');
  };

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
      icon: <DeveloperMode />,
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
      icon: <AccountBalanceWallet />,
      title: 'Wallet Integration',
      description: 'Seamless integration with popular wallets for easy asset management and transaction signing.',
      action: () => navigate('/wallet'),
    },
  ];

  const stats = [
    { value: '1000+', label: 'Subnets Deployed', icon: <NetworkCheck /> },
    { value: '50M+', label: 'Transactions Processed', icon: <Timeline /> },
    { value: '99.9%', label: 'Uptime Guarantee', icon: <Shield /> },
    { value: '24/7', label: 'Support Available', icon: <Verified /> },
  ];

  return (
    <NotificationProvider>
      <Box
        sx={{
          minHeight: '100vh',
          position: 'relative',
          background: theme.palette.background.default,
          overflow: 'hidden',
        }}
      >
        {/* Interactive Background */}
        <InteractiveParticles />

        {/* Animated Hero Section */}
        <AnimatedHeroSection
          onGetStarted={handleGetStarted}
          onTryDemo={handleTryDemo}
        />

        {/* Floating Action Menu */}
        <FloatingActionMenu />

        {/* Features Section */}
        <Container maxWidth="xl" sx={{ py: 8 }}>
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
              <Grid key={feature.title} xs={12} md={6} lg={4}>
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
        <Container maxWidth="xl" sx={{ py: 8 }}>
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
              <Grid key={tool.title} xs={12} md={4}>
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
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
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
                    </CardActions>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Terminal Demo Section */}
        <Container maxWidth="xl" sx={{ py: 8 }}>
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
              See It In Action
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
            >
              Experience the power of our CLI tool with real-time subnet creation
            </Typography>
          </Box>

          <Fade in timeout={1500}>
            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
              <Terminal
                commands={[
                  'npm install -g @avalabs/subnet-cli',
                  'subnet-wizard create mySubnet',
                  'Selected template: DeFi Protocol',
                  '✓ Subnet configuration complete',
                  '✓ Smart contracts deployed',
                  '✓ Validators configured',
                  'Subnet mySubnet is live!'
                ]}
              />
            </Box>
          </Fade>
        </Container>

        {/* CTA Section */}
        <Container maxWidth="xl" sx={{ py: 8 }}>
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
      </Box>
    </NotificationProvider>
  );
};

export default EnhancedLandingPage;
