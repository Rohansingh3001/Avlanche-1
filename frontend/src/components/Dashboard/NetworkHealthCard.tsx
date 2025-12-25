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
import { Subnet, RealtimeMetrics } from '@/types';

interface HealthMetrics {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
}

interface HealthAlert {
    id: string;
    severity: 'warning' | 'error';
    message: string;
    timestamp: number;
}

interface HealthData {
    overall: number;
    metrics: HealthMetrics;
    alerts: HealthAlert[];
}

interface NetworkHealthCardProps {
    subnets?: Subnet[];
    realtimeMetrics?: RealtimeMetrics;
}

const NetworkHealthCard: React.FC<NetworkHealthCardProps> = ({ 
    subnets = [], 
    realtimeMetrics = {} 
}) => {
    const [expanded, setExpanded] = useState(false);
    const [healthData, setHealthData] = useState<HealthData>({
        overall: 100,
        metrics: {
            cpu: 0,
            memory: 0,
            network: 100,
            storage: 0
        },
        alerts: []
    });

    useEffect(() => {
        // Calculate overall health based on subnets and metrics
        const calculateHealth = (): HealthData => {
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

            // Mock health calculation - replace with real metrics
            const mockMetrics: HealthMetrics = {
                cpu: Math.floor(Math.random() * 30) + 60, // 60-90%
                memory: Math.floor(Math.random() * 40) + 50, // 50-90%
                network: Math.floor(Math.random() * 20) + 80, // 80-100%
                storage: Math.floor(Math.random() * 50) + 40 // 40-90%
            };

            const alerts: HealthAlert[] = [];
            
            // Generate mock alerts based on metrics
            if (mockMetrics.cpu > 85) {
                alerts.push({
                    id: 'cpu-high',
                    severity: 'warning',
                    message: 'High CPU usage detected',
                    timestamp: Date.now()
                });
            }

            if (mockMetrics.memory > 85) {
                alerts.push({
                    id: 'memory-high',
                    severity: 'error',
                    message: 'Memory usage critical',
                    timestamp: Date.now()
                });
            }

            const overall = Math.floor(
                (mockMetrics.cpu + mockMetrics.memory + mockMetrics.network + mockMetrics.storage) / 4
            );

            return {
                overall,
                metrics: mockMetrics,
                alerts
            };
        };

        setHealthData(calculateHealth());
    }, [subnets, realtimeMetrics]);

    const getHealthColor = (value: number): string => {
        if (value >= 80) return '#4caf50';
        if (value >= 60) return '#ff9800';
        return '#f44336';
    };

    const getHealthIcon = (value: number) => {
        if (value >= 80) return <HealthyIcon sx={{ color: '#4caf50' }} />;
        if (value >= 60) return <WarningIcon sx={{ color: '#ff9800' }} />;
        return <ErrorIcon sx={{ color: '#f44336' }} />;
    };

    const formatMetricName = (key: string): string => {
        return key.charAt(0).toUpperCase() + key.slice(1);
    };

    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: getHealthColor(healthData.overall) }}>
                        <NetworkIcon />
                    </Avatar>
                }
                title="Network Health"
                subheader={`Overall Score: ${healthData.overall}%`}
                action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Refresh">
                            <IconButton size="small">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <IconButton
                            onClick={() => setExpanded(!expanded)}
                            size="small"
                        >
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                }
            />
            <CardContent>
                <Box sx={{ mb: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={healthData.overall}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: getHealthColor(healthData.overall),
                                borderRadius: 4
                            }
                        }}
                    />
                </Box>

                {healthData.alerts.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        {healthData.alerts.map((alert) => (
                            <Alert
                                key={alert.id}
                                severity={alert.severity}
                                sx={{ mb: 1 }}
                            >
                                {alert.message}
                            </Alert>
                        ))}
                    </Box>
                )}

                <Collapse in={expanded}>
                    <Typography variant="h6" gutterBottom>
                        System Metrics
                    </Typography>
                    <List dense>
                        {Object.entries(healthData.metrics).map(([key, value]) => {
                            const MetricIcon = {
                                cpu: PerformanceIcon,
                                memory: MemoryIcon,
                                network: NetworkIcon,
                                storage: StorageIcon
                            }[key] || PerformanceIcon;

                            return (
                                <ListItem key={key}>
                                    <ListItemIcon>
                                        <MetricIcon sx={{ color: getHealthColor(value) }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={formatMetricName(key)}
                                        secondary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={value}
                                                    sx={{
                                                        flexGrow: 1,
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: '#e0e0e0',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: getHealthColor(value),
                                                            borderRadius: 3
                                                        }
                                                    }}
                                                />
                                                <Typography variant="caption" sx={{ minWidth: 40 }}>
                                                    {value}%
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            );
                        })}
                    </List>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            size="small"
                            icon={getHealthIcon(healthData.overall)}
                            label={`${subnets.length} Active Subnets`}
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            label="Auto-scaling: ON"
                            color="success"
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            label="Monitoring: Active"
                            color="info"
                            variant="outlined"
                        />
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

export default NetworkHealthCard;
