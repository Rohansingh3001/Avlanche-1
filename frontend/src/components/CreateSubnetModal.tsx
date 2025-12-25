import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Grid,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  RocketLaunch,
  CheckCircle,
  Settings,
  Security,
  Code,
  NetworkCheck,
  AccountBalanceWallet,
  Warning,
  Info,
} from '@mui/icons-material';
import { useNotification } from './NotificationProvider';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';
import { ethers } from 'ethers';

interface SubnetConfig {
  name: string;
  description: string;
  chainId: string;
  tokenSymbol: string;
  tokenName: string;
  blockchainType: string;
  initialAllocation: string;
  gasLimit: string;
  targetBlockRate: string;
  minValidators: string;
  maxValidators: string;
  minStake: string;
  network: string;
}

interface CreateSubnetModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (subnetData?: any) => void;
}

const CreateSubnetModal: React.FC<CreateSubnetModalProps> = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const { showSuccess, showError, showInfo } = useNotification();
  const { 
    isConnected, 
    account, 
    balance, 
    chainId, 
    connect, 
    switchNetwork, 
    getCurrentNetwork,
    walletType,
    isLoading: walletLoading
  } = useEnhancedWallet();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [walletChecked, setWalletChecked] = useState(false);
  const [sufficientFunds, setSufficientFunds] = useState(false);
  const [config, setConfig] = useState<SubnetConfig>({
    name: '',
    description: '',
    chainId: '',
    tokenSymbol: '',
    tokenName: '',
    blockchainType: 'EVM',
    initialAllocation: '1000000',
    gasLimit: '8000000',
    targetBlockRate: '2',
    minValidators: '1',
    maxValidators: '10',
    minStake: '25',
    network: 'fuji',
  });

  const steps = [
    {
      label: 'Wallet Connection',
      description: 'Connect and validate your wallet',
      icon: <AccountBalanceWallet />,
    },
    {
      label: 'Basic Configuration',
      description: 'Set up your subnet basics',
      icon: <Settings />,
    },
    {
      label: 'Token Configuration',
      description: 'Configure your native token',
      icon: <Code />,
    },
    {
      label: 'Network Settings',
      description: 'Configure network parameters',
      icon: <NetworkCheck />,
    },
    {
      label: 'Review & Deploy',
      description: 'Review and create your subnet',
      icon: <RocketLaunch />,
    },
  ];

  // Check wallet status and funds when modal opens
  useEffect(() => {
    if (open && isConnected && account && balance) {
      setWalletChecked(true);
      // Check if user has sufficient funds for subnet creation (minimum 1 AVAX)
      const minRequiredBalance = 1.0;
      setSufficientFunds(parseFloat(balance) >= minRequiredBalance);
    } else if (open) {
      setWalletChecked(false);
      setSufficientFunds(false);
    }
  }, [open, isConnected, account, balance]);

  // Reset modal state when closed
  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setWalletChecked(false);
      setSufficientFunds(false);
    }
  }, [open]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleInputChange = (field: keyof SubnetConfig) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setConfig(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return isConnected && walletChecked && sufficientFunds;
      case 1:
        return config.name.length >= 3 && config.chainId.length > 0;
      case 2:
        return config.tokenName.length > 0 && config.tokenSymbol.length > 0;
      case 3:
        return config.gasLimit.length > 0 && config.targetBlockRate.length > 0 && config.minStake.length > 0;
      default:
        return true;
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
      showSuccess('Wallet connected successfully!');
    } catch (error) {
      showError('Failed to connect wallet. Please try again.');
    }
  };

  const handleSwitchNetwork = async (targetNetwork: string) => {
    try {
      let targetChainId: number;
      switch (targetNetwork) {
        case 'fuji':
          targetChainId = 43113;
          break;
        case 'mainnet':
          targetChainId = 43114;
          break;
        default:
          targetChainId = 43113; // Default to Fuji
      }
      
      await switchNetwork(targetChainId);
      showSuccess(`Switched to ${targetNetwork} network`);
    } catch (error) {
      showError(`Failed to switch to ${targetNetwork} network`);
    }
  };

  const createSubnet = async () => {
    setLoading(true);
    try {
      // Wallet validation
      if (!isConnected || !account) {
        throw new Error('Wallet must be connected to create a subnet');
      }

      if (!sufficientFunds) {
        throw new Error('Insufficient AVAX balance for subnet creation');
      }

      if (chainId && ![43113, 43114].includes(chainId)) {
        throw new Error('Please switch to Avalanche Fuji Testnet or Mainnet');
      }

      // Basic validation
      if (!config.name || config.name.trim().length < 3) {
        throw new Error('Subnet name must be at least 3 characters long');
      }
      
      if (!config.chainId || parseInt(config.chainId) < 1) {
        throw new Error('Chain ID must be a positive integer');
      }
      
      showInfo('Creating subnet... This may take a few minutes.');
      
      // Prepare subnet data for API
      const vmTypeMapping: Record<'EVM' | 'SpacesVM' | 'Custom', string> = {
        EVM: 'SubnetEVM',
        SpacesVM: 'SpacesVM',
        Custom: 'Custom'
      };

      const blockchainType = config.blockchainType as 'EVM' | 'SpacesVM' | 'Custom';

      const subnetData = {
        name: config.name?.trim(),
        description: config.description?.trim() || '',
        chainId: parseInt(config.chainId) || Math.floor(Math.random() * 100000) + 1000,
        vmType: vmTypeMapping[blockchainType] || 'SubnetEVM',
        networkId: config.network === 'fuji' ? 5 : config.network === 'mainnet' ? 1 : 1337,
        validators: {
          minValidators: parseInt(config.minValidators) || 1,
          maxValidators: parseInt(config.maxValidators) || 10,
          minStake: parseFloat(config.minStake || '25')
        },
        token: {
          name: config.tokenName,
          symbol: config.tokenSymbol,
          decimals: 18,
          initialSupply: config.initialAllocation
        },
        deployment: {
          target: config.network,
          autoStart: true
        },
        // Include wallet information for validation
        walletInfo: {
          address: account,
          walletType: walletType,
          chainId: chainId,
          balance: balance
        }
      };
      
      const response = await fetch('/api/subnets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': account, // Include wallet address in header for backend validation
        },
        body: JSON.stringify(subnetData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
          
          // Log detailed validation errors for debugging
          if (errorData.error?.details) {
            console.error('Validation details:', errorData.error.details);
            if (Array.isArray(errorData.error.details)) {
              const validationErrors = errorData.error.details.map((err: any) => err.msg || err.message).join(', ');
              errorMessage = `Validation failed: ${validationErrors}`;
            }
          }
        } catch (jsonError) {
          // Response might not be JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response format from server');
      }
      
      showSuccess(`Subnet "${config.name}" created successfully! Wallet: ${account?.slice(0, 6)}...${account?.slice(-4)}`);
      onSuccess(result);
      onClose();
      handleReset();
    } catch (error) {
      console.error('Error creating subnet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create subnet';
      showError(`Failed to create subnet: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Wallet Connection Required
              </Typography>
              <Typography variant="body2">
                Creating a subnet requires a connected wallet to validate your identity and ensure you have sufficient funds for network fees.
              </Typography>
            </Alert>

            {!isConnected ? (
              <Card sx={{ mb: 2, p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ mr: 1, color: theme.palette.warning.main }} />
                  <Typography variant="h6">Wallet Not Connected</Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Please connect your wallet to continue with subnet creation.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleConnectWallet}
                  disabled={walletLoading}
                  startIcon={walletLoading ? <CircularProgress size={16} /> : <AccountBalanceWallet />}
                >
                  {walletLoading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </Card>
            ) : (
              <Card sx={{ mb: 2, p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ mr: 1, color: theme.palette.success.main }} />
                  <Typography variant="h6">Wallet Connected</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Info color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Wallet Address"
                        secondary={
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {account}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <AccountBalanceWallet color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Balance"
                        secondary={`${balance} AVAX`}
                      />
                    </ListItem>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <NetworkCheck color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Network"
                        secondary={getCurrentNetwork && getCurrentNetwork()?.displayName || 'Unknown'}
                      />
                    </ListItem>
                  </Grid>
                </Grid>

                {!sufficientFunds && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Insufficient Funds:</strong> You need at least 1 AVAX to create a subnet. 
                      Current balance: {balance} AVAX
                    </Typography>
                  </Alert>
                )}

                {chainId && ![43113, 43114].includes(chainId) && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Network Warning:</strong> You're not on an Avalanche network. 
                      Switch to Fuji Testnet or Mainnet for subnet creation.
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSwitchNetwork('fuji')}
                      sx={{ mr: 1 }}
                    >
                      Switch to Fuji
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSwitchNetwork('mainnet')}
                    >
                      Switch to Mainnet
                    </Button>
                  </Alert>
                )}
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Subnet Name"
              value={config.name}
              onChange={handleInputChange('name')}
              margin="normal"
              helperText="A unique name for your subnet (minimum 3 characters)"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={config.description}
              onChange={handleInputChange('description')}
              margin="normal"
              helperText="Brief description of your subnet's purpose"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Chain ID"
              value={config.chainId}
              onChange={handleInputChange('chainId')}
              margin="normal"
              helperText="Unique identifier for your blockchain (e.g., 12345)"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Blockchain Type</InputLabel>
              <Select
                value={config.blockchainType}
                label="Blockchain Type"
                onChange={(e) => setConfig(prev => ({ ...prev, blockchainType: e.target.value }))}
              >
                <MenuItem value="EVM">EVM (Ethereum Virtual Machine)</MenuItem>
                <MenuItem value="SpacesVM">SpacesVM (Key-Value Store)</MenuItem>
                <MenuItem value="Custom">Custom VM</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Token Name"
              value={config.tokenName}
              onChange={handleInputChange('tokenName')}
              margin="normal"
              helperText="Full name of your native token (e.g., My Subnet Token)"
              required
            />
            <TextField
              fullWidth
              label="Token Symbol"
              value={config.tokenSymbol}
              onChange={handleInputChange('tokenSymbol')}
              margin="normal"
              helperText="Ticker symbol for your token (e.g., MST, max 6 characters)"
              inputProps={{ maxLength: 6 }}
              required
            />
            <TextField
              fullWidth
              label="Initial Allocation"
              value={config.initialAllocation}
              onChange={handleInputChange('initialAllocation')}
              margin="normal"
              helperText="Initial token supply"
              type="number"
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Gas Limit"
                  value={config.gasLimit}
                  onChange={handleInputChange('gasLimit')}
                  margin="normal"
                  helperText="Block gas limit"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Target Block Rate (seconds)"
                  value={config.targetBlockRate}
                  onChange={handleInputChange('targetBlockRate')}
                  margin="normal"
                  helperText="Time between blocks"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Min Validators"
                  value={config.minValidators}
                  onChange={handleInputChange('minValidators')}
                  margin="normal"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Max Validators"
                  value={config.maxValidators}
                  onChange={handleInputChange('maxValidators')}
                  margin="normal"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Minimum Stake (AVAX)"
                  value={config.minStake}
                  onChange={handleInputChange('minStake')}
                  margin="normal"
                  helperText="Minimum AVAX required to become a validator"
                  type="number"
                />
              </Grid>
            </Grid>
            <FormControl fullWidth margin="normal">
              <InputLabel>Network</InputLabel>
              <Select
                value={config.network}
                label="Network"
                onChange={(e) => setConfig(prev => ({ ...prev, network: e.target.value }))}
              >
                <MenuItem value="fuji">Fuji Testnet</MenuItem>
                <MenuItem value="mainnet">Mainnet</MenuItem>
                <MenuItem value="local">Local Network</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Review your configuration before creating the subnet. This process may take several minutes.
            </Alert>
            
            {/* Wallet Information */}
            <Card sx={{ mb: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalanceWallet sx={{ mr: 1 }} />
                  Wallet Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Connected Wallet</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Balance</Typography>
                    <Typography variant="body1">{balance} AVAX</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Wallet Type</Typography>
                    <Typography variant="body1">{walletType === 'core' ? 'Core Wallet' : 'MetaMask'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Configuration Summary */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configuration Summary
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={`Name: ${config.name}`} />
                  <Chip label={`Chain ID: ${config.chainId}`} />
                  <Chip label={`Token: ${config.tokenSymbol}`} />
                  <Chip label={`Type: ${config.blockchainType}`} />
                  <Chip label={`Network: ${config.network}`} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  • Description: {config.description || 'No description provided'}
                  <br />
                  • Token: {config.tokenName} ({config.tokenSymbol})
                  <br />
                  • Initial Supply: {config.initialAllocation} tokens
                  <br />
                  • Block Time: {config.targetBlockRate} seconds
                  <br />
                  • Validators: {config.minValidators}-{config.maxValidators}
                  <br />
                  • Minimum Stake: {config.minStake} AVAX
                </Typography>
              </CardContent>
            </Card>

            {/* Final Checks */}
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Subnet creation will incur network fees. Make sure you have sufficient AVAX balance and are connected to the correct network.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 700,
      }}>
        Create New Subnet
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel 
                icon={step.icon}
                sx={{
                  '& .MuiStepIcon-root': {
                    color: activeStep >= index ? theme.palette.primary.main : theme.palette.grey[400],
                  },
                }}
              >
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? createSubnet : handleNext}
                    disabled={!validateStep(index) || loading}
                    sx={{ mt: 1, mr: 1 }}
                    startIcon={loading ? <CircularProgress size={16} /> : 
                             index === steps.length - 1 ? <RocketLaunch /> : null}
                  >
                    {loading ? 'Creating...' : 
                     index === steps.length - 1 ? 'Create Subnet' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0 || loading}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSubnetModal;
