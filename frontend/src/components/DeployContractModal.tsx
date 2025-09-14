import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  AccountBalance as DeployIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  OpenInNew as ExternalIcon,
} from '@mui/icons-material';
// Removed import of SolidityEditor as it's not used in this component
import { useNotification } from './NotificationProvider';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';
import { AVALANCHE_NETWORKS, getNetworkConfig, getGasConfig, isL2Network } from '../config/avalanche';
import NetworkSelector from './NetworkSelector';

interface DeployContractModalProps {
  open: boolean;
  onClose: () => void;
  contract: {
    id: string;
    name: string;
    code: string;
    abi?: any[];
    bytecode?: string;
  };
  onDeployed: () => void;
  networks?: Array<{ id: string; name: string; chainId: number; status: string }>;
}

interface CompilationResult {
  success: boolean;
  compilerVersion: string;
  contracts: Record<string, {
    abi: any[];
    bytecode: string;
    deployedBytecode: string;
    gasEstimates: any;
  }>;
  warnings: any[];
}

interface DeploymentResult {
  contractId: string;
  address: string;
  transactionHash: string;
  gasUsed: string;
  status: string;
}

const DeployContractModal: React.FC<DeployContractModalProps> = ({
  open,
  onClose,
  contract,
  onDeployed,
  networks = [],
}) => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const { 
    chainId, 
    account, 
    isConnected, 
    provider, 
    signer,
    getCurrentNetwork,
    getGasConfiguration,
    estimateGas: walletEstimateGas,
    sendTransaction
  } = useEnhancedWallet();
  
  const [activeStep, setActiveStep] = useState(0);
  const [sourceCode, setSourceCode] = useState('');
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [selectedContract, setSelectedContract] = useState('');
  const [deploymentForm, setDeploymentForm] = useState({
    name: '',
    description: '',
    networkId: '',
    gasLimit: '5000000',
    gasPrice: '25000000000', // 25 gwei
    constructorArgs: '',
  });
  const [deploying, setDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  // Initialize form with contract data
  useEffect(() => {
    if (contract) {
      setSourceCode(contract.code || '');
      if (contract.abi && contract.bytecode) {
        setCompilationResult({
          success: true,
          compilerVersion: 'Pre-compiled',
          contracts: {
            [contract.name]: {
              abi: contract.abi,
              bytecode: contract.bytecode,
              deployedBytecode: contract.bytecode,
              gasEstimates: {},
            },
          },
          warnings: [],
        });
        setSelectedContract(contract.name);
      }
    }
  }, [contract]);

  const steps = ['Write Contract', 'Compile & Configure', 'Deploy'];

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setSourceCode('');
      setCompilationResult(null);
      setSelectedContract('');
      setDeploymentForm({
        name: '',
        description: '',
        networkId: '',
        gasLimit: '5000000',
        gasPrice: '25000000000',
        constructorArgs: '',
      });
      setDeploying(false);
      setDeploymentResult(null);
    }
  }, [open]);

  // Auto-detect current network when wallet is connected
  useEffect(() => {
    if (chainId && !deploymentForm.networkId) {
      setDeploymentForm(prev => ({ ...prev, networkId: chainId.toString() }));
    }
  }, [chainId, deploymentForm.networkId]);

  const handleCompilationSuccess = (result: CompilationResult) => {
    setCompilationResult(result);
    const contractNames = Object.keys(result.contracts);
    if (contractNames.length === 1) {
      setSelectedContract(contractNames[0]);
      setDeploymentForm(prev => ({ ...prev, name: contractNames[0] }));
    }
    setActiveStep(1);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate compilation
      if (!compilationResult || !compilationResult.success) {
        showNotification('Please compile your contract first', 'warning');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Validate configuration
      if (!selectedContract) {
        showNotification('Please select a contract to deploy', 'warning');
        return;
      }
      if (!chainId) {
        showNotification('Please connect your wallet and select a network', 'warning');
        return;
      }
      if (!deploymentForm.name.trim()) {
        showNotification('Please enter a contract name', 'warning');
        return;
      }
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const parseConstructorArgs = (argsString: string) => {
    if (!argsString.trim()) return [];
    try {
      return JSON.parse(argsString);
    } catch {
      // Try to parse as comma-separated values
      return argsString.split(',').map(arg => arg.trim());
    }
  };

  const estimateContractGas = async () => {
    if (!compilationResult || !selectedContract) return;
    
    const contract = compilationResult.contracts[selectedContract];
    const constructorArgs = parseConstructorArgs(deploymentForm.constructorArgs);
    
    try {
      const response = await fetch('/api/contracts/estimate-gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bytecode: contract.bytecode,
          constructorArgs,
          networkId: chainId,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setDeploymentForm(prev => ({ ...prev, gasLimit: result.gasEstimate }));
        showNotification('Gas estimate updated', 'info');
      }
    } catch (error) {
      console.error('Gas estimation failed:', error);
      showNotification('Failed to estimate gas', 'warning');
    }
  };

  const deployContract = async () => {
    if (!compilationResult || !selectedContract || !signer || !chainId) {
      showNotification('Missing requirements for deployment', 'error');
      return;
    }

    setDeploying(true);
    try {
      const contractData = compilationResult.contracts[selectedContract];
      const constructorArgs = parseConstructorArgs(deploymentForm.constructorArgs);
      const currentNetwork = getCurrentNetwork?.();
      
      if (!currentNetwork) {
        throw new Error('Network not supported');
      }

      // Get gas configuration for current network
      const gasConfig = getGasConfiguration?.();
      const deploymentGasConfig = {
        gasLimit: deploymentForm.gasLimit || gasConfig?.gasLimit || '5000000',
        gasPrice: deploymentForm.gasPrice || gasConfig?.gasPrice || '25000000000',
        maxFeePerGas: gasConfig?.maxFeePerGas,
        maxPriorityFeePerGas: gasConfig?.maxPriorityFeePerGas,
      };

      showNotification('Deploying contract to ' + currentNetwork.displayName, 'info');

      // Create contract factory with ethers.js v6
      const { ethers } = await import('ethers');
      const contractFactory = new ethers.ContractFactory(
        contractData.abi,
        contractData.bytecode,
        signer
      );

      // Estimate gas if not provided
      let estimatedGas;
      try {
        estimatedGas = await contractFactory.getDeployTransaction(...constructorArgs).then(tx =>
          provider?.estimateGas(tx)
        );
        if (estimatedGas && !deploymentForm.gasLimit) {
          deploymentGasConfig.gasLimit = (estimatedGas * BigInt(120) / BigInt(100)).toString(); // Add 20% buffer
        }
      } catch (gasError) {
        console.warn('Gas estimation failed, using provided values:', gasError);
      }

      // Deploy contract
      const deployedContract = await contractFactory.deploy(...constructorArgs, {
        gasLimit: deploymentGasConfig.gasLimit,
        gasPrice: deploymentGasConfig.gasPrice,
        ...(deploymentGasConfig.maxFeePerGas && { 
          maxFeePerGas: deploymentGasConfig.maxFeePerGas,
          maxPriorityFeePerGas: deploymentGasConfig.maxPriorityFeePerGas 
        }),
      });

      showNotification('Contract deployment transaction sent!', 'info');

      // Wait for deployment
      await deployedContract.waitForDeployment();
      const contractAddress = await deployedContract.getAddress();
      const deploymentTx = deployedContract.deploymentTransaction();

      // Save contract to backend
      try {
        const uploadResponse = await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: deploymentForm.name,
            description: deploymentForm.description,
            networkId: chainId,
            networkName: currentNetwork.displayName,
            address: contractAddress,
            sourceCode,
            abi: JSON.stringify(contractData.abi),
            bytecode: contractData.bytecode,
            compiler: 'solc',
            version: compilationResult.compilerVersion,
            deploymentTx: deploymentTx?.hash,
            gasUsed: deploymentTx ? 'pending' : 'unknown',
            deployer: account,
          }),
        });

        if (uploadResponse.ok) {
          console.log('Contract saved to database successfully');
        }
      } catch (saveError) {
        console.warn('Failed to save contract to database:', saveError);
      }

      // Set deployment result
      setDeploymentResult({
        contractId: contractAddress,
        address: contractAddress,
        transactionHash: deploymentTx?.hash || '',
        gasUsed: estimatedGas?.toString() || 'unknown',
        status: 'success'
      });
      
      showNotification(
        `Contract deployed successfully to ${currentNetwork.displayName}! Address: ${contractAddress}`,
        'success'
      );
      onDeployed();
      
    } catch (error: any) {
      console.error('Deployment error:', error);
      let errorMessage = 'Failed to deploy contract';
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Could not estimate gas. Contract may fail to deploy.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Write Your Smart Contract
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Write your Solidity contract code and compile it to check for errors.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={20}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="pragma solidity ^0.8.0;&#10;&#10;contract MyContract {&#10;    // Your contract code here&#10;}"
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Deployment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure your contract deployment settings and parameters.
            </Typography>

            <Grid container spacing={3}>
              {/* Contract Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Contract</InputLabel>
                  <Select
                    value={selectedContract}
                    label="Select Contract"
                    onChange={(e) => setSelectedContract(e.target.value)}
                  >
                    {compilationResult && Object.keys(compilationResult.contracts).map((contractName) => (
                      <MenuItem key={contractName} value={contractName}>
                        {contractName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Network Selection */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Target Network
                  </Typography>
                  <NetworkSelector variant="select" showBalance />
                  {chainId && (
                    <Box mt={1}>
                      <Alert severity={isL2Network(chainId) ? "success" : "info"} sx={{ mt: 1 }}>
                        {isL2Network(chainId) ? (
                          <Typography variant="caption">
                            ✓ Layer 2 network selected - Lower gas fees and faster transactions
                          </Typography>
                        ) : (
                          <Typography variant="caption">
                            Layer 1 network selected - High security, higher gas fees
                          </Typography>
                        )}
                      </Alert>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Contract Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contract Name"
                  value={deploymentForm.name}
                  onChange={(e) => setDeploymentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Contract"
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={deploymentForm.description}
                  onChange={(e) => setDeploymentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Contract description"
                />
              </Grid>

              {/* Constructor Arguments */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Constructor Arguments (JSON)"
                  value={deploymentForm.constructorArgs}
                  onChange={(e) => setDeploymentForm(prev => ({ ...prev, constructorArgs: e.target.value }))}
                  placeholder='["arg1", "arg2", 123]'
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Gas Settings */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Gas Limit"
                  value={deploymentForm.gasLimit}
                  onChange={(e) => setDeploymentForm(prev => ({ ...prev, gasLimit: e.target.value }))}
                  type="number"
                />
                <Button size="small" onClick={estimateContractGas} sx={{ mt: 1 }}>
                  Estimate Gas
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Gas Price (wei)"
                  value={deploymentForm.gasPrice}
                  onChange={(e) => setDeploymentForm(prev => ({ ...prev, gasPrice: e.target.value }))}
                  type="number"
                />
              </Grid>

              {/* Contract Info */}
              {selectedContract && compilationResult && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Contract Information
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          label={`Functions: ${compilationResult.contracts[selectedContract].abi.filter((item: any) => item.type === 'function').length}`}
                          size="small"
                        />
                        <Chip
                          label={`Events: ${compilationResult.contracts[selectedContract].abi.filter((item: any) => item.type === 'event').length}`}
                          size="small"
                        />
                        <Chip
                          label={`Bytecode: ${Math.round(compilationResult.contracts[selectedContract].bytecode.length / 2)} bytes`}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Deploy Contract
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your deployment settings and deploy your contract to the blockchain.
            </Typography>

            {!deploymentResult ? (
              <Box>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Deployment Summary
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Contract" secondary={selectedContract} />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Target Network" 
                          secondary={getCurrentNetwork?.()?.displayName || `Chain ID: ${chainId}`} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Gas Limit" secondary={deploymentForm.gasLimit} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Gas Price" secondary={`${deploymentForm.gasPrice} wei`} />
                      </ListItem>
                      {deploymentForm.constructorArgs && (
                        <ListItem>
                          <ListItemText primary="Constructor Args" secondary={deploymentForm.constructorArgs} />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>

                {deploying && (
                  <Box sx={{ mb: 3 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Deploying contract to blockchain...
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  size="large"
                  startIcon={deploying ? <CircularProgress size={20} /> : <DeployIcon />}
                  onClick={deployContract}
                  disabled={deploying}
                  fullWidth
                >
                  {deploying ? 'Deploying...' : 'Deploy Contract'}
                </Button>
              </Box>
            ) : (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Contract deployed successfully!
                </Alert>

                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Deployment Results
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <SuccessIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Contract Address"
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {deploymentResult.address}
                              </Typography>
                              <IconButton size="small" onClick={() => copyToClipboard(deploymentResult.address)}>
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Transaction Hash"
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {deploymentResult.transactionHash}
                              </Typography>
                              <IconButton size="small" onClick={() => copyToClipboard(deploymentResult.transactionHash)}>
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Gas Used" secondary={deploymentResult.gasUsed} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            )}
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
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight="bold">
            Deploy Smart Contract
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={deploying}>
          {deploymentResult ? 'Close' : 'Cancel'}
        </Button>
        
        {!deploymentResult && (
          <>
            <Button
              disabled={activeStep === 0 || deploying}
              onClick={handleBack}
            >
              Back
            </Button>
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={deploying}
              >
                Next
              </Button>
            ) : null}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeployContractModal;