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

  // Mock data for charts
  const performanceData = [
    { time: '00:00', tps: 45, blocks: 120, validators: 8 },
    { time: '04:00', tps: 52, blocks: 145, validators: 8 },
    { time: '08:00', tps: 38, blocks: 98, validators: 7 },
    { time: '12:00', tps: 67, blocks: 178, validators: 9 },
    { time: '16:00', tps: 54, blocks: 156, validators: 8 },
    { time: '20:00', tps: 41, blocks: 112, validators: 8 },
    { time: '24:00', tps: 49, blocks: 134, validators: 8 },
  ];

  const networkDistribution = [
    { name: 'DeFi Subnet', value: 45, color: '#FF6B6B' },
    { name: 'Gaming Subnet', value: 30, color: '#4ECDC4' },
    { name: 'C-Chain', value: 25, color: '#45B7D1' },
  ];

  const resourceUsage = [
    { resource: 'CPU', usage: 68, max: 100 },
    { resource: 'Memory', usage: 42, max: 100 },
    { resource: 'Storage', usage: 35, max: 100 },
    { resource: 'Network', usage: 78, max: 100 },
  ];

  const metricCards: MetricCard[] = [
    {
      title: 'Total Transactions',
      value: '2.4M',
      change: 12.5,
      icon: <TransactionsIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Blocks Produced',
      value: '48,392',
      change: 8.2,
      icon: <BlocksIcon />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Active Validators',
      value: 24,
      change: 4.3,
      icon: <ValidatorsIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Network TPS',
      value: 156,
      change: -2.1,
      icon: <SpeedIcon />,
      color: theme.palette.warning.main,
    },
  ];

  useEffect(() => {
    // Mock log data
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: '2024-03-12 10:30:45',
        level: 'info',
        message: 'New block produced successfully',
        source: 'Consensus',
        subnet: 'DeFi Subnet',
      },
      {
        id: '2',
        timestamp: '2024-03-12 10:30:42',
        level: 'success',
        message: 'Validator node synchronized',
        source: 'Network',
        subnet: 'Gaming Subnet',
      },
      {
        id: '3',
        timestamp: '2024-03-12 10:30:38',
        level: 'warning',
        message: 'High memory usage detected on node-3',
        source: 'System',
        subnet: 'DeFi Subnet',
      },
      {
        id: '4',
        timestamp: '2024-03-12 10:30:35',
        level: 'error',
        message: 'Failed to connect to peer 192.168.1.100',
        source: 'Network',
        subnet: 'C-Chain',
      },
      {
        id: '5',
        timestamp: '2024-03-12 10:30:30',
        level: 'info',
        message: 'Smart contract deployed successfully',
        source: 'EVM',
        subnet: 'Gaming Subnet',
      },
    ];
    setLogs(mockLogs);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
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
                      dataKey="tps"
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.3)}
                      name="TPS"
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
                      dataKey="blocks"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2}
                      name="Blocks"
                    />
                    <Line
                      type="monotone"
                      dataKey="validators"
                      stroke={theme.palette.success.main}
                      strokeWidth={2}
                      name="Validators"
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
                      primary="Consensus Layer"
                      secondary="All validators online and synced"
                    />
                    <Chip label="Healthy" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SuccessIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="P2P Network"
                      secondary="24 peers connected"
                    />
                    <Chip label="Healthy" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Block Production"
                      secondary="Slight delay in last block"
                    />
                    <Chip label="Warning" color="warning" size="small" />
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
                      <Typography variant="h6">2.4 GB</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Memory Used
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <StorageIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="h6">156 GB</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Storage Used
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <NetworkIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                      <Typography variant="h6">1.2 GB/s</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Network I/O
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <SpeedIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h6">68%</Typography>
                      <Typography variant="caption" color="text.secondary">
                        CPU Load
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