import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { MetricCardProps } from '../../types';

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    total,
    icon,
    color = 'primary',
    trend,
    percentage,
    subtitle,
    isLoading = false
}) => {
    const getTrendIcon = () => {
        if (!trend) return null;
        const isPositive = trend.startsWith('+');
        return isPositive ? (
            <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
        ) : (
            <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
        );
    };

    const getTrendColor = () => {
        if (!trend) return 'inherit';
        return trend.startsWith('+') ? 'success.main' : 'error.main';
    };

    const getProgressValue = () => {
        if (percentage !== undefined) return percentage;
        if (total && value !== undefined) return (value / total) * 100;
        return 0;
    };

    return (
        <Card 
            sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${getCardGradient(color)})`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    transform: 'translate(30%, -30%)'
                }
            }}
        >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2
                            }}
                        >
                            {React.cloneElement(icon, { sx: { fontSize: 24 } })}
                        </Box>
                        <Typography variant="h6" fontWeight="medium">
                            {title}
                        </Typography>
                    </Box>
                    
                    {subtitle && (
                        <Tooltip title={subtitle}>
                            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                <InfoIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Value */}
                <Box sx={{ mb: 2 }}>
                    {isLoading ? (
                        <CircularProgress size={40} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                            <Typography variant="h3" component="div" fontWeight="bold">
                                {value?.toLocaleString() || '0'}
                            </Typography>
                            {total && (
                                <Typography variant="h5" sx={{ ml: 1, opacity: 0.8 }}>
                                    / {total.toLocaleString()}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Progress Bar */}
                {(total || percentage !== undefined) && !isLoading && (
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <Box
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(255,255,255,0.3)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: '100%',
                                            width: `${Math.min(getProgressValue(), 100)}%`,
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                            borderRadius: 3,
                                            transition: 'width 0.5s ease-in-out'
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ minWidth: 35, fontWeight: 'medium' }}>
                                {Math.round(getProgressValue())}%
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Footer */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {subtitle && (
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {subtitle}
                        </Typography>
                    )}
                    
                    {trend && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getTrendIcon()}
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    ml: 0.5, 
                                    fontWeight: 'medium',
                                    color: getTrendColor()
                                }}
                            >
                                {trend}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

// Helper function to get gradient colors based on color prop
const getCardGradient = (color: string): string => {
    const gradients: Record<string, string> = {
        primary: '#667eea 0%, #764ba2 100%',
        success: '#11998e 0%, #38ef7d 100%',
        error: '#fc466b 0%, #3f5efb 100%',
        warning: '#fdbb2d 0%, #22c1c3 100%',
        info: '#667eea 0%, #764ba2 100%',
        secondary: '#a8edea 0%, #fed6e3 100%'
    };
    return gradients[color] || gradients.primary;
};

export default MetricCard;
