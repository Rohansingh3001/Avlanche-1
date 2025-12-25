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
    Tooltip
} from '@mui/material';
import {
    History as ActivityIcon,
    Refresh as RefreshIcon,
    FiberManualRecord as DotIcon
} from '@mui/icons-material';
import { RecentActivityCardProps, Activity } from '@/types';

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ 
    activities = [], 
    onRefresh 
}) => {
    // Mock activities if none provided
    const defaultActivities: Activity[] = [
        {
            type: 'subnet',
            title: 'Subnet Created',
            description: 'New subnet "DeFi-Chain" successfully deployed',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            status: 'success'
        },
        {
            type: 'contract',
            title: 'Contract Deployed',
            description: 'TokenContract.sol deployed to subnet',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            status: 'success'
        },
        {
            type: 'asset',
            title: 'Asset Minted',
            description: '1000 AVAX tokens minted successfully',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'success'
        }
    ];

    const displayActivities = activities.length > 0 ? activities : defaultActivities;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return '#4caf50';
            case 'warning': return '#ff9800';
            case 'error': return '#f44336';
            default: return '#2196f3';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffMins < 1440) {
            return `${Math.floor(diffMins / 60)}h ago`;
        } else {
            return `${Math.floor(diffMins / 1440)}d ago`;
        }
    };

    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: '#2196f3' }}>
                        <ActivityIcon />
                    </Avatar>
                }
                title="Recent Activity"
                subheader="Latest subnet and contract operations"
                action={
                    <Tooltip title="Refresh">
                        <IconButton size="small" onClick={onRefresh}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                }
            />
            <CardContent>
                <List dense>
                    {displayActivities.slice(0, 5).map((activity, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon>
                                <DotIcon 
                                    sx={{ 
                                        color: getStatusColor(activity.status),
                                        fontSize: 16 
                                    }} 
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">
                                            {activity.title}
                                        </Typography>
                                        <Chip
                                            label={activity.type}
                                            size="small"
                                            variant="outlined"
                                            sx={{ 
                                                fontSize: '0.6rem',
                                                height: 20,
                                                textTransform: 'uppercase'
                                            }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {activity.description}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTimestamp(activity.timestamp)}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
                
                {displayActivities.length === 0 && (
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ textAlign: 'center', py: 2 }}
                    >
                        No recent activity
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentActivityCard;
