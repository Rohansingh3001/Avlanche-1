import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Stack,
} from '@mui/material';
import {
  AccountBalanceWallet,
  ContentCopy,
  CheckCircle,
  Error,
  Refresh,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { alpha } from '@mui/material/styles';

const WalletConnection: React.FC = () => {
  const {
    isConnected,
    account,
    chainId,
    balance,
    connect,
    disconnect,
    switchNetwork,
    walletType,
  } = useWallet();

  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleSwitchToAvalanche = async () => {
    try {
      await switchNetwork(43114); // Avalanche C-Chain
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const getNetworkName = (chainId: number | null): string => {
    switch (chainId) {
      case 43114:
        return 'Avalanche C-Chain';
      case 43113:
        return 'Avalanche Fuji Testnet';
      case 1:
        return 'Ethereum Mainnet';
      default:
        return 'Unknown Network';
    }
  };

  const getNetworkColor = (chainId: number | null): 'success' | 'warning' | 'error' => {
    switch (chainId) {
      case 43114:
      case 43113:
        return 'success';
      case 1:
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <Card
      sx={{
        background: (theme) => 
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <AccountBalanceWallet color="primary" />
              <Typography variant="h6">Wallet Connection</Typography>
            </Box>
            {isConnected && (
              <Chip
                icon={<CheckCircle />}
                label={walletType === 'core' ? 'Core Wallet' : 'MetaMask'}
                color="success"
                size="small"
              />
            )}
          </Box>

          {/* Connection Status */}
          {!isConnected ? (
            <Alert severity="info" action={
              <Button color="inherit" size="small" onClick={handleConnectWallet}>
                Connect
              </Button>
            }>
              Connect your wallet to interact with Avalanche subnets
            </Alert>
          ) : (
            <Stack spacing={2}>
              {/* Account Address */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Connected Account
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontFamily="monospace">
                    {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'N/A'}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                    <IconButton size="small" onClick={handleCopyAddress}>
                      {copied ? <CheckCircle color="success" /> : <ContentCopy />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Network Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Network
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={getNetworkName(chainId)}
                    color={getNetworkColor(chainId)}
                    size="small"
                  />
                  {chainId !== 43114 && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleSwitchToAvalanche}
                    >
                      Switch to Avalanche
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Balance */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Balance
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">
                    {balance ? `${balance} AVAX` : 'Loading...'}
                  </Typography>
                  <IconButton size="small">
                    <Refresh />
                  </IconButton>
                </Box>
              </Box>

              {/* Actions */}
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={disconnect}
                  color="secondary"
                >
                  Disconnect
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.open(`https://snowtrace.io/address/${account}`, '_blank')}
                >
                  View on SnowTrace
                </Button>
              </Box>
            </Stack>
          )}

          {/* Wallet Installation Help */}
          {!window.avalanche && !window.ethereum && (
            <Alert severity="warning">
              <Typography variant="body2">
                No wallet detected. Install{' '}
                <a
                  href="https://core.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', fontWeight: 'bold' }}
                >
                  Core Wallet
                </a>{' '}
                (recommended for Avalanche) or{' '}
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', fontWeight: 'bold' }}
                >
                  MetaMask
                </a>
              </Typography>
            </Alert>
          )}

          {/* Core Wallet Recommendation */}
          {!window.avalanche && window.ethereum && (
            <Alert severity="info">
              <Typography variant="body2">
                For the best Avalanche experience, consider using{' '}
                <a
                  href="https://core.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', fontWeight: 'bold' }}
                >
                  Core Wallet
                </a>
                , the native Avalanche wallet with built-in subnet support.
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WalletConnection;