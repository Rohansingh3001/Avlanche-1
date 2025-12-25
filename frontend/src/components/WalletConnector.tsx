import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Launch as LaunchIcon,
  Warning as WarningIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';
import { useNotification } from './NotificationProvider';

interface WalletConnectorProps {
  onConnect?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
}

const WalletConnector: React.FC<WalletConnectorProps> = ({
  onConnect,
  size = 'medium',
  variant = 'contained'
}) => {
  const { showNotification } = useNotification();
  const {
    isConnected,
    account,
    connect,
    disconnect,
    balance,
    chainId,
    walletType,
    isLoading,
    error,
    refreshBalance
  } = useEnhancedWallet();

  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      showNotification('Wallet connected successfully!', 'success');
      onConnect?.();
    } catch (error: any) {
      console.error('Connection error:', error);
      showNotification(`Failed to connect wallet: ${error.message}`, 'error');

      // Show help dialog if no wallet is detected
      if (error.message.includes('No supported wallet found')) {
        setHelpDialogOpen(true);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    showNotification('Wallet disconnected', 'info');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 43114: return 'Avalanche C-Chain';
      case 43113: return 'Avalanche Fuji Testnet';
      case 1: return 'Ethereum Mainnet';
      default: return `Chain ${chainId}`;
    }
  };

  if (isConnected && account) {
    return (
      <Card variant="outlined" sx={{ maxWidth: 400 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <WalletIcon color="success" />
            <Box flex={1}>
              <Typography variant="h6">
                {walletType === 'core' ? 'Core Wallet' : 'MetaMask'} Connected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatAddress(account)}
              </Typography>
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Network: {getNetworkName(chainId)}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Balance: {balance || '0.0000'} AVAX
              </Typography>
              {refreshBalance && (
                <Button
                  size="small"
                  variant="text"
                  onClick={refreshBalance}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <SyncIcon />
                </Button>
              )}
            </Box>
          </Box>

          <Button
            variant="outlined"
            onClick={handleDisconnect}
            size="small"
            fullWidth
          >
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant={variant}
          size={size}
          startIcon={<WalletIcon />}
          onClick={handleConnect}
          disabled={isLoading}
          sx={{
            ...(variant === 'contained' && {
              background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
            }),
          }}
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>

        <Button
          variant="text"
          size="small"
          onClick={() => setHelpDialogOpen(true)}
          sx={{ ml: 1 }}
        >
          Need Help?
        </Button>
      </Box>

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="md">
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            Wallet Setup Help
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            To connect your wallet, you need to install a compatible wallet extension:
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <WalletIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Core Wallet (Recommended)"
                secondary="The official Avalanche wallet with native subnet support"
              />
              <Button
                variant="outlined"
                size="small"
                endIcon={<LaunchIcon />}
                onClick={() => window.open('https://core.app/', '_blank')}
              >
                Install
              </Button>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <WalletIcon />
              </ListItemIcon>
              <ListItemText
                primary="MetaMask"
                secondary="Popular Ethereum wallet with Avalanche network support"
              />
              <Button
                variant="outlined"
                size="small"
                endIcon={<LaunchIcon />}
                onClick={() => window.open('https://metamask.io/', '_blank')}
              >
                Install
              </Button>
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>After installation:</strong>
              <br />
              1. Refresh this page
              <br />
              2. Click "Connect Wallet"
              <br />
              3. Follow the wallet prompts to connect
              <br />
              4. Make sure you're on the correct network (Avalanche C-Chain or Fuji Testnet)
            </Typography>
          </Alert>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Troubleshooting:</strong>
              <br />
              • Make sure your wallet extension is enabled
              <br />
              • Try refreshing the page
              <br />
              • Check if your wallet is locked and unlock it
              <br />
              • Ensure you're on the correct network
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setHelpDialogOpen(false);
              window.location.reload();
            }}
          >
            Refresh Page
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletConnector;