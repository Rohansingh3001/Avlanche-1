import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Button,
    Chip,
    Avatar,
    LinearProgress,
    Alert,
    Fab,
    Tooltip,
    Card,
    CardContent,
    CardActions,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Add as AddIcon,
    Rocket as RocketIcon,
    AccountBalance as NetworkIcon,
    Speed as MetricsIcon,
    Security as SecurityIcon,
    TrendingUp as TrendingUpIcon,
    PlayArrow,
    Stop,
    Settings,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import CreateSubnetModal from '../components/CreateSubnetModal';
import { useNotification } from '../components/NotificationProvider';

// Mock data and types for now
interface MockSubnet {
    id: string;
    name: string;
    status: 'active' | 'stopped' | 'error';
    isHealthy: boolean;
    validators?: any[];
    updated_at: string;
    uptime?: number;
}

interface MockContract {
    id: string;
    name: string;
    status: 'deployed' | 'pending';
    created_at: string;
}

interface MockAsset {
    id: string;
    name: string;
}

interface MockStats {
    uptime?: number;
}

interface DashboardData {
    subnets: MockSubnet[];
    contracts: MockContract[];
    assets: MockAsset[];
    stats: MockStats;
}

// Mock API service
const mockApiService = {
    getSubnets: () => Promise.resolve({ data: [] as MockSubnet[] }),
    getContracts: () => Promise.resolve({ data: [] as MockContract[] }),
    getAssets: () => Promise.resolve({ data: [] as MockAsset[] }),
    getSystemStats: () => Promise.resolve({ data: {} as MockStats })
};

// Mock hooks
const useWallet = () => ({
    isConnected: false,
    account: null as string | null
});

const useWebSocket = () => ({
    isConnected: false,
    lastMessage: null as any
});

const Dashboard: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { isConnected, account } = useWallet();
    const { isConnected: wsConnected, lastMessage } = useWebSocket();
    const [realtimeMetrics, setRealtimeMetrics] = useState<Record<string, any>>({});
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Fetch dashboard data
    const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardData>(
        'dashboardData',
        async () => {
            const [subnets, contracts, assets, systemStats] = await Promise.all([
                mockApiService.getSubnets(),
                mockApiService.getContracts(),
                mockApiService.getAssets(),
                mockApiService.getSystemStats()
            ]);

            return {
                subnets: subnets.data || [],
                contracts: contracts.data || [],
                assets: assets.data || [],
                stats: systemStats.data || {}
            };
        },
        {
            refetchInterval: 30000,
            staleTime: 10000
        }
    );

    // Handle WebSocket updates
    useEffect(() => {
        if (lastMessage) {
            const message = lastMessage as any;
            switch (message.type) {
                case 'subnet_health_update':
                case 'subnet_deployment_completed':
                case 'subnet_deployment_failed':
                    refetch();
                    break;
                case 'metrics_update':
                    setRealtimeMetrics(message.data || {});
                    break;
                default:
                    break;
            }
        }
    }, [lastMessage, refetch]);

    if (isLoading) {
        return (
            <Box sx={{ width: '100%', mt: 4 }}>
                <LinearProgress />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Typography>Loading dashboard...</Typography>
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to load dashboard data: {(error as Error).message}
                </Alert>
                <Button variant="contained" onClick={() => refetch()}>
                    Retry
                </Button>
            </Container>
        );
    }

    const { subnets = [], contracts = [], assets = [], stats = {} } = dashboardData || {};

    // Calculate metrics
    const activeSubnets = subnets.filter((s: MockSubnet) => s.status === 'active').length;
    const deployedContracts = contracts.filter((c: MockContract) => c.status === 'deployed').length;
    const totalAssets = assets.length;
    const healthySubnets = subnets.filter((s: MockSubnet) => s.isHealthy !== false).length;

    // MetricCard component definition
    const MetricCard: React.FC<{
        title: string;
        value: number;
        total?: number;
        icon: React.ReactElement;
        color: string;
        trend: string;
        subtitle: string;
    }> = ({ title, value, total, icon, color, trend, subtitle }) => (
        <Box
            sx={{
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color})`,
                color: 'white',
                height: '100%'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    {icon}
                </Avatar>
                <Typography variant="h6">{title}</Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold">
                {value}
                {total && <Typography component="span" variant="h5"> / {total}</Typography>}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {subtitle} • {trend}
            </Typography>
        </Box>
    );

    const metrics = [
        {
            title: 'Active Subnets',
            value: activeSubnets,
            total: subnets.length,
            icon: <NetworkIcon />,
            color: '#667eea, #764ba2',
            trend: '+12%',
            subtitle: `${subnets.length} total subnets`
        },
        {
            title: 'Deployed Contracts',
            value: deployedContracts,
            total: contracts.length,
            icon: <SecurityIcon />,
            color: '#11998e, #38ef7d',
            trend: '+8%',
            subtitle: `${contracts.length} total contracts`
        },
        {
            title: 'Total Assets',
            value: totalAssets,
            icon: <TrendingUpIcon />,
            color: '#667eea, #764ba2',
            trend: '+15%',
            subtitle: 'Tokens and NFTs'
        },
        {
            title: 'Network Health',
            value: healthySubnets,
            total: subnets.length,
            icon: <MetricsIcon />,
            color: '#fdbb2d, #22c1c3',
            trend: '99.9%',
            subtitle: 'Healthy subnets'
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Welcome to the Avalanche Subnet Tooling Suite
                </Typography>
                
                {/* Connection Status */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip
                        label={isConnected ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Wallet Disconnected'}
                        color={isConnected ? 'success' : 'error'}
                        size="small"
                        avatar={<Avatar sx={{ width: 20, height: 20 }}>{isConnected ? '🟢' : '🔴'}</Avatar>}
                    />
                    <Chip
                        label={wsConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
                        color={wsConnected ? 'success' : 'warning'}
                        size="small"
                        avatar={<Avatar sx={{ width: 20, height: 20 }}>{wsConnected ? '📡' : '📴'}</Avatar>}
                    />
                </Box>
            </Box>

            {/* Metrics Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {metrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <MetricCard {...metric} />
                    </Grid>
                ))}
            </Grid>

            {/* Welcome Message for New Users */}
            {subnets.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <RocketIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Welcome to Avalanche Subnet Tooling!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Create your first subnet to get started with your decentralized network.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateModalOpen(true)}
                            sx={{
                                background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
                                py: 1.5,
                                px: 4
                            }}
                        >
                            Create Your First Subnet
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/faucet')}
                            sx={{
                                py: 1.5,
                                px: 4
                            }}
                        >
                            Get Test Tokens
                        </Button>
                    </Box>
                </Box>
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

            {/* Create Subnet Modal */}
            <CreateSubnetModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    refetch(); // Refresh dashboard data
                    showNotification('Subnet created successfully!', 'success');
                }}
            />
        </Container>
    );
};

export default Dashboard;
