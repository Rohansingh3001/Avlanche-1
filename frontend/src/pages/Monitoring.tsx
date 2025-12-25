import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  alpha,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Computer as NodeIcon,
  Group as ValidatorsIcon,
  AccountBalance as BlocksIcon,
  Receipt as TransactionsIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: string;
  subnet?: string;
}

interface NetworkStats {
  name: string;
  value: number;
  change: number;
}

const Monitoring: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedSubnet, setSelectedSubnet] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [realTimeData, setRealTimeData] = useState<any>({});
  const [healthData, setHealthData] = useState<any>({});
  const [metricsData, setMetricsData] = useState<any>({});

  // Process real metrics data for charts
  const performanceData = metricsData.metrics ? metricsData.metrics.map((metric: any, index: number) => ({
    time: new Date(metric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: metric.cpu || 0,
    memory: metric.memory || 0,
    network: metric.network || 0,
    blockHeight: metric.blockHeight || 0,
  })) : [
    { time: '00:00', cpu: 45, memory: 120, network: 8, blockHeight: 0 },
    { time: '04:00', cpu: 52, memory: 145, network: 8, blockHeight: 0 },
    { time: '08:00', cpu: 38, memory: 98, network: 7, blockHeight: 0 },
    { time: '12:00', cpu: 67, memory: 178, network: 9, blockHeight: 0 },
  ];

  const networkDistribution = [
    { name: 'DeFi Subnet', value: 45, color: '#FF6B6B' },
    { name: 'Gaming Subnet', value: 30, color: '#4ECDC4' },
    { name: 'C-Chain', value: 25, color: '#45B7D1' },
  ];

  const resourceUsage = [
    { resource: 'CPU', usage: healthData.metrics?.cpu || 0, max: 100 },
    { resource: 'Memory', usage: healthData.metrics?.memory || 0, max: 100 },
    { resource: 'Storage', usage: healthData.metrics?.storage || 0, max: 100 },
    { resource: 'Network', usage: healthData.metrics?.network || 0, max: 100 },
  ];

  const metricCards: MetricCard[] = [
    {
      title: 'System Health',
      value: healthData.overall ? `${healthData.overall}%` : 'Loading...',
      change: healthData.overall >= 80 ? 5.2 : -2.1,
      icon: <TransactionsIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'CPU Usage',
      value: healthData.metrics?.cpu ? `${healthData.metrics.cpu}%` : 'N/A',
      change: 0,
      icon: <MemoryIcon />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Memory Usage',
      value: healthData.metrics?.memory ? `${healthData.metrics.memory}%` : 'N/A',
      change: 0,
      icon: <StorageIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Network Status',
      value: healthData.status || 'Unknown',
      change: healthData.status === 'healthy' ? 2.1 : -1.5,
      icon: <NetworkIcon />,
      color: theme.palette.warning.main,
    },
  ];

  useEffect(() => {
    fetchHealthData();
    fetchMetricsData();
    fetchSystemLogs();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchHealthData();
      fetchMetricsData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedSubnet, timeRange]);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/monitoring/health');
      if (response.ok) {
        const result = await response.json();
        setHealthData(result.data || {});
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  };

  const fetchMetricsData = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(selectedSubnet !== 'all' && { subnet_id: selectedSubnet })
      });
      
      const response = await fetch(`/api/monitoring/metrics?${params}`);
      if (response.ok) {
        const result = await response.json();
        setMetricsData(result.data || {});
      }
    } catch (error) {
      console.error('Error fetching metrics data:', error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const response = await fetch('/api/monitoring/alerts');
      if (response.ok) {
        const result = await response.json();
        const alerts = result.data || [];
        
        // Convert alerts to log format
        const logEntries: LogEntry[] = alerts.map((alert: any, index: number) => ({
          id: alert.id || index.toString(),
          timestamp: new Date(alert.timestamp).toLocaleString(),
          level: alert.severity as 'info' | 'warning' | 'error' | 'success',
          message: alert.message,
          source: 'System',
          subnet: alert.subnet_id || 'Unknown',
        }));
        
        setLogs(logEntries);
      }
    } catch (error) {
      console.error('Error fetching system logs:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchHealthData(),
        fetchMetricsData(),
        fetchSystemLogs()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'success': return <SuccessIcon color="success" />;
      case 'info': default: return <InfoIcon color="info" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'success': return theme.palette.success.main;
      case 'info': default: return theme.palette.info.main;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
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
              Monitoring
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Real-time network and subnet monitoring
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <SelectMenuItem value="1h">1 Hour</SelectMenuItem>
                <SelectMenuItem value="24h">24 Hours</SelectMenuItem>
                <SelectMenuItem value="7d">7 Days</SelectMenuItem>
                <SelectMenuItem value="30d">30 Days</SelectMenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Subnet</InputLabel>
              <Select
                value={selectedSubnet}
                label="Subnet"
                onChange={(e) => setSelectedSubnet(e.target.value)}
              >
                <SelectMenuItem value="all">All Subnets</SelectMenuItem>
                <SelectMenuItem value="defi">DeFi Subnet</SelectMenuItem>
                <SelectMenuItem value="gaming">Gaming Subnet</SelectMenuItem>
                <SelectMenuItem value="c-chain">C-Chain</SelectMenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Metric Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {metricCards.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(metric.color, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha(metric.color, 0.1),
                        color: metric.color,
                        mr: 2,
                      }}
                    >
                      {metric.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {metric.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {metric.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {metric.change >= 0 ? (
                      <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5, fontSize: 16 }} />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: metric.change >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Performance" />
          <Tab label="Network" />
          <Tab label="Resources" />
          <Tab label="Logs" />
        </Tabs>
      </Box>

      {/* Performance Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Network Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.3)}
                      name="CPU %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Network Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={networkDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {networkDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Block Production & Validators
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2}
                      name="Memory %"
                    />
                    <Line
                      type="monotone"
                      dataKey="network"
                      stroke={theme.palette.success.main}
                      strokeWidth={2}
                      name="Network %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Network Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Network Health
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SuccessIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="System Health"
                      secondary={healthData.status === 'healthy' ? 'All systems operational' : 'Some issues detected'}
                    />
                    <Chip 
                      label={healthData.status || 'Unknown'} 
                      color={healthData.status === 'healthy' ? 'success' : healthData.status === 'warning' ? 'warning' : 'error'} 
                      size="small" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SuccessIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="CPU Usage"
                      secondary={`${healthData.metrics?.cpu || 0}% utilization`}
                    />
                    <Chip 
                      label={healthData.metrics?.cpu > 80 ? 'High' : 'Normal'} 
                      color={healthData.metrics?.cpu > 80 ? 'warning' : 'success'} 
                      size="small" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Memory Usage"
                      secondary={`${healthData.metrics?.memory || 0}% utilization`}
                    />
                    <Chip 
                      label={healthData.metrics?.memory > 80 ? 'High' : 'Normal'} 
                      color={healthData.metrics?.memory > 80 ? 'warning' : 'success'} 
                      size="small" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subnet Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NodeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="DeFi Subnet"
                      secondary="8 validators, 2.1k TPS"
                    />
                    <Chip label="Active" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NodeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Gaming Subnet"
                      secondary="5 validators, 1.8k TPS"
                    />
                    <Chip label="Active" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NodeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="C-Chain"
                      secondary="11 validators, 3.2k TPS"
                    />
                    <Chip label="Active" color="success" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Network Topology
                </Typography>
                <Alert severity="info">
                  Network topology visualization would be displayed here with interactive node connections.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Resources Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resource Usage
                </Typography>
                {resourceUsage.map((resource, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{resource.resource}</Typography>
                      <Typography variant="body2">{resource.usage}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={resource.usage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.grey[300], 0.3),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: resource.usage > 80 ? theme.palette.error.main :
                                   resource.usage > 60 ? theme.palette.warning.main :
                                   theme.palette.success.main,
                        },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <MemoryIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6">{healthData.metrics?.memory || 0}%</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Memory Usage
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <StorageIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="h6">{healthData.metrics?.storage || 0}%</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Storage Usage
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <NetworkIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                      <Typography variant="h6">{healthData.metrics?.network || 0}%</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Network Usage
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <SpeedIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h6">{healthData.metrics?.cpu || 0}%</Typography>
                      <Typography variant="caption" color="text.secondary">
                        CPU Usage
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Logs Tab */}
      {tabValue === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                System Logs
              </Typography>
              <Button
                startIcon={<ExportIcon />}
                variant="outlined"
                size="small"
              >
                Export Logs
              </Button>
            </Box>
            <List>
              {logs.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getLogIcon(log.level)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{log.message}</Typography>
                          <Chip
                            label={log.level}
                            size="small"
                            sx={{
                              bgcolor: alpha(getLogColor(log.level), 0.1),
                              color: getLogColor(log.level),
                            }}
                          />
                          {log.subnet && (
                            <Chip label={log.subnet} size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {log.timestamp} • {log.source}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < logs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Monitoring;