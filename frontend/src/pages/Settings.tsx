import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Grid,
  Chip,
  Card,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Slider,
  RadioGroup,
  Radio,
  FormLabel,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  RestoreFromTrash as RestoreIcon,
  Security as SecurityIcon,
  Lan as NetworkIcon,
  Palette as PaletteIcon,
  Api as ApiIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudSync as CloudSyncIcon,
  Speed as SpeedIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface NetworkEndpoint {
  id: string;
  name: string;
  url: string;
  chainId: string;
  isActive: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  service: string;
  isActive: boolean;
  lastUsed: string;
}

const Settings: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showEndpointDialog, setShowEndpointDialog] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({});

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    enableNotifications: true,
    soundEnabled: false,
    language: 'en',
    timezone: 'UTC',
    compactMode: false,
    showAdvancedFeatures: false
  });

  // Network Settings
  const [networkEndpoints, setNetworkEndpoints] = useState<NetworkEndpoint[]>([
    {
      id: '1',
      name: 'Avalanche Mainnet',
      url: 'https://api.avax.network',
      chainId: '43114',
      isActive: true
    },
    {
      id: '2',
      name: 'Fuji Testnet',
      url: 'https://api.avax-test.network',
      chainId: '43113',
      isActive: false
    },
    {
      id: '3',
      name: 'Local Network',
      url: 'http://localhost:9650',
      chainId: '1337',
      isActive: false
    }
  ]);

  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    url: '',
    chainId: ''
  });

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Snowtrace API',
      key: 'st_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      service: 'Snowtrace',
      isActive: true,
      lastUsed: '2024-01-15'
    },
    {
      id: '2',
      name: 'Alchemy API',
      key: 'alch_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      service: 'Alchemy',
      isActive: true,
      lastUsed: '2024-01-14'
    }
  ]);

  const [newApiKey, setNewApiKey] = useState({
    name: '',
    key: '',
    service: ''
  });

  // Theme Settings
  const [themeSettings, setThemeSettings] = useState({
    mode: 'dark',
    primaryColor: '#1976d2',
    accentColor: '#ff4081',
    glassEffect: true,
    particleAnimation: true,
    backgroundAnimation: true,
    cardOpacity: 0.9,
    borderRadius: 12
  });

  // Performance Settings
  const [performanceSettings, setPerformanceSettings] = useState({
    enableAnimations: true,
    maxLogEntries: 1000,
    cacheSize: 100,
    autoCleanup: true,
    compressionEnabled: true,
    batchSize: 50,
    requestTimeout: 30
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    autoLock: true,
    lockTimeout: 15,
    requireAuth: false,
    encryptStorage: true,
    sessionTimeout: 60,
    allowRemoteAccess: false,
    auditLogging: true
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or backend
    const settings = {
      general: generalSettings,
      theme: themeSettings,
      performance: performanceSettings,
      security: securitySettings,
      networkEndpoints,
      apiKeys
    };
    
    localStorage.setItem('avalanche-settings', JSON.stringify(settings));
    setSnackbarMessage('Settings saved successfully!');
    setSnackbarOpen(true);
  };

  const handleResetSettings = () => {
    // Reset to default values
    setSnackbarMessage('Settings reset to defaults!');
    setSnackbarOpen(true);
  };

  const handleAddEndpoint = () => {
    if (newEndpoint.name && newEndpoint.url && newEndpoint.chainId) {
      const endpoint: NetworkEndpoint = {
        id: Date.now().toString(),
        ...newEndpoint,
        isActive: false
      };
      setNetworkEndpoints([...networkEndpoints, endpoint]);
      setNewEndpoint({ name: '', url: '', chainId: '' });
      setShowEndpointDialog(false);
      setSnackbarMessage('Network endpoint added successfully!');
      setSnackbarOpen(true);
    }
  };

  const handleAddApiKey = () => {
    if (newApiKey.name && newApiKey.key && newApiKey.service) {
      const apiKey: ApiKey = {
        id: Date.now().toString(),
        ...newApiKey,
        isActive: true,
        lastUsed: new Date().toISOString().split('T')[0]
      };
      setApiKeys([...apiKeys, apiKey]);
      setNewApiKey({ name: '', key: '', service: '' });
      setShowApiKeyDialog(false);
      setSnackbarMessage('API key added successfully!');
      setSnackbarOpen(true);
    }
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const deleteEndpoint = (id: string) => {
    setNetworkEndpoints(endpoints => endpoints.filter(e => e.id !== id));
    setSnackbarMessage('Network endpoint deleted!');
    setSnackbarOpen(true);
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(keys => keys.filter(k => k.id !== id));
    setSnackbarMessage('API key deleted!');
    setSnackbarOpen(true);
  };

  const toggleEndpointActive = (id: string) => {
    setNetworkEndpoints(endpoints =>
      endpoints.map(e => ({
        ...e,
        isActive: e.id === id ? !e.isActive : e.isActive
      }))
    );
  };

  useEffect(() => {
    // Load settings from localStorage on component mount
    const savedSettings = localStorage.getItem('avalanche-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setGeneralSettings(parsed.general || generalSettings);
      setThemeSettings(parsed.theme || themeSettings);
      setPerformanceSettings(parsed.performance || performanceSettings);
      setSecuritySettings(parsed.security || securitySettings);
      setNetworkEndpoints(parsed.networkEndpoints || networkEndpoints);
      setApiKeys(parsed.apiKeys || apiKeys);
    }
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          fontWeight: 600
        }}>
          <SettingsIcon fontSize="large" />
          Settings
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Configure your Avalanche Subnet Tooling Suite preferences
        </Typography>
      </Box>

      <Paper sx={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<SettingsIcon />} label="General" />
            <Tab icon={<NetworkIcon />} label="Network" />
            <Tab icon={<ApiIcon />} label="API Keys" />
            <Tab icon={<PaletteIcon />} label="Theme" />
            <Tab icon={<SpeedIcon />} label="Performance" />
            <Tab icon={<SecurityIcon />} label="Security" />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <NotificationsIcon sx={{ mr: 1 }} />
                    Application Preferences
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalSettings.autoRefresh}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          autoRefresh: e.target.checked
                        })}
                      />
                    }
                    label="Auto-refresh data"
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>Refresh Interval (seconds)</Typography>
                    <Slider
                      value={generalSettings.refreshInterval}
                      onChange={(_, value) => setGeneralSettings({
                        ...generalSettings,
                        refreshInterval: value as number
                      })}
                      min={5}
                      max={300}
                      marks={[
                        { value: 5, label: '5s' },
                        { value: 30, label: '30s' },
                        { value: 60, label: '1m' },
                        { value: 300, label: '5m' }
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalSettings.enableNotifications}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          enableNotifications: e.target.checked
                        })}
                      />
                    }
                    label="Enable notifications"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalSettings.soundEnabled}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          soundEnabled: e.target.checked
                        })}
                      />
                    }
                    label="Sound notifications"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalSettings.compactMode}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          compactMode: e.target.checked
                        })}
                      />
                    }
                    label="Compact mode"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <LanguageIcon sx={{ mr: 1 }} />
                    Localization
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={generalSettings.language}
                      label="Language"
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        language: e.target.value
                      })}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="zh">中文</MenuItem>
                      <MenuItem value="ja">日本語</MenuItem>
                      <MenuItem value="ko">한국어</MenuItem>
                      <MenuItem value="es">Español</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={generalSettings.timezone}
                      label="Timezone"
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        timezone: e.target.value
                      })}
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                      <MenuItem value="Europe/London">London</MenuItem>
                      <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Network Settings */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Network Endpoints</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowEndpointDialog(true)}
              >
                Add Endpoint
              </Button>
            </Box>

            <Grid container spacing={2}>
              {networkEndpoints.map((endpoint) => (
                <Grid item xs={12} md={6} key={endpoint.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6">{endpoint.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {endpoint.url}
                          </Typography>
                          <Chip 
                            label={`Chain ID: ${endpoint.chainId}`} 
                            size="small" 
                            sx={{ mt: 1 }} 
                          />
                        </Box>
                        <Box>
                          <Chip
                            label={endpoint.isActive ? 'Active' : 'Inactive'}
                            color={endpoint.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => toggleEndpointActive(endpoint.id)}
                      >
                        {endpoint.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => deleteEndpoint(endpoint.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* API Keys */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">API Keys</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowApiKeyDialog(true)}
              >
                Add API Key
              </Button>
            </Box>

            <Grid container spacing={2}>
              {apiKeys.map((apiKey) => (
                <Grid item xs={12} key={apiKey.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{apiKey.name}</Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Service: {apiKey.service}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              size="small"
                              value={showApiKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                              InputProps={{
                                readOnly: true,
                                style: { fontFamily: 'monospace' }
                              }}
                              sx={{ flex: 1 }}
                            />
                            <IconButton
                              onClick={() => toggleApiKeyVisibility(apiKey.id)}
                            >
                              {showApiKeys[apiKey.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            Last used: {apiKey.lastUsed}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 2 }}>
                          <Chip
                            label={apiKey.isActive ? 'Active' : 'Inactive'}
                            color={apiKey.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small">
                        <EditIcon sx={{ mr: 1 }} />
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteApiKey(apiKey.id)}
                      >
                        <DeleteIcon sx={{ mr: 1 }} />
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Theme Settings */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <PaletteIcon sx={{ mr: 1 }} />
                    Appearance
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Theme Mode</FormLabel>
                    <RadioGroup
                      value={themeSettings.mode}
                      onChange={(e) => setThemeSettings({
                        ...themeSettings,
                        mode: e.target.value
                      })}
                    >
                      <FormControlLabel value="light" control={<Radio />} label="Light" />
                      <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                      <FormControlLabel value="auto" control={<Radio />} label="Auto" />
                    </RadioGroup>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Primary Color"
                    type="color"
                    value={themeSettings.primaryColor}
                    onChange={(e) => setThemeSettings({
                      ...themeSettings,
                      primaryColor: e.target.value
                    })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Accent Color"
                    type="color"
                    value={themeSettings.accentColor}
                    onChange={(e) => setThemeSettings({
                      ...themeSettings,
                      accentColor: e.target.value
                    })}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Visual Effects
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={themeSettings.glassEffect}
                        onChange={(e) => setThemeSettings({
                          ...themeSettings,
                          glassEffect: e.target.checked
                        })}
                      />
                    }
                    label="Glass morphism effect"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={themeSettings.particleAnimation}
                        onChange={(e) => setThemeSettings({
                          ...themeSettings,
                          particleAnimation: e.target.checked
                        })}
                      />
                    }
                    label="Particle animations"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={themeSettings.backgroundAnimation}
                        onChange={(e) => setThemeSettings({
                          ...themeSettings,
                          backgroundAnimation: e.target.checked
                        })}
                      />
                    }
                    label="Background animations"
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>Card Opacity</Typography>
                    <Slider
                      value={themeSettings.cardOpacity}
                      onChange={(_, value) => setThemeSettings({
                        ...themeSettings,
                        cardOpacity: value as number
                      })}
                      min={0.5}
                      max={1}
                      step={0.1}
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>Border Radius</Typography>
                    <Slider
                      value={themeSettings.borderRadius}
                      onChange={(_, value) => setThemeSettings({
                        ...themeSettings,
                        borderRadius: value as number
                      })}
                      min={0}
                      max={24}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Performance Settings */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <SpeedIcon sx={{ mr: 1 }} />
                    Performance Options
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={performanceSettings.enableAnimations}
                        onChange={(e) => setPerformanceSettings({
                          ...performanceSettings,
                          enableAnimations: e.target.checked
                        })}
                      />
                    }
                    label="Enable animations"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={performanceSettings.autoCleanup}
                        onChange={(e) => setPerformanceSettings({
                          ...performanceSettings,
                          autoCleanup: e.target.checked
                        })}
                      />
                    }
                    label="Auto cleanup old data"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={performanceSettings.compressionEnabled}
                        onChange={(e) => setPerformanceSettings({
                          ...performanceSettings,
                          compressionEnabled: e.target.checked
                        })}
                      />
                    }
                    label="Enable data compression"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <StorageIcon sx={{ mr: 1 }} />
                    Data Management
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Max Log Entries"
                    type="number"
                    value={performanceSettings.maxLogEntries}
                    onChange={(e) => setPerformanceSettings({
                      ...performanceSettings,
                      maxLogEntries: parseInt(e.target.value)
                    })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Cache Size (MB)"
                    type="number"
                    value={performanceSettings.cacheSize}
                    onChange={(e) => setPerformanceSettings({
                      ...performanceSettings,
                      cacheSize: parseInt(e.target.value)
                    })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Request Timeout (seconds)"
                    type="number"
                    value={performanceSettings.requestTimeout}
                    onChange={(e) => setPerformanceSettings({
                      ...performanceSettings,
                      requestTimeout: parseInt(e.target.value)
                    })}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <SecurityIcon sx={{ mr: 1 }} />
                    Security Options
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.autoLock}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          autoLock: e.target.checked
                        })}
                      />
                    }
                    label="Auto-lock application"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.requireAuth}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          requireAuth: e.target.checked
                        })}
                      />
                    }
                    label="Require authentication"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.encryptStorage}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          encryptStorage: e.target.checked
                        })}
                      />
                    }
                    label="Encrypt local storage"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.auditLogging}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          auditLogging: e.target.checked
                        })}
                      />
                    }
                    label="Enable audit logging"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Session Management
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Lock Timeout (minutes)"
                    type="number"
                    value={securitySettings.lockTimeout}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      lockTimeout: parseInt(e.target.value)
                    })}
                    sx={{ mb: 2 }}
                    disabled={!securitySettings.autoLock}
                  />

                  <TextField
                    fullWidth
                    label="Session Timeout (minutes)"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      sessionTimeout: parseInt(e.target.value)
                    })}
                    sx={{ mb: 2 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.allowRemoteAccess}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          allowRemoteAccess: e.target.checked
                        })}
                      />
                    }
                    label="Allow remote access"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Action Buttons */}
        <Box sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>

      {/* Add Network Endpoint Dialog */}
      <Dialog open={showEndpointDialog} onClose={() => setShowEndpointDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Network Endpoint</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Network Name"
            fullWidth
            variant="outlined"
            value={newEndpoint.name}
            onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="RPC URL"
            fullWidth
            variant="outlined"
            value={newEndpoint.url}
            onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Chain ID"
            fullWidth
            variant="outlined"
            value={newEndpoint.chainId}
            onChange={(e) => setNewEndpoint({ ...newEndpoint, chainId: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEndpointDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEndpoint} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Add API Key Dialog */}
      <Dialog open={showApiKeyDialog} onClose={() => setShowApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Key Name"
            fullWidth
            variant="outlined"
            value={newApiKey.name}
            onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Service"
            fullWidth
            variant="outlined"
            value={newApiKey.service}
            onChange={(e) => setNewApiKey({ ...newApiKey, service: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="API Key"
            fullWidth
            variant="outlined"
            type="password"
            value={newApiKey.key}
            onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApiKeyDialog(false)}>Cancel</Button>
          <Button onClick={handleAddApiKey} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;