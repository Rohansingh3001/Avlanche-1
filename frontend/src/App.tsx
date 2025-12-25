export { };

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { Terrain as TerrainIcon } from '@mui/icons-material';

// Contexts
import { WalletProvider } from './contexts/WalletContext';
import { EnhancedWalletProvider } from './contexts/EnhancedWalletContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import NotificationProvider from './components/NotificationProvider';

// Pages (lazy loaded)
const CleanLandingPage = React.lazy(() => import('./pages/CleanLandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Subnets = React.lazy(() => import('./pages/Subnets'));
const Contracts = React.lazy(() => import('./pages/Contracts'));
const Assets = React.lazy(() => import('./pages/Assets'));
const Monitoring = React.lazy(() => import('./pages/Monitoring'));
const CLIDocumentation = React.lazy(() => import('./pages/CLIDocumentation'));
const Settings = React.lazy(() => import('./pages/Settings'));
const WalletPage = React.lazy(() => import('./pages/WalletPage'));
const FaucetPage = React.lazy(() => import('./pages/FaucetPage'));
import ErrorBoundary from './components/ErrorBoundary';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00D4FF',
      light: '#33DDFF',
      dark: '#0099CC',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FF6B35',
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0A0E1A',
      paper: '#1A1F2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B8BCC8',
    },
    divider: '#2A3142',
    success: {
      main: '#00E676',
      light: '#66FFA6',
      dark: '#00C853',
    },
    warning: {
      main: '#FFB300',
      light: '#FFD54F',
      dark: '#FF8F00',
    },
    error: {
      main: '#FF1744',
      light: '#FF616F',
      dark: '#C51162',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.08)',
    '0px 8px 16px rgba(0,0,0,0.10)',
    '0px 12px 24px rgba(0,0,0,0.12)',
    '0px 16px 32px rgba(0,0,0,0.14)',
    '0px 20px 40px rgba(0,0,0,0.16)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 28px 56px rgba(0,0,0,0.20)',
    '0px 32px 64px rgba(0,0,0,0.22)',
    ...Array(15).fill('0px 32px 64px rgba(0,0,0,0.22)'),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
        },
        contained: {
          background: 'linear-gradient(45deg, #00D4FF 30%, #FF6B35 90%)',
          boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #33DDFF 30%, #FF8A65 90%)',
            boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: '#00D4FF',
          color: '#00D4FF',
          '&:hover': {
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            borderColor: '#33DDFF',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(26, 31, 46, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(26, 31, 46, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 14, 26, 0.9)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          background: 'linear-gradient(45deg, #00D4FF, #FF6B35)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
      },
    },
  },
});

// Loading component
const LoadingFallback: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="400px"
  >
    <CircularProgress />
  </Box>
);

// Simple Layout component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  // Hide navigation on landing page
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Subnets', path: '/subnets' },
    { label: 'Contracts', path: '/contracts' },
    { label: 'Assets', path: '/assets' },
    { label: 'Monitoring', path: '/monitoring' },
    { label: 'Faucet', path: '/faucet' },
    { label: 'CLI Docs', path: '/cli' },
    { label: 'Wallet', path: '/wallet' },
    { label: 'Settings', path: '/settings' }
  ];

  return (
    <Box>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerrainIcon /> Avalanche Subnet Tooling Suite
          </Typography>
          <Stack direction="row" spacing={2}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
                variant={location.pathname === item.path ? "outlined" : "text"}
                sx={{
                  color: 'white',
                  borderColor: location.pathname === item.path ? 'white' : 'transparent'
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <WalletProvider>
            <EnhancedWalletProvider>
              <WebSocketProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <Layout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<CleanLandingPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/subnets" element={<Subnets />} />
                        <Route path="/contracts" element={<Contracts />} />
                        <Route path="/assets" element={<Assets />} />
                        <Route path="/monitoring" element={<Monitoring />} />
                        <Route path="/cli" element={<CLIDocumentation />} />
                        <Route path="/cli-docs" element={<CLIDocumentation />} />
                        <Route path="/faucet" element={<FaucetPage />} />
                        <Route path="/wallet" element={<WalletPage />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<ErrorBoundary />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </Router>
              </WebSocketProvider>
            </EnhancedWalletProvider>
          </WalletProvider>
        </NotificationProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
