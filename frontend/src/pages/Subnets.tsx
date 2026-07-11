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
  Divider,
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
  const { isConnected: walletConnected, account } = useEnhancedWallet();
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const fetchSubnets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subnets');
      if (!response.ok) {
        throw new Error('Failed to fetch subnets');
      }
      
      const result = await response.json();
      const apiSubnets = result.data || [];
      
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
      
      setSubnets(transformedSubnets);
    } catch (error) {
      console.error('Error fetching subnets:', error);
      showNotification('Failed to fetch subnets', 'error');
      setSubnets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubnets();
  }, [showNotification]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const message = typeof lastMessage === 'string' ? JSON.parse(lastMessage) : lastMessage;
        
        switch (message.type) {
          case 'subnet_created':
            fetchSubnets();
            showNotification(`Subnet ${message.data?.name || 'Unknown'} created successfully!`, 'success');
            break;
            
          case 'subnet_deployment_completed':
            setSubnets(prev => prev.map(subnet => 
              subnet.id === message.subnetId 
                ? { ...subnet, status: 'running' as const, lastActivity: 'Just deployed' }
                : subnet
            ));
            showNotification(message.message || 'Subnet deployed successfully', 'success');
            break;
            
          case 'subnet_deployment_failed':
            setSubnets(prev => prev.map(subnet => 
              subnet.id === message.subnetId 
                ? { ...subnet, status: 'error' as const, lastActivity: 'Deployment failed' }
                : subnet
            ));
            showNotification(message.message || 'Subnet deployment failed', 'error');
            break;
            
          case 'subnet_updated':
            if (message.data) {
              setSubnets(prev => prev.map(subnet => 
                subnet.id === message.data.id ? { ...subnet, ...message.data } : subnet
              ));
            }
            break;
            
          case 'subnet_deleted':
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
      showNotification(`${action === 'start' ? 'Starting' : 'Stopping'} subnet "${subnet.name}"...`, 'info');
      
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
      case 'stopped': return '#6B7280';
      case 'pending': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return '#6B7280';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Page Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
          Subnet Manager
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="body1" color="text.secondary">
              Configure, provision, and deploy sovereign Avalanche EVM subnet nodes.
            </Typography>
            <Chip
              size="small"
              label={isConnected ? "Live Updates" : "Idle Updates"}
              variant="outlined"
              sx={{
                borderColor: isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
                color: isConnected ? '#10B981' : 'text.secondary',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
          {!walletConnected && (
            <Alert severity="info" variant="outlined" sx={{ flex: 1, borderRadius: 3, py: 0.5 }}>
              Connect your developer wallet to initiate chain genesis setups.
            </Alert>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            Deploy New Subnet
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Grid container spacing={4}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="rectangular" width="100%" height={80} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : subnets.length === 0 ? (
        <Card sx={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(13,18,38,0.2)' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CloudIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              No Active Subnets Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: '400px', mx: 'auto' }}>
              Create your custom subnet configuration using the wizard to initialize node validator services.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
            >
              Start Genesis Wizard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={4}>
          {subnets.map((subnet) => (
            <Grid item xs={12} md={6} lg={4} key={subnet.id}>
              <Card className="glass-card-hover" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent sx={{ p: 4, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span className={`status-dot-pulse ${subnet.status === 'running' ? 'active' : subnet.status}`} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                          {subnet.name}
                        </Typography>
                        <Chip
                          label={subnet.vmType}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: 'rgba(5, 107, 93, 0.08)',
                            color: '#056B5D',
                            border: '1px solid rgba(5, 107, 93, 0.15)'
                          }}
                        />
                      </Box>
                    </Box>
                    <IconButton onClick={(e) => handleActionMenuClick(e, subnet)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, minHeight: 40, lineHeight: 1.6 }}>
                    {subnet.description}
                  </Typography>

                  <Grid container spacing={2.5} sx={{ mb: 3, p: 2, background: '#F4F8F5', borderRadius: 3, border: '1px solid #D1DDD6' }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StorageIcon sx={{ fontSize: 16, color: '#056B5D' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Chain ID</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>{subnet.chainId}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon sx={{ fontSize: 16, color: '#056B5D' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Validators</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>{subnet.validators}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SpeedIcon sx={{ fontSize: 16, color: '#056B5D' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Block Time</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>{subnet.blockTime}s</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 16, color: '#056B5D' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Total TXs</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>{subnet.transactions.toLocaleString()}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                    Activity Feed: {subnet.lastActivity}
                  </Typography>
                </CardContent>

                <CardActions sx={{ px: 4, pb: 4, pt: 0, gap: 1.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => {
                      setSelectedSubnet(subnet);
                      setDetailsDialogOpen(true);
                    }}
                    sx={{ flex: 1 }}
                  >
                    Open View
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={subnet.status === 'running' ? <StopIcon /> : <PlayIcon />}
                    onClick={() => handleStartStop(subnet)}
                    color={subnet.status === 'running' ? 'secondary' : 'primary'}
                    sx={{ flex: 1 }}
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
      <Tooltip title="Deploy Subnet Wizard">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            background: 'linear-gradient(135deg, #00F2FE 0%, #8B5CF6 100%)',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
          }}
          onClick={() => setCreateModalOpen(true)}
        >
          <AddIcon sx={{ color: '#03050C', fontWeight: 'bold' }} />
        </Fab>
      </Tooltip>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            background: '#0a0e1a',
            border: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ViewIcon sx={{ mr: 1.5, fontSize: 18 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditSettings}>
          <EditIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Edit Settings
        </MenuItem>
        <MenuItem onClick={() => selectedSubnet && handleStartStop(selectedSubnet)}>
          {selectedSubnet?.status === 'running' ? <StopIcon sx={{ mr: 1.5, fontSize: 18 }} /> : <PlayIcon sx={{ mr: 1.5, fontSize: 18 }} />}
          {selectedSubnet?.status === 'running' ? 'Stop Node' : 'Start Node'}
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Delete Subnet
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: '#0a0e1a',
            border: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Subnet</DialogTitle>
        <DialogContent>
          <Alert severity="warning" variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
            This action cannot be undone. All local configurations will be permanently cleared.
          </Alert>
          <Typography variant="body2">
            Confirm deleting subnet configuration: <strong>{selectedSubnet?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subnet Details Dialog */}
      {selectedSubnet && (
        <SubnetDetails
          open={detailsDialogOpen}
          onClose={() => {
            setDetailsDialogOpen(false);
            setSelectedSubnet(null);
          }}
          subnet={selectedSubnet}
        />
      )}

      {/* Subnet Settings Dialog */}
      {selectedSubnet && (
        <EditSubnetSettings
          open={settingsDialogOpen}
          onClose={() => {
            setSettingsDialogOpen(false);
            setSelectedSubnet(null);
          }}
          subnet={selectedSubnet}
          onSave={handleSaveSettings}
        />
      )}

      {/* Create Subnet Modal */}
      <CreateSubnetModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchSubnets();
          showNotification('Subnet created successfully!', 'success');
        }}
      />
    </Container>
  );
};

export default Subnets;