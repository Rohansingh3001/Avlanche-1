import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CardHeader,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Button,
    Alert,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tooltip,
    Avatar,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Terminal as TerminalIcon,
    PlayArrow as PlayIcon,
    Code as CodeIcon,
    Download as DownloadIcon,
    Settings as SettingsIcon,
    Help as HelpIcon,
    ContentCopy as CopyIcon,
    CheckCircle as CheckIcon,
    Info as InfoIcon,
    Terrain,
    School,
    Construction,
    Sync,
    Architecture,
    Bolt,
    GpsFixed,
    AccountBalance,
    SportsEsports,
    Business,
    RocketLaunch,
    AutoAwesome,
    Inventory2,
    Lightbulb,
} from '@mui/icons-material';

interface SidebarItem {
    label: string;
    icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
    { label: 'Theory & Overview', icon: <InfoIcon fontSize="small" /> },
    { label: 'Quick Start', icon: <PlayIcon fontSize="small" /> },
    { label: 'Installation', icon: <DownloadIcon fontSize="small" /> },
    { label: 'CLI Commands', icon: <TerminalIcon fontSize="small" /> },
    { label: 'Examples', icon: <CodeIcon fontSize="small" /> },
    { label: 'Troubleshooting', icon: <HelpIcon fontSize="small" /> },
];

const CLIDocumentation: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

    const copyToClipboard = async (text: string, commandId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCommand(commandId);
            setTimeout(() => setCopiedCommand(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const CommandBox: React.FC<{ command: string; description: string; id: string }> = ({ command, description, id }) => (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                mb: 2.5,
                background: '#040714',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: 'rgba(0, 242, 254, 0.25)',
                    boxShadow: '0 8px 25px rgba(0, 242, 254, 0.1)'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 500 }}
                    >
                        {description}
                    </Typography>
                    <Box sx={{
                        backgroundColor: '#02040a',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: 2,
                        p: 1.5,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'var(--font-mono)',
                                color: '#00F2FE',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                userSelect: 'all',
                                overflowX: 'auto',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '6px' }}>$</span>{command}
                        </Typography>
                    </Box>
                </Box>
                <Tooltip title={copiedCommand === id ? "Copied!" : "Copy Command"}>
                    <IconButton
                        onClick={() => copyToClipboard(command, id)}
                        size="small"
                        sx={{
                            color: copiedCommand === id ? '#10B981' : 'rgba(255,255,255,0.4)',
                            border: '1px solid',
                            borderColor: copiedCommand === id ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
                            borderRadius: 1.5,
                            p: '6px',
                            background: copiedCommand === id ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                            '&:hover': {
                                color: copiedCommand === id ? '#10B981' : '#00F2FE',
                                borderColor: copiedCommand === id ? 'rgba(16,185,129,0.3)' : 'rgba(0,242,254,0.3)',
                                background: 'rgba(0,242,254,0.05)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {copiedCommand === id ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Terrain sx={{ color: '#E84142', fontSize: 36 }} /> CLI Documentation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Guide details and terminal commands for configuring, building, and running custom Avalanche subnets.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
                    <Chip icon={<TerminalIcon sx={{ fontSize: '16px !important' }} />} label="Command Line Interface" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    <Chip icon={<CodeIcon sx={{ fontSize: '16px !important' }} />} label="Node.js 16+" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    <Chip icon={<SettingsIcon sx={{ fontSize: '16px !important' }} />} label="Interactive Wizard" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Left Sidebar Menu */}
                <Grid item xs={12} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 4,
                            background: 'rgba(13, 18, 38, 0.45)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            position: 'sticky',
                            top: 88,
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 700, px: 2, pb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)' }}>
                            Table of Contents
                        </Typography>
                        <List sx={{ p: 0 }}>
                            {sidebarItems.map((item, idx) => {
                                const active = tabValue === idx;
                                return (
                                    <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                                        <ListItemButton
                                            onClick={() => setTabValue(idx)}
                                            sx={{
                                                borderRadius: 2,
                                                px: 2,
                                                py: 1,
                                                background: active ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                                                border: active ? '1px solid rgba(0, 242, 254, 0.15)' : '1px solid transparent',
                                                '&:hover': {
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                },
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 32, color: active ? '#00F2FE' : 'rgba(255,255,255,0.45)' }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: '0.88rem',
                                                    fontWeight: active ? 700 : 500,
                                                    color: active ? '#ffffff' : 'rgba(255,255,255,0.65)',
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                </Grid>

                {/* Right Content Pane */}
                <Grid item xs={12} md={9}>
                    <Card sx={{ p: 4, minHeight: 500 }}>
                        {/* Theory & Overview Tab */}
                        {tabValue === 0 && (
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <School sx={{ color: '#00F2FE' }} /> Understanding Avalanche Subnets
                                </Typography>

                                <Alert severity="info" variant="outlined" sx={{ mb: 4, borderRadius: 3, border: '1px solid rgba(0, 242, 254, 0.25)', background: 'rgba(0, 242, 254, 0.03)', color: 'text.primary' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: '#00F2FE' }}>
                                        What is an Avalanche Subnet?
                                    </Typography>
                                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                        A subnet (subnetwork) is a sovereign network that defines its own rules regarding membership, token economics, and execution.
                                        Subnets are composed of a dynamic subset of Avalanche validators working together to achieve consensus on the state of one or more blockchains.
                                    </Typography>
                                </Alert>

                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,18,38,0.3)', height: '100%' }}>
                                            <CardHeader
                                                avatar={<Construction sx={{ color: '#8B5CF6' }} />}
                                                title="How Subnets Work"
                                                titleTypographyProps={{ fontWeight: 700, fontSize: '1.05rem' }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                <List dense>
                                                    <ListItem sx={{ px: 0 }}>
                                                        <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon sx={{ color: '#10B981', fontSize: 18 }} /></ListItemIcon>
                                                        <ListItemText primary="Custom VMs: EVM, SpacesVM, or custom VM types" primaryTypographyProps={{ fontSize: '0.88rem' }} />
                                                    </ListItem>
                                                    <ListItem sx={{ px: 0 }}>
                                                        <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon sx={{ color: '#10B981', fontSize: 18 }} /></ListItemIcon>
                                                        <ListItemText primary="Sovereign Consensus: Independent validator pools" primaryTypographyProps={{ fontSize: '0.88rem' }} />
                                                    </ListItem>
                                                    <ListItem sx={{ px: 0 }}>
                                                        <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon sx={{ color: '#10B981', fontSize: 18 }} /></ListItemIcon>
                                                        <ListItemText primary="Custom Rules: Customize gas limits and token economics" primaryTypographyProps={{ fontSize: '0.88rem' }} />
                                                    </ListItem>
                                                </List>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,18,38,0.3)', height: '100%' }}>
                                            <CardHeader
                                                avatar={<SettingsIcon sx={{ color: '#E84142' }} />}
                                                title="CLI Architecture"
                                                titleTypographyProps={{ fontWeight: 700, fontSize: '1.05rem' }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                <List dense>
                                                    <ListItem sx={{ px: 0 }}>
                                                        <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon sx={{ color: '#10B981', fontSize: 18 }} /></ListItemIcon>
                                                        <ListItemText primary="Genesis Builder: Initial blockchain allocator specs" primaryTypographyProps={{ fontSize: '0.88rem' }} />
                                                    </ListItem>
                                                    <ListItem sx={{ px: 0 }}>
                                                        <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon sx={{ color: '#10B981', fontSize: 18 }} /></ListItemIcon>
                                                        <ListItemText primary="Validator Manager: Subnet nodes and weights" primaryTypographyProps={{ fontSize: '0.88rem' }} />
                                                    </ListItem>
                                                    <ListItem sx={{ px: 0 }}>
                                                        <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon sx={{ color: '#10B981', fontSize: 18 }} /></ListItemIcon>
                                                        <ListItemText primary="Deployment Engine: Local / Fuji RPC scripts" primaryTypographyProps={{ fontSize: '0.88rem' }} />
                                                    </ListItem>
                                                </List>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>

                                <Box sx={{ p: 3, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, mb: 4 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Sync sx={{ color: '#8B5CF6' }} /> Creation Workflow
                                    </Typography>
                                    <Grid container spacing={3}>
                                        {[
                                            { num: '1', title: 'Config', desc: 'Define names, chain IDs, and base VM settings' },
                                            { num: '2', title: 'Genesis', desc: 'Generate allocations, test account keys, and initial parameters' },
                                            { num: '3', title: 'Validator', desc: 'Assign node weights and configure validation settings' },
                                            { num: '4', title: 'Deploy', desc: 'Compile script artifacts and deploy subnet chains' },
                                        ].map((step) => (
                                            <Grid item xs={12} sm={3} key={step.num}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Avatar sx={{ mx: 'auto', mb: 1, width: 36, height: 36, fontSize: '0.9rem', fontWeight: 800, background: 'linear-gradient(135deg, #00F2FE 0%, #8B5CF6 100%)', color: '#03050C' }}>
                                                        {step.num}
                                                    </Avatar>
                                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>{step.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">{step.desc}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GpsFixed sx={{ color: '#00F2FE' }} /> Benefits & Use Cases
                                </Typography>
                                <Grid container spacing={3}>
                                    {[
                                        { icon: <AccountBalance sx={{ color: '#00F2FE' }} />, title: 'DeFi Applications', desc: 'Create trading environments with customized block finality limits, custom fee dynamics, and validator weight parameters.' },
                                        { icon: <SportsEsports sx={{ color: '#8B5CF6' }} />, title: 'Gaming & NFTs', desc: 'Deploy gaming-specific chains featuring sub-second block validation cycles and direct token economies.' },
                                        { icon: <Business sx={{ color: '#E84142' }} />, title: 'Enterprise Networks', desc: 'Build private console ecosystems with customized identity rules, firewall specifications, and controlled validators.' },
                                    ].map((uc, i) => (
                                        <Grid item xs={12} md={4} key={i}>
                                            <Card sx={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                        {uc.icon}
                                                        <Typography variant="subtitle1" fontWeight={700}>{uc.title}</Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{uc.desc}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Quick Start Tab */}
                        {tabValue === 1 && (
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <RocketLaunch sx={{ color: '#00F2FE' }} /> Getting Started
                                </Typography>
                                <Alert severity="info" variant="outlined" sx={{ mb: 4, borderRadius: 3, border: '1px solid rgba(0,242,254,0.2)', background: 'rgba(0,242,254,0.03)' }}>
                                    The Avalanche Subnet CLI provides an interactive guided terminal interface to generate config archives, genesis lists, and deploy networks.
                                </Alert>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,18,38,0.3)', height: '100%' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <RocketLaunch sx={{ color: '#00F2FE' }} /> Three Simple Steps
                                                </Typography>
                                                <List>
                                                    {[
                                                        { num: '1', title: 'Install CLI tool', desc: 'npm install -g @avalanche/subnet-wizard' },
                                                        { num: '2', title: 'Launch Wizard', desc: 'Run "subnet-wizard" command in target workspace' },
                                                        { num: '3', title: 'Follow Prompts', desc: 'Setup name, genesis keys, and validator NodeIDs' },
                                                    ].map((item) => (
                                                        <ListItem key={item.num} sx={{ px: 0, alignItems: 'flex-start' }}>
                                                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.75rem', mr: 2, background: 'rgba(0, 242, 254, 0.1)', color: '#00F2FE', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                                                                {item.num}
                                                            </Avatar>
                                                            <ListItemText primary={item.title} secondary={item.desc} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} secondaryTypographyProps={{ fontSize: '0.8rem' }} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,18,38,0.3)', height: '100%' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AutoAwesome sx={{ color: '#8B5CF6' }} /> Core Features
                                                </Typography>
                                                <List dense>
                                                    {[
                                                        'Guided step-by-step terminal interfaces',
                                                        'Auto-compilation of Genesis files',
                                                        'Validator management & weight allotments',
                                                        'Local subnet simulation configurations',
                                                        'Fuji testnet automated integrations',
                                                    ].map((feat, i) => (
                                                        <ListItem key={i} sx={{ px: 0 }}>
                                                            <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon sx={{ color: '#10B981', fontSize: 18 }} /></ListItemIcon>
                                                            <ListItemText primary={feat} primaryTypographyProps={{ fontSize: '0.88rem' }} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Installation Tab */}
                        {tabValue === 2 && (
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Inventory2 sx={{ color: '#00F2FE' }} /> Installation Details
                                </Typography>

                                <Accordion defaultExpanded sx={{ mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700}>Dependencies & Requirements</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                            Verify Node.js and NPM package tools are installed locally:
                                        </Typography>
                                        <CommandBox
                                            command="node --version && npm --version"
                                            description="Verify local dev environments"
                                            id="verify-env"
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700}>Global Package Install</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                            Install the CLI executable globally via npm package registries:
                                        </Typography>
                                        <CommandBox
                                            command="npm install -g avalanche-subnet-cli"
                                            description="Global installation command"
                                            id="global-npm-install"
                                        />
                                        <CommandBox
                                            command="subnet-wizard --version"
                                            description="Confirm CLI executable is accessible"
                                            id="verify-wizard"
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700}>Local Repository Setup</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                            For developer contributions or local builds, clone and bootstrap:
                                        </Typography>
                                        <CommandBox
                                            command="git clone https://github.com/Rohansingh3001/Avlanche-1.git"
                                            description="Clone source code"
                                            id="clone-src"
                                        />
                                        <CommandBox
                                            command="cd avalanche-subnet-cli && npm install && npm run build"
                                            description="Install dependencies and compile resources"
                                            id="build-src"
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}

                        {/* CLI Commands Tab */}
                        {tabValue === 3 && (
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <TerminalIcon sx={{ color: '#00F2FE' }} /> Command Reference
                                </Typography>

                                <Alert severity="info" sx={{ mb: 4, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,18,38,0.2)' }}>
                                    All CLI actions support the <code>--help</code> flag to inspect arguments, configurations, and environment options.
                                </Alert>

                                <Accordion defaultExpanded sx={{ mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#00F2FE' }}>Subnet Orchestration</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <CommandBox
                                            command="subnet-wizard"
                                            description="Initiates interactive setup for building genesis file parameters, VM formats, token dynamics, and local nodes configurations."
                                            id="cmd-base"
                                        />
                                        <CommandBox
                                            command="subnet-wizard create"
                                            description="Start creation process with pre-configured templates."
                                            id="cmd-create"
                                        />
                                        <CommandBox
                                            command="subnet-wizard list"
                                            description="Scan subnets directory and list configurations."
                                            id="cmd-list"
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#8B5CF6' }}>Utility & Version Helpers</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <CommandBox
                                            command="subnet-wizard --help"
                                            description="Inspect arguments and command line flags"
                                            id="cmd-help"
                                        />
                                        <CommandBox
                                            command="subnet-wizard --version"
                                            description="Print the installed version of avalanche-subnet-cli"
                                            id="cmd-ver"
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}

                        {/* Examples Tab */}
                        {tabValue === 4 && (
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CodeIcon sx={{ color: '#00F2FE' }} /> Guided Examples
                                </Typography>

                                <Accordion defaultExpanded sx={{ mb: 3 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700}>Complete Setup Walkthrough</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: '#00F2FE' }}>
                                            Step 1: Bootstrap the wizard console
                                        </Typography>
                                        <CommandBox
                                            command="subnet-wizard"
                                            description="Launch guided CLI"
                                            id="ex-start"
                                        />

                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B5CF6', mt: 3, mb: 1 }}>
                                            Step 2: Interactive genesis configuration inputs
                                        </Typography>
                                        <Paper sx={{ p: 2.5, backgroundColor: '#02040a', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 3, borderRadius: 2 }}>
                                            <Typography variant="body2" component="pre" sx={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                                                {`? What is your subnet name? alphaSubnet
? Select VM type: SubnetEVM (Ethereum Compatible)
? Enter Chain ID: 43231
? Enter block gas limit: 8000000
? Enter target block rate (seconds): 2`}
                                            </Typography>
                                        </Paper>

                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10B981', mb: 1 }}>
                                            Step 3: Allocating initial genesis funds
                                        </Typography>
                                        <Paper sx={{ p: 2.5, backgroundColor: '#02040a', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 3, borderRadius: 2 }}>
                                            <Typography variant="body2" component="pre" sx={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                                                {`? Do you want to pre-fund accounts? Yes
? Enter account address: 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
? Enter balance in AVT: 1000000
? Add another account? No`}
                                            </Typography>
                                        </Paper>

                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F59E0B', mb: 1 }}>
                                            Step 4: Register Subnet Validators
                                        </Typography>
                                        <Paper sx={{ p: 2.5, backgroundColor: '#02040a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 2 }}>
                                            <Typography variant="body2" component="pre" sx={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                                                {`? Enter validator NodeID: NodeID-BFa1paRxVF3SKGg5zrRHZB8Hp4hsm5kQG
? Enter validator weight: 100
? Add another validator? No`}
                                            </Typography>
                                        </Paper>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700}>List Command Outputs</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <CommandBox
                                            command="subnet-wizard list"
                                            description="View deployed configurations inside local folders"
                                            id="ex-list-cmd"
                                        />
                                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Expected output payload:</Typography>
                                        <Paper sx={{ p: 2.5, backgroundColor: '#02040a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                            <Typography variant="body2" component="pre" sx={{ fontFamily: 'var(--font-mono)', color: '#00F2FE', fontSize: '0.8rem', lineHeight: 1.5 }}>
                                                {`Found 2 subnets configurations:
  
  1. alpha-defi-hub — Chain ID: 43231 | VM: SubnetEVM
     Created: 7/11/2026, 8:45:12 PM
  2. alpha-gaming-chain — Chain ID: 88888 | VM: SpacesVM
     Created: 7/11/2026, 8:50:30 PM`}
                                            </Typography>
                                        </Paper>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}

                        {/* Troubleshooting Tab */}
                        {tabValue === 5 && (
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <HelpIcon sx={{ color: '#00F2FE' }} /> Troubleshooting
                                </Typography>

                                <Accordion defaultExpanded sx={{ mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#EF4444' }}>Common CLI Errors</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ mb: 3.5 }}>
                                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                                Error: Command not found: subnet-wizard
                                            </Alert>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                <strong>Fix:</strong> Install the NPM package globally and check your environment shell system PATH configs.
                                            </Typography>
                                            <CommandBox
                                                command="npm install -g avalanche-subnet-cli"
                                                description="Install package globally"
                                                id="err-command-fix"
                                            />
                                        </Box>

                                        <Box>
                                            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                                                Error: Chain ID already exists
                                            </Alert>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                <strong>Fix:</strong> Chain IDs must be unique. List configured chains to identify conflict numbers:
                                            </Typography>
                                            <CommandBox
                                                command="subnet-wizard list"
                                                description="Scan active local subnet numbers"
                                                id="err-chain-fix"
                                            />
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#F59E0B' }}>RPC Connectivity Errors</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                            Error: Cannot connect to Avalanche node RPC (ext/info)
                                        </Alert>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            Verify your local node is running on default port <code>9650</code>. Run the diagnostics request check:
                                        </Typography>
                                        <CommandBox
                                            command={`curl -X POST --data '{"jsonrpc":"2.0","id":1,"method":"info.getNodeID"}' -H 'content-type:application/json;' http://localhost:9650/ext/info`}
                                            description="Test local node port links"
                                            id="err-port-fix"
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1" fontWeight={700}>Further Help & Issues</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                            For assistance, check online resources or open tracking items:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CodeIcon />}
                                                href="https://github.com/Rohansingh3001/Avlanche-1"
                                                target="_blank"
                                            >
                                                Source Code
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<HelpIcon />}
                                                href="https://github.com/Rohansingh3001/Avlanche-1/issues"
                                                target="_blank"
                                            >
                                                Submit Issue
                                            </Button>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CLIDocumentation;
