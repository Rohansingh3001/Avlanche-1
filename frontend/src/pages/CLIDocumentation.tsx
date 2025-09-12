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
    Info as InfoIcon
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
            sx={{ 
                p: 2, 
                mb: 2, 
                backgroundColor: '#1e1e1e', 
                color: '#ffffff',
                fontFamily: 'Monaco, Consolas, monospace'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
                <Tooltip title={copiedCommand === id ? "Copied!" : "Copy command"}>
                    <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(command, id)}
                        sx={{ color: copiedCommand === id ? '#4caf50' : '#ffffff' }}
                    >
                        {copiedCommand === id ? <CheckIcon /> : <CopyIcon />}
                    </IconButton>
                </Tooltip>
            </Box>
            <Typography 
                variant="body1" 
                sx={{ 
                    fontFamily: 'Monaco, Consolas, monospace',
                    backgroundColor: '#000000',
                    p: 1,
                    borderRadius: 1,
                    color: '#00ff00'
                }}
            >
                $ {command}
            </Typography>
        </Paper>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    🏔️ Avalanche Subnet CLI
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
                    <Tab label="Quick Start" icon={<PlayIcon />} />
                    <Tab label="Installation" icon={<DownloadIcon />} />
                    <Tab label="Commands" icon={<TerminalIcon />} />
                    <Tab label="Examples" icon={<CodeIcon />} />
                    <Tab label="Troubleshooting" icon={<HelpIcon />} />
                </Tabs>
            </Box>

            {/* Quick Start Tab */}
            <TabPanel value={tabValue} index={0}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body1">
                        The Avalanche Subnet CLI provides an interactive wizard to create and deploy custom subnets with ease.
                    </Typography>
                </Alert>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardHeader 
                                title="🚀 Getting Started"
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
                                title="✨ Features"
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
            <TabPanel value={tabValue} index={1}>
                <Typography variant="h5" gutterBottom>📦 Installation Guide</Typography>
                
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
            <TabPanel value={tabValue} index={2}>
                <Typography variant="h5" gutterBottom>⚡ Available Commands</Typography>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Primary Commands</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <CommandBox 
                            command="subnet-wizard"
                            description="Start the interactive subnet creation wizard"
                            id="main-wizard"
                        />
                        <CommandBox 
                            command="subnet-wizard create"
                            description="Create a new subnet with prompts"
                            id="create-subnet"
                        />
                        <CommandBox 
                            command="subnet-wizard deploy --config subnet-config.json"
                            description="Deploy subnet from configuration file"
                            id="deploy-config"
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Configuration Commands</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <CommandBox 
                            command="subnet-wizard config init"
                            description="Initialize configuration file"
                            id="config-init"
                        />
                        <CommandBox 
                            command="subnet-wizard config validate"
                            description="Validate configuration file"
                            id="config-validate"
                        />
                        <CommandBox 
                            command="subnet-wizard config template --vm evm"
                            description="Generate configuration template"
                            id="config-template"
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Utility Commands</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <CommandBox 
                            command="subnet-wizard --help"
                            description="Show help and available commands"
                            id="help"
                        />
                        <CommandBox 
                            command="subnet-wizard --version"
                            description="Display CLI version"
                            id="version"
                        />
                        <CommandBox 
                            command="subnet-wizard list"
                            description="List existing subnets"
                            id="list-subnets"
                        />
                    </AccordionDetails>
                </Accordion>

                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                        💡 <strong>Pro Tip:</strong> Use <code>subnet-wizard [command] --help</code> to get detailed help for any specific command.
                    </Typography>
                </Alert>
            </TabPanel>

            {/* Examples Tab */}
            <TabPanel value={tabValue} index={3}>
                <Typography variant="h5" gutterBottom>📝 Usage Examples</Typography>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Basic Subnet Creation</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" gutterBottom>
                            Create a simple EVM-compatible subnet:
                        </Typography>
                        <CommandBox 
                            command="subnet-wizard"
                            description="Start the interactive wizard"
                            id="example-basic"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Follow the prompts to configure:
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    primary="Subnet name: my-defi-subnet"
                                    secondary="Choose a descriptive name"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="VM Type: SubnetEVM"
                                    secondary="Ethereum-compatible virtual machine"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="Chain ID: 12345"
                                    secondary="Unique identifier for your subnet"
                                />
                            </ListItem>
                        </List>
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
            <TabPanel value={tabValue} index={4}>
                <Typography variant="h5" gutterBottom>🔧 Troubleshooting</Typography>

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
