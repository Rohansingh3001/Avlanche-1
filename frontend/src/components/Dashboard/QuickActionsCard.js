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

const QuickActionsCard = ({ 
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
            description: 'Launch a new subnet with custom configuration',
            icon: <SubnetIcon />,
            color: 'primary',
            action: onCreateSubnet,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: 'Deploy Contract',
            description: 'Deploy smart contracts to your subnets',
            icon: <ContractIcon />,
            color: 'success',
            action: onDeployContract,
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
        },
        {
            title: 'Manage Assets',
            description: 'Create and manage tokens and NFTs',
            icon: <AssetIcon />,
            color: 'info',
            action: onManageAssets,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: 'View Monitoring',
            description: 'Monitor subnet health and performance',
            icon: <MonitorIcon />,
            color: 'warning',
            action: onViewMonitoring,
            gradient: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)'
        },
        {
            title: 'Settings',
            description: 'Configure application settings',
            icon: <SettingsIcon />,
            color: 'secondary',
            action: onManageSettings,
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        },
        {
            title: 'Developer Tools',
            description: 'Access advanced development tools',
            icon: <ToolsIcon />,
            color: 'error',
            action: onAccessTools,
            gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)'
        }
    ];

    return (
        <Card>
            <CardHeader 
                title="Quick Actions" 
                subheader="Common tasks and shortcuts"
                avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <AddIcon />
                    </Avatar>
                }
            />
            <CardContent sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                    {quickActions.map((action, index) => (
                        <Grid item xs={6} key={index}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    background: action.gradient,
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 6,
                                        '&::before': {
                                            opacity: 1
                                        }
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(255,255,255,0.1)',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease'
                                    }
                                }}
                                onClick={action.action}
                            >
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 1,
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 1
                                            }}
                                        >
                                            {React.cloneElement(action.icon, { sx: { fontSize: 20 } })}
                                        </Box>
                                    </Box>
                                    
                                    <Typography 
                                        variant="subtitle2" 
                                        fontWeight="bold" 
                                        gutterBottom
                                        sx={{ lineHeight: 1.2 }}
                                    >
                                        {action.title}
                                    </Typography>
                                    
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            opacity: 0.9,
                                            fontSize: '0.7rem',
                                            lineHeight: 1.2,
                                            display: 'block'
                                        }}
                                    >
                                        {action.description}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Featured Action */}
                <Box sx={{ mt: 3 }}>
                    <Paper
                        sx={{
                            p: 2,
                            background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
                            color: 'white',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 6
                            }
                        }}
                        onClick={onCreateSubnet}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                            <Avatar 
                                sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.2)', 
                                    mr: 2,
                                    width: 40,
                                    height: 40
                                }}
                            >
                                <SubnetIcon />
                            </Avatar>
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Get Started
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Create your first subnet now
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.3)'
                                }
                            }}
                            fullWidth
                        >
                            Create New Subnet
                        </Button>
                    </Paper>
                </Box>
            </CardContent>
        </Card>
    );
};

export default QuickActionsCard;
