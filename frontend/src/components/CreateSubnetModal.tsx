import React, { useState } from 'react';
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
} from '@mui/material';
import {
  RocketLaunch,
  CheckCircle,
  Settings,
  Security,
  Code,
  NetworkCheck,
} from '@mui/icons-material';
import { useNotification } from './NotificationProvider';

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
  onSuccess: () => void;
}

const CreateSubnetModal: React.FC<CreateSubnetModalProps> = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const { showSuccess, showError, showInfo } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
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
        return config.name.length >= 3 && config.chainId.length > 0;
      case 1:
        return config.tokenName.length > 0 && config.tokenSymbol.length > 0;
      case 2:
        return config.gasLimit.length > 0 && config.targetBlockRate.length > 0 && config.minStake.length > 0;
      default:
        return true;
    }
  };

  const createSubnet = async () => {
    setLoading(true);
    try {
      showInfo('Creating subnet... This may take a few minutes.');
      
      // Prepare subnet data for API
      const subnetData = {
        name: config.name,
        description: config.description,
        chainId: parseInt(config.chainId),
        vmType: config.blockchainType,
        networkId: config.network === 'fuji' ? 5 : config.network === 'mainnet' ? 1 : 1337,
        validators: {
          minValidators: parseInt(config.minValidators),
          maxValidators: parseInt(config.maxValidators),
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
        }
      };
      
      const response = await fetch('/api/subnets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subnetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      showSuccess(`Subnet "${config.name}" created successfully!`);
      onSuccess();
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
                <MenuItem value="Custom">Custom VM</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
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

      case 2:
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

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Review your configuration before creating the subnet. This process may take several minutes.
            </Alert>
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
