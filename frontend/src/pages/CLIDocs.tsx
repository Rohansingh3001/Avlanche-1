import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  Stack,
  Badge,
  Breadcrumbs,
  Link,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Terminal as TerminalIcon,
  Code as CodeIcon,
  PlayArrow as PlayArrowIcon,
  FileCopy as CopyIcon,
  Book as DocsIcon,
  Lightbulb as TipIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  School as TutorialIcon,
  Build as BuildIcon,
  Cloud as DeployIcon,
  Security as SecurityIcon,
  Settings as ConfigIcon,
  Help as HelpIcon,
  Launch as LaunchIcon,
  GitHub as GitHubIcon,
  Article as ArticleIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNotification } from '../components/NotificationProvider';

interface Command {
  name: string;
  category: string;
  description: string;
  syntax: string;
  examples: string[];
  options: CommandOption[];
  notes?: string;
  warning?: string;
}

interface CommandOption {
  flag: string;
  description: string;
  required?: boolean;
  type: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  steps: TutorialStep[];
}

interface TutorialStep {
  title: string;
  description: string;
  command?: string;
  code?: string;
  expected?: string;
}

const CLIDocs: React.FC = () => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [commands, setCommands] = useState<Command[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    // Mock CLI commands data
    const mockCommands: Command[] = [
      {
        name: 'avalanche subnet create',
        category: 'subnet',
        description: 'Create a new Avalanche subnet',
        syntax: 'avalanche subnet create [subnetName] [flags]',
        examples: [
          'avalanche subnet create mySubnet',
          'avalanche subnet create defiSubnet --vm=evm --chain-id=12345',
          'avalanche subnet create gameSubnet --validators=5 --threshold=3',
        ],
        options: [
          { flag: '--vm', description: 'Virtual machine type (evm, wasm, custom)', required: false, type: 'string' },
          { flag: '--chain-id', description: 'Chain ID for the subnet', required: false, type: 'number' },
          { flag: '--validators', description: 'Number of validators', required: false, type: 'number' },
          { flag: '--threshold', description: 'Signature threshold', required: false, type: 'number' },
        ],
        notes: 'This command creates a new subnet configuration file. You still need to deploy it.',
      },
      {
        name: 'avalanche subnet deploy',
        category: 'subnet',
        description: 'Deploy a subnet to the network',
        syntax: 'avalanche subnet deploy [subnetName] [flags]',
        examples: [
          'avalanche subnet deploy mySubnet --network=fuji',
          'avalanche subnet deploy defiSubnet --network=mainnet --ledger',
        ],
        options: [
          { flag: '--network', description: 'Target network (fuji, mainnet, local)', required: true, type: 'string' },
          { flag: '--ledger', description: 'Use Ledger hardware wallet', required: false, type: 'boolean' },
          { flag: '--key', description: 'Private key file path', required: false, type: 'string' },
        ],
        warning: 'Deploying to mainnet requires real AVAX tokens for fees.',
      },
      {
        name: 'avalanche contract deploy',
        category: 'contract',
        description: 'Deploy a smart contract to a subnet',
        syntax: 'avalanche contract deploy [contractPath] [flags]',
        examples: [
          'avalanche contract deploy ./MyToken.sol --subnet=mySubnet',
          'avalanche contract deploy ./NFT.sol --subnet=gameSubnet --constructor="[\'Token\', \'TKN\']"',
        ],
        options: [
          { flag: '--subnet', description: 'Target subnet name', required: true, type: 'string' },
          { flag: '--constructor', description: 'Constructor arguments as JSON', required: false, type: 'string' },
          { flag: '--verify', description: 'Verify contract on explorer', required: false, type: 'boolean' },
        ],
      },
      {
        name: 'avalanche key create',
        category: 'key',
        description: 'Create a new private key',
        syntax: 'avalanche key create [keyName] [flags]',
        examples: [
          'avalanche key create myKey',
          'avalanche key create validatorKey --file=./keys/',
        ],
        options: [
          { flag: '--file', description: 'Output directory for key file', required: false, type: 'string' },
          { flag: '--force', description: 'Overwrite existing key', required: false, type: 'boolean' },
        ],
        warning: 'Store your private keys securely. Never share them or commit to version control.',
      },
      {
        name: 'avalanche network status',
        category: 'network',
        description: 'Check network status and health',
        syntax: 'avalanche network status [flags]',
        examples: [
          'avalanche network status',
          'avalanche network status --network=fuji',
          'avalanche network status --subnet=mySubnet',
        ],
        options: [
          { flag: '--network', description: 'Network to check (fuji, mainnet, local)', required: false, type: 'string' },
          { flag: '--subnet', description: 'Specific subnet to check', required: false, type: 'string' },
        ],
      },
    ];

    const mockTutorials: Tutorial[] = [
      {
        id: '1',
        title: 'Creating Your First Subnet',
        description: 'Learn how to create and deploy a basic EVM subnet',
        difficulty: 'beginner',
        duration: '15 minutes',
        steps: [
          {
            title: 'Install Avalanche CLI',
            description: 'First, install the Avalanche CLI tool on your system',
            command: 'curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s',
            expected: 'CLI installed successfully',
          },
          {
            title: 'Create Subnet Configuration',
            description: 'Create a new subnet with EVM virtual machine',
            command: 'avalanche subnet create myFirstSubnet --vm=evm',
            expected: 'Subnet configuration created in ~/.avalanche-cli/subnets/',
          },
          {
            title: 'Deploy to Fuji Testnet',
            description: 'Deploy your subnet to the Fuji testnet',
            command: 'avalanche subnet deploy myFirstSubnet --network=fuji',
            expected: 'Subnet deployed with RPC URL and Chain ID',
          },
        ],
      },
      {
        id: '2',
        title: 'Smart Contract Deployment',
        description: 'Deploy and interact with smart contracts on your subnet',
        difficulty: 'intermediate',
        duration: '30 minutes',
        steps: [
          {
            title: 'Write Smart Contract',
            description: 'Create a simple ERC-20 token contract',
            code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "My Token";
    string public symbol = "MTK";
    uint256 public totalSupply = 1000000;
    mapping(address => uint256) public balanceOf;
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
}`,
          },
          {
            title: 'Deploy Contract',
            description: 'Deploy the contract to your subnet',
            command: 'avalanche contract deploy ./MyToken.sol --subnet=myFirstSubnet',
            expected: 'Contract deployed at address 0x...',
          },
        ],
      },
    ];

    setCommands(mockCommands);
    setTutorials(mockTutorials);
  }, []);

  const filteredCommands = commands.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(commands.map(cmd => cmd.category)))];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Command copied to clipboard', 'success');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return theme.palette.success.main;
      case 'intermediate': return theme.palette.warning.main;
      case 'advanced': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          py: 6,
        }}
      >
        <Container maxWidth="xl">
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            <Link
              color="inherit"
              href="/"
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <DocsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              CLI Documentation
            </Typography>
          </Breadcrumbs>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Avalanche CLI
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Complete command-line interface for building, deploying, and managing Avalanche subnets
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              <Chip
                icon={<TerminalIcon />}
                label="50+ Commands"
                variant="outlined"
                color="primary"
                size="medium"
              />
              <Chip
                icon={<TutorialIcon />}
                label="Interactive Tutorials"
                variant="outlined"
                color="secondary"
                size="medium"
              />
              <Chip
                icon={<DocsIcon />}
                label="Complete Examples"
                variant="outlined"
                color="success"
                size="medium"
              />
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            backgroundColor: 'transparent',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            mb: 4
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab 
              label="Command Reference" 
              icon={<TerminalIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Interactive Tutorials" 
              icon={<TutorialIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Quick Start Guide" 
              icon={<PlayArrowIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <>
            {/* Enhanced Search and Filter Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    placeholder="Search commands, descriptions, or examples..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchQuery('')}
                          >
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        },
                        '&.Mui-focused': {
                          backgroundColor: theme.palette.background.paper,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon fontSize="small" color="action" />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {categories.map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          variant={selectedCategory === category ? 'filled' : 'outlined'}
                          onClick={() => setSelectedCategory(category)}
                          size="small"
                          sx={{ 
                            textTransform: 'capitalize',
                            fontWeight: selectedCategory === category ? 600 : 400,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              {searchQuery && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Typography variant="body2" color="text.secondary">
                    Found {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''} 
                    {searchQuery && ` matching "${searchQuery}"`}
                    {selectedCategory !== 'all' && ` in category "${selectedCategory}"`}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Professional Commands List */}
            <Box>
              {filteredCommands.length === 0 ? (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.background.paper, 0.6)} 0%, 
                      ${alpha(theme.palette.background.paper, 0.3)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                  }}
                >
                  <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No commands found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search terms or category filter
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {filteredCommands.map((command, index) => (
                    <Grid item xs={12} key={index}>
                      <Card
                        elevation={0}
                        sx={{
                          background: `linear-gradient(135deg, 
                            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                            ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                          backdropFilter: 'blur(20px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          borderRadius: 3,
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          },
                        }}
                      >
                        <Accordion
                          elevation={0}
                          sx={{
                            backgroundColor: 'transparent',
                            '&:before': { display: 'none' },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                              p: 3,
                              '& .MuiAccordionSummary-content': {
                                alignItems: 'center',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 3,
                                }}
                              >
                                <TerminalIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                              </Box>
                              
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
                                    fontWeight: 600,
                                    color: 'primary.main',
                                    mb: 0.5,
                                    wordBreak: 'break-all',
                                  }}
                                >
                                  {command.name}
                                </Typography>
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                  sx={{ lineHeight: 1.5 }}
                                >
                                  {command.description}
                                </Typography>
                              </Box>

                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={command.category}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    textTransform: 'capitalize',
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    color: 'primary.main',
                                    fontWeight: 500,
                                  }}
                                />
                                {command.warning && (
                                  <Tooltip title="Has important warnings">
                                    <WarningIcon
                                      fontSize="small"
                                      sx={{ color: 'warning.main' }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            </Box>
                          </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* Syntax */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Syntax
                        </Typography>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: alpha(theme.palette.common.black, 0.6),
                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            fontFamily: 'monospace',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: 2,
                          }}
                        >
                          <Typography 
                            component="code" 
                            sx={{ 
                              fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
                              color: theme.palette.primary.light,
                              fontSize: '0.9rem',
                              fontWeight: 500,
                            }}
                          >
                            {command.syntax}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(command.syntax)}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Paper>
                      </Grid>

                      {/* Options */}
                      {command.options.length > 0 && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Options
                          </Typography>
                          <List dense>
                            {command.options.map((option, optIndex) => (
                              <ListItem key={optIndex}>
                                <ListItemIcon>
                                  <CodeIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography component="code" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                        {option.flag}
                                      </Typography>
                                      <Chip label={option.type} size="small" variant="outlined" />
                                      {option.required && (
                                        <Chip label="required" size="small" color="error" />
                                      )}
                                    </Box>
                                  }
                                  secondary={option.description}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      )}

                      {/* Examples */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Examples
                        </Typography>
                        {command.examples.map((example, exIndex) => (
                          <Paper
                            key={exIndex}
                            sx={{
                              p: 2,
                              mb: 1,
                              bgcolor: alpha(theme.palette.common.black, 0.4),
                              border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                              fontFamily: 'monospace',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderRadius: 2,
                            }}
                          >
                            <Typography 
                              component="code" 
                              sx={{ 
                                fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
                                fontSize: '0.85rem',
                                color: theme.palette.text.primary,
                                wordBreak: 'break-all',
                              }}
                            >
                              {example}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(example)}
                            >
                              <CopyIcon />
                            </IconButton>
                          </Paper>
                        ))}
                      </Grid>

                      {/* Notes and Warnings */}
                      {(command.notes || command.warning) && (
                        <Grid item xs={12}>
                          {command.notes && (
                            <Alert severity="info" sx={{ mb: command.warning ? 1 : 0 }}>
                              {command.notes}
                            </Alert>
                          )}
                          {command.warning && (
                            <Alert severity="warning">
                              {command.warning}
                            </Alert>
                          )}
                        </Grid>
                      )}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}

        {/* Interactive Tutorials Tab */}
        {tabValue === 1 && (
          <>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Interactive Tutorials
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Step-by-step guided tutorials to master Avalanche CLI
            </Typography>

            <Grid container spacing={3}>
              {tutorials.map((tutorial) => (
                <Grid item xs={12} lg={6} key={tutorial.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                        ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.15)}`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                            mr: 2,
                          }}
                        >
                          <TutorialIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            {tutorial.title}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip
                              label={tutorial.difficulty}
                              size="small"
                              sx={{
                                bgcolor: alpha(getDifficultyColor(tutorial.difficulty), 0.15),
                                color: getDifficultyColor(tutorial.difficulty),
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem',
                              }}
                            />
                            <Chip
                              icon={<CodeIcon />}
                              label={tutorial.duration}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip
                              label={`${tutorial.steps.length} steps`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          </Stack>
                        </Box>
                      </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {tutorial.description}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Steps ({tutorial.steps.length})
                  </Typography>
                  <List dense>
                    {tutorial.steps.slice(0, 3).map((step, stepIndex) => (
                      <ListItem key={stepIndex}>
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                            }}
                          >
                            {stepIndex + 1}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={step.title}
                          secondary={step.description}
                        />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PlayArrowIcon />}
                        sx={{
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '1rem',
                        }}
                      >
                        Start Tutorial
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Quick Start Guide Tab */}
        {tabValue === 2 && (
          <>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Quick Start Guide
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Get up and running with Avalanche CLI in just a few minutes
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                        ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Installation & Setup
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Install the Avalanche CLI and verify your setup
                    </Typography>

                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">1. Installation</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Install the Avalanche CLI using the official installer:
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: alpha(theme.palette.common.black, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: 2,
                        mb: 2 
                      }}
                    >
                      <Typography 
                        component="code" 
                        sx={{ 
                          fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
                          color: theme.palette.primary.light,
                          fontSize: '0.9rem',
                          wordBreak: 'break-all',
                        }}
                      >
                        curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s
                      </Typography>
                    </Paper>
                    <Typography variant="body2">
                      Verify installation by running: <code>avalanche --version</code>
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">2. Create Your First Subnet</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Create a new EVM subnet with default settings:
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: alpha(theme.palette.common.black, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: 2,
                        mb: 2 
                      }}
                    >
                      <Typography 
                        component="code" 
                        sx={{ 
                          fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
                          color: theme.palette.primary.light,
                          fontSize: '0.9rem',
                        }}
                      >
                        avalanche subnet create mySubnet
                      </Typography>
                    </Paper>
                    <Typography variant="body2">
                      Follow the interactive prompts to configure your subnet.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">3. Deploy to Testnet</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Deploy your subnet to the Fuji testnet:
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: alpha(theme.palette.common.black, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: 2,
                        mb: 2 
                      }}
                    >
                      <Typography 
                        component="code" 
                        sx={{ 
                          fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
                          color: theme.palette.primary.light,
                          fontSize: '0.9rem',
                        }}
                      >
                        avalanche subnet deploy mySubnet --network=fuji
                      </Typography>
                    </Paper>
                    <Alert severity="info">
                      You'll need testnet AVAX tokens to deploy. Get them from the Fuji faucet.
                    </Alert>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                      ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    <LaunchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Helpful Resources
                  </Typography>
                  <List>
                    <ListItem
                      button
                      component="a"
                      href="https://docs.avax.network"
                      target="_blank"
                      sx={{ borderRadius: 2, mb: 1 }}
                    >
                      <ListItemIcon>
                        <DocsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Official Documentation"
                        secondary="Comprehensive guides and API reference"
                      />
                    </ListItem>
                    <ListItem
                      button
                      component="a"
                      href="https://github.com/ava-labs/avalanche-cli"
                      target="_blank"
                      sx={{ borderRadius: 2, mb: 1 }}
                    >
                      <ListItemIcon>
                        <GitHubIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="GitHub Repository"
                        secondary="Source code and issue tracking"
                      />
                    </ListItem>
                    <ListItem button sx={{ borderRadius: 2 }}>
                      <ListItemIcon>
                        <HelpIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Community Support"
                        secondary="Discord and forum discussions"
                      />
                    </ListItem>
                  </List>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                      ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    <ConfigIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Common Operations
                  </Typography>
                  <List dense>
                    {[
                      { icon: BuildIcon, title: 'Create Subnet', desc: 'Set up a new subnet configuration' },
                      { icon: DeployIcon, title: 'Deploy Contract', desc: 'Deploy smart contracts to subnet' },
                      { icon: SecurityIcon, title: 'Manage Keys', desc: 'Create and manage private keys' },
                      { icon: ConfigIcon, title: 'Configure Network', desc: 'Set up network connections' },
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <item.icon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={item.desc}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default CLIDocs;