import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow as CompileIcon,
  Code as CodeIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { useNotification } from './NotificationProvider';

interface CompilationResult {
  success: boolean;
  compilerVersion: string;
  contracts: Record<string, {
    abi: any[];
    bytecode: string;
    deployedBytecode: string;
    gasEstimates: any;
  }>;
  warnings: Array<{
    severity: string;
    message: string;
    formattedMessage: string;
  }>;
  errors?: Array<{
    severity: string;
    message: string;
    formattedMessage: string;
  }>;
}

interface SolidityEditorProps {
  open: boolean;
  onClose: () => void;
  contract?: {
    id: string;
    name: string;
    code: string;
  } | null;
  onSave: () => void;
}

const SolidityEditor: React.FC<SolidityEditorProps> = ({
  open,
  onClose,
  contract,
  onSave,
}) => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const editorRef = useRef<any>(null);
  
  const [contractName, setContractName] = useState('');
  const [code, setCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Initialize form when contract changes
  useEffect(() => {
    if (contract) {
      setContractName(contract.name);
      setCode(contract.code);
    } else {
      setContractName('');
      setCode(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    
}`);
    }
  }, [contract]);

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure Solidity language
    monaco.languages.register({ id: 'solidity' });
    
    // Define Solidity syntax highlighting
    monaco.languages.setMonarchTokensProvider('solidity', {
      tokenizer: {
        root: [
          [/pragma\b/, 'keyword'],
          [/contract\b/, 'keyword'],
          [/function\b/, 'keyword'],
          [/modifier\b/, 'keyword'],
          [/event\b/, 'keyword'],
          [/struct\b/, 'keyword'],
          [/enum\b/, 'keyword'],
          [/mapping\b/, 'keyword'],
          [/address\b/, 'type'],
          [/uint\d*\b/, 'type'],
          [/int\d*\b/, 'type'],
          [/bytes\d*\b/, 'type'],
          [/bool\b/, 'type'],
          [/string\b/, 'type'],
          [/public\b/, 'keyword'],
          [/private\b/, 'keyword'],
          [/internal\b/, 'keyword'],
          [/external\b/, 'keyword'],
          [/pure\b/, 'keyword'],
          [/view\b/, 'keyword'],
          [/payable\b/, 'keyword'],
          [/\d+/, 'number'],
          [/".*?"/, 'string'],
          [/'.*?'/, 'string'],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
        ],
        comment: [
          [/[^/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[/*]/, 'comment'],
        ],
      },
    });

    // Set editor theme
    monaco.editor.setTheme(theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light');
  };

  const compileContract = async () => {
    if (!code.trim()) {
      showNotification('Please enter some Solidity code to compile', 'warning');
      return;
    }

    setIsCompiling(true);
    setCompilationResult(null);

    try {
      const response = await fetch('/api/contracts/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCode: code,
          contractName: contractName || 'Contract',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setCompilationResult(result);
        showNotification('Contract compiled successfully!', 'success');
      } else {
        setCompilationResult({
          success: false,
          compilerVersion: 'N/A',
          contracts: {},
          warnings: [],
          errors: result.errors || [{ severity: 'error', message: result.error || 'Compilation failed', formattedMessage: result.error || 'Compilation failed' }],
        });
        showNotification('Compilation failed', 'error');
      }
    } catch (error) {
      console.error('Compilation error:', error);
      showNotification('Failed to compile contract', 'error');
      setCompilationResult({
        success: false,
        compilerVersion: 'N/A',
        contracts: {},
        warnings: [],
        errors: [{ severity: 'error', message: 'Network error', formattedMessage: 'Failed to connect to compiler service' }],
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSave = async () => {
    if (!contractName.trim()) {
      showNotification('Please enter a contract name', 'warning');
      return;
    }

    if (!code.trim()) {
      showNotification('Please enter some Solidity code', 'warning');
      return;
    }

    setIsSaving(true);

    try {
      const url = contract?.id ? `/api/contracts/${contract.id}` : '/api/contracts';
      const method = contract?.id ? 'PUT' : 'POST';

      const payload: any = {
        name: contractName,
        code: code,
      };

      // Add compilation results if available
      if (compilationResult?.success) {
        const contractData = Object.values(compilationResult.contracts)[0];
        if (contractData) {
          payload.abi = contractData.abi;
          payload.bytecode = contractData.bytecode;
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showNotification(
          `Contract ${contract?.id ? 'updated' : 'saved'} successfully!`,
          'success'
        );
        onSave();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to save contract');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to save contract',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const downloadABI = () => {
    if (!compilationResult?.success) return;

    const contractData = Object.values(compilationResult.contracts)[0];
    if (!contractData?.abi) return;

    const blob = new Blob([JSON.stringify(contractData.abi, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contractName || 'contract'}_abi.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyABI = () => {
    if (!compilationResult?.success) return;

    const contractData = Object.values(compilationResult.contracts)[0];
    if (!contractData?.abi) return;

    navigator.clipboard.writeText(JSON.stringify(contractData.abi, null, 2));
    showNotification('ABI copied to clipboard!', 'success');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight="bold">
            {contract ? 'Edit Contract' : 'Create New Contract'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Contract Name */}
        <Box sx={{ p: 3, pb: 0 }}>
          <TextField
            fullWidth
            label="Contract Name"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
            placeholder="Enter contract name"
            sx={{ mb: 2 }}
          />
        </Box>

        {/* Editor and Results */}
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Editor */}
          <Box sx={{ flex: 1, borderRight: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ height: '100%', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Solidity Code</Typography>
                <Button
                  variant="contained"
                  startIcon={isCompiling ? <CircularProgress size={16} /> : <CompileIcon />}
                  onClick={compileContract}
                  disabled={isCompiling}
                  size="small"
                >
                  {isCompiling ? 'Compiling...' : 'Compile'}
                </Button>
              </Box>
              
              <Box sx={{ height: 'calc(100% - 60px)', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Editor
                  height="100%"
                  language="solidity"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorMount}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    folding: true,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Results Panel */}
          <Box sx={{ width: '400px', borderLeft: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Compilation Results
              </Typography>

              {!compilationResult ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CodeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Click "Compile" to see results
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                    <Tab label="Summary" />
                    <Tab label="Errors" />
                    <Tab label="ABI" />
                  </Tabs>

                  {/* Summary Tab */}
                  {tabValue === 0 && (
                    <Box>
                      <Alert
                        severity={compilationResult.success ? 'success' : 'error'}
                        icon={compilationResult.success ? <SuccessIcon /> : <ErrorIcon />}
                        sx={{ mb: 2 }}
                      >
                        {compilationResult.success ? 'Compilation successful!' : 'Compilation failed'}
                      </Alert>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Compiler:</strong> {compilationResult.compilerVersion}
                      </Typography>

                      {compilationResult.success && (
                        <>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Contracts:</strong> {Object.keys(compilationResult.contracts).length}
                          </Typography>
                          
                          {compilationResult.warnings.length > 0 && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                              {compilationResult.warnings.length} warning(s)
                            </Alert>
                          )}
                        </>
                      )}
                    </Box>
                  )}

                  {/* Errors Tab */}
                  {tabValue === 1 && (
                    <Box>
                      {(compilationResult.errors || []).length === 0 && compilationResult.warnings.length === 0 ? (
                        <Alert severity="success">No errors or warnings!</Alert>
                      ) : (
                        <List dense>
                          {(compilationResult.errors || []).map((error, index) => (
                            <ListItem key={`error-${index}`}>
                              <ListItemIcon>
                                <ErrorIcon color="error" />
                              </ListItemIcon>
                              <ListItemText
                                primary={error.message}
                                secondary={error.formattedMessage}
                              />
                            </ListItem>
                          ))}
                          {compilationResult.warnings.map((warning, index) => (
                            <ListItem key={`warning-${index}`}>
                              <ListItemIcon>
                                <WarningIcon color="warning" />
                              </ListItemIcon>
                              <ListItemText
                                primary={warning.message}
                                secondary={warning.formattedMessage}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}

                  {/* ABI Tab */}
                  {tabValue === 2 && (
                    <Box>
                      {compilationResult.success && Object.keys(compilationResult.contracts).length > 0 ? (
                        <Box>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Tooltip title="Copy ABI">
                              <IconButton size="small" onClick={copyABI}>
                                <CopyIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download ABI">
                              <IconButton size="small" onClick={downloadABI}>
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          
                          <Box
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                              p: 2,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              overflow: 'auto',
                              maxHeight: '300px',
                            }}
                          >
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(Object.values(compilationResult.contracts)[0]?.abi || [], null, 2)}
                            </pre>
                          </Box>
                        </Box>
                      ) : (
                        <Alert severity="info">Compile successfully to see ABI</Alert>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : contract ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SolidityEditor;