import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    Grid,
    Button,
    Avatar,
    Paper
} from '@mui/material';
import {
    Add as AddIcon,
    Rocket as SubnetIcon,
    Security as ContractIcon,
    AccountBalance as AssetIcon,
    Visibility as MonitorIcon,
    Settings as SettingsIcon,
    Build as ToolsIcon
} from '@mui/icons-material';
import { QuickActionsCardProps } from '@/types';

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ 
    onCreateSubnet, 
    onDeployContract, 
    onManageAssets, 
    onViewMonitoring,
    onManageSettings,
    onAccessTools 
}) => {
    const quickActions = [
        {
            title: 'Create Subnet',
            description: 'Launch a new custom subnet',
            icon: <SubnetIcon />,
            color: '#1976d2',
            action: onCreateSubnet,
            disabled: false
        },
        {
            title: 'Deploy Contract',
            description: 'Deploy smart contracts',
            icon: <ContractIcon />,
            color: '#388e3c',
            action: onDeployContract,
            disabled: false
        },
        {
            title: 'Manage Assets',
            description: 'Create and manage tokens',
            icon: <AssetIcon />,
            color: '#f57c00',
            action: onManageAssets,
            disabled: false
        },
        {
            title: 'View Monitoring',
            description: 'Monitor network health',
            icon: <MonitorIcon />,
            color: '#7b1fa2',
            action: onViewMonitoring,
            disabled: false
        },
        {
            title: 'Settings',
            description: 'Configure preferences',
            icon: <SettingsIcon />,
            color: '#616161',
            action: onManageSettings,
            disabled: false
        },
        {
            title: 'Developer Tools',
            description: 'Access development tools',
            icon: <ToolsIcon />,
            color: '#d32f2f',
            action: onAccessTools,
            disabled: false
        }
    ];

    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: '#1976d2' }}>
                        <AddIcon />
                    </Avatar>
                }
                title="Quick Actions"
                subheader="Manage your Avalanche subnets and assets"
            />
            <CardContent>
                <Grid container spacing={2}>
                    {quickActions.map((action, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Paper
                                sx={{
                                    p: 2,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                                    opacity: action.disabled ? 0.6 : 1,
                                    transition: 'all 0.3s ease',
                                    '&:hover': action.disabled ? {} : {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3
                                    }
                                }}
                                onClick={action.disabled ? undefined : action.action}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: action.color,
                                            width: 32,
                                            height: 32,
                                            mr: 1
                                        }}
                                    >
                                        {action.icon}
                                    </Avatar>
                                    <Typography variant="h6" component="div">
                                        {action.title}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ flexGrow: 1 }}
                                >
                                    {action.description}
                                </Typography>
                                <Button
                                    size="small"
                                    sx={{ mt: 1, alignSelf: 'flex-start' }}
                                    disabled={action.disabled}
                                >
                                    Get Started
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default QuickActionsCard;
