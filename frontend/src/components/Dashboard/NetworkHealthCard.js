import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    Chip,
    Avatar,
    IconButton,
    Collapse,
    Alert,
    Tooltip
} from '@mui/material';
import {
    NetworkCheck as NetworkIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CheckCircle as HealthyIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Speed as PerformanceIcon,
    Memory as MemoryIcon,
    Storage as StorageIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

const NetworkHealthCard = ({ subnets = [], realtimeMetrics = {} }) => {
    const [expanded, setExpanded] = useState(false);
    const [healthData, setHealthData] = useState({
        overall: 100,
        metrics: {},
        alerts: []
    });

    useEffect(() => {
        // Calculate overall health based on subnets and metrics
        const calculateHealth = () => {
            if (subnets.length === 0) {
                return {
                    overall: 100,
                    metrics: {
                        cpu: 0,
                        memory: 0,
                        network: 100,
                        storage: 0
                    },
                    alerts: []
                };
            }

            const healthySubnets = subnets.filter(s => s.isHealthy !== false).length;
            const overallHealth = Math.round((healthySubnets / subnets.length) * 100);

            const metrics = {
                cpu: realtimeMetrics.cpu || Math.random() * 30 + 20, // Mock data
                memory: realtimeMetrics.memory || Math.random() * 40 + 30,
                network: realtimeMetrics.network || Math.random() * 20 + 80,
                storage: realtimeMetrics.storage || Math.random() * 25 + 15
            };

            const alerts = [];
            if (metrics.cpu > 80) alerts.push({ type: 'warning', message: 'High CPU usage detected' });
            if (metrics.memory > 85) alerts.push({ type: 'error', message: 'Memory usage critical' });
            if (metrics.network < 70) alerts.push({ type: 'warning', message: 'Network performance degraded' });
            if (overallHealth < 80) alerts.push({ type: 'error', message: 'Some subnets are unhealthy' });

            return { overall: overallHealth, metrics, alerts };
        };

        setHealthData(calculateHealth());
    }, [subnets, realtimeMetrics]);

    const getHealthColor = (value) => {
        if (value >= 90) return 'success';
        if (value >= 70) return 'warning';
        return 'error';
    };

    const getHealthIcon = (value) => {
        if (value >= 90) return <HealthyIcon sx={{ color: 'success.main' }} />;
        if (value >= 70) return <WarningIcon sx={{ color: 'warning.main' }} />;
        return <ErrorIcon sx={{ color: 'error.main' }} />;
    };

    const MetricItem = ({ icon, label, value, unit = '%', color }) => (
        <ListItem sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
                {React.cloneElement(icon, { 
                    sx: { fontSize: 20, color: `${color}.main` } 
                })}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                            {label}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                            {Math.round(value)}{unit}
                        </Typography>
                    </Box>
                }
                secondary={
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(value, 100)}
                        color={getHealthColor(value)}
                        sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                    />
                }
            />
        </ListItem>
    );

    return (
        <Card>
            <CardHeader
                title="Network Health"
                subheader={`${subnets.length} subnet${subnets.length !== 1 ? 's' : ''} monitored`}
                avatar={
                    <Avatar sx={{ bgcolor: getHealthColor(healthData.overall) + '.main' }}>
                        <NetworkIcon />
                    </Avatar>
                }
                action={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Refresh">
                            <IconButton size="small">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <IconButton
                            size="small"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                }
            />
            <CardContent sx={{ pt: 0 }}>
                {/* Overall Health */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                            Overall Health
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getHealthIcon(healthData.overall)}
                            <Typography variant="h6" fontWeight="bold">
                                {healthData.overall}%
                            </Typography>
                        </Box>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={healthData.overall}
                        color={getHealthColor(healthData.overall)}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>

                {/* Alerts */}
                {healthData.alerts.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        {healthData.alerts.map((alert, index) => (
                            <Alert 
                                key={index}
                                severity={alert.type}
                                size="small"
                                sx={{ mb: 1 }}
                            >
                                {alert.message}
                            </Alert>
                        ))}
                    </Box>
                )}

                {/* Quick Status */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        label={`${subnets.filter(s => s.status === 'active').length} Active`}
                        color="success"
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        label={`${subnets.filter(s => s.status === 'stopped').length} Stopped`}
                        color="default"
                        size="small"
                        variant="outlined"
                    />
                    {subnets.filter(s => s.status === 'error').length > 0 && (
                        <Chip
                            label={`${subnets.filter(s => s.status === 'error').length} Error`}
                            color="error"
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Box>

                {/* Detailed Metrics */}
                <Collapse in={expanded}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                        System Metrics
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                        <MetricItem
                            icon={<PerformanceIcon />}
                            label="CPU Usage"
                            value={healthData.metrics.cpu}
                            color={getHealthColor(100 - healthData.metrics.cpu)}
                        />
                        <MetricItem
                            icon={<MemoryIcon />}
                            label="Memory Usage"
                            value={healthData.metrics.memory}
                            color={getHealthColor(100 - healthData.metrics.memory)}
                        />
                        <MetricItem
                            icon={<NetworkIcon />}
                            label="Network Performance"
                            value={healthData.metrics.network}
                            color={getHealthColor(healthData.metrics.network)}
                        />
                        <MetricItem
                            icon={<StorageIcon />}
                            label="Storage Usage"
                            value={healthData.metrics.storage}
                            color={getHealthColor(100 - healthData.metrics.storage)}
                        />
                    </List>

                    {/* Subnet Details */}
                    {subnets.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                                Subnet Status
                            </Typography>
                            <List dense sx={{ py: 0 }}>
                                {subnets.slice(0, 3).map((subnet) => (
                                    <ListItem key={subnet.id} sx={{ py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            {subnet.status === 'active' ? (
                                                <HealthyIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                            ) : subnet.status === 'error' ? (
                                                <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                            ) : (
                                                <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2">
                                                    {subnet.name || `Subnet ${subnet.id}`}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    {subnet.status}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                                {subnets.length > 3 && (
                                    <ListItem sx={{ py: 0.5 }}>
                                        <ListItemText>
                                            <Typography variant="caption" color="text.secondary">
                                                +{subnets.length - 3} more subnets
                                            </Typography>
                                        </ListItemText>
                                    </ListItem>
                                )}
                            </List>
                        </Box>
                    )}
                </Collapse>
            </CardContent>
        </Card>
    );
};

export default NetworkHealthCard;
