import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    Chip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Avatar,
    LinearProgress
} from '@mui/material';
import {
    Visibility as ViewIcon,
    PlayArrow as StartIcon,
    Stop as StopIcon,
    Settings as SettingsIcon,
    CheckCircle as HealthyIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    NetworkCheck as NetworkIcon
} from '@mui/icons-material';

const SubnetStatusCard = ({ subnets = [], onViewDetails, onStartSubnet, onStopSubnet }) => {
    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'running':
                return <HealthyIcon sx={{ color: 'success.main', fontSize: 16 }} />;
            case 'stopped':
            case 'inactive':
                return <StopIcon sx={{ color: 'text.secondary', fontSize: 16 }} />;
            case 'error':
            case 'failed':
                return <ErrorIcon sx={{ color: 'error.main', fontSize: 16 }} />;
            case 'starting':
            case 'deploying':
                return <LinearProgress sx={{ width: 20, height: 4 }} />;
            default:
                return <WarningIcon sx={{ color: 'warning.main', fontSize: 16 }} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'running':
                return 'success';
            case 'stopped':
            case 'inactive':
                return 'default';
            case 'error':
            case 'failed':
                return 'error';
            case 'starting':
            case 'deploying':
                return 'info';
            default:
                return 'warning';
        }
    };

    const getHealthScore = (subnet) => {
        if (!subnet.validators || subnet.validators.length === 0) return 0;
        const healthyValidators = subnet.validators.filter(v => v.isHealthy).length;
        return Math.round((healthyValidators / subnet.validators.length) * 100);
    };

    const formatUptime = (seconds) => {
        if (!seconds) return 'N/A';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    if (subnets.length === 0) {
        return (
            <Card>
                <CardHeader 
                    title="Subnet Status" 
                    avatar={<NetworkIcon />}
                />
                <CardContent>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Subnets Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Create your first subnet to get started
                        </Typography>
                        <Button variant="contained" color="primary">
                            Create Subnet
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader 
                title="Subnet Status" 
                subheader={`${subnets.length} subnet${subnets.length !== 1 ? 's' : ''} configured`}
                avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <NetworkIcon />
                    </Avatar>
                }
                action={
                    <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<SettingsIcon />}
                    >
                        Manage All
                    </Button>
                }
            />
            <CardContent sx={{ pt: 0 }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Chain ID</TableCell>
                                <TableCell>Validators</TableCell>
                                <TableCell>Health</TableCell>
                                <TableCell>Uptime</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {subnets.map((subnet) => (
                                <TableRow 
                                    key={subnet.id}
                                    sx={{ 
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': { backgroundColor: 'action.hover' }
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {getStatusIcon(subnet.status)}
                                            <Typography variant="body2" fontWeight="medium" sx={{ ml: 1 }}>
                                                {subnet.name || `Subnet ${subnet.id}`}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Chip 
                                            label={subnet.status || 'unknown'}
                                            color={getStatusColor(subnet.status)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {subnet.chainId || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2">
                                            {subnet.validators?.length || 0}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{ width: 40, mr: 1 }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={getHealthScore(subnet)}
                                                    color={getHealthScore(subnet) > 80 ? 'success' : getHealthScore(subnet) > 50 ? 'warning' : 'error'}
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                />
                                            </Box>
                                            <Typography variant="body2" sx={{ minWidth: 35 }}>
                                                {getHealthScore(subnet)}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatUptime(subnet.uptime)}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="View Details">
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => onViewDetails?.(subnet.id)}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            {subnet.status === 'stopped' && (
                                                <Tooltip title="Start Subnet">
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => onStartSubnet?.(subnet.id)}
                                                        color="success"
                                                    >
                                                        <StartIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            
                                            {subnet.status === 'active' && (
                                                <Tooltip title="Stop Subnet">
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => onStopSubnet?.(subnet.id)}
                                                        color="error"
                                                    >
                                                        <StopIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            
                                            <Tooltip title="Settings">
                                                <IconButton size="small">
                                                    <SettingsIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default SubnetStatusCard;
