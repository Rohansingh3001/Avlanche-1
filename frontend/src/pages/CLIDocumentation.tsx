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
    Divider,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tooltip,
    Tab,
    Tabs
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
    Warning as WarningIcon,
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

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`cli-tabpanel-${index}`}
            aria-labelledby={`cli-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const CLIDocumentation: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

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
            elevation={4}
            sx={{
                p: 3,
                mb: 3,
                backgroundColor: '#0a0a0a',
                color: '#ffffff',
                fontFamily: 'Monaco, Consolas, monospace',
                border: '2px solid #333',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    border: '2px solid #00ff88',
                    boxShadow: '0 8px 25px rgba(0, 255, 136, 0.15)',
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{ color: '#888', mb: 1, fontSize: '0.9rem', fontWeight: 500 }}
                    >
                        {description}
                    </Typography>
                    <Box sx={{
                        backgroundColor: '#000000',
                        border: '1px solid #333',
                        borderRadius: 1,
                        p: 2,
                        position: 'relative',
                        '&::before': {
                            content: '"$"',
                            position: 'absolute',
                            left: '8px',
                            top: '8px',
                            color: '#00ff88',
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                        }
                    }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                                color: '#00ff88',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                pl: 3,
                                lineHeight: 1.4,
                                userSelect: 'all'
                            }}
                        >
                            {command}
                        </Typography>
                    </Box>
                </Box>
                <Tooltip title={copiedCommand === id ? "Copied!" : "Copy command"}>
                    <IconButton
                        onClick={() => copyToClipboard(command, id)}
                        sx={{
                            ml: 2,
                            color: copiedCommand === id ? '#4caf50' : '#00ff88',
                            backgroundColor: copiedCommand === id ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                            border: `1px solid ${copiedCommand === id ? '#4caf50' : '#00ff88'}`,
                            '&:hover': {
                                backgroundColor: copiedCommand === id ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0, 255, 136, 0.2)',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {copiedCommand === id ? <CheckIcon /> : <CopyIcon />}
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Terrain /> Avalanche Subnet CLI
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Interactive command-line interface for creating and managing Avalanche subnets
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip icon={<TerminalIcon />} label="Command Line Interface" color="primary" />
                    <Chip icon={<CodeIcon />} label="Node.js" color="secondary" />
                    <Chip icon={<SettingsIcon />} label="Interactive Wizard" color="info" />
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="CLI documentation tabs">
                    <Tab label="Theory & Overview" icon={<InfoIcon />} />
                    <Tab label="Quick Start" icon={<PlayIcon />} />
                    <Tab label="Installation" icon={<DownloadIcon />} />
                    <Tab label="Commands" icon={<TerminalIcon />} />
                    <Tab label="Examples" icon={<CodeIcon />} />
                    <Tab label="Troubleshooting" icon={<HelpIcon />} />
                </Tabs>
            </Box>

            {/* Theory & Overview Tab */}
            <TabPanel value={tabValue} index={0}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School /> Understanding Avalanche Subnets
                </Typography>

                <Alert severity="info" sx={{ mb: 4, p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        What is an Avalanche Subnet?
                    </Typography>
                    <Typography variant="body1">
                        A subnet is a sovereign network that defines its own rules regarding membership, token economics, and execution.
                        Subnets are composed of a dynamic subset of Avalanche validators working together to achieve consensus on the state of one or more blockchains.
                    </Typography>
                </Alert>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <CardHeader
                                avatar={<Construction />}
                                title="How Subnets Work"
                                titleTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                            />
                            <CardContent>
                                <List>
                                    <ListItem>
                                        <ListItemIcon><CheckIcon sx={{ color: 'white' }} /></ListItemIcon>
                                        <ListItemText
                                            primary="Custom Virtual Machines"
                                            secondary="Deploy EVM, SpacesVM, or custom VMs"
                                            primaryTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><CheckIcon sx={{ color: 'white' }} /></ListItemIcon>
                                        <ListItemText
                                            primary="Sovereign Consensus"
                                            secondary="Validators reach agreement on subnet state"
                                            primaryTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><CheckIcon sx={{ color: 'white' }} /></ListItemIcon>
                                        <ListItemText
                                            primary="Custom Rules"
                                            secondary="Define gas fees, block time, and governance"
                                            primaryTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><CheckIcon sx={{ color: 'white' }} /></ListItemIcon>
                                        <ListItemText
                                            primary="Scalable Architecture"
                                            secondary="Each subnet operates independently"
                                            primaryTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                            <CardHeader
                                avatar={<SettingsIcon />}
                                title="CLI Architecture"
                                titleTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                            />
                            <CardContent>
                                <Typography variant="body1" gutterBottom sx={{ color: 'white' }}>
                                    Our CLI provides a user-friendly interface to:
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon><SettingsIcon sx={{ color: 'white' }} /></ListItemIcon>
                                        <ListItemText
                                            primary="Generate Genesis Files"
                                            secondary="Initial blockchain state configuration"
                                            primaryTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><TerminalIcon sx={{ color: 'white' }} /></ListItemIcon>
                                        <ListItemText
                                            primary="Validator Management"
                                            secondary="Configure subnet validators and weights"
                                            primaryTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><CodeIcon sx={{ color: 'white' }} /></ListItemIcon>
                                        <ListItemText
                                            primary="Deployment Scripts"
                                            secondary="Automated subnet deployment process"
                                            primaryTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Sync /> Subnet Creation Workflow
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    1
                                </Box>
                                <Typography variant="h6" gutterBottom>Configuration</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Define subnet parameters: name, VM type, chain ID, and initial settings
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    backgroundColor: 'secondary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    2
                                </Box>
                                <Typography variant="h6" gutterBottom>Genesis Creation</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Generate genesis file with initial accounts, allocations, and network parameters
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    backgroundColor: 'success.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    3
                                </Box>
                                <Typography variant="h6" gutterBottom>Validator Setup</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Configure validators, assign weights, and set up consensus mechanism
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    backgroundColor: 'warning.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    4
                                </Box>
                                <Typography variant="h6" gutterBottom>Deployment</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Deploy subnet to Avalanche network and initialize blockchain
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 4, p: 3, backgroundColor: '#f0f8ff', borderRadius: 2, border: '2px solid #e3f2fd' }}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Architecture /> Technical Architecture
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', backgroundColor: 'primary.main', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Bolt /> CLI → Avalanche Network Flow
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon><CheckIcon sx={{ color: 'white' }} /></ListItemIcon>
                                            <ListItemText
                                                primary="1. CLI generates configuration files"
                                                primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><CheckIcon sx={{ color: 'white' }} /></ListItemIcon>
                                            <ListItemText
                                                primary="2. Creates genesis.json with initial state"
                                                primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><CheckIcon sx={{ color: 'white' }} /></ListItemIcon>
                                            <ListItemText
                                                primary="3. Deploys to Avalanche node via RPC"
                                                primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><CheckIcon sx={{ color: 'white' }} /></ListItemIcon>
                                            <ListItemText
                                                primary="4. Validators start consensus process"
                                                primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', backgroundColor: 'secondary.main', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Construction /> Core Components
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon><SettingsIcon sx={{ color: 'white' }} /></ListItemIcon>
                                            <ListItemText
                                                primary="Config Generator: Creates subnet parameters"
                                                primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><CodeIcon sx={{ color: 'white' }} /></ListItemIcon>
                                            <ListItemText
                                                primary="Genesis Builder: Initial blockchain state"
                                                primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><TerminalIcon sx={{ color: 'white' }} /></ListItemIcon>
                                            <ListItemText
                                                primary="Validator Manager: Consensus setup"
                                                primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><PlayIcon sx={{ color: 'white' }} /></ListItemIcon>
                                            <ListItemText
                                                primary="Deployment Engine: Network integration"
                                                primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Sync /> Data Flow Process:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>User Input</strong> → <strong>CLI Validation</strong> → <strong>Configuration Generation</strong> →
                            <strong>Genesis Creation</strong> → <strong>Avalanche RPC Calls</strong> → <strong>Subnet Deployment</strong> →
                            <strong>Validator Initialization</strong> → <strong>Blockchain Ready</strong>
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GpsFixed /> Use Cases & Benefits
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccountBalance /> DeFi Applications
                                    </Typography>
                                    <Typography variant="body2">
                                        Create high-performance trading environments with custom gas fees,
                                        specialized consensus rules, and optimized throughput for financial applications.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SportsEsports /> Gaming & NFTs
                                    </Typography>
                                    <Typography variant="body2">
                                        Deploy gaming-specific blockchains with fast block times,
                                        low transaction costs, and custom token economics for in-game assets.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Business /> Enterprise Solutions
                                    </Typography>
                                    <Typography variant="body2">
                                        Build private or consortium networks with controlled access,
                                        compliance features, and enterprise-grade security requirements.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </TabPanel>

            {/* Quick Start Tab */}
            <TabPanel value={tabValue} index={1}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body1">
                        The Avalanche Subnet CLI provides an interactive wizard to create and deploy custom subnets with ease.
                    </Typography>
                </Alert>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardHeader
                                avatar={<RocketLaunch />}
                                title="Getting Started"
                                subheader="Run the subnet wizard in 3 simple steps"
                            />
                            <CardContent>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography variant="h6" color="primary">1</Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Install CLI"
                                            secondary="npm install -g avalanche-subnet-cli"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography variant="h6" color="primary">2</Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Run Wizard"
                                            secondary="subnet-wizard"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography variant="h6" color="primary">3</Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Deploy Subnet"
                                            secondary="Follow the interactive prompts"
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardHeader
                                avatar={<AutoAwesome />}
                                title="Features"
                                subheader="What the CLI can do for you"
                            />
                            <CardContent>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                        <ListItemText primary="Interactive subnet creation wizard" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                        <ListItemText primary="Multiple VM types (EVM, SpacesVM)" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                        <ListItemText primary="Genesis configuration generation" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                        <ListItemText primary="Validator management" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                        <ListItemText primary="Automated deployment scripts" />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Installation Tab */}
            <TabPanel value={tabValue} index={2}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Inventory2 /> Installation Guide
                </Typography>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Prerequisites</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1" gutterBottom>
                                Before installing the CLI, ensure you have the following:
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon><CheckIcon /></ListItemIcon>
                                    <ListItemText primary="Node.js 16+ installed" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon /></ListItemIcon>
                                    <ListItemText primary="npm or yarn package manager" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon /></ListItemIcon>
                                    <ListItemText primary="Avalanche node access (local or remote)" />
                                </ListItem>
                            </List>
                        </Box>
                        <CommandBox
                            command="node --version && npm --version"
                            description="Verify Node.js and npm installation"
                            id="check-versions"
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Global Installation</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" gutterBottom>
                            Install the CLI globally to use it from anywhere:
                        </Typography>
                        <CommandBox
                            command="npm install -g avalanche-subnet-cli"
                            description="Install CLI globally via npm"
                            id="global-install"
                        />
                        <CommandBox
                            command="subnet-wizard --version"
                            description="Verify installation"
                            id="verify-install"
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Local Development</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" gutterBottom>
                            For development or local testing:
                        </Typography>
                        <CommandBox
                            command="git clone https://github.com/your-org/avalanche-subnet-cli.git"
                            description="Clone the repository"
                            id="clone-repo"
                        />
                        <CommandBox
                            command="cd avalanche-subnet-cli && npm install"
                            description="Install dependencies"
                            id="install-deps"
                        />
                        <CommandBox
                            command="npm start"
                            description="Run the CLI locally"
                            id="run-local"
                        />
                    </AccordionDetails>
                </Accordion>
            </TabPanel>

            {/* Commands Tab */}
            <TabPanel value={tabValue} index={3}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Bolt /> CLI Command Reference
                </Typography>

                <Alert severity="info" sx={{ mb: 4, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Lightbulb /> Command Quick Reference
                    </Typography>
                    <Typography variant="body1">
                        All commands support <code>--help</code> flag for detailed information.
                        Commands are designed to be intuitive and self-documenting with interactive prompts.
                    </Typography>
                </Alert>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Primary Commands (Most Used)
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <CommandBox
                            command="subnet-wizard"
                            description="Launch the interactive subnet creation wizard - Your main entry point!"
                            id="main-wizard"
                        />
                        <CommandBox
                            command="subnet-wizard create --interactive"
                            description="Create a new subnet with guided prompts and validation"
                            id="create-subnet"
                        />
                        <CommandBox
                            command="subnet-wizard deploy --config my-subnet.json"
                            description="Deploy subnet from pre-configured JSON file"
                            id="deploy-config"
                        />
                        <CommandBox
                            command="subnet-wizard list --detailed"
                            description="List all existing subnets with detailed information"
                            id="list-detailed"
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                            Configuration Management
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <CommandBox
                            command="subnet-wizard config init --name my-subnet"
                            description="Initialize a new configuration file with basic settings"
                            id="config-init"
                        />
                        <CommandBox
                            command="subnet-wizard config validate subnet-config.json"
                            description="Validate configuration file for errors and best practices"
                            id="config-validate"
                        />
                        <CommandBox
                            command="subnet-wizard config template --vm evm --output template.json"
                            description="Generate configuration template for specific VM type"
                            id="config-template"
                        />
                        <CommandBox
                            command="subnet-wizard config edit subnet-config.json"
                            description="Edit configuration file with interactive prompts"
                            id="config-edit"
                        />
                        <CommandBox
                            command="subnet-wizard config export --format yaml"
                            description="Export configuration in different formats (JSON/YAML)"
                            id="config-export"
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            Utility & Management Commands
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <CommandBox
                            command="subnet-wizard --help"
                            description="Show comprehensive help and all available commands"
                            id="help"
                        />
                        <CommandBox
                            command="subnet-wizard --version"
                            description="Display current CLI version and build information"
                            id="version"
                        />
                        <CommandBox
                            command="subnet-wizard list --status"
                            description="List all subnets with their current status and health"
                            id="list-subnets"
                        />
                        <CommandBox
                            command="subnet-wizard status subnet-name"
                            description="Get detailed status information for a specific subnet"
                            id="status-subnet"
                        />
                        <CommandBox
                            command="subnet-wizard logs subnet-name --tail 100"
                            description="View subnet logs for debugging and monitoring"
                            id="logs-subnet"
                        />
                        <CommandBox
                            command="subnet-wizard update"
                            description="Update CLI to the latest version"
                            id="update-cli"
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                            Advanced Operations
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <CommandBox
                            command="subnet-wizard validator add --node-id NodeID-xyz --weight 100"
                            description="Add a new validator to an existing subnet"
                            id="validator-add"
                        />
                        <CommandBox
                            command="subnet-wizard validator remove --node-id NodeID-xyz"
                            description="Remove a validator from subnet (with consensus)"
                            id="validator-remove"
                        />
                        <CommandBox
                            command="subnet-wizard upgrade --vm-version latest subnet-name"
                            description="Upgrade subnet VM to a newer version"
                            id="upgrade-subnet"
                        />
                        <CommandBox
                            command="subnet-wizard backup subnet-name --output backup.tar.gz"
                            description="Create a complete backup of subnet configuration and data"
                            id="backup-subnet"
                        />
                        <CommandBox
                            command="subnet-wizard restore --from backup.tar.gz"
                            description="Restore subnet from backup file"
                            id="restore-subnet"
                        />
                    </AccordionDetails>
                </Accordion>

                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                        <strong>Pro Tip:</strong> Use <code>subnet-wizard [command] --help</code> to get detailed help for any specific command.
                    </Typography>
                </Alert>
            </TabPanel>

            {/* Examples Tab */}
            <TabPanel value={tabValue} index={4}>
                <Typography variant="h5" gutterBottom>Usage Examples</Typography>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Complete Subnet Creation Walkthrough</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Step-by-step subnet creation with expected outputs:
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom color="secondary">Step 1: Start the CLI Wizard</Typography>
                            <CommandBox
                                command="subnet-wizard"
                                description="Launch the interactive subnet creation wizard"
                                id="example-start-wizard"
                            />
                            <Alert severity="success" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    <strong>Expected Output:</strong> Welcome screen with ASCII art and menu options
                                </Typography>
                            </Alert>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom color="secondary">Step 2: Configure Basic Settings</Typography>
                            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
                                <Typography variant="body2" component="pre" sx={{ fontFamily: 'Monaco, Consolas, monospace' }}>
                                    {`? What is your subnet name? my-defi-subnet
? Select VM type: SubnetEVM (Ethereum Compatible)
? Enter Chain ID: 12345
? Enter block gas limit: 8000000
? Enter target block rate (seconds): 2`}
                                </Typography>
                            </Paper>
                            <Alert severity="info" sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    The wizard will guide you through each configuration step with helpful prompts and validation.
                                </Typography>
                            </Alert>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom color="secondary">Step 3: Genesis Configuration</Typography>
                            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
                                <Typography variant="body2" component="pre" sx={{ fontFamily: 'Monaco, Consolas, monospace' }}>
                                    {`? Do you want to pre-fund accounts? Yes
? Enter account address: 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC  
? Enter balance in AVAX: 1000000
? Add another account? No`}
                                </Typography>
                            </Paper>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom color="secondary">Step 4: Validator Setup</Typography>
                            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
                                <Typography variant="body2" component="pre" sx={{ fontFamily: 'Monaco, Consolas, monospace' }}>
                                    {`? Enter validator NodeID: NodeID-BFa1paRxVF3SKGg5zrRHZB8Hp4hsm5kQG
? Enter validator weight: 100
? Add another validator? No`}
                                </Typography>
                            </Paper>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom color="secondary">Step 5: Generation & Deployment</Typography>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Files Generated:</strong>
                                </Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemText primary="genesis.json - Initial blockchain state" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="subnet-config.json - Subnet configuration" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="deploy.sh - Deployment script" />
                                    </ListItem>
                                </List>
                            </Alert>
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Advanced Configuration</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" gutterBottom>
                            Create subnet with custom genesis and validators:
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                1. Generate configuration template:
                            </Typography>
                            <CommandBox
                                command="subnet-wizard config template --vm evm --output my-subnet.json"
                                description="Create configuration template"
                                id="example-template"
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                2. Edit the configuration file:
                            </Typography>
                            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="body2" component="pre" sx={{ fontFamily: 'Monaco, Consolas, monospace' }}>
                                    {`{
  "subnetName": "my-defi-subnet",
  "vmType": "SubnetEVM",
  "chainId": 12345,
  "validators": [
    {
      "nodeId": "NodeID-BFa1paRxVF3SKGg5zrRHZB8Hp4hsm5kQG",
      "weight": 100
    }
  ],
  "genesis": {
    "gasLimit": "0x7A1200",
    "difficulty": "0x0",
    "alloc": {
      "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC": {
        "balance": "0x295BE96E64066972000000"
      }
    }
  }
}`}
                                </Typography>
                            </Paper>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                3. Deploy with configuration:
                            </Typography>
                            <CommandBox
                                command="subnet-wizard deploy --config my-subnet.json"
                                description="Deploy subnet from config file"
                                id="example-deploy"
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">SpacesVM Subnet</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" gutterBottom>
                            Create a key-value store subnet using SpacesVM:
                        </Typography>
                        <CommandBox
                            command="subnet-wizard create --vm spacesvm --name my-storage-subnet"
                            description="Create SpacesVM subnet"
                            id="example-spacesvm"
                        />
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                SpacesVM is ideal for decentralized storage applications and key-value databases.
                            </Typography>
                        </Alert>
                    </AccordionDetails>
                </Accordion>
            </TabPanel>

            {/* Troubleshooting Tab */}
            <TabPanel value={tabValue} index={5}>
                <Typography variant="h5" gutterBottom>Troubleshooting</Typography>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Common Issues</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ mb: 3 }}>
                            <Alert severity="error" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Error: Command not found: subnet-wizard</Typography>
                            </Alert>
                            <Typography variant="body2" gutterBottom>
                                <strong>Solution:</strong> Install the CLI globally or check your PATH variable.
                            </Typography>
                            <CommandBox
                                command="npm install -g avalanche-subnet-cli"
                                description="Reinstall CLI globally"
                                id="fix-command-not-found"
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Error: Node ID validation failed</Typography>
                            </Alert>
                            <Typography variant="body2" gutterBottom>
                                <strong>Solution:</strong> Ensure Node IDs follow the correct format (NodeID-...).
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Example: NodeID-BFa1paRxVF3SKGg5zrRHZB8Hp4hsm5kQG
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Error: Chain ID already exists</Typography>
                            </Alert>
                            <Typography variant="body2" gutterBottom>
                                <strong>Solution:</strong> Choose a unique Chain ID that's not already in use.
                            </Typography>
                            <CommandBox
                                command="subnet-wizard list --show-chain-ids"
                                description="Check existing Chain IDs"
                                id="fix-chain-id"
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Network Issues</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ mb: 3 }}>
                            <Alert severity="error" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Error: Cannot connect to Avalanche node</Typography>
                            </Alert>
                            <Typography variant="body2" gutterBottom>
                                <strong>Solutions:</strong>
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                                    <ListItemText primary="Check if your Avalanche node is running" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                                    <ListItemText primary="Verify the node endpoint URL" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                                    <ListItemText primary="Check firewall and network connectivity" />
                                </ListItem>
                            </List>
                            <CommandBox
                                command={`curl -X POST --data '{"jsonrpc":"2.0","id":1,"method":"info.getNodeID"}' -H 'content-type:application/json;' http://localhost:9650/ext/info`}
                                description="Test node connectivity"
                                id="test-node"
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Debug Mode</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" gutterBottom>
                            Enable verbose logging for detailed error information:
                        </Typography>
                        <CommandBox
                            command="subnet-wizard --debug"
                            description="Run CLI with debug output"
                            id="debug-mode"
                        />
                        <CommandBox
                            command="subnet-wizard --verbose create"
                            description="Verbose subnet creation"
                            id="verbose-create"
                        />
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Debug logs will show API calls, validation steps, and detailed error messages.
                            </Typography>
                        </Alert>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Getting Help</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" gutterBottom>
                            If you're still experiencing issues:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary="Check the GitHub Issues"
                                    secondary="Search for existing solutions or report new bugs"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary="Join the Discord Community"
                                    secondary="Get help from other developers and maintainers"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary="Read the Avalanche Documentation"
                                    secondary="Official documentation for Avalanche subnets"
                                />
                            </ListItem>
                        </List>
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button variant="outlined" startIcon={<CodeIcon />}>
                                GitHub Repository
                            </Button>
                            <Button variant="outlined" startIcon={<HelpIcon />}>
                                Discord Community
                            </Button>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </TabPanel>
        </Container>
    );
};

export default CLIDocumentation;
