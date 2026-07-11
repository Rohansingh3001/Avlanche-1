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
      
      const compileResult: any = await apiService.compileContract({
        sourceCode: contract.source_code,
        contractName: contract.name,
      });
      
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
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header Panel */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Smart Contracts Hub
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Draft, compile, deploy and test Solidity smart contracts on active EVM subnetworks.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={() => setTemplatesModalOpen(true)}
          >
            Templates
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create New
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : contracts.length === 0 ? (
        <Card sx={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(13,18,38,0.2)' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CodeIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              No Smart Contracts Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: '400px', mx: 'auto' }}>
              Create a blank smart contract editor canvas or load one of our predefined Solidity templates.
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
                Compile Blank Contract
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={4}>
          {contracts.map((contract) => (
            <Grid item xs={12} md={6} lg={4} key={contract.id}>
              <Card className="glass-card-hover" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent sx={{ p: 4, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                      {contract.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={contract.status} 
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: contract.status === 'deployed' 
                            ? 'rgba(16,185,129,0.1)' 
                            : contract.status === 'compiled'
                            ? 'rgba(0,242,254,0.1)'
                            : contract.status === 'failed'
                            ? 'rgba(239,68,68,0.1)'
                            : 'rgba(255,255,255,0.06)',
                          color: contract.status === 'deployed' 
                            ? '#10B981' 
                            : contract.status === 'compiled'
                            ? '#00F2FE'
                            : contract.status === 'failed'
                            ? '#EF4444'
                            : 'text.secondary',
                          border: `1px solid ${
                            contract.status === 'deployed' 
                            ? 'rgba(16,185,129,0.2)' 
                            : contract.status === 'compiled'
                            ? 'rgba(0,242,254,0.2)'
                            : contract.status === 'failed'
                            ? 'rgba(239,68,68,0.2)'
                            : 'rgba(255,255,255,0.1)'
                          }`,
                          textTransform: 'uppercase'
                        }}
                      />
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, contract)}>
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Created: {new Date(contract.created_at).toLocaleDateString()}
                  </Typography>
                  
                  {contract.address && (
                    <Box sx={{ mt: 3, p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 3 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                        Contract RPC Address
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          color: '#00F2FE',
                          wordBreak: 'break-all',
                        }}
                      >
                        {contract.address}
                      </Typography>
                      {contract.subnet_id && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                          Deploy Target: {contract.subnet_id}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
                
                <Box sx={{ p: 4, pt: 0 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditContract(contract)}
                      sx={{ flex: 1 }}
                    >
                      Code Edit
                    </Button>
                    {contract.status === 'compiled' && !contract.address && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DeployIcon />}
                        onClick={() => handleDeployContract(contract)}
                        sx={{ flex: 1 }}
                      >
                        Deploy
                      </Button>
                    )}
                    {contract.status === 'uploaded' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CodeIcon />}
                        onClick={() => handleCompileContract(contract)}
                        sx={{ flex: 1 }}
                      >
                        Compile
                      </Button>
                    )}
                    {contract.address && contract.abi && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<ViewIcon />}
                        onClick={() => handleInteractContract(contract)}
                        sx={{ flex: 1 }}
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

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            background: '#0a0e1a',
            border: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        <MenuItem onClick={() => menuContract && handleEditContract(menuContract)}>
          <EditIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Edit Code
        </MenuItem>
        {menuContract?.status === 'uploaded' && (
          <MenuItem onClick={() => menuContract && handleCompileContract(menuContract)}>
            <CodeIcon sx={{ mr: 1.5, fontSize: 18 }} />
            Compile Code
          </MenuItem>
        )}
        {menuContract?.status === 'compiled' && !menuContract?.address && (
          <MenuItem onClick={() => menuContract && handleDeployContract(menuContract)}>
            <DeployIcon sx={{ mr: 1.5, fontSize: 18 }} />
            Deploy Contract
          </MenuItem>
        )}
        {menuContract?.address && menuContract?.abi && (
          <MenuItem onClick={() => menuContract && handleInteractContract(menuContract)}>
            <ViewIcon sx={{ mr: 1.5, fontSize: 18 }} />
            Interact UI
          </MenuItem>
        )}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
        <MenuItem 
          onClick={() => {
            if (menuContract) {
              handleDeleteContract(menuContract.id);
            }
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Delete Record
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
            chainId: 43114,
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