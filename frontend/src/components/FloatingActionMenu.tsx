import React, { useState, useEffect } from 'react';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import {
  RocketLaunch,
  Code,
  KeyboardArrowUp,
  GitHub,
  Twitter,
  Dashboard,
  MenuBook,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface FloatingActionMenuProps {
  onScrollToTop?: () => void;
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ onScrollToTop }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onScrollToTop?.();
  };

  const actions = [
    {
      icon: <RocketLaunch />,
      name: 'Get Started',
      action: () => navigate('/dashboard'),
      color: theme.palette.primary.main,
    },
    {
      icon: <Code />,
      name: 'CLI Docs',
      action: () => navigate('/cli'),
      color: theme.palette.secondary.main,
    },
    {
      icon: <Dashboard />,
      name: 'Dashboard',
      action: () => navigate('/dashboard'),
      color: theme.palette.info.main,
    },
    {
      icon: <GitHub />,
      name: 'GitHub',
      action: () => window.open('https://github.com/ava-labs/avalanche-cli', '_blank'),
      color: theme.palette.text.primary,
    },
    {
      icon: <MenuBook />,
      name: 'Documentation',
      action: () => window.open('https://docs.avax.network/', '_blank'),
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'flex-end',
      }}
    >
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Tooltip title="Back to Top" placement="left">
          <Fab
            size="small"
            onClick={handleScrollToTop}
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              color: theme.palette.text.primary,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                transform: 'scale(1.1) translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'fadeInUp 0.5s ease-out',
              '@keyframes fadeInUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Tooltip>
      )}

      {/* Speed Dial Menu */}
      <SpeedDial
        ariaLabel="Quick Actions"
        icon={<SpeedDialIcon />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="up"
        sx={{
          '& .MuiFab-primary': {
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              transform: 'scale(1.1)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .MuiSpeedDial-actions': {
            paddingBottom: 1,
          },
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipPlacement="left"
            onClick={() => {
              action.action();
              setOpen(false);
            }}
            FabProps={{
              sx: {
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                color: action.color,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(action.color, 0.3)}`,
                '&:hover': {
                  bgcolor: alpha(action.color, 0.1),
                  color: action.color,
                  transform: 'scale(1.1)',
                  boxShadow: `0 4px 20px ${alpha(action.color, 0.3)}`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem',
                },
              },
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default FloatingActionMenu;
