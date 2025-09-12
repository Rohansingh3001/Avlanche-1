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
    Chip,
    Avatar,
    Button,
    Divider
} from '@mui/material';
import {
    History as HistoryIcon,
    Rocket as SubnetIcon,
    Security as ContractIcon,
    AccountBalance as AssetIcon,
    TrendingUp as DeploymentIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Schedule as PendingIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const RecentActivityCard = ({ activities = [], onRefresh }) => {
    const getActivityIcon = (type, status) => {
        let IconComponent;
        let color = 'default';

        switch (type) {
            case 'subnet':
                IconComponent = SubnetIcon;
                break;
            case 'contract':
                IconComponent = ContractIcon;
                break;
            case 'asset':
                IconComponent = AssetIcon;
                break;
            case 'deployment':
                IconComponent = DeploymentIcon;
                break;
            default:
                IconComponent = HistoryIcon;
        }

        switch (status) {
            case 'active':
            case 'deployed':
            case 'success':
            case 'completed':
                color = 'success';
                break;
            case 'error':
            case 'failed':
                color = 'error';
                break;
            case 'pending':
            case 'deploying':
            case 'starting':
                color = 'warning';
                break;
            default:
                color = 'default';
        }

        return (
            <Avatar sx={{ bgcolor: `${color}.main`, width: 32, height: 32 }}>
                <IconComponent sx={{ fontSize: 18 }} />
            </Avatar>
        );
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
            case 'deployed':
            case 'success':
            case 'completed':
                return <SuccessIcon sx={{ color: 'success.main', fontSize: 16 }} />;
            case 'error':
            case 'failed':
                return <ErrorIcon sx={{ color: 'error.main', fontSize: 16 }} />;
            case 'pending':
            case 'deploying':
            case 'starting':
                return <PendingIcon sx={{ color: 'warning.main', fontSize: 16 }} />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'deployed':
            case 'success':
            case 'completed':
                return 'success';
            case 'error':
            case 'failed':
                return 'error';
            case 'pending':
            case 'deploying':
            case 'starting':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Unknown time';
        try {
            const date = new Date(timestamp);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            return 'Invalid date';
        }
    };

    if (activities.length === 0) {
        return (
            <Card>
                <CardHeader 
                    title="Recent Activity" 
                    avatar={<HistoryIcon />}
                    action={
                        <Button 
                            size="small" 
                            startIcon={<RefreshIcon />}
                            onClick={onRefresh}
                        >
                            Refresh
                        </Button>
                    }
                />
                <CardContent>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Recent Activity
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Activity will appear here as you work with subnets
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader 
                title="Recent Activity" 
                subheader={`${activities.length} recent item${activities.length !== 1 ? 's' : ''}`}
                avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <HistoryIcon />
                    </Avatar>
                }
                action={
                    <Button 
                        size="small" 
                        startIcon={<RefreshIcon />}
                        onClick={onRefresh}
                    >
                        Refresh
                    </Button>
                }
            />
            <CardContent sx={{ pt: 0 }}>
                <List sx={{ width: '100%' }}>
                    {activities.map((activity, index) => (
                        <React.Fragment key={index}>
                            <ListItem 
                                alignItems="flex-start"
                                sx={{ 
                                    px: 0,
                                    '&:hover': { 
                                        backgroundColor: 'action.hover',
                                        borderRadius: 1
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ mt: 1 }}>
                                    {getActivityIcon(activity.type, activity.status)}
                                </ListItemIcon>
                                
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body1" fontWeight="medium">
                                                {activity.title}
                                            </Typography>
                                            {getStatusIcon(activity.status)}
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {activity.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                <Chip 
                                                    label={activity.status}
                                                    size="small"
                                                    color={getStatusColor(activity.status)}
                                                    variant="outlined"
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTimestamp(activity.timestamp)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            
                            {index < activities.length - 1 && (
                                <Divider variant="inset" component="li" sx={{ ml: 6 }} />
                            )}
                        </React.Fragment>
                    ))}
                </List>
                
                {activities.length > 5 && (
                    <Box sx={{ textAlign: 'center', pt: 2 }}>
                        <Button variant="text" size="small">
                            View All Activity
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentActivityCard;
