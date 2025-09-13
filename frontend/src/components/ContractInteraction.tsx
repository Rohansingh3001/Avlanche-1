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
    if (!contract) return;

    const functionKey = func.name;
    setLoading(prev => ({ ...prev, [functionKey]: true }));

    try {
      // Prepare function arguments
      const args = func.inputs.map((input) => {
        const inputValue = functionInputs[func.name][input.name];
        return parseInputValue(inputValue, input.type);
      });

      const response = await fetch(`/api/contracts/${contract.id}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: func.name,
          args,
          value: func.stateMutability === 'payable' ? functionInputs[func.name]._value || '0' : '0',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Function call failed');
      }

      const result = await response.json();
      
      setFunctionResults(prev => ({
        ...prev,
        [functionKey]: result.data,
      }));

      // Add to transaction history if it's a state-changing function
      if (func.stateMutability !== 'view' && func.stateMutability !== 'pure') {
        const newTransaction: TransactionHistory = {
          hash: result.data.transactionHash || 'N/A',
          method: func.name,
          status: 'success',
          timestamp: new Date().toISOString(),
          gasUsed: result.data.gasUsed,
          value: result.data.value,
        };
        setTransactionHistory(prev => [newTransaction, ...prev]);
      }

      showNotification(`Function ${func.name} executed successfully`, 'success');
    } catch (error) {
      console.error('Function call error:', error);
      showNotification(
        error instanceof Error ? error.message : `Failed to call ${func.name}`,
        'error'
      );
    } finally {
      setLoading(prev => ({ ...prev, [functionKey]: false }));
    }
  };

  const formatResult = (result: any, outputs: any[]) => {
    if (!result || !outputs.length) return 'No return value';
    
    if (outputs.length === 1) {
      const output = outputs[0];
      if (output.type.startsWith('uint') || output.type.startsWith('int')) {
        return result.toString();
      } else if (output.type === 'bool') {
        return result ? 'true' : 'false';
      } else if (output.type === 'address') {
        return result;
      } else {
        return result.toString();
      }
    } else {
      // Multiple return values
      return outputs.map((output, index) => (
        `${output.name || `output${index}`}: ${result[index]?.toString() || 'N/A'}`
      )).join(', ');
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
                                      {formatResult(functionResults[func.name].result, func.outputs)}
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