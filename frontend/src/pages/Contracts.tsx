import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Code as CodeIcon,
  PlayArrow as DeployIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Description as TemplateIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useNotification } from '../components/NotificationProvider';
import SolidityEditor from '../components/SolidityEditor';
import DeployContractModal from '../components/DeployContractModal';
import ContractInteraction from '../components/ContractInteraction';
import ContractTemplatesModal from '../components/ContractTemplatesModal';
import { ContractTemplate } from '../data/contractTemplates';
import apiService from '../services/api';

interface Contract {
  id: string;
  name: string;
  source_code: string;
  abi?: any[];
  bytecode?: string;
  address?: string;
  subnet_id?: string;
  deployment_tx?: string;
  status: 'uploaded' | 'compiled' | 'deployed' | 'failed';
  created_at: string;
  deployed_at?: string;
  compiler_version?: string;
}

const Contracts: React.FC = () => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuContract, setMenuContract] = useState<Contract | null>(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const result: any = await apiService.getContracts();
      setContracts(result.data || []);
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      showNotification(`Failed to fetch contracts: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) {
      return;
    }

    try {
      await apiService.deleteContract(contractId);
      showNotification('Contract deleted successfully', 'success');
      fetchContracts();
    } catch (error: any) {
      console.error('Error deleting contract:', error);
      showNotification(`Failed to delete contract: ${error.message}`, 'error');
    }
  };

  const handleCreateNew = () => {
    setSelectedContract(null);
    setEditorOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setEditorOpen(true);
    handleCloseMenu();
  };

  const handleDeployContract = (contract: Contract) => {
    setSelectedContract(contract);
    setDeployModalOpen(true);
    handleCloseMenu();
  };

  const handleInteractContract = (contract: Contract) => {
    setSelectedContract(contract);
    setInteractionOpen(true);
    handleCloseMenu();
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, contract: Contract) => {
    setMenuAnchor(event.currentTarget);
    setMenuContract(contract);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuContract(null);
  };

  const handleSelectTemplate = (template: ContractTemplate) => {
    const newContract: Contract = {
      id: '',
      name: template.name,
      source_code: template.code,
      status: 'uploaded',
      created_at: new Date().toISOString(),
    };
    setSelectedContract(newContract);
    setEditorOpen(true);
  };

  const handleContractSaved = () => {
    fetchContracts();
    setEditorOpen(false);
  };

  const handleContractDeployed = () => {
    fetchContracts();
    setDeployModalOpen(false);
  };

  const handleCompileContract = async (contract: Contract) => {
    try {
      setLoading(true);
      
      // Compile the contract
      const compileResult: any = await apiService.compileContract({
        sourceCode: contract.source_code,
        contractName: contract.name,
      });
      
      // Update contract with compilation results
      if (compileResult.data.contracts && Object.keys(compileResult.data.contracts).length > 0) {
        const compiledContract = Object.values(compileResult.data.contracts)[0] as any;
        
        await apiService.updateContract(contract.id, {
          abi: JSON.stringify(compiledContract.abi),
          bytecode: compiledContract.bytecode,
          status: 'compiled',
          compiler_version: compileResult.data.compilerVersion,
        });

        showNotification('Contract compiled successfully', 'success');
        fetchContracts();
      }
    } catch (error: any) {
      console.error('Compilation error:', error);
      showNotification(`Compilation failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderRadius: 2,
          p: 4,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Smart Contracts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Develop, compile, and deploy Solidity smart contracts on Avalanche subnets
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<TemplateIcon />}
              onClick={() => setTemplatesModalOpen(true)}
              size="large"
            >
              Templates
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              size="large"
            >
              New Contract
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : contracts.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <CodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No contracts yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first smart contract or start from a template
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<TemplateIcon />}
                onClick={() => setTemplatesModalOpen(true)}
              >
                Browse Templates
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
              >
                Create Contract
              </Button>
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {contracts.map((contract) => (
              <Grid item xs={12} md={6} lg={4} key={contract.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {contract.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={contract.status.charAt(0).toUpperCase() + contract.status.slice(1)} 
                          color={
                            contract.status === 'deployed' ? 'success' :
                            contract.status === 'compiled' ? 'info' :
                            contract.status === 'failed' ? 'error' : 'default'
                          }
                          size="small" 
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, contract)}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    </Box>                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Status: {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Created: {new Date(contract.created_at).toLocaleDateString()}
                    </Typography>
                    
                    {contract.address && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Address:</strong>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            color: 'primary.main',
                            bgcolor: 'action.hover',
                            p: 1,
                            borderRadius: 1,
                            wordBreak: 'break-all',
                            mb: 1,
                          }}
                        >
                          {contract.address}
                        </Typography>
                        {contract.subnet_id && (
                          <Typography variant="body2" color="text.secondary">
                            Subnet ID: {contract.subnet_id}
                          </Typography>
                        )}
                      </>
                    )}
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditContract(contract)}
                      >
                        Edit
                      </Button>
                      {contract.status === 'compiled' && !contract.address && (
                        <Button
                          size="small"
                          startIcon={<DeployIcon />}
                          color="primary"
                          onClick={() => handleDeployContract(contract)}
                        >
                          Deploy
                        </Button>
                      )}
                      {contract.status === 'uploaded' && (
                        <Button
                          size="small"
                          startIcon={<CodeIcon />}
                          color="secondary"
                          onClick={() => handleCompileContract(contract)}
                        >
                          Compile
                        </Button>
                      )}
                      {contract.address && contract.abi && (
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          color="success"
                          onClick={() => handleInteractContract(contract)}
                        >
                          Interact
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => menuContract && handleEditContract(menuContract)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Code
        </MenuItem>
        {menuContract?.status === 'uploaded' && (
          <MenuItem onClick={() => menuContract && handleCompileContract(menuContract)}>
            <CodeIcon sx={{ mr: 1 }} />
            Compile Contract
          </MenuItem>
        )}
        {menuContract?.status === 'compiled' && !menuContract?.address && (
          <MenuItem onClick={() => menuContract && handleDeployContract(menuContract)}>
            <DeployIcon sx={{ mr: 1 }} />
            Deploy Contract
          </MenuItem>
        )}
        {menuContract?.address && menuContract?.abi && (
          <MenuItem onClick={() => menuContract && handleInteractContract(menuContract)}>
            <ViewIcon sx={{ mr: 1 }} />
            Interact
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => {
            if (menuContract) {
              handleDeleteContract(menuContract.id);
            }
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Solidity Editor Modal */}
      <SolidityEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        contract={selectedContract ? {
          id: selectedContract.id,
          name: selectedContract.name,
          code: selectedContract.source_code,
        } : null}
        onSave={handleContractSaved}
      />

      {/* Deploy Contract Modal */}
      {selectedContract && (
        <DeployContractModal
          open={deployModalOpen}
          onClose={() => setDeployModalOpen(false)}
          contract={{
            id: selectedContract.id,
            name: selectedContract.name,
            code: selectedContract.source_code,
            abi: selectedContract.abi,
            bytecode: selectedContract.bytecode,
          }}
          onDeployed={handleContractDeployed}
        />
      )}

      {/* Contract Interaction Modal */}
      {selectedContract?.address && selectedContract?.abi && (
        <ContractInteraction
          open={interactionOpen}
          onClose={() => setInteractionOpen(false)}
          contract={{
            id: selectedContract.id,
            name: selectedContract.name,
            address: selectedContract.address,
            abi: selectedContract.abi,
            subnetName: selectedContract.subnet_id || 'Unknown',
            chainId: 43114, // Default Avalanche mainnet chain ID
          }}
        />
      )}

      {/* Contract Templates Modal */}
      <ContractTemplatesModal
        open={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </Container>
  );
};

export default Contracts;