/**
 * Avalanche L2 Network Selector Component
 * Allows users to easily switch between different Avalanche networks and L2 solutions
 */

import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  SwapHoriz as SwitchIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { AVALANCHE_NETWORKS, isL2Network } from '../config/avalanche';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';

interface NetworkSelectorProps {
  variant?: 'select' | 'dialog';
  showBalance?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  variant = 'select',
  showBalance = true,
  size = 'medium'
}) => {
  const {
    chainId,
    switchNetwork,
    balance,
    isLoading,
    error,
    addAvalancheNetwork,
    getCurrentNetwork
  } = useEnhancedWallet();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  const currentNetwork = getCurrentNetwork?.() || null;
  const availableNetworks = Object.values(AVALANCHE_NETWORKS);

  const handleNetworkSwitch = async (targetChainId: number) => {
    try {
      await switchNetwork?.(targetChainId);
      const network = availableNetworks.find(n => n.chainId === targetChainId);
      setSnackbarMessage(`Successfully switched to ${network?.displayName}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error switching network:', error);
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to switch network');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAddNetwork = async (networkKey: string) => {
    try {
      await addAvalancheNetwork?.(networkKey);
      const network = AVALANCHE_NETWORKS[networkKey];
      setSnackbarMessage(`Successfully added ${network.displayName}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding network:', error);
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to add network');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const NetworkChip: React.FC<{ network: any; isActive?: boolean }> = ({ network, isActive }) => (
    <Chip
      avatar={<Avatar sx={{ width: 20, height: 20 }}>{network.symbol?.charAt(0) || 'A'}</Avatar>}
      label={
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2">{network.displayName}</Typography>
          {isL2Network(network.chainId) && (
            <Chip label="L2" size="small" color="secondary" sx={{ height: 16, fontSize: '0.7rem' }} />
          )}
          {network.isTestnet && (
            <Chip label="Test" size="small" color="warning" sx={{ height: 16, fontSize: '0.7rem' }} />
          )}
        </Box>
      }
      color={isActive ? 'primary' : 'default'}
      variant={isActive ? 'filled' : 'outlined'}
      sx={{ minWidth: 200 }}
    />
  );

  if (variant === 'select') {
    return (
      <Box>
        <FormControl size={size === 'large' ? 'medium' : size} sx={{ minWidth: 250 }}>
          <InputLabel>Network</InputLabel>
          <Select
            value={chainId || ''}
            onChange={(e) => handleNetworkSwitch(Number(e.target.value))}
            disabled={isLoading}
            startAdornment={<WalletIcon sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            {availableNetworks.map((network) => (
              <MenuItem key={network.chainId} value={network.chainId}>
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {network.nativeCurrency.symbol.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2">{network.displayName}</Typography>
                    <Box display="flex" gap={0.5} mt={0.5}>
                      {isL2Network(network.chainId) && (
                        <Chip label="L2" size="small" color="secondary" />
                      )}
                      {network.isTestnet && (
                        <Chip label="Testnet" size="small" color="warning" />
                      )}
                    </Box>
                  </Box>
                  {showBalance && chainId === network.chainId && balance && (
                    <Typography variant="body2" color="text.secondary">
                      {balance} {network.nativeCurrency.symbol}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {currentNetwork && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Current: {currentNetwork.displayName} 
              {isL2Network(currentNetwork.chainId) && ' (Layer 2)'}
            </Typography>
          </Box>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<SwitchIcon />}
        onClick={() => setDialogOpen(true)}
        disabled={isLoading}
        sx={{ minWidth: 200 }}
      >
        {currentNetwork ? (
          <NetworkChip network={currentNetwork} isActive />
        ) : (
          'Select Network'
        )}
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WalletIcon />
            <Typography variant="h6">Select Avalanche Network</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Choose from Avalanche's Layer 1 (C-Chain) or Layer 2 subnets. 
              L2 networks offer lower fees and specialized functionality.
            </Typography>
          </Alert>

          <List>
            {availableNetworks.map((network) => {
              const isActive = chainId === network.chainId;
              const isL2 = isL2Network(network.chainId);
              
              return (
                <ListItem key={network.chainId} divider>
                  <ListItemIcon>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {network.nativeCurrency.symbol.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">{network.displayName}</Typography>
                        {isL2 && (
                          <Chip label="Layer 2" size="small" color="secondary" />
                        )}
                        {network.isTestnet && (
                          <Chip label="Testnet" size="small" color="warning" />
                        )}
                        {isActive && (
                          <Chip label="Connected" size="small" color="success" icon={<CheckIcon />} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Chain ID: {network.chainId} • Currency: {network.nativeCurrency.symbol}
                        </Typography>
                        {isActive && showBalance && balance && (
                          <Typography variant="body2" color="primary">
                            Balance: {balance} {network.nativeCurrency.symbol}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    {isActive ? (
                      <Chip label="Active" color="success" icon={<CheckIcon />} />
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleNetworkSwitch(network.chainId)}
                        disabled={isLoading}
                      >
                        Switch
                      </Button>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NetworkSelector;