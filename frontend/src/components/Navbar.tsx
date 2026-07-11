import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  AccountTree as SubnetsIcon,
  Code as ContractsIcon,
  Token as AssetsIcon,
  Monitor as MonitoringIcon,
  Terminal as TerminalIcon,
  Wallet as WalletIcon,
  Settings as SettingsIcon,
  Terrain as TerrainIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <HomeIcon fontSize="small" /> },
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Subnets', path: '/subnets', icon: <SubnetsIcon fontSize="small" /> },
  { label: 'Contracts', path: '/contracts', icon: <ContractsIcon fontSize="small" /> },
  { label: 'Assets', path: '/assets', icon: <AssetsIcon fontSize="small" /> },
  { label: 'Monitoring', path: '/monitoring', icon: <MonitoringIcon fontSize="small" /> },
  { label: 'Faucet', path: '/faucet', icon: <TerminalIcon fontSize="small" /> },
  { label: 'CLI Docs', path: '/cli', icon: <TerminalIcon fontSize="small" /> },
  { label: 'Wallet', path: '/wallet', icon: <WalletIcon fontSize="small" /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon fontSize="small" /> },
];

const primaryNavItems = navItems.slice(1, 8); // Dashboard → CLI Docs
const allNavItems = navItems;

const Navbar: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const drawerContent = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        background: '#F4F8F5',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #D1DDD6',
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: '1px solid #D1DDD6',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TerrainIcon sx={{ color: '#056B5D', fontSize: 22 }} />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: '#056B5D',
              fontSize: '0.95rem',
            }}
          >
            Avalanche Suite
          </Typography>
        </Box>
        <IconButton
          onClick={toggleDrawer}
          size="small"
          sx={{ color: '#5C6E64', '&:hover': { color: '#056B5D' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Status badge */}
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Chip
          icon={<CircleIcon sx={{ fontSize: '8px !important', color: '#10B981 !important' }} />}
          label="Fuji Testnet"
          size="small"
          sx={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#10B981',
            fontSize: '0.75rem',
            height: 24,
          }}
        />
      </Box>

      <Divider sx={{ borderColor: '#D1DDD6', mx: 2 }} />

      {/* Nav Items */}
      <List sx={{ flex: 1, pt: 1, px: 1 }}>
        {allNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={toggleDrawer}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  position: 'relative',
                  background: active
                    ? 'rgba(5, 107, 93, 0.08)'
                    : 'transparent',
                  border: active ? '1px solid rgba(5, 107, 93, 0.15)' : '1px solid transparent',
                  '&:hover': {
                    background: 'rgba(5, 107, 93, 0.04)',
                    border: '1px solid rgba(5, 107, 93, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: active ? '#056B5D' : '#5C6E64',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: active ? 700 : 400,
                    color: active ? '#056B5D' : '#2C3A33',
                  }}
                />
                {active && (
                  <Box
                    sx={{
                      width: 4,
                      height: '60%',
                      borderRadius: 2,
                      background: '#056B5D',
                      position: 'absolute',
                      right: 8,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #D1DDD6' }}>
        <Typography variant="caption" sx={{ color: '#5C6E64', fontSize: '0.7rem' }}>
          Avalanche Subnet Suite v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: scrolled
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #D1DDD6',
          boxShadow: scrolled
            ? '0 4px 20px rgba(5,107,93,0.05)'
            : 'none',
          transition: 'all 0.3s ease',
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: { xs: 56, md: 64 } }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              mr: 3,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                background: '#056B5D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TerrainIcon sx={{ color: '#ffffff', fontSize: 18 }} />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                color: '#2C3A33',
                letterSpacing: '-0.02em',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Avalanche Suite
            </Typography>
          </Box>

          {/* Desktop Nav Links */}
          {!isTablet && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
              {primaryNavItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    size="small"
                    sx={{
                      color: active ? '#056B5D' : '#5C6E64',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.85rem',
                      px: 2,
                      py: 0.75,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      position: 'relative',
                      background: active
                        ? 'rgba(5, 107, 93, 0.08)'
                        : 'transparent',
                      border: active
                        ? '1px solid rgba(5, 107, 93, 0.15)'
                        : '1px solid transparent',
                      '&:hover': {
                        color: '#056B5D',
                        background: 'rgba(5, 107, 93, 0.04)',
                        border: '1px solid rgba(5, 107, 93, 0.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Spacer on tablet */}
          {isTablet && <Box sx={{ flex: 1 }} />}

          {/* Right Side — Network chip + Wallet + Hamburger */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Network indicator — desktop only */}
            {!isMobile && (
              <Chip
                icon={<CircleIcon sx={{ fontSize: '8px !important', color: '#10B981 !important' }} />}
                label="Fuji Testnet"
                size="small"
                sx={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  color: '#10B981',
                  fontSize: '0.72rem',
                  height: 26,
                  mr: 0.5,
                }}
              />
            )}

            {/* Wallet / Settings quick links — tablet + desktop */}
            {!isTablet && (
              <>
                <Tooltip title="Wallet">
                  <IconButton
                    component={Link}
                    to="/wallet"
                    size="small"
                    sx={{
                      color: isActive('/wallet') ? '#056B5D' : '#5C6E64',
                      border: '1px solid',
                      borderColor: isActive('/wallet') ? '#056B5D' : '#D1DDD6',
                      borderRadius: 1.5,
                      p: '6px',
                      '&:hover': { color: '#056B5D', borderColor: '#056B5D' },
                    }}
                  >
                    <WalletIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings">
                  <IconButton
                    component={Link}
                    to="/settings"
                    size="small"
                    sx={{
                      color: isActive('/settings') ? '#056B5D' : '#5C6E64',
                      border: '1px solid',
                      borderColor: isActive('/settings') ? '#056B5D' : '#D1DDD6',
                      borderRadius: 1.5,
                      p: '6px',
                      '&:hover': { color: '#056B5D', borderColor: '#056B5D' },
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {/* Hamburger — tablet/mobile */}
            {isTablet && (
              <IconButton
                id="navbar-menu-toggle"
                onClick={toggleDrawer}
                size="small"
                sx={{
                  color: '#5C6E64',
                  border: '1px solid #D1DDD6',
                  borderRadius: 1.5,
                  p: '6px',
                  '&:hover': {
                    color: '#056B5D',
                    borderColor: '#056B5D',
                    background: 'rgba(5, 107, 93, 0.04)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {drawerOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile/Tablet Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            background: 'transparent',
            boxShadow: '-4px 0 40px rgba(5,107,93,0.05)',
          },
        }}
      >
        {drawerOpen && drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
