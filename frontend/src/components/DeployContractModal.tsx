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
  subnets?: Array<{ id: string; name: string; chainId: number; status: string }>;
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
  subnets = [],
}) => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  
  const [activeStep, setActiveStep] = useState(0);
  const [sourceCode, setSourceCode] = useState('');
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [selectedContract, setSelectedContract] = useState('');
  const [deploymentForm, setDeploymentForm] = useState({
    name: '',
    description: '',
    subnetId: '',
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
        subnetId: '',
        gasLimit: '5000000',
        gasPrice: '25000000000',
        constructorArgs: '',
      });
      setDeploying(false);
      setDeploymentResult(null);
    }
  }, [open]);

  // Auto-fill subnet selection if only one is available
  useEffect(() => {
    if (subnets.length === 1 && !deploymentForm.subnetId) {
      setDeploymentForm(prev => ({ ...prev, subnetId: subnets[0].id }));
    }
  }, [subnets, deploymentForm.subnetId]);

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
      if (!deploymentForm.subnetId) {
        showNotification('Please select a subnet for deployment', 'warning');
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

  const estimateGas = async () => {
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
          subnetId: deploymentForm.subnetId,
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
    if (!compilationResult || !selectedContract) return;

    setDeploying(true);
    try {
      const contract = compilationResult.contracts[selectedContract];
      const constructorArgs = parseConstructorArgs(deploymentForm.constructorArgs);

      // First, upload the contract
      const uploadResponse = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deploymentForm.name,
          description: deploymentForm.description,
          subnetId: deploymentForm.subnetId,
          sourceCode,
          abi: JSON.stringify(contract.abi),
          bytecode: contract.bytecode,
          compiler: 'solc',
          version: compilationResult.compilerVersion,
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || 'Failed to upload contract');
      }

      const uploadResult = await uploadResponse.json();
      const contractId = uploadResult.data.id;

      // Then deploy the contract
      const deployResponse = await fetch('/api/contracts/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId,
          constructorArgs,
          gasLimit: parseInt(deploymentForm.gasLimit),
          gasPrice: deploymentForm.gasPrice,
        }),
      });

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json();
        throw new Error(errorData.error?.message || 'Deployment failed');
      }

      const deployResult = await deployResponse.json();
      setDeploymentResult(deployResult.data);
      
      showNotification('Contract deployed successfully!', 'success');
      onDeployed();
      
    } catch (error) {
      console.error('Deployment error:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to deploy contract',
        'error'
      );
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

              {/* Subnet Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Subnet</InputLabel>
                  <Select
                    value={deploymentForm.subnetId}
                    label="Target Subnet"
                    onChange={(e) => setDeploymentForm(prev => ({ ...prev, subnetId: e.target.value }))}
                  >
                    {subnets.filter(subnet => subnet.status === 'running').map((subnet) => (
                      <MenuItem key={subnet.id} value={subnet.id}>
                        {subnet.name} (Chain ID: {subnet.chainId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                <Button size="small" onClick={estimateGas} sx={{ mt: 1 }}>
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
                          primary="Target Subnet" 
                          secondary={subnets.find(s => s.id === deploymentForm.subnetId)?.name || 'Unknown'} 
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