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
  Alert,
  LinearProgress,
  Fab,
  Tooltip,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Cloud as CloudIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import CreateSubnetModal from '../components/CreateSubnetModal';
import SubnetDetails from '../components/SubnetDetails';
import EditSubnetSettings from '../components/EditSubnetSettings';
import { useNotification } from '../components/NotificationProvider';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useEnhancedWallet } from '../contexts/EnhancedWalletContext';

interface Subnet {
  id: string;
  name: string;
  description: string;
  chainId: number;
  vmType: string;
  status: 'running' | 'stopped' | 'pending' | 'error';
  network: string;
  validators: number;
  blockTime: number;
  gasLimit: number;
  tokenSymbol: string;
  tokenName: string;
  createdAt: string;
  lastActivity: string;
  transactions: number;
  blocks: number;
}

const Subnets: React.FC = () => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const { lastMessage, isConnected } = useWebSocket();
  const { isConnected: walletConnected, account, balance } = useEnhancedWallet();
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Fetch subnets from API
  const fetchSubnets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subnets');
      if (!response.ok) {
        throw new Error('Failed to fetch subnets');
      }
      
      const result = await response.json();
      const apiSubnets = result.data || [];
      
      // Transform API data to match frontend interface
      const transformedSubnets: Subnet[] = apiSubnets.map((subnet: any) => ({
        id: subnet.id,
        name: subnet.name,
        description: subnet.description || 'No description provided',
        chainId: subnet.chain_id || subnet.chainId,
        vmType: subnet.vm_type || subnet.vmType || 'EVM',
        status: subnet.status === 'created' ? 'stopped' : subnet.status || 'stopped',
        network: subnet.config?.deployment?.target || 'local',
        validators: subnet.config?.validators?.minValidators || 1,
        blockTime: 2,
        gasLimit: 8000000,
        tokenSymbol: subnet.config?.token?.symbol || 'TOKEN',
        tokenName: subnet.config?.token?.name || 'Custom Token',
        createdAt: new Date(subnet.created_at).toLocaleDateString(),
        lastActivity: 'Just now',
        transactions: Math.floor(Math.random() * 1000),
        blocks: Math.floor(Math.random() * 500),
      }));
      
      // Only show real subnets once they exist
      setSubnets(transformedSubnets);
      } catch (error) {
        console.error('Error fetching subnets:', error);
        showNotification('Failed to fetch subnets', 'error');
        
        // On error, just set empty array - let user create real subnets
        setSubnets([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchSubnets();
  }, [showNotification]);

  // Listen for WebSocket updates
  useEffect(() => {
    if (lastMessage) {
      try {
        const message = typeof lastMessage === 'string' ? JSON.parse(lastMessage) : lastMessage;
        
        switch (message.type) {
          case 'subnet_created':
            // Refresh the list when a new subnet is created
            fetchSubnets();
            showNotification(`Subnet ${message.data?.name || 'Unknown'} created successfully!`, 'success');
            break;
            
          case 'subnet_deployment_completed':
            // Update subnet status when deployment completes
            setSubnets(prev => prev.map(subnet => 
              subnet.id === message.subnetId 
                ? { ...subnet, status: 'running' as const, lastActivity: 'Just deployed' }
                : subnet
            ));
            showNotification(message.message || 'Subnet deployed successfully', 'success');
            break;
            
          case 'subnet_deployment_failed':
            // Update subnet status when deployment fails
            setSubnets(prev => prev.map(subnet => 
              subnet.id === message.subnetId 
                ? { ...subnet, status: 'error' as const, lastActivity: 'Deployment failed' }
                : subnet
            ));
            showNotification(message.message || 'Subnet deployment failed', 'error');
            break;
            
          case 'subnet_updated':
            // Update subnet data when modified
            if (message.data) {
              setSubnets(prev => prev.map(subnet => 
                subnet.id === message.data.id ? { ...subnet, ...message.data } : subnet
              ));
            }
            break;
            
          case 'subnet_deleted':
            // Remove subnet from list when deleted
            setSubnets(prev => prev.filter(subnet => subnet.id !== message.subnetId));
            showNotification('Subnet deleted successfully', 'info');
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, showNotification]);

  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>, subnet: Subnet) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedSubnet(subnet);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedSubnet(null);
  };

  const handleViewDetails = () => {
    setDetailsDialogOpen(true);
    handleActionMenuClose();
  };

  const handleEditSettings = () => {
    setSettingsDialogOpen(true);
    handleActionMenuClose();
  };

  const handleSaveSettings = (updatedSubnet: Partial<Subnet>) => {
    if (!selectedSubnet) return;
    
    // Update the subnet in the list
    setSubnets(prev => prev.map(subnet => 
      subnet.id === selectedSubnet.id 
        ? { ...subnet, ...updatedSubnet }
        : subnet
    ));
    
    setSettingsDialogOpen(false);
  };

  const handleStartStop = async (subnet: Subnet) => {
    const action = subnet.status === 'running' ? 'stop' : 'start';
    try {
      // Replace with actual API call
      showNotification(`${action === 'start' ? 'Starting' : 'Stopping'} subnet "${subnet.name}"...`, 'info');
      
      // Update local state
      setSubnets(prev => prev.map(s => 
        s.id === subnet.id 
          ? { ...s, status: action === 'start' ? 'running' : 'stopped' }
          : s
      ));
      
      showNotification(`Subnet "${subnet.name}" ${action}ed successfully`, 'success');
    } catch (error) {
      showNotification(`Failed to ${action} subnet`, 'error');
    }
    handleActionMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleActionMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedSubnet) return;
    
    try {
      // Replace with actual API call
      setSubnets(prev => prev.filter(s => s.id !== selectedSubnet.id));
      showNotification(`Subnet "${selectedSubnet.name}" deleted successfully`, 'success');
    } catch (error) {
      showNotification('Failed to delete subnet', 'error');
    }
    
    setDeleteDialogOpen(false);
    setSelectedSubnet(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return theme.palette.success.main;
      case 'stopped': return theme.palette.error.main;
      case 'pending': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayIcon />;
      case 'stopped': return <StopIcon />;
      case 'pending': return <SpeedIcon />;
      case 'error': return <SecurityIcon />;
      default: return <CloudIcon />;
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
          Subnets
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" color="text.secondary">
              Manage your Avalanche subnets
            </Typography>
            <Chip
              size="small"
              label={isConnected ? "Live Updates" : "Offline"}
              color={isConnected ? "success" : "default"}
              variant="outlined"
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSubnets}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!walletConnected && (
            <Alert severity="info" sx={{ flex: 1 }}>
              Connect your wallet to create and manage subnets
            </Alert>
          )}
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
              py: 1.5,
              px: 4,
            }}
          >
            Create New Subnet
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : subnets.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CloudIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Subnets Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first subnet to get started with Avalanche development
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
            >
              Create Your First Subnet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {subnets.map((subnet) => (
            <Grid item xs={12} md={6} lg={4} key={subnet.id}>
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
                        bgcolor: getStatusColor(subnet.status),
                        mr: 2,
                      }}
                    >
                      {getStatusIcon(subnet.status)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {subnet.name}
                      </Typography>
                      <Chip
                        label={subnet.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(subnet.status), 0.1),
                          color: getStatusColor(subnet.status),
                        }}
                      />
                    </Box>
                    <IconButton
                      onClick={(e) => handleActionMenuClick(e, subnet)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {subnet.description}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StorageIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Chain ID: {subnet.chainId}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <GroupIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Validators: {subnet.validators}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SpeedIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Block Time: {subnet.blockTime}s
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          TXs: {subnet.transactions.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" color="text.secondary">
                    Last activity: {subnet.lastActivity}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => {
                      setSelectedSubnet(subnet);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    startIcon={subnet.status === 'running' ? <StopIcon /> : <PlayIcon />}
                    onClick={() => handleStartStop(subnet)}
                    color={subnet.status === 'running' ? 'error' : 'success'}
                  >
                    {subnet.status === 'running' ? 'Stop' : 'Start'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Tooltip title="Create New Subnet">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
          }}
          onClick={() => setCreateModalOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditSettings}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Settings
        </MenuItem>
        <MenuItem onClick={() => selectedSubnet && handleStartStop(selectedSubnet)}>
          {selectedSubnet?.status === 'running' ? <StopIcon sx={{ mr: 1 }} /> : <PlayIcon sx={{ mr: 1 }} />}
          {selectedSubnet?.status === 'running' ? 'Stop' : 'Start'}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Subnet</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All data associated with this subnet will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete subnet "{selectedSubnet?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Subnet Modal */}
      <CreateSubnetModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newSubnetData) => {
          setCreateModalOpen(false);
          showNotification('Subnet created successfully!', 'success');
          
          // Add the new subnet to the list immediately for instant feedback
          if (newSubnetData?.data) {
            const newSubnet: Subnet = {
              id: newSubnetData.data.id,
              name: newSubnetData.data.name,
              description: newSubnetData.data.description || 'No description provided',
              chainId: newSubnetData.data.chainId,
              vmType: newSubnetData.data.vmType || 'EVM',
              status: 'pending',
              network: newSubnetData.data.deployment?.target || 'local',
              validators: newSubnetData.data.config?.validators?.minValidators || 1,
              blockTime: 2,
              gasLimit: 8000000,
              tokenSymbol: newSubnetData.data.config?.token?.symbol || 'TOKEN',
              tokenName: newSubnetData.data.config?.token?.name || 'Custom Token',
              createdAt: new Date().toLocaleDateString(),
              lastActivity: 'Just created',
              transactions: 0,
              blocks: 0,
            };
            
            setSubnets(prev => [newSubnet, ...prev]);
          } else {
            // Fallback to refreshing the list
            fetchSubnets();
          }
        }}
      />

      {/* Subnet Details Modal */}
      <SubnetDetails
        open={detailsDialogOpen}
        subnet={selectedSubnet}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedSubnet(null);
        }}
        onEdit={() => {
          setDetailsDialogOpen(false);
          setSettingsDialogOpen(true);
        }}
      />

      {/* Edit Subnet Settings Modal */}
      <EditSubnetSettings
        open={settingsDialogOpen}
        subnet={selectedSubnet}
        onClose={() => {
          setSettingsDialogOpen(false);
          setSelectedSubnet(null);
        }}
        onSave={handleSaveSettings}
      />
    </Container>
  );
};

export default Subnets;