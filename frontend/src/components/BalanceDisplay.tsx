import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Refresh as RefreshIcon,
  Token as TokenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';
import { useTokenBalances, useNativeBalance } from '../hooks/useTokenBalances';

interface BalanceDisplayProps {
  compact?: boolean;
  showRefresh?: boolean;
  showTokens?: boolean;
  onBalanceClick?: (symbol: string, balance: string) => void;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  compact = false,
  showRefresh = true,
  showTokens = true,
  onBalanceClick,
}) => {
  const { isConnected, account, chainId } = useEnhancedWallet();
  const { balance, refresh } = useNativeBalance();
  const { balances, isLoading, refreshBalances } = useTokenBalances();
  const [showAllBalances, setShowAllBalances] = React.useState(!compact);

  const handleRefresh = async () => {
    if (refresh) {
      await refresh();
    }
    if (showTokens) {
      refreshBalances();
    }
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 43114: return 'Avalanche C-Chain';
      case 43113: return 'Avalanche Fuji Testnet';
      default: return `Chain ${chainId}`;
    }
  };

  if (!isConnected) {
    return (
      <Alert severity="info">
        Connect your wallet to view balances
      </Alert>
    );
  }

  if (compact) {
    return (
      <Card variant="outlined" sx={{ minWidth: 200 }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Balance
            </Typography>
            {showRefresh && (
              <IconButton 
                size="small" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
              </IconButton>
            )}
          </Box>
          <Typography 
            variant="h6" 
            sx={{ cursor: onBalanceClick ? 'pointer' : 'default' }}
            onClick={() => onBalanceClick?.('AVAX', balance)}
          >
            {balance} AVAX
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getNetworkName(chainId)}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <WalletIcon color="primary" />
            <Typography variant="h6">Wallet Balance</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {showTokens && (
              <Tooltip title={showAllBalances ? 'Hide tokens' : 'Show tokens'}>
                <IconButton 
                  size="small" 
                  onClick={() => setShowAllBalances(!showAllBalances)}
                >
                  {showAllBalances ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Tooltip>
            )}
            {showRefresh && (
              <Tooltip title="Refresh balances">
                <IconButton 
                  size="small" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <List dense>
          {/* Native AVAX Balance */}
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <WalletIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight="bold">
                    AVAX
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    sx={{ cursor: onBalanceClick ? 'pointer' : 'default' }}
                    onClick={() => onBalanceClick?.('AVAX', balance)}
                  >
                    {balance}
                  </Typography>
                </Box>
              }
              secondary="Native Avalanche Token"
            />
          </ListItem>

          {/* Token Balances */}
          {showTokens && showAllBalances && (
            <>
              <Divider sx={{ my: 1 }} />
              {Object.entries(balances).map(([symbol, tokenBalance]) => (
                <ListItem key={symbol} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {tokenBalance.isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <TokenIcon color="secondary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          {symbol}
                        </Typography>
                        <Typography 
                          variant="body2"
                          color={tokenBalance.error ? 'error' : 'text.primary'}
                          sx={{ cursor: onBalanceClick && !tokenBalance.error ? 'pointer' : 'default' }}
                          onClick={() => !tokenBalance.error && onBalanceClick?.(symbol, tokenBalance.balance)}
                        >
                          {tokenBalance.error ? 'Error' : tokenBalance.balance}
                        </Typography>
                      </Box>
                    }
                    secondary={tokenBalance.error || 'ERC-20 Token'}
                  />
                </ListItem>
              ))}
            </>
          )}
        </List>

        {/* Network Info */}
        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary">
            Network: {getNetworkName(chainId)}
          </Typography>
          {account && (
            <Typography variant="caption" color="text.secondary" display="block">
              Address: {`${account.slice(0, 6)}...${account.slice(-4)}`}
            </Typography>
          )}
        </Box>

        {/* Refresh Button */}
        {showRefresh && (
          <Box mt={2}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRefresh}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
              fullWidth
            >
              {isLoading ? 'Refreshing...' : 'Refresh Balances'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceDisplay;