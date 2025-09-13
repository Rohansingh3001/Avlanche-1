import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import {
  Security,
  Speed,
  AccountBalanceWallet,
  SwapHoriz,
  Visibility,
  Download,
  CheckCircle,
  Launch,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import WalletConnection from '../components/WalletConnection';

const WalletPage: React.FC = () => {
  const coreFeatures = [
    {
      icon: <Security color="primary" />,
      title: 'Native Avalanche Support',
      description: 'Built specifically for Avalanche ecosystem with seamless subnet integration',
    },
    {
      icon: <Speed color="primary" />,
      title: 'Optimized Performance',
      description: 'Faster transaction processing and lower fees on Avalanche networks',
    },
    {
      icon: <SwapHoriz color="primary" />,
      title: 'Cross-Chain Assets',
      description: 'Manage assets across multiple Avalanche subnets from one interface',
    },
    {
      icon: <Visibility color="primary" />,
      title: 'Advanced Portfolio View',
      description: 'Comprehensive overview of your Avalanche and subnet assets',
    },
  ];

  const supportedNetworks = [
    { name: 'Avalanche C-Chain', chainId: 43114, status: 'active' },
    { name: 'Avalanche Fuji Testnet', chainId: 43113, status: 'active' },
    { name: 'DeFi Kingdoms Subnet', chainId: 53935, status: 'supported' },
    { name: 'Crabada Subnet', chainId: 73772, status: 'supported' },
    { name: 'Your Custom Subnet', chainId: 0, status: 'ready' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box textAlign="center">
          <Typography variant="h3" component="h1" gutterBottom>
            Wallet Integration
          </Typography>
          <Typography variant="h6" color="text.secondary" maxWidth="600px" mx="auto">
            Connect with Core Wallet or MetaMask to manage your Avalanche assets and interact with subnets
          </Typography>
        </Box>

        {/* Your Configured Address Alert */}
        <Alert 
          severity="info" 
          sx={{ 
            background: (theme) => alpha(theme.palette.info.main, 0.1),
            border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Typography variant="body2">
            <strong>Your Core Wallet Address:</strong> 0x4545D00c94C3318F0B51f5333e768D19CB8F247a
            <br />
            This address is pre-configured as your default wallet for testing and development.
          </Typography>
        </Alert>

        {/* Wallet Connection Component */}
        <WalletConnection />

        {/* Core Wallet Features */}
        <Card
          sx={{
            background: (theme) => 
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <CardContent>
            <Typography variant="h5" gutterBottom display="flex" alignItems="center" gap={1}>
              <AccountBalanceWallet color="primary" />
              Core Wallet Features
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {coreFeatures.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box display="flex" gap={2}>
                    {feature.icon}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Supported Networks */}
        <Card
          sx={{
            background: (theme) => 
              `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
          }}
        >
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Supported Networks
            </Typography>
            <List>
              {supportedNetworks.map((network, index) => (
                <ListItem key={index} divider={index < supportedNetworks.length - 1}>
                  <ListItemIcon>
                    <CheckCircle 
                      color={
                        network.status === 'active' ? 'success' : 
                        network.status === 'supported' ? 'primary' : 'secondary'
                      } 
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={network.name}
                    secondary={network.chainId > 0 ? `Chain ID: ${network.chainId}` : 'Configure your subnet'}
                  />
                  <Chip
                    label={network.status}
                    color={
                      network.status === 'active' ? 'success' : 
                      network.status === 'supported' ? 'primary' : 'default'
                    }
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Install Core Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Get the official Avalanche wallet with native subnet support
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  endIcon={<Launch />}
                  href="https://core.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Core Wallet
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  View on SnowTrace
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Explore your address and transactions on Avalanche's block explorer
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Launch />}
                  href="https://snowtrace.io/address/0x4545D00c94C3318F0B51f5333e768D19CB8F247a"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open SnowTrace
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Integration Instructions */}
        <Card
          sx={{
            background: (theme) => 
              `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
            border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Integration Guide
            </Typography>
            <Typography variant="body2" paragraph>
              This wallet integration supports both Core Wallet (recommended) and MetaMask:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="1. Core Wallet Priority"
                  secondary="The system will prefer Core Wallet if both are installed"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2. Automatic Network Detection"
                  secondary="Automatically detects and switches to Avalanche networks"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="3. Subnet Support"
                  secondary="Ready to connect to custom subnets you create"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="4. Development Mode"
                  secondary="Pre-configured with your address for testing: 0x4545D00c94C3318F0B51f5333e768D19CB8F247a"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default WalletPage;