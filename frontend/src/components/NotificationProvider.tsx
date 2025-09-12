import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertColor,
  Slide,
  SlideProps,
  IconButton,
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { Close, CheckCircle, Error as ErrorIcon, Warning, Info } from '@mui/icons-material';

interface NotificationContextType {
  showNotification: (message: string, type?: AlertColor, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface Notification {
  id: string;
  message: string;
  type: AlertColor;
  duration: number;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: AlertColor = 'info', duration = 6000) => {
    const id = Math.random().toString(36).substring(2, 11);
    const notification: Notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(message, 'info');
  }, [showNotification]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: AlertColor) => {
    switch (type) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <Warning />;
      case 'info':
        return <Info />;
      default:
        return <Info />;
    }
  };

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Box
        sx={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 400,
        }}
      >
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            severity={notification.type}
            icon={getIcon(notification.type)}
            sx={{
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette[notification.type].main, 0.1)} 0%, 
                ${alpha(theme.palette[notification.type].main, 0.05)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette[notification.type].main, 0.3)}`,
              borderRadius: 2,
              boxShadow: `0 8px 32px ${alpha(theme.palette[notification.type].main, 0.2)}`,
              color: theme.palette[notification.type].main,
              '& .MuiAlert-icon': {
                color: theme.palette[notification.type].main,
              },
              animation: 'slideInRight 0.3s ease-out',
              '@keyframes slideInRight': {
                '0%': {
                  transform: 'translateX(100%)',
                  opacity: 0,
                },
                '100%': {
                  transform: 'translateX(0)',
                  opacity: 1,
                },
              },
            }}
            action={
              <IconButton
                size="small"
                onClick={() => removeNotification(notification.id)}
                sx={{
                  color: theme.palette[notification.type].main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette[notification.type].main, 0.1),
                  },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            }
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {notification.message}
            </Typography>
          </Alert>
        ))}
      </Box>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
