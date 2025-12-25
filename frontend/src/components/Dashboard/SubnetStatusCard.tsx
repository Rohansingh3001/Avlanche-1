import React from 'react';
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
    Avatar,
    Chip,
    IconButton,
    Button,
    Tooltip
} from '@mui/material';
import {
    AccountTree as SubnetIcon,
    PlayArrow as StartIcon,
    Stop as StopIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { SubnetStatusCardProps, Subnet } from '@/types';

const SubnetStatusCard: React.FC<SubnetStatusCardProps> = ({ 
    subnets = [], 
    onViewDetails,
    onStartSubnet,
    onStopSubnet 
}) => {
    // Mock subnets if none provided
    const defaultSubnets: Subnet[] = [
        {
            id: '1',
            name: 'DeFi-Chain',
            chainId: 12345,
            status: 'active',
            vmType: 'evm',
            validators: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            uptime: 99.9,
            isHealthy: true
        },
        {
            id: '2',
            name: 'Gaming-Net',
            chainId: 67890,
            status: 'stopped',
            vmType: 'spacesvm',
            validators: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            uptime: 0,
            isHealthy: false
        }
    ];

    const displaySubnets = subnets.length > 0 ? subnets : defaultSubnets;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#4caf50';
            case 'starting': return '#ff9800';
            case 'stopped': return '#9e9e9e';
            case 'error': return '#f44336';
            case 'deploying': return '#2196f3';
            default: return '#9e9e9e';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: '#4caf50' }}>
                        <SubnetIcon />
                    </Avatar>
                }
                title="Subnet Status"
                subheader={`${displaySubnets.filter(s => s.status === 'active').length} of ${displaySubnets.length} active`}
                action={
                    <Tooltip title="Refresh">
                        <IconButton size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                }
            />
            <CardContent>
                <List dense>
                    {displaySubnets.map((subnet) => (
                        <ListItem
                            key={subnet.id}
                            sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                mb: 1,
                                px: 2
                            }}
                        >
                            <ListItemIcon>
                                <SubnetIcon sx={{ color: getStatusColor(subnet.status) }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle2">
                                            {subnet.name}
                                        </Typography>
                                        <Chip
                                            label={getStatusLabel(subnet.status)}
                                            size="small"
                                            sx={{
                                                backgroundColor: getStatusColor(subnet.status),
                                                color: 'white',
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Chain ID: {subnet.chainId} • VM: {subnet.vmType.toUpperCase()}
                                        </Typography>
                                        {subnet.uptime !== undefined && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                Uptime: {subnet.uptime}%
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="View Details">
                                    <IconButton
                                        size="small"
                                        onClick={() => onViewDetails?.(subnet.id)}
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                </Tooltip>
                                {subnet.status === 'stopped' ? (
                                    <Tooltip title="Start Subnet">
                                        <IconButton
                                            size="small"
                                            onClick={() => onStartSubnet?.(subnet.id)}
                                            sx={{ color: '#4caf50' }}
                                        >
                                            <StartIcon />
                                        </IconButton>
                                    </Tooltip>
                                ) : subnet.status === 'active' ? (
                                    <Tooltip title="Stop Subnet">
                                        <IconButton
                                            size="small"
                                            onClick={() => onStopSubnet?.(subnet.id)}
                                            sx={{ color: '#f44336' }}
                                        >
                                            <StopIcon />
                                        </IconButton>
                                    </Tooltip>
                                ) : null}
                            </Box>
                        </ListItem>
                    ))}
                </List>
                
                {displaySubnets.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            No subnets found
                        </Typography>
                        <Button variant="outlined" size="small">
                            Create Your First Subnet
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default SubnetStatusCard;
