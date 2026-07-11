export { };

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';

// Contexts
import { WalletProvider } from './contexts/WalletContext';
import { EnhancedWalletProvider } from './contexts/EnhancedWalletContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import NotificationProvider from './components/NotificationProvider';
import Navbar from './components/Navbar';

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
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#056B5D', // Deep Forest Teal
      light: '#0C8B7B',
      dark: '#024F44',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0C8B7B', // Vibrant Mint
      light: '#2BB0A0',
      dark: '#056B5D',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4F8F5', // Light Cream/Mint Background
      paper: '#ffffff', // Card panels
    },
    text: {
      primary: '#2C3A33', // Charcoal/Slate
      secondary: '#5C6E64', // Muted Sage
    },
    divider: '#D1DDD6',
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
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
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 4px 12px rgba(5, 107, 93, 0.04)',
    '0px 8px 24px rgba(5, 107, 93, 0.06)',
    '0px 12px 32px rgba(5, 107, 93, 0.08)',
    '0px 16px 40px rgba(5, 107, 93, 0.1)',
    ...Array(20).fill('0px 16px 40px rgba(5, 107, 93, 0.1)'),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 20px',
          fontSize: '0.95rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #056B5D 0%, #0C8B7B 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #0C8B7B 0%, #056B5D 100%)',
            boxShadow: '0 4px 14px rgba(5, 107, 93, 0.25)',
            transform: 'translateY(-2px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #0C8B7B 0%, #2BB0A0 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #2BB0A0 0%, #0C8B7B 100%)',
            boxShadow: '0 4px 14px rgba(12, 139, 123, 0.25)',
            transform: 'translateY(-2px)',
          },
        },
        outlinedPrimary: {
          borderColor: '#D1DDD6',
          color: '#056B5D',
          '&:hover': {
            backgroundColor: 'rgba(5, 107, 93, 0.04)',
            borderColor: '#056B5D',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: '#ffffff',
          border: '1px solid #D1DDD6',
          boxShadow: '0 4px 12px rgba(5, 107, 93, 0.03)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: '#ffffff',
          border: '1px solid #D1DDD6',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          borderBottom: '1px solid #D1DDD6',
          boxShadow: 'none',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          color: '#2C3A33',
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

  // Hide navigation on landing page (it has its own nav)
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
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
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </Router>
              </WebSocketProvider>
            </EnhancedWalletProvider>
          </WalletProvider>
        </NotificationProvider>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
