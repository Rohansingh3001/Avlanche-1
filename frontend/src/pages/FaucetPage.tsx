import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import {
  Token as TokenIcon,
  AccountBalanceWallet as WalletIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import FaucetModal from '../components/FaucetModal';
import WalletConnector from '../components/WalletConnector';
import WalletDebugger from '../components/WalletDebugger';
import BalanceDisplay from '../components/BalanceDisplay';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';
import { useNotification } from '../components/NotificationProvider';

interface FaucetTransaction {
  id: string;
  token: string;
  amount: string;
  address: string;
  timestamp: string;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
}

const FaucetPage: React.FC = () => {
  const theme = useTheme();
  const { isConnected, account, balance } = useEnhancedWallet();
  const { showNotification } = useNotification();
  const [faucetModalOpen, setFaucetModalOpen] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<FaucetTransaction[]>([]);

  // Mock recent transactions for demonstration
  useEffect(() => {
    const mockTransactions: FaucetTransaction[] = [
      {
        id: '1',
        token: 'AVAX',
        amount: '10',
        address: '0x1234...5678',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        txHash: '0xabcd...efgh',
        status: 'completed',
      },
      {
        id: '2',
        token: 'USDC',
        amount: '1000',
        address: '0x1234...5678',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        txHash: '0x1234...5678',
        status: 'completed',
      },
      {
        id: '3',
        token: 'WAVAX',
        amount: '5',
        address: '0x9876...5432',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        status: 'pending',
      },
    ];
    setRecentTransactions(mockTransactions);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'pending': return theme.palette.warning.main;
      case 'failed': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderRadius: 2,
          p: 4,
          mb: 4,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Token Faucet
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Get free test tokens for Avalanche development
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<TokenIcon />}
            onClick={() => setFaucetModalOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
              py: 1.5,
              px: 4,
            }}
          >
            Request Tokens
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Wallet Status */}
        <Grid item xs={12} md={6}>
          {!isConnected ? (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <WalletIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Wallet Status</Typography>
                    <Chip 
                      label="Disconnected" 
                      color="default"
                      size="small"
                    />
                  </Box>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Connect your wallet to request tokens and view your balance
                </Alert>
                <WalletConnector />
              </CardContent>
            </Card>
          ) : (
            <BalanceDisplay 
              showRefresh={true} 
              showTokens={true}
              onBalanceClick={(symbol, balance) => {
                showNotification(`${symbol} Balance: ${balance}`, 'info');
              }}
            />
          )}
        </Grid>

        {/* Available Tokens */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <TokenIcon />
                </Avatar>
                <Typography variant="h6">Available Tokens</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { symbol: 'AVAX', name: 'Avalanche', amount: '10', network: 'Fuji Testnet' },
                  { symbol: 'USDC', name: 'USD Coin', amount: '1000', network: 'Fuji Testnet' },
                  { symbol: 'WAVAX', name: 'Wrapped AVAX', amount: '5', network: 'Fuji Testnet' },
                  { symbol: 'TEST', name: 'Test Token', amount: '10000', network: 'Local Subnet' },
                ].map((token) => (
                  <Box 
                    key={token.symbol}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {token.symbol}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {token.name} • {token.network}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {token.amount} {token.symbol}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Faucet Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <InfoIcon />
                </Avatar>
                <Typography variant="h6">How to Use the Faucet</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary" gutterBottom>
                      1. Connect Wallet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Connect your Core Wallet or MetaMask to the Avalanche Fuji testnet
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary" gutterBottom>
                      2. Select Token
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose the token you want to receive from the available options
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary" gutterBottom>
                      3. Request Tokens
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click request and wait for the tokens to arrive in your wallet
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> These are test tokens with no real value. Each address can request tokens once every 24 hours per token type.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Wallet Debugger - for troubleshooting */}
        <Grid item xs={12}>
          <WalletDebugger />
        </Grid>

        {/* Recent Faucet Activity */}
        {recentTransactions.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                    <TimelineIcon />
                  </Avatar>
                  <Typography variant="h6">Recent Faucet Activity</Typography>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Token</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Recipient</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {tx.token}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {tx.amount} {tx.token}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {formatAddress(tx.address)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatTime(tx.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tx.status}
                              size="small"
                              sx={{
                                bgcolor: alpha(getStatusColor(tx.status), 0.1),
                                color: getStatusColor(tx.status),
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Faucet Modal */}
      <FaucetModal
        open={faucetModalOpen}
        onClose={() => setFaucetModalOpen(false)}
      />
    </Container>
  );
};

export default FaucetPage;