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
    Paper,
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
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import CreateSubnetModal from '../components/CreateSubnetModal';
import { useNotification } from '../components/NotificationProvider';

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

const mockSubnets: MockSubnet[] = [
    {
        id: 'subnet-alpha-001',
        name: 'Alpha Gaming Chain',
        status: 'active',
        isHealthy: true,
        validators: [{ id: 'v1' }, { id: 'v2' }, { id: 'v3' }],
        updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
        uptime: 99.97,
    },
    {
        id: 'subnet-defi-002',
        name: 'DeFi Liquidity Hub',
        status: 'active',
        isHealthy: true,
        validators: [{ id: 'v1' }, { id: 'v2' }, { id: 'v3' }, { id: 'v4' }, { id: 'v5' }],
        updated_at: new Date(Date.now() - 12 * 60000).toISOString(),
        uptime: 99.99,
    },
    {
        id: 'subnet-nft-003',
        name: 'NFT Marketplace Net',
        status: 'active',
        isHealthy: true,
        validators: [{ id: 'v1' }, { id: 'v2' }],
        updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
        uptime: 98.5,
    },
    {
        id: 'subnet-dev-004',
        name: 'Dev Testnet',
        status: 'stopped',
        isHealthy: false,
        validators: [],
        updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
        uptime: 0,
    },
];

const mockContracts: MockContract[] = [
    { id: 'c-001', name: 'AvalancheToken (AVT)', status: 'deployed', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'c-002', name: 'LiquidityPool V2', status: 'deployed', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'c-003', name: 'NFT Collection: ApeAvalanche', status: 'deployed', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'c-004', name: 'Governance DAO', status: 'pending', created_at: new Date().toISOString() },
];

const mockAssets: MockAsset[] = [
    { id: 'a-001', name: 'AVAX' },
    { id: 'a-002', name: 'AVT (Custom Token)' },
    { id: 'a-003', name: 'LPT (LP Token)' },
    { id: 'a-004', name: 'APE NFT Collection' },
    { id: 'a-005', name: 'GOV Token' },
];

const mockStats: MockStats = { uptime: 99.8 };

const mockApiService = {
    getSubnets: () => Promise.resolve({ data: mockSubnets }),
    getContracts: () => Promise.resolve({ data: mockContracts }),
    getAssets: () => Promise.resolve({ data: mockAssets }),
    getSystemStats: () => Promise.resolve({ data: mockStats }),
};

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
            <Container maxWidth="xl" sx={{ mt: 4 }}>
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

    const activeSubnets = subnets.filter((s: MockSubnet) => s.status === 'active').length;
    const deployedContracts = contracts.filter((c: MockContract) => c.status === 'deployed').length;
    const totalAssets = assets.length;
    const healthySubnets = subnets.filter((s: MockSubnet) => s.isHealthy !== false).length;

    const MetricCard: React.FC<{
        title: string;
        value: number;
        total?: number;
        icon: React.ReactElement;
        colorGradient: string;
        trend: string;
        subtitle: string;
    }> = ({ title, value, total, icon, colorGradient, trend, subtitle }) => (
        <Paper
            elevation={4}
            sx={{
                p: 3.5,
                borderRadius: 4,
                background: colorGradient,
                color: 'white',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4)',
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85 }}>
                    {title}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: 'white', width: 42, height: 42 }}>
                    {icon}
                </Avatar>
            </Box>
            <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                {value}
                {total !== undefined && <span style={{ fontSize: '1.5rem', opacity: 0.6 }}> / {total}</span>}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                    label={trend}
                    size="small"
                    sx={{
                        height: 18,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                    }}
                />
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.78rem' }}>
                    {subtitle}
                </Typography>
            </Box>
        </Paper>
    );

    const metrics = [
        {
            title: 'Active Subnets',
            value: activeSubnets,
            total: subnets.length,
            icon: <NetworkIcon />,
            colorGradient: 'linear-gradient(135deg, #00F2FE 0%, #8B5CF6 100%)',
            trend: '+12%',
            subtitle: `${subnets.length} total subnets`
        },
        {
            title: 'Deployed Contracts',
            value: deployedContracts,
            total: contracts.length,
            icon: <SecurityIcon />,
            colorGradient: 'linear-gradient(135deg, #E84142 0%, #FF5722 100%)',
            trend: '+8%',
            subtitle: `${contracts.length} total contracts`
        },
        {
            title: 'Total Assets',
            value: totalAssets,
            icon: <TrendingUpIcon />,
            colorGradient: 'linear-gradient(135deg, #7B2CBF 0%, #00F2FE 100%)',
            trend: '+15%',
            subtitle: 'Tokens and NFTs'
        },
        {
            title: 'Network Health',
            value: healthySubnets,
            total: subnets.length,
            icon: <MetricsIcon />,
            colorGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            trend: '99.9%',
            subtitle: 'Healthy nodes'
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
                <Box>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                        Workspace Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Welcome to the Avalanche Subnet Tooling Suite. Monitor node deployment configurations and network analytics.
                    </Typography>
                    
                    {/* Connection Status */}
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
                        <Chip
                            label={isConnected ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Wallet Disconnected'}
                            variant="outlined"
                            size="small"
                            sx={{
                                borderColor: isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)',
                                color: isConnected ? '#10B981' : '#EF4444',
                                background: isConnected ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.03)',
                                fontWeight: 600,
                            }}
                        />
                        <Chip
                            label={wsConnected ? 'Real-time Linked' : 'Real-time Idle'}
                            variant="outlined"
                            size="small"
                            sx={{
                                borderColor: wsConnected ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.25)',
                                color: wsConnected ? '#10B981' : '#F59E0B',
                                background: wsConnected ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.03)',
                                fontWeight: 600,
                            }}
                        />
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModalOpen(true)}
                    sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                >
                    Deploy Subnet
                </Button>
            </Box>

            {/* Metrics Grid */}
            <Grid container spacing={4} sx={{ mb: 5 }}>
                {metrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <MetricCard {...metric} />
                    </Grid>
                ))}
            </Grid>

            {/* Subnets Panel */}
            {subnets.length > 0 ? (
                <Grid container spacing={4}>
                    {/* Active Subnets List */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>Your Active Networks</Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => setCreateModalOpen(true)}
                                    >
                                        Create New
                                    </Button>
                                </Box>
                                {subnets.map((subnet: MockSubnet) => (
                                    <Box
                                        key={subnet.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            mb: 2,
                                            borderRadius: 3,
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'rgba(255,255,255,0.04)',
                                                borderColor: 'rgba(0, 242, 254, 0.2)',
                                                transform: 'translateX(2px)',
                                            },
                                            '&:last-child': { mb: 0 }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ flexShrink: 0 }}>
                                                <span className={`status-dot-pulse ${subnet.status}`} />
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'text.primary' }}>
                                                    {subnet.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {subnet.validators?.length ?? 0} validators • Uptime {subnet.uptime}%
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip
                                                label={subnet.status}
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    background: subnet.status === 'active'
                                                        ? 'rgba(16,185,129,0.1)'
                                                        : 'rgba(107,114,128,0.1)',
                                                    color: subnet.status === 'active' ? '#10B981' : '#9CA3AF',
                                                    border: `1px solid ${subnet.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(107,114,128,0.15)'}`,
                                                    textTransform: 'uppercase',
                                                }}
                                            />
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => navigate('/subnets')}
                                                sx={{ color: 'primary.main', fontSize: '0.8rem', minWidth: 'unset', fontWeight: 600 }}
                                            >
                                                Details
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Contracts Panel */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, letterSpacing: '-0.01em' }}>Recent Contracts</Typography>
                                {contracts.map((contract: MockContract) => (
                                    <Box
                                        key={contract.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            mb: 2,
                                            pb: 2,
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' },
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 180, display: 'block', color: 'text.primary' }}>
                                                {contract.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                                                {new Date(contract.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={contract.status}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.68rem',
                                                fontWeight: 600,
                                                background: contract.status === 'deployed'
                                                    ? 'rgba(12, 139, 123, 0.1)'
                                                    : 'rgba(245,158,11,0.1)',
                                                color: contract.status === 'deployed' ? '#0C8B7B' : '#F59E0B',
                                                border: `1px solid ${contract.status === 'deployed' ? 'rgba(12, 139, 123, 0.2)' : 'rgba(245,158,11,0.2)'}`,
                                                textTransform: 'uppercase',
                                            }}
                                        />
                                    </Box>
                                ))}
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    onClick={() => navigate('/contracts')}
                                    sx={{ mt: 3 }}
                                >
                                    Open Solidity Editor
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            ) : (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <RocketIcon sx={{ fontSize: 90, color: 'primary.main', mb: 3, opacity: 0.8 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>Launch your first subnet</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
                        Bootstrap validator systems and EVM configurations to initialize a local or Fuji network.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Bootstrap Subnet
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/faucet')}
                        >
                            Get Test Assets
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Create Subnet Modal */}
            <CreateSubnetModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    refetch();
                    showNotification('Subnet created successfully!', 'success');
                }}
            />
        </Container>
    );
};

export default Dashboard;
