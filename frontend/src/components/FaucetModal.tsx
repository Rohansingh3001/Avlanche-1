import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  AccountBalanceWallet as WalletIcon,
  Token as TokenIcon,
} from '@mui/icons-material';
import { useNotification } from './NotificationProvider';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';
import WalletConnector from './WalletConnector';
import BalanceDisplay from './BalanceDisplay';

interface FaucetModalProps {
  open: boolean;
  onClose: () => void;
}

interface FaucetToken {
  symbol: string;
  name: string;
  amount: string;
  address?: string;
  network: string;
}

const AVAILABLE_TOKENS: FaucetToken[] = [
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    amount: '10',
    network: 'Fuji Testnet',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    amount: '1000',
    address: '0x5425890298aed601595a70AB815c96711a31Bc65',
    network: 'Fuji Testnet',
  },
  {
    symbol: 'WAVAX',
    name: 'Wrapped AVAX',
    amount: '5',
    address: '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3',
    network: 'Fuji Testnet',
  },
  {
    symbol: 'TEST',
    name: 'Test Token',
    amount: '10000',
    address: '0x0000000000000000000000000000000000000000',
    network: 'Local Subnet',
  },
];

const FaucetModal: React.FC<FaucetModalProps> = ({ open, onClose }) => {
  const { showNotification } = useNotification();
  const { account, isConnected, balance } = useEnhancedWallet();
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<FaucetToken>(AVAILABLE_TOKENS[0]);
  const [customAddress, setCustomAddress] = useState('0x3109390df94C5E032dEf00A7816FAa743E0BefE4');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [lastFaucetTime, setLastFaucetTime] = useState<Record<string, number>>({});

  const targetAddress = useCustomAddress ? customAddress : account;

  const handleRequestTokens = async () => {
    if (!targetAddress) {
      showNotification('Please connect wallet or enter a valid address', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Import API service dynamically to avoid import issues
      const { default: apiService } = await import('../services/api');
      
      // Request tokens from the backend faucet
      const result = await apiService.requestFaucetTokens({
        address: targetAddress,
        tokenSymbol: selectedToken.symbol,
      }) as { success: boolean; message?: string };

      if (result.success) {
        showNotification(
          `Successfully requested ${selectedToken.amount} ${selectedToken.symbol}! Tokens will arrive shortly.`,
          'success'
        );
        
        // Update last faucet time for UI cooldown display
        const tokenKey = `${selectedToken.symbol}_${targetAddress}`;
        setLastFaucetTime(prev => ({
          ...prev,
          [tokenKey]: Date.now(),
        }));
      } else {
        throw new Error(result.message || 'Faucet request failed');
      }
      
    } catch (error: any) {
      console.error('Faucet error:', error);
      
      // Handle specific error messages from backend
      if (error.message.includes('wait') && error.message.includes('hours')) {
        showNotification(error.message, 'warning');
      } else {
        showNotification(`Failed to request ${selectedToken.symbol}: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Address copied to clipboard', 'success');
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getCooldownStatus = (tokenSymbol: string) => {
    const tokenKey = `${tokenSymbol}_${targetAddress}`;
    const lastRequest = lastFaucetTime[tokenKey];
    if (!lastRequest) return null;
    
    const cooldownTime = 24 * 60 * 60 * 1000;
    const remainingTime = cooldownTime - (Date.now() - lastRequest);
    
    if (remainingTime > 0) {
      const hours = Math.ceil(remainingTime / (60 * 60 * 1000));
      return `${hours}h remaining`;
    }
    
    return null;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(232, 65, 66, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <TokenIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Avalanche Token Faucet
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Get test tokens for development and testing on Avalanche networks
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Wallet Connection Status */}
          <Grid item xs={12}>
            {!isConnected ? (
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <WalletIcon color="disabled" />
                    <Typography variant="h6">
                      Wallet Status
                    </Typography>
                    <Chip 
                      label="Disconnected" 
                      color="default"
                      size="small"
                    />
                  </Box>
                  <WalletConnector />
                </CardContent>
              </Card>
            ) : (
              <BalanceDisplay 
                compact={false}
                showRefresh={true}
                showTokens={true}
                onBalanceClick={(symbol, balance) => {
                  showNotification(`Current ${symbol} balance: ${balance}`, 'info');
                }}
              />
            )}
          </Grid>

          {/* Token Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Token</InputLabel>
              <Select
                value={AVAILABLE_TOKENS.indexOf(selectedToken)}
                onChange={(e) => setSelectedToken(AVAILABLE_TOKENS[e.target.value as number])}
                label="Select Token"
              >
                {AVAILABLE_TOKENS.map((token, index) => (
                  <MenuItem key={token.symbol} value={index}>
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {token.symbol} - {token.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {token.network}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="primary">
                        {token.amount} {token.symbol}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Custom Address Option */}
          <Grid item xs={12}>
            <Box mb={2} display="flex" gap={1} flexWrap="wrap">
              <Button
                variant={useCustomAddress ? 'contained' : 'outlined'}
                onClick={() => setUseCustomAddress(!useCustomAddress)}
                size="small"
              >
                {useCustomAddress ? 'Use Connected Wallet' : 'Use Custom Address'}
              </Button>
              {!isConnected && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setUseCustomAddress(true);
                    setCustomAddress('0x3109390df94C5E032dEf00A7816FAa743E0BefE4');
                    showNotification('Using your wallet address', 'info');
                  }}
                  size="small"
                  color="secondary"
                >
                  Use My Address
                </Button>
              )}
            </Box>

            {useCustomAddress && (
              <TextField
                fullWidth
                label="Recipient Address"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="0x..."
                helperText="Enter the address to receive tokens"
              />
            )}
          </Grid>

          {/* Faucet Information */}
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2" gutterBottom>
                <strong>Faucet Rules:</strong>
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>Each address can request tokens once every 24 hours per token type</li>
                <li>Testnet tokens have no real value and are for development only</li>
                <li>AVAX is the native gas token needed for transactions</li>
                <li>ERC-20 tokens require AVAX for gas fees to transfer</li>
              </Typography>
            </Alert>
          </Grid>

          {/* Current Selection Summary */}
          {targetAddress && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Request Summary
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">Token:</Typography>
                    <Typography fontWeight="bold">
                      {selectedToken.amount} {selectedToken.symbol}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">Network:</Typography>
                    <Typography>{selectedToken.network}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">Recipient:</Typography>
                    <Typography fontFamily="monospace">
                      {formatAddress(targetAddress)}
                    </Typography>
                  </Box>
                  {selectedToken.address && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography color="text.secondary">Contract:</Typography>
                      <Typography fontFamily="monospace" fontSize="0.8rem">
                        {formatAddress(selectedToken.address)}
                      </Typography>
                    </Box>
                  )}
                  
                  {getCooldownStatus(selectedToken.symbol) && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Cooldown active: {getCooldownStatus(selectedToken.symbol)}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleRequestTokens}
          disabled={!targetAddress || loading || !!getCooldownStatus(selectedToken.symbol)}
          startIcon={loading ? <CircularProgress size={16} /> : <TokenIcon />}
          sx={{
            background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
            minWidth: 150,
          }}
        >
          {loading ? 'Requesting...' : `Request ${selectedToken.symbol}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FaucetModal;