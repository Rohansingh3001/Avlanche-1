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
  Chip,
  Avatar,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha,
  Paper,
  LinearProgress,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import {
  Rocket,
  Speed,
  Security,
  Code,
  Dashboard as DashboardIcon,
  PlayArrow,
  GitHub,
  Twitter,
  LinkedIn,
  ArrowForward,
  CloudDownload,
  Build,
  Analytics,
  Memory,
  Storage,
  NetworkCheck,
  Timeline,
  AutoAwesome,
  FlashOn,
  Shield,
  Layers,
  RocketLaunch,
  Terrain,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import InteractiveParticles from '../components/InteractiveParticles';
import GlitchText from '../components/GlitchText';
import Terminal from '../components/Terminal';
import HolographicCard from '../components/HolographicCard';

// Tech stats component
const TechStats: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Subnets Deployed', value: 0, target: 1247 },
    { label: 'Transactions/Sec', value: 0, target: 4500 },
    { label: 'Active Validators', value: 0, target: 892 },
    { label: 'Total Value Locked', value: 0, target: 2840 },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => prev.map(stat => ({
        ...stat,
        value: Math.min(stat.value + Math.ceil(stat.target / 100), stat.target)
      })));
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {stats.map((stat, index) => (
        <Grid item xs={6} md={3} key={index}>
          <Fade in timeout={1000 + index * 200}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(232, 65, 66, 0.1) 0%, rgba(76, 110, 245, 0.1) 100%)',
                border: '1px solid',
                borderColor: alpha('#E84142', 0.2),
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {stat.value.toLocaleString()}
                {stat.label === 'Total Value Locked' && 'M'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Fade>
        </Grid>
      ))}
    </Grid>
  );
};

// Feature card component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  return (
    <Slide direction="up" in timeout={1000 + delay}>
      <HolographicCard
        sx={{
          height: '100%',
          cursor: 'pointer',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2, color: 'primary.main' }}>
            {icon}
          </Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </HolographicCard>
    </Slide>
  );
};

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const fullText = 'Build. Deploy. Scale.';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const terminalCommands = [
    'subnet-wizard create --name "my-defi-chain"',
    'subnet-wizard deploy --validator-count 5',
    'subnet-wizard status --subnet-id 0x123...',
    'avalanche-cli contract deploy ERC20Token',
    'subnet-wizard scale --add-validators 3',
  ];

  const features = [
    {
      icon: <Rocket sx={{ fontSize: 40 }} />,
      title: 'Rapid Deployment',
      description: 'Deploy custom Avalanche subnets in minutes with our intuitive CLI tools and automated infrastructure setup.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'High Performance',
      description: 'Experience lightning-fast transaction speeds with sub-second finality and unlimited throughput potential.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Enterprise Security',
      description: 'Built-in security features with validator staking, consensus mechanisms, and cryptographic guarantees.',
    },
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'Developer Friendly',
      description: 'Comprehensive SDK, detailed documentation, and powerful CLI tools for seamless development experience.',
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Real-time Analytics',
      description: 'Monitor your subnet performance with advanced analytics, metrics, and alerting systems.',
    },
    {
      icon: <Layers sx={{ fontSize: 40 }} />,
      title: 'Modular Architecture',
      description: 'Flexible architecture allowing custom virtual machines, consensus protocols, and governance models.',
    },
  ];

  const tools = [
    {
      name: 'Subnet Wizard',
      description: 'Interactive CLI for subnet creation',
      icon: <AutoAwesome />,
      path: '/cli',
    },
    {
      name: 'Dashboard',
      description: 'Monitor and manage your infrastructure',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      name: 'Smart Contracts',
      description: 'Deploy and interact with contracts',
      icon: <Build />,
      path: '/contracts',
    },
    {
      name: 'Asset Management',
      description: 'Create and manage digital assets',
      icon: <Storage />,
      path: '/assets',
    },
  ];

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <InteractiveParticles />

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          py: { xs: 8, md: 12 },
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Chip
                    icon={<RocketLaunch />}
                    label="Now in Production"
                    color="primary"
                    sx={{ mb: 2, fontWeight: 'bold' }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      fontWeight: 'bold',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                    }}
                  >
                    <GlitchText text="Avalanche Subnet" />
                  </Typography>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      fontWeight: 'bold',
                      mb: 2,
                    }}
                  >
                    Tooling Suite
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      color: 'primary.main',
                      fontWeight: 'bold',
                      mb: 3,
                      minHeight: '60px',
                    }}
                  >
                    {typedText}
                    <Box
                      component="span"
                      sx={{
                        animation: 'blink 1s infinite',
                        '@keyframes blink': {
                          '0%, 50%': { opacity: 1 },
                          '51%, 100%': { opacity: 0 },
                        },
                      }}
                    >
                      |
                    </Box>
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: '500px' }}
                  >
                    The most advanced platform for creating, deploying, and managing custom blockchain networks on Avalanche.
                    Power your dApps with unlimited scalability and enterprise-grade infrastructure.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={() => navigate('/dashboard')}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
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
                      sx={{ py: 1.5, px: 4, fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                      View CLI Docs
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1500}>
                <Box
                  sx={{
                    position: 'relative',
                    textAlign: 'center',
                  }}
                >
                  {/* Terminal Demo */}
                  <Terminal
                    commands={terminalCommands}
                    prompt="avalanche$"
                    typingSpeed={40}
                    pauseDuration={2000}
                  />
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <TechStats />
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Why Choose Our Platform?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Built for developers, designed for scale. Experience the next generation of blockchain infrastructure.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <FeatureCard {...feature} delay={index * 200} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Tools Section */}
      <Box sx={{ backgroundColor: alpha(theme.palette.grey[100], 0.5), py: 6 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Powerful Tools
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to build and manage your blockchain infrastructure
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {tools.map((tool, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={1000 + index * 200}>
                  <Box
                    component={RouterLink}
                    to={tool.path}
                    sx={{
                      textDecoration: 'none',
                      height: '100%',
                      display: 'block',
                    }}
                  >
                    <HolographicCard
                      sx={{
                        height: '100%',
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56,
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          {tool.icon}
                        </Avatar>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {tool.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tool.description}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <Button endIcon={<ArrowForward />}>
                          Explore
                        </Button>
                      </CardActions>
                    </HolographicCard>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                Ready to Build the Future?
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                Join thousands of developers already building on our platform.
                Start your blockchain journey today with our comprehensive tooling suite.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CloudDownload />}
                  onClick={() => navigate('/cli')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.9),
                    },
                  }}
                >
                  Install CLI
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<GitHub />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#ffffff', 0.1),
                    },
                  }}
                >
                  View on GitHub
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  '& .pulse': {
                    animation: 'pulse 2s infinite',
                  },
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(1.05)',
                      opacity: 0.8,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <Box
                  className="pulse"
                  sx={{
                    width: 200,
                    height: 200,
                    mx: 'auto',
                    borderRadius: '50%',
                    border: '3px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                  }}
                >
                  <RocketLaunch sx={{ fontSize: '4rem', color: 'white' }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: theme.palette.grey[900], color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Terrain /> Avalanche Subnet Tooling Suite
              </Typography>
              <Typography variant="body2" color="grey.400">
                Empowering the next generation of blockchain applications with
                enterprise-grade infrastructure and developer-friendly tools.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box textAlign={{ xs: 'left', md: 'right' }}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <IconButton color="inherit">
                    <GitHub />
                  </IconButton>
                  <IconButton color="inherit">
                    <Twitter />
                  </IconButton>
                  <IconButton color="inherit">
                    <LinkedIn />
                  </IconButton>
                </Stack>
                <Typography variant="body2" color="grey.400" sx={{ mt: 1 }}>
                  © 2025 Avalanche Tooling Suite. All rights reserved.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
