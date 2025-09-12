import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Alert,
  LinearProgress,
  Fab,
  Tooltip,
  useTheme,
  alpha,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as DeployIcon,
  Code as CodeIcon,
  PlayArrow as CallIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Description as ContractIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Assessment as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon,
  Functions as FunctionIcon,
} from '@mui/icons-material';
import { useNotification } from '../components/NotificationProvider';

interface Contract {
  id: string;
  name: string;
  description: string;
  address: string;
  subnetId: string;
  subnetName: string;
  compiler: string;
  version: string;
  status: 'deployed' | 'pending' | 'failed' | 'verified';
  deployedAt: string;
  lastInteraction: string;
  transactionCount: number;
  gasUsed: number;
  abi: any[];
  verified: boolean;
  functions: ContractFunction[];
}

interface ContractFunction {
  name: string;
  type: 'function' | 'view' | 'pure';
  inputs: any[];
  outputs: any[];
  stateMutability: string;
}

const Contracts: React.FC = () => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [interactModalOpen, setInteractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [deployForm, setDeployForm] = useState({
    name: '',
    description: '',
    subnetId: '',
    sourceCode: '',
    constructor: '',
  });

  // Mock data for demonstration
  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockContracts: Contract[] = [
          {
            id: '1',
            name: 'DeFi Token',
            description: 'ERC-20 token for DeFi applications',
            address: '0x1234567890abcdef1234567890abcdef12345678',
            subnetId: '1',
            subnetName: 'DeFi Subnet',
            compiler: 'solidity',
            version: '0.8.19',
            status: 'deployed',
            deployedAt: '2024-01-15',
            lastInteraction: '5 minutes ago',
            transactionCount: 2341,
            gasUsed: 1250000,
            abi: [],
            verified: true,
            functions: [
              { name: 'transfer', type: 'function', inputs: [], outputs: [], stateMutability: 'nonpayable' },
              { name: 'balanceOf', type: 'view', inputs: [], outputs: [], stateMutability: 'view' },
              { name: 'approve', type: 'function', inputs: [], outputs: [], stateMutability: 'nonpayable' },
            ],
          },
          {
            id: '2',
            name: 'NFT Collection',
            description: 'ERC-721 NFT collection contract',
            address: '0xabcdef1234567890abcdef1234567890abcdef12',
            subnetId: '2',
            subnetName: 'Gaming Subnet',
            compiler: 'solidity',
            version: '0.8.19',
            status: 'pending',
            deployedAt: '2024-02-01',
            lastInteraction: '1 hour ago',
            transactionCount: 892,
            gasUsed: 3200000,
            abi: [],
            verified: false,
            functions: [
              { name: 'mint', type: 'function', inputs: [], outputs: [], stateMutability: 'payable' },
              { name: 'ownerOf', type: 'view', inputs: [], outputs: [], stateMutability: 'view' },
              { name: 'transferFrom', type: 'function', inputs: [], outputs: [], stateMutability: 'nonpayable' },
            ],
          },
        ];
        
        setContracts(mockContracts);
      } catch (error) {
        showNotification('Failed to fetch contracts', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [showNotification]);

  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>, contract: Contract) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedContract(contract);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedContract(null);
  };

  const handleDeploy = async () => {
    try {
      showNotification('Deploying contract...', 'info');
      // Replace with actual deployment logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      showNotification('Contract deployed successfully!', 'success');
      setDeployModalOpen(false);
      setDeployForm({ name: '', description: '', subnetId: '', sourceCode: '', constructor: '' });
    } catch (error) {
      showNotification('Failed to deploy contract', 'error');
    }
  };

  const handleInteract = (contract: Contract) => {
    setSelectedContract(contract);
    setInteractModalOpen(true);
    handleActionMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return theme.palette.success.main;
      case 'pending': return theme.palette.warning.main;
      case 'failed': return theme.palette.error.main;
      case 'verified': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <ContractIcon />;
      case 'pending': return <DeployIcon />;
      case 'failed': return <WarningIcon />;
      case 'verified': return <VerifiedIcon />;
      default: return <CodeIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Smart Contracts
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Deploy, manage, and interact with smart contracts
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<DeployIcon />}
            onClick={() => setDeployModalOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
              py: 1.5,
              px: 4,
            }}
          >
            Deploy Contract
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<CodeIcon />}
            onClick={() => {/* Open contract templates */}}
          >
            Templates
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="All Contracts" />
        <Tab label="Deployed" />
        <Tab label="Pending" />
        <Tab label="Verified" />
      </Tabs>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="rectangular" width="100%" height={80} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <ContractIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Contracts Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Deploy your first smart contract to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<DeployIcon />}
              onClick={() => setDeployModalOpen(true)}
            >
              Deploy Your First Contract
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {contracts.map((contract) => (
            <Grid item xs={12} md={6} lg={4} key={contract.id}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getStatusColor(contract.status),
                        mr: 2,
                      }}
                    >
                      {getStatusIcon(contract.status)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {contract.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={contract.status}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(contract.status), 0.1),
                            color: getStatusColor(contract.status),
                          }}
                        />
                        {contract.verified && (
                          <Chip
                            label="Verified"
                            size="small"
                            icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    <IconButton
                      onClick={(e) => handleActionMenuClick(e, contract)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {contract.description}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Address: {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Subnet: {contract.subnetName}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Transactions: {contract.transactionCount.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Gas Used: {(contract.gasUsed / 1000000).toFixed(1)}M
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" color="text.secondary">
                    Last interaction: {contract.lastInteraction}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<CallIcon />}
                    onClick={() => handleInteract(contract)}
                  >
                    Interact
                  </Button>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => {/* Navigate to contract details */}}
                  >
                    Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Tooltip title="Deploy New Contract">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
          }}
          onClick={() => setDeployModalOpen(true)}
        >
          <DeployIcon />
        </Fab>
      </Tooltip>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => selectedContract && handleInteract(selectedContract)}>
          <CallIcon sx={{ mr: 1 }} />
          Interact
        </MenuItem>
        <MenuItem onClick={() => {/* Navigate to contract details */}}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {/* Verify contract */}}>
          <SecurityIcon sx={{ mr: 1 }} />
          Verify Contract
        </MenuItem>
        <MenuItem onClick={() => {/* View analytics */}}>
          <AnalyticsIcon sx={{ mr: 1 }} />
          Analytics
        </MenuItem>
      </Menu>

      {/* Deploy Contract Modal */}
      <Dialog
        open={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Deploy Smart Contract</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contract Name"
                value={deployForm.name}
                onChange={(e) => setDeployForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Subnet</InputLabel>
                <Select
                  value={deployForm.subnetId}
                  label="Target Subnet"
                  onChange={(e) => setDeployForm(prev => ({ ...prev, subnetId: e.target.value }))}
                >
                  <SelectMenuItem value="1">DeFi Subnet</SelectMenuItem>
                  <SelectMenuItem value="2">Gaming Subnet</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={deployForm.description}
                onChange={(e) => setDeployForm(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Source Code"
                value={deployForm.sourceCode}
                onChange={(e) => setDeployForm(prev => ({ ...prev, sourceCode: e.target.value }))}
                multiline
                rows={8}
                placeholder="pragma solidity ^0.8.0;..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Constructor Arguments (JSON)"
                value={deployForm.constructor}
                onChange={(e) => setDeployForm(prev => ({ ...prev, constructor: e.target.value }))}
                placeholder='["arg1", "arg2"]'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeployModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeploy} variant="contained">
            Deploy Contract
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contract Interaction Modal */}
      <Dialog
        open={interactModalOpen}
        onClose={() => setInteractModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Interact with {selectedContract?.name}
        </DialogTitle>
        <DialogContent>
          {selectedContract && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Contract Functions
              </Typography>
              <List>
                {selectedContract.functions.map((func, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <FunctionIcon color={func.type === 'view' ? 'info' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={func.name}
                      secondary={`Type: ${func.type} | State: ${func.stateMutability}`}
                    />
                    <Button size="small" variant="outlined">
                      Call
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInteractModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Contracts;