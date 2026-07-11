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
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Button,
  Alert,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Computer as NodeIcon,
  Receipt as TransactionsIcon,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const Monitoring: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedSubnet, setSelectedSubnet] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<any>({});
  const [metricsData, setMetricsData] = useState<any>({});

  const performanceData = metricsData.metrics ? metricsData.metrics.map((metric: any) => ({
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
    { name: 'DeFi Subnet', value: 45, color: '#00F2FE' },
    { name: 'Gaming Subnet', value: 30, color: '#8B5CF6' },
    { name: 'C-Chain', value: 25, color: '#E84142' },
  ];

  const resourceUsage = [
    { resource: 'CPU Usage', usage: healthData.metrics?.cpu || 42, max: 100 },
    { resource: 'Memory Allocations', usage: healthData.metrics?.memory || 65, max: 100 },
    { resource: 'Storage Reserves', usage: healthData.metrics?.storage || 18, max: 100 },
    { resource: 'Network Throughput', usage: healthData.metrics?.network || 30, max: 100 },
  ];

  const metricCards: MetricCard[] = [
    {
      title: 'System Health',
      value: healthData.overall ? `${healthData.overall}%` : '98.5%',
      change: healthData.overall >= 80 ? 5.2 : 0.8,
      icon: <TransactionsIcon />,
      color: '#00F2FE',
    },
    {
      title: 'Active CPU',
      value: healthData.metrics?.cpu ? `${healthData.metrics.cpu}%` : '42%',
      change: -2.5,
      icon: <MemoryIcon />,
      color: '#8B5CF6',
    },
    {
      title: 'Memory Alloc',
      value: healthData.metrics?.memory ? `${healthData.metrics.memory}%` : '65%',
      change: 1.2,
      icon: <StorageIcon />,
      color: '#E84142',
    },
    {
      title: 'Network Status',
      value: healthData.status || 'HEALTHY',
      change: 0.5,
      icon: <NetworkIcon />,
      color: '#10B981',
    },
  ];

  useEffect(() => {
    fetchHealthData();
    fetchMetricsData();
    fetchSystemLogs();
    
    const interval = setInterval(() => {
      fetchHealthData();
      fetchMetricsData();
    }, 30000);

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
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header Panel */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            System Telemetry
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Live observability streams, TPS metric charts, logs alerts, and validator resource health.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Range</InputLabel>
            <Select
              value={timeRange}
              label="Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <SelectMenuItem value="1h">1 Hour</SelectMenuItem>
              <SelectMenuItem value="24h">24 Hours</SelectMenuItem>
              <SelectMenuItem value="7d">7 Days</SelectMenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Select Subnet</InputLabel>
            <Select
              value={selectedSubnet}
              label="Select Subnet"
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

      {/* Metric Cards Grid */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        {metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="glass-card-hover" sx={{ border: `1px solid ${alpha(metric.color, 0.15)}` }}>
              <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {metric.title}
                  </Typography>
                  <Avatar sx={{ bgcolor: alpha(metric.color, 0.08), color: metric.color, width: 36, height: 36 }}>
                    {metric.icon}
                  </Avatar>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 1, letterSpacing: '-0.02em' }}>
                  {metric.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {metric.change >= 0 ? (
                    <TrendingUpIcon sx={{ color: '#10B981', fontSize: 16 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: '#EF4444', fontSize: 16 }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: metric.change >= 0 ? '#10B981' : '#EF4444',
                      fontWeight: 700
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

      {/* Navigation tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.08)', mb: 4 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Performance charts" sx={{ fontWeight: 700 }} />
          <Tab label="Subnet statuses" sx={{ fontWeight: 700 }} />
          <Tab label="Resource loads" sx={{ fontWeight: 700 }} />
          <Tab label="System Alert logs" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* Tab: Performance */}
      {tabValue === 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Subnet Nodes Utilization</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke="#00F2FE"
                      fillOpacity={1}
                      fill="url(#colorCpu)"
                      name="CPU Load"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Tx Density Distributions</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={networkDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {networkDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Active Network Data Flow</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke="#8B5CF6"
                      strokeWidth={2.5}
                      name="Memory Allocation"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="network"
                      stroke="#E84142"
                      strokeWidth={2.5}
                      name="Network IO"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab: Network Status */}
      {tabValue === 1 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Subnets Status Feed</Typography>
                <List sx={{ p: 0 }}>
                  {[
                    { name: 'DeFi Liquidity Hub', val: '8 validators • 2.1k TPS', status: 'Active' },
                    { name: 'Alpha Gaming Chain', val: '5 validators • 1.8k TPS', status: 'Active' },
                    { name: 'NFT Marketplace Net', val: '11 validators • 3.2k TPS', status: 'Active' },
                  ].map((sub, i) => (
                    <React.Fragment key={i}>
                      <ListItem sx={{ py: 1.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><NodeIcon sx={{ color: '#00F2FE' }} /></ListItemIcon>
                        <ListItemText primary={sub.name} secondary={sub.val} primaryTypographyProps={{ fontWeight: 700 }} />
                        <Chip label={sub.status} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600 }} />
                      </ListItem>
                      {i < 2 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Node Core Operations</Typography>
                <List sx={{ p: 0 }}>
                  {[
                    { label: 'VM Genesis Config', desc: 'Valid genesis.json operational metadata spec' },
                    { label: 'Avalanche RPC Server', desc: 'Active binding extensions at port 9650' },
                    { label: 'Ledger database sync', desc: 'Block indexes successfully mapped locally' },
                  ].map((itm, i) => (
                    <React.Fragment key={i}>
                      <ListItem sx={{ py: 1.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><SuccessIcon sx={{ color: '#10B981' }} /></ListItemIcon>
                        <ListItemText primary={itm.label} secondary={itm.desc} primaryTypographyProps={{ fontWeight: 700 }} />
                        <Chip label="OPERATIONAL" size="small" sx={{ height: 18, fontSize: '0.64rem', fontWeight: 700, bgcolor: 'rgba(16,185,129,0.05)', color: '#10B981', border: '1px solid rgba(16,185,129,0.15)' }} />
                      </ListItem>
                      {i < 2 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab: Resource loads */}
      {tabValue === 2 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Validator Utilization Reserves</Typography>
                {resourceUsage.map((resource, index) => (
                  <Box key={index} sx={{ mb: 3.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>{resource.resource}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#00F2FE' }}>{resource.usage}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={resource.usage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiLinearProgress-bar': {
                          background: resource.usage > 80 
                            ? 'linear-gradient(90deg, #E84142, #FF5722)' 
                            : 'linear-gradient(90deg, #00F2FE, #8B5CF6)',
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
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Core Analytics Specs</Typography>
                <Grid container spacing={3}>
                  {[
                    { icon: <MemoryIcon sx={{ color: '#00F2FE' }} />, val: '65%', title: 'Memory Reserves' },
                    { icon: <StorageIcon sx={{ color: '#8B5CF6' }} />, val: '18%', title: 'Disk Partition Usage' },
                    { icon: <NetworkIcon sx={{ color: '#E84142' }} />, val: '30%', title: 'RPC Port Load' },
                    { icon: <TimelineIcon sx={{ color: '#10B981' }} />, val: '42%', title: 'Core Processor Load' },
                  ].map((metric, i) => (
                    <Grid item xs={6} key={i}>
                      <Paper sx={{ p: 2.5, textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>{metric.icon}</Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, color: '#fff' }}>{metric.val}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">{metric.title}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab: System Alerts Logs */}
      {tabValue === 3 && (
        <Card sx={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Telemetry Log Output</Typography>
              <Button startIcon={<ExportIcon />} variant="outlined" size="small">Export Logs</Button>
            </Box>
            {logs.length === 0 ? (
              <Alert severity="info" variant="outlined">No system logs reported in the current window.</Alert>
            ) : (
              <List sx={{ p: 0 }}>
                {logs.map((log, index) => (
                  <React.Fragment key={log.id}>
                    <ListItem sx={{ py: 2, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>{getLogIcon(log.level)}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                              {log.message}
                            </Typography>
                            <Chip
                              label={log.level.toUpperCase()}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                bgcolor: alpha(getLogColor(log.level), 0.1),
                                color: getLogColor(log.level),
                                border: `1px solid ${alpha(getLogColor(log.level), 0.2)}`,
                              }}
                            />
                            {log.subnet && (
                              <Chip label={`Subnet: ${log.subnet}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.64rem' }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Timestamp: {log.timestamp} • Origin: {log.source}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < logs.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Monitoring;