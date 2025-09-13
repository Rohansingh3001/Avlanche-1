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
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  InputAdornment,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  RestoreFromTrash as ResetIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Token as TokenIcon,
  Group as GroupIcon,
  Lan as NetworkIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNotification } from './NotificationProvider';

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

interface EditSubnetSettingsProps {
  open: boolean;
  subnet: Subnet | null;
  onClose: () => void;
  onSave: (updatedSubnet: Partial<Subnet>) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const EditSubnetSettings: React.FC<EditSubnetSettingsProps> = ({
  open,
  subnet,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    blockTime: 2,
    gasLimit: 8000000,
    tokenName: '',
    tokenSymbol: '',
    validators: 1,
    maxValidators: 10,
    enablePrecompiles: true,
    allowFeeRecipients: true,
    networkUpgradeEnabled: false,
    pruningEnabled: false,
    logLevel: 'info',
    rpcGasLimit: 50000000,
    rpcTxFeeCap: 100,
    allowUnfinalizedQueries: false,
    enableMetrics: true,
    metricsPort: 9090,
  });

  // Initialize form data when subnet changes
  useEffect(() => {
    if (subnet) {
      setFormData({
        name: subnet.name,
        description: subnet.description,
        blockTime: subnet.blockTime,
        gasLimit: subnet.gasLimit,
        tokenName: subnet.tokenName,
        tokenSymbol: subnet.tokenSymbol,
        validators: subnet.validators,
        maxValidators: 10,
        enablePrecompiles: true,
        allowFeeRecipients: true,
        networkUpgradeEnabled: false,
        pruningEnabled: false,
        logLevel: 'info',
        rpcGasLimit: 50000000,
        rpcTxFeeCap: 100,
        allowUnfinalizedQueries: false,
        enableMetrics: true,
        metricsPort: 9090,
      });
      setHasChanges(false);
    }
  }, [subnet]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!subnet) return;

    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        blockTime: formData.blockTime,
        gasLimit: formData.gasLimit,
        tokenName: formData.tokenName,
        tokenSymbol: formData.tokenSymbol,
        validators: formData.validators,
      };

      const response = await fetch(`/api/subnets/${subnet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update subnet');
      }

      const result = await response.json();
      
      const updatedSubnet: Partial<Subnet> = {
        name: formData.name,
        description: formData.description,
        blockTime: formData.blockTime,
        gasLimit: formData.gasLimit,
        tokenName: formData.tokenName,
        tokenSymbol: formData.tokenSymbol,
        validators: formData.validators,
      };

      onSave(updatedSubnet);
      showNotification('Subnet settings updated successfully!', 'success');
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Error updating subnet:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to update subnet settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (subnet) {
      setFormData({
        name: subnet.name,
        description: subnet.description,
        blockTime: subnet.blockTime,
        gasLimit: subnet.gasLimit,
        tokenName: subnet.tokenName,
        tokenSymbol: subnet.tokenSymbol,
        validators: subnet.validators,
        maxValidators: 10,
        enablePrecompiles: true,
        allowFeeRecipients: true,
        networkUpgradeEnabled: false,
        pruningEnabled: false,
        logLevel: 'info',
        rpcGasLimit: 50000000,
        rpcTxFeeCap: 100,
        allowUnfinalizedQueries: false,
        enableMetrics: true,
        metricsPort: 9090,
      });
      setHasChanges(false);
      showNotification('Settings reset to original values', 'info');
    }
  };

  if (!subnet) return null;

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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                mr: 2,
              }}
            >
              <SettingsIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Edit Subnet Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subnet.name}
              </Typography>
            </Box>
          </Box>
          <Box>
            {hasChanges && (
              <Chip
                label="Unsaved Changes"
                color="warning"
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Basic Settings" icon={<InfoIcon />} iconPosition="start" />
            <Tab label="Network Config" icon={<NetworkIcon />} iconPosition="start" />
            <Tab label="Validators" icon={<GroupIcon />} iconPosition="start" />
            <Tab label="Advanced" icon={<SettingsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Basic Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subnet Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Token Symbol"
                value={formData.tokenSymbol}
                onChange={(e) => handleInputChange('tokenSymbol', e.target.value.toUpperCase())}
                variant="outlined"
                inputProps={{ maxLength: 6 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Token Name"
                value={formData.tokenName}
                onChange={(e) => handleInputChange('tokenName', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Network Configuration Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Block Configuration
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>
                      Block Time: {formData.blockTime}s
                    </Typography>
                    <Slider
                      value={formData.blockTime}
                      onChange={(_, value) => handleInputChange('blockTime', value)}
                      min={1}
                      max={10}
                      step={0.5}
                      marks={[
                        { value: 1, label: '1s' },
                        { value: 2, label: '2s' },
                        { value: 5, label: '5s' },
                        { value: 10, label: '10s' },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Gas Limit"
                    type="number"
                    value={formData.gasLimit}
                    onChange={(e) => handleInputChange('gasLimit', parseInt(e.target.value))}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">gas</InputAdornment>,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    RPC Configuration
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="RPC Gas Limit"
                      type="number"
                      value={formData.rpcGasLimit}
                      onChange={(e) => handleInputChange('rpcGasLimit', parseInt(e.target.value))}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="RPC Transaction Fee Cap"
                    type="number"
                    value={formData.rpcTxFeeCap}
                    onChange={(e) => handleInputChange('rpcTxFeeCap', parseInt(e.target.value))}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">AVAX</InputAdornment>,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Validators Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Validator Settings
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>
                      Minimum Validators: {formData.validators}
                    </Typography>
                    <Slider
                      value={formData.validators}
                      onChange={(_, value) => handleInputChange('validators', value)}
                      min={1}
                      max={20}
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 5, label: '5' },
                        { value: 10, label: '10' },
                        { value: 20, label: '20' },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>
                      Maximum Validators: {formData.maxValidators}
                    </Typography>
                    <Slider
                      value={formData.maxValidators}
                      onChange={(_, value) => handleInputChange('maxValidators', value)}
                      min={formData.validators}
                      max={100}
                      step={1}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Validator Options
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Allow Fee Recipients"
                        secondary="Enable validators to specify fee recipient addresses"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={formData.allowFeeRecipients}
                          onChange={(e) => handleInputChange('allowFeeRecipients', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Advanced Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Advanced settings can significantly impact subnet performance and security.
                  Please review changes carefully before applying.
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">EVM Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Enable Precompiles"
                        secondary="Allow usage of precompiled contracts"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={formData.enablePrecompiles}
                          onChange={(e) => handleInputChange('enablePrecompiles', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Allow Unfinalized Queries"
                        secondary="Enable queries on unfinalized blocks"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={formData.allowUnfinalizedQueries}
                          onChange={(e) => handleInputChange('allowUnfinalizedQueries', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">System Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Log Level</InputLabel>
                    <Select
                      value={formData.logLevel}
                      label="Log Level"
                      onChange={(e) => handleInputChange('logLevel', e.target.value)}
                    >
                      <MenuItem value="debug">Debug</MenuItem>
                      <MenuItem value="info">Info</MenuItem>
                      <MenuItem value="warn">Warning</MenuItem>
                      <MenuItem value="error">Error</MenuItem>
                    </Select>
                  </FormControl>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Enable Pruning"
                        secondary="Automatically prune old blockchain data"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={formData.pruningEnabled}
                          onChange={(e) => handleInputChange('pruningEnabled', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Enable Metrics"
                        secondary="Collect and expose performance metrics"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={formData.enableMetrics}
                          onChange={(e) => handleInputChange('enableMetrics', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  {formData.enableMetrics && (
                    <TextField
                      fullWidth
                      label="Metrics Port"
                      type="number"
                      value={formData.metricsPort}
                      onChange={(e) => handleInputChange('metricsPort', parseInt(e.target.value))}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleReset}
          disabled={!hasChanges || saving}
          startIcon={<ResetIcon />}
        >
          Reset
        </Button>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!hasChanges || saving}
          startIcon={saving ? undefined : <SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSubnetSettings;