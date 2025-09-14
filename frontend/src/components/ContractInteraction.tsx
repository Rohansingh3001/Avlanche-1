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
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as CallIcon,
  Visibility as ReadIcon,
  Send as WriteIcon,
  AccountBalance as PayableIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  History as HistoryIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { ethers } from 'ethers';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';
import { useNotification } from './NotificationProvider';

interface ContractInteractionProps {
  open: boolean;
  onClose: () => void;
  contract: {
    id: string;
    name: string;
    address: string;
    abi: any[];
    subnetName: string;
    chainId: number;
  } | null;
}

interface ContractFunction {
  name: string;
  type: 'function';
  inputs: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
}

interface TransactionHistory {
  hash: string;
  method: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  gasUsed?: string;
  value?: string;
}

const ContractInteraction: React.FC<ContractInteractionProps> = ({
  open,
  onClose,
  contract,
}) => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const { provider, signer, account, chainId, getCurrentNetwork } = useEnhancedWallet();
  
  const [tabValue, setTabValue] = useState(0);
  const [functions, setFunctions] = useState<ContractFunction[]>([]);
  const [functionInputs, setFunctionInputs] = useState<Record<string, Record<string, string>>>({});
  const [functionResults, setFunctionResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');

  // Parse ABI and extract functions
  useEffect(() => {
    if (contract?.abi) {
      const contractFunctions = contract.abi
        .filter((item: any) => item.type === 'function')
        .map((item: any) => ({
          name: item.name,
          type: item.type,
          inputs: item.inputs || [],
          outputs: item.outputs || [],
          stateMutability: item.stateMutability || 'nonpayable',
        }));
      
      setFunctions(contractFunctions);
      
      // Initialize function inputs
      const initialInputs: Record<string, Record<string, string>> = {};
      contractFunctions.forEach((func) => {
        initialInputs[func.name] = {};
        func.inputs.forEach((input: { name: string; type: string; internalType?: string }) => {
          initialInputs[func.name][input.name] = '';
        });
      });
      setFunctionInputs(initialInputs);
    }
  }, [contract]);

  const handleInputChange = (functionName: string, inputName: string, value: string) => {
    setFunctionInputs(prev => ({
      ...prev,
      [functionName]: {
        ...prev[functionName],
        [inputName]: value,
      },
    }));
  };

  const parseInputValue = (value: string, type: string) => {
    if (!value.trim()) return '';
    
    try {
      if (type.startsWith('uint') || type.startsWith('int')) {
        return ethers.toBigInt(value);
      } else if (type === 'bool') {
        return value.toLowerCase() === 'true';
      } else if (type.startsWith('bytes')) {
        return ethers.hexlify(ethers.toUtf8Bytes(value));
      } else if (type === 'address') {
        return ethers.getAddress(value); 
      } else {
        return value;
      }
    } catch (error) {
      throw new Error(`Invalid ${type} value: ${value}`);
    }
  };

  const callFunction = async (func: ContractFunction) => {
    if (!contract || !provider || !signer) return;

    const functionKey = func.name;
    setLoading(prev => ({ ...prev, [functionKey]: true }));

    try {
      // Create contract instance
      const contractInstance = new ethers.Contract(contract.address, contract.abi, signer);

      // Prepare function arguments
      const args = func.inputs.map((input) => {
        const inputValue = functionInputs[func.name][input.name];
        return parseInputValue(inputValue, input.type);
      });

      let result: any;
      let transactionResponse: ethers.TransactionResponse | undefined;

      // Handle different function types
      if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
        // Read-only function call
        result = await contractInstance[func.name](...args);
        
        setFunctionResults(prev => ({
          ...prev,
          [functionKey]: { result },
        }));
      } else {
        // State-changing function call
        const value = func.stateMutability === 'payable' 
          ? ethers.parseEther(functionInputs[func.name]._value || '0')
          : undefined;

        const overrides: any = {};
        if (value && value > BigInt(0)) {
          overrides.value = value;
        }

        // Get gas configuration for current network
        const currentNetwork = getCurrentNetwork && getCurrentNetwork();
        const gasConfig = currentNetwork && 'gasConfig' in currentNetwork ? currentNetwork.gasConfig : null;
        if (gasConfig) {
          if (gasConfig.gasPrice) {
            overrides.gasPrice = ethers.parseUnits(gasConfig.gasPrice.toString(), 'gwei');
          }
          if (gasConfig.gasLimit) {
            overrides.gasLimit = gasConfig.gasLimit;
          }
        }

        // Estimate gas
        try {
          const estimatedGas = await contractInstance[func.name].estimateGas(...args, overrides);
          overrides.gasLimit = estimatedGas + (estimatedGas * BigInt(20) / BigInt(100)); // Add 20% buffer
        } catch (gasError) {
          console.warn('Gas estimation failed, using default:', gasError);
        }

        // Execute transaction
        transactionResponse = await contractInstance[func.name](...args, overrides);
        
        // Wait for transaction confirmation
        if (transactionResponse) {
          const receipt = await transactionResponse.wait();
        
          result = {
            transactionHash: receipt?.hash,
            blockNumber: receipt?.blockNumber,
            gasUsed: receipt?.gasUsed?.toString(),
            status: receipt?.status === 1 ? 'success' : 'failed',
          };

          setFunctionResults(prev => ({
            ...prev,
            [functionKey]: result,
          }));

          // Add to transaction history
          const newTransaction: TransactionHistory = {
            hash: result.transactionHash || 'N/A',
            method: func.name,
            status: result.status === 'success' ? 'success' : 'failed',
            timestamp: new Date().toISOString(),
            gasUsed: result.gasUsed,
            value: value ? ethers.formatEther(value) : undefined,
          };
          setTransactionHistory(prev => [newTransaction, ...prev]);
        }
      }

      showNotification(`Function ${func.name} executed successfully`, 'success');
    } catch (error: any) {
      console.error('Function call error:', error);
      
      let errorMessage = `Failed to call ${func.name}`;
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Transaction would fail. Please check your inputs and account balance.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for transaction.';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, 'error');
    } finally {
      setLoading(prev => ({ ...prev, [functionKey]: false }));
    }
  };

  const formatResult = (result: any, outputs: any[]) => {
    // Handle transaction results
    if (result && result.transactionHash) {
      return `Transaction Hash: ${result.transactionHash}`;
    }
    
    // Handle read function results
    const actualResult = result?.result !== undefined ? result.result : result;
    
    if (actualResult === undefined || actualResult === null) {
      return outputs.length > 0 ? 'No return value' : 'Transaction completed';
    }
    
    if (outputs.length === 0) {
      return 'Function executed successfully';
    }
    
    if (outputs.length === 1) {
      const output = outputs[0];
      if (output.type.startsWith('uint') || output.type.startsWith('int')) {
        return typeof actualResult === 'bigint' ? actualResult.toString() : actualResult?.toString() || '0';
      } else if (output.type === 'bool') {
        return actualResult ? 'true' : 'false';
      } else if (output.type === 'address') {
        return actualResult?.toString() || '0x0';
      } else if (output.type.startsWith('bytes')) {
        return actualResult?.toString() || '0x';
      } else {
        return actualResult?.toString() || '';
      }
    } else {
      // Multiple return values
      if (Array.isArray(actualResult)) {
        return outputs.map((output, index) => (
          `${output.name || `output${index}`}: ${
            actualResult[index]?.toString() || 'N/A'
          }`
        )).join(', ');
      } else {
        return actualResult?.toString() || 'Multiple values returned';
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  };

  const getFunctionIcon = (stateMutability: string) => {
    switch (stateMutability) {
      case 'view':
      case 'pure':
        return <ReadIcon color="info" />;
      case 'payable':
        return <PayableIcon color="warning" />;
      default:
        return <WriteIcon color="primary" />;
    }
  };

  const getFunctionColor = (stateMutability: string) => {
    switch (stateMutability) {
      case 'view':
      case 'pure':
        return 'info';
      case 'payable':
        return 'warning';
      default:
        return 'primary';
    }
  };

  if (!contract) return null;

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
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Contract Interaction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contract.name} on {contract.subnetName}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Contract Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Contract Address</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {contract.address}
                  </Typography>
                  <IconButton size="small" onClick={() => copyToClipboard(contract.address)}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Chain ID</Typography>
                <Typography variant="body1">{contract.chainId}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Functions" icon={<CodeIcon />} iconPosition="start" />
            <Tab label="Transaction History" icon={<HistoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Functions Tab */}
        {tabValue === 0 && (
          <Box>
            {functions.length === 0 ? (
              <Alert severity="info">
                No callable functions found in this contract.
              </Alert>
            ) : (
              <Box>
                {/* Categorize functions */}
                {['view', 'pure', 'nonpayable', 'payable'].map((mutability) => {
                  const categoryFunctions = functions.filter(f => f.stateMutability === mutability);
                  if (categoryFunctions.length === 0) return null;

                  return (
                    <Box key={mutability} sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFunctionIcon(mutability)}
                        {mutability === 'view' || mutability === 'pure' ? 'Read Functions' : 
                         mutability === 'payable' ? 'Payable Functions' : 'Write Functions'}
                      </Typography>
                      
                      {categoryFunctions.map((func) => (
                        <Accordion key={func.name} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              <Typography variant="subtitle1" sx={{ fontFamily: 'monospace' }}>
                                {func.name}
                              </Typography>
                              <Chip
                                label={func.stateMutability}
                                size="small"
                                color={getFunctionColor(func.stateMutability) as any}
                                variant="outlined"
                              />
                              {func.inputs.length > 0 && (
                                <Chip
                                  label={`${func.inputs.length} input${func.inputs.length > 1 ? 's' : ''}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </AccordionSummary>
                          
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              {/* Function Inputs */}
                              {func.inputs.length > 0 && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Input Parameters
                                  </Typography>
                                  {func.inputs.map((input) => (
                                    <TextField
                                      key={input.name}
                                      fullWidth
                                      label={`${input.name} (${input.type})`}
                                      value={functionInputs[func.name]?.[input.name] || ''}
                                      onChange={(e) => handleInputChange(func.name, input.name, e.target.value)}
                                      sx={{ mb: 2 }}
                                      placeholder={`Enter ${input.type} value`}
                                    />
                                  ))}
                                </Grid>
                              )}

                              {/* Value field for payable functions */}
                              {func.stateMutability === 'payable' && (
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Value (ETH)"
                                    value={functionInputs[func.name]?._value || ''}
                                    onChange={(e) => handleInputChange(func.name, '_value', e.target.value)}
                                    type="number"
                                    placeholder="0.0"
                                    sx={{ mb: 2 }}
                                  />
                                </Grid>
                              )}

                              {/* Call Button */}
                              <Grid item xs={12}>
                                <Button
                                  variant="contained"
                                  startIcon={loading[func.name] ? <CircularProgress size={16} /> : <CallIcon />}
                                  onClick={() => callFunction(func)}
                                  disabled={loading[func.name]}
                                  color={getFunctionColor(func.stateMutability) as any}
                                >
                                  {loading[func.name] ? 'Calling...' : 'Call Function'}
                                </Button>
                              </Grid>

                              {/* Results */}
                              {functionResults[func.name] && (
                                <Grid item xs={12}>
                                  <Alert severity="success" sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Result:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                      {formatResult(functionResults[func.name], func.outputs)}
                                    </Typography>
                                    {functionResults[func.name].transactionHash && (
                                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">Transaction Hash:</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                          {functionResults[func.name].transactionHash}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => copyToClipboard(functionResults[func.name].transactionHash)}
                                        >
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    )}
                                    {functionResults[func.name].gasUsed && (
                                      <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2">
                                          Gas Used: {functionResults[func.name].gasUsed}
                                        </Typography>
                                      </Box>
                                    )}
                                    {functionResults[func.name].blockNumber && (
                                      <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2">
                                          Block Number: {functionResults[func.name].blockNumber}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Alert>
                                </Grid>
                              )}
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* Transaction History Tab */}
        {tabValue === 1 && (
          <Box>
            {transactionHistory.length === 0 ? (
              <Alert severity="info">
                No transactions yet. Interact with the contract to see transaction history.
              </Alert>
            ) : (
              <List>
                {transactionHistory.map((tx, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <HistoryIcon color={tx.status === 'success' ? 'success' : 'error'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{tx.method}</Typography>
                          <Chip label={tx.status} size="small" color={tx.status === 'success' ? 'success' : 'error'} />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(tx.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {tx.hash}
                          </Typography>
                          {tx.gasUsed && (
                            <Typography variant="body2" color="text.secondary">
                              Gas Used: {tx.gasUsed}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <IconButton onClick={() => copyToClipboard(tx.hash)}>
                      <CopyIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractInteraction;