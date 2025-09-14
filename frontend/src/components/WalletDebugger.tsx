import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as BugIcon,
} from '@mui/icons-material';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';
import { useNotification } from './NotificationProvider';

const WalletDebugger: React.FC = () => {
  const { showNotification } = useNotification();
  const walletContext = useEnhancedWallet();
  const [testAddress, setTestAddress] = useState('0x3109390df94C5E032dEf00A7816FAa743E0BefE4');
  const [detectionResults, setDetectionResults] = useState<any>({});

  useEffect(() => {
    checkWalletDetection();
  }, []);

  const checkWalletDetection = () => {
    const results = {
      windowEthereum: !!window.ethereum,
      windowAvalanche: !!window.avalanche,
      ethereumIsCoreWallet: window.ethereum?.isCore || false,
      ethereumIsMetaMask: window.ethereum?.isMetaMask || false,
      userAgent: navigator.userAgent,
      availableProviders: [] as string[],
    };

    // Check for available providers
    if (window.ethereum) {
      results.availableProviders.push('ethereum');
    }
    if (window.avalanche) {
      results.availableProviders.push('avalanche');
    }

    setDetectionResults(results);
  };

  const testConnection = async () => {
    try {
      showNotification('Testing wallet connection...', 'info');
      await walletContext.connect();
      showNotification('Wallet connected successfully!', 'success');
    } catch (error: any) {
      showNotification(`Connection failed: ${error.message}`, 'error');
      console.error('Connection test failed:', error);
    }
  };

  const testManualAddress = () => {
    if (testAddress && testAddress.length === 42 && testAddress.startsWith('0x')) {
      showNotification(`Test address is valid: ${testAddress}`, 'success');
    } else {
      showNotification('Invalid Ethereum address format', 'error');
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <BugIcon color="primary" />
          <Typography variant="h6">Wallet Connection Debugger</Typography>
        </Box>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Wallet Detection</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Window.ethereum detected"
                  secondary={detectionResults.windowEthereum ? '✅ Yes' : '❌ No'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Window.avalanche detected"
                  secondary={detectionResults.windowAvalanche ? '✅ Yes' : '❌ No'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Core Wallet detected"
                  secondary={detectionResults.ethereumIsCoreWallet ? '✅ Yes' : '❌ No'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="MetaMask detected"
                  secondary={detectionResults.ethereumIsMetaMask ? '✅ Yes' : '❌ No'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Available providers"
                  secondary={detectionResults.availableProviders.join(', ') || 'None'}
                />
              </ListItem>
            </List>
            <Button variant="outlined" onClick={checkWalletDetection} size="small">
              Refresh Detection
            </Button>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Current Wallet State</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Connected"
                  secondary={walletContext.isConnected ? '✅ Yes' : '❌ No'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Account"
                  secondary={walletContext.account || 'Not connected'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Chain ID"
                  secondary={walletContext.chainId || 'Unknown'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Balance"
                  secondary={walletContext.balance ? `${walletContext.balance} AVAX` : 'Not available'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Wallet Type"
                  secondary={walletContext.walletType || 'None'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Loading"
                  secondary={walletContext.isLoading ? '⏳ Yes' : '✅ No'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Error"
                  secondary={walletContext.error || 'None'}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Test Functions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button variant="contained" onClick={testConnection}>
                Test Connection
              </Button>
              
              <Box>
                <TextField
                  fullWidth
                  label="Test Address"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  size="small"
                  helperText="Enter an Ethereum address to validate"
                />
                <Button 
                  variant="outlined" 
                  onClick={testManualAddress}
                  sx={{ mt: 1 }}
                  size="small"
                >
                  Validate Address
                </Button>
              </Box>

              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
                color="warning"
              >
                Refresh Page
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        {!detectionResults.windowEthereum && !detectionResults.windowAvalanche && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>No wallet detected!</strong><br />
              Please install either Core Wallet or MetaMask and refresh the page.
            </Typography>
          </Alert>
        )}

        {walletContext.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Wallet Error:</strong><br />
              {walletContext.error}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletDebugger;