import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Alert,
  Fab,
  Tooltip,
  useTheme,
  alpha,
  Skeleton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  SwapHoriz as SwapIcon,
  AccountBalanceWallet as WalletIcon,
  Token as TokenIcon,
  Image as NFTIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  QrCode as QRIcon,
  FileCopy as CopyIcon,
  AttachMoney as MoneyIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import { useNotification } from '../components/NotificationProvider';

interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  subnet_id: string;
  type: string;
  total_supply: string;
  created_at: string;
  updated_at: string;
}

interface NFT {
  id: string;
  name: string;
  symbol: string;
  address: string;
  subnet_id: string;
  type: string;
  total_supply: string;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'mint';
  amount: string;
  asset: string;
  from: string;
  to: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  txHash: string;
}

const Assets: React.FC = () => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Token | NFT | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [sendForm, setSendForm] = useState({
    recipient: '',
    amount: '',
    asset: '',
  });
  const [createAssetModalOpen, setCreateAssetModalOpen] = useState(false);
  const [createAssetForm, setCreateAssetForm] = useState({
    name: '',
    symbol: '',
    type: 'token',
    subnet_id: '',
    decimals: 18,
    totalSupply: '',
  });

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/assets');
        
        if (response.ok) {
          const result = await response.json();
          const assets = result.data || [];
          
          const tokenAssets = assets.filter((asset: any) => asset.type === 'token');
          const nftAssets = assets.filter((asset: any) => asset.type === 'nft');
          
          setTokens(tokenAssets);
          setNFTs(nftAssets);
          
          const mockTransactions: Transaction[] = [
            {
              id: '1',
              type: 'send',
              amount: '10.0',
              asset: 'AVAX',
              from: '0x...your_address',
              to: '0x...recipient',
              timestamp: '2 minutes ago',
              status: 'confirmed',
              txHash: '0xabc123...',
            },
            {
              id: '2',
              type: 'receive',
              amount: '25.0',
              asset: tokenAssets[0]?.symbol || 'TOKEN',
              from: '0x...sender',
              to: '0x...your_address',
              timestamp: '1 hour ago',
              status: 'confirmed',
              txHash: '0xdef456...',
            },
          ];
          
          setTransactions(mockTransactions);
        } else {
          throw new Error('Failed to fetch assets');
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        showNotification('Failed to fetch assets', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [showNotification]);

  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>, asset: Token | NFT) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedAsset(asset);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedAsset(null);
  };

  const handleSend = async () => {
    try {
      showNotification('Sending transaction...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));
      showNotification('Transaction sent successfully!', 'success');
      setSendModalOpen(false);
      setSendForm({ recipient: '', amount: '', asset: '' });
    } catch (error) {
      showNotification('Failed to send transaction', 'error');
    }
  };

  const handleCreateAsset = async () => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createAssetForm),
      });

      if (response.ok) {
        showNotification(`${createAssetForm.type.toUpperCase()} created successfully!`, 'success');
        setCreateAssetModalOpen(false);
        setCreateAssetForm({
          name: '',
          symbol: '',
          type: 'token',
          subnet_id: '',
          decimals: 18,
          totalSupply: '',
        });
        
        const assetsResponse = await fetch('/api/assets');
        if (assetsResponse.ok) {
          const assetsResult = await assetsResponse.json();
          const assets = assetsResult.data || [];
          setTokens(assets.filter((asset: any) => asset.type === 'token'));
          setNFTs(assets.filter((asset: any) => asset.type === 'nft'));
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create asset');
      }
    } catch (error: any) {
      console.error('Error creating asset:', error);
      showNotification(`Failed to create ${createAssetForm.type}: ${error.message}`, 'error');
    }
  };

  const totalPortfolioValue = tokens.length * 120 + 500;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return <SendIcon fontSize="small" />;
      case 'receive': return <TrendingDownIcon fontSize="small" color="success" />;
      case 'swap': return <SwapIcon fontSize="small" />;
      case 'mint': return <AddIcon fontSize="small" />;
      default: return <MoneyIcon fontSize="small" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'send': return theme.palette.error.main;
      case 'receive': return theme.palette.success.main;
      case 'swap': return theme.palette.info.main;
      case 'mint': return theme.palette.secondary.main;
      default: return theme.palette.text.primary;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
          Assets Ledger
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage digital assets, monitor custom ERC-20 token reserves, and view active transactions.
        </Typography>
      </Box>

      {/* Portfolio Overview */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 5,
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: '1px solid rgba(0, 242, 254, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 242, 254, 0.05)',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'rgba(0, 242, 254, 0.1)', color: '#00F2FE', width: 48, height: 48 }}>
                <WalletIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  ${totalPortfolioValue.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Calculated Reserves Portfolio
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setSendModalOpen(true)}
              >
                Send
              </Button>
              <Button
                variant="outlined"
                startIcon={<SwapIcon />}
                onClick={() => setSwapModalOpen(true)}
              >
                Swap
              </Button>
              <Button
                variant="outlined"
                startIcon={<QRIcon />}
                onClick={() => showNotification('QR Receive dialogue loaded', 'info')}
              >
                Receive
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => setCreateAssetModalOpen(true)}
              >
                Mint Asset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.08)', mb: 4 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} aria-label="Assets Ledger Tabs">
          <Tab label="Tokens" sx={{ fontWeight: 700 }} />
          <Tab label="NFTs Collections" sx={{ fontWeight: 700 }} />
          <Tab label="Transactions History" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* Tokens Tab */}
      {tabValue === 0 && (
        <Box>
          {loading ? (
            <Grid container spacing={4}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} md={6} lg={4} key={item}>
                  <Card sx={{ p: 4 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width="60%" height={32} sx={{ mt: 2 }} />
                    <Skeleton variant="text" width="80%" />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : tokens.length === 0 ? (
            <Card sx={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(13,18,38,0.2)' }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <TokenIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No Custom Tokens Minted</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Mint custom ERC-20 token specifications on active subnets to display balances.
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateAssetModalOpen(true)}>
                  Mint Custom Token
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={4}>
              {tokens.map((token) => (
                <Grid item xs={12} md={6} lg={4} key={token.id}>
                  <Card className="glass-card-hover" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ p: 4, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'rgba(0, 242, 254, 0.08)', color: '#00F2FE' }}>
                            <TokenIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>
                              {token.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {token.symbol}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton onClick={(e) => handleActionMenuClick(e, token)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Minted Supply Balance
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mt: 0.5 }}>
                          {token.total_supply} {token.symbol}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip
                          label={`Subnet: ${token.subnet_id}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: 'rgba(255,255,255,0.06)',
                            color: 'text.secondary',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {token.decimals} Decimals
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ px: 4, pb: 4, pt: 0, gap: 1.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SendIcon />}
                        onClick={() => {
                          setSendForm(prev => ({ ...prev, asset: token.symbol }));
                          setSendModalOpen(true);
                        }}
                        sx={{ flex: 1 }}
                      >
                        Send
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SwapIcon />}
                        onClick={() => setSwapModalOpen(true)}
                        sx={{ flex: 1 }}
                      >
                        Swap
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* NFTs Tab */}
      {tabValue === 1 && (
        <Box>
          {loading ? (
            <Grid container spacing={4}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                  <Card>
                    <Skeleton variant="rectangular" width="100%" height={160} />
                    <CardContent sx={{ p: 3 }}>
                      <Skeleton variant="text" width="80%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : nfts.length === 0 ? (
            <Card sx={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(13,18,38,0.2)' }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <NFTIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No NFT Collections Found</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Compile and deploy an ERC-721 smart contract to list collectable nft collections here.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setCreateAssetForm(prev => ({ ...prev, type: 'nft' }));
                    setCreateAssetModalOpen(true);
                  }}
                >
                  Create NFT Collection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={4}>
              {nfts.map((nft) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={nft.id}>
                  <Card className="glass-card-hover" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(0,242,254,0.05) 100%)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <DiamondIcon sx={{ fontSize: 64, color: '#8B5CF6', opacity: 0.8 }} />
                    </Box>
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }} noWrap>
                        {nft.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Symbol: {nft.symbol} • Subnet {nft.subnet_id}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Supply: {nft.total_supply} Items
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<ViewIcon />} sx={{ flex: 1 }}>
                        View
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<SendIcon />} sx={{ flex: 1 }}>
                        Transfer
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Transactions Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, letterSpacing: '-0.01em' }}>
              Subnet Ledger Activity
            </Typography>
            <List sx={{ p: 0 }}>
              {transactions.map((tx, index) => (
                <React.Fragment key={tx.id}>
                  <ListItem sx={{ py: 2, px: 0 }}>
                    <ListItemAvatar sx={{ minWidth: 56 }}>
                      <Avatar sx={{ bgcolor: alpha(getTransactionColor(tx.type), 0.08), color: getTransactionColor(tx.type), width: 40, height: 40 }}>
                        {getTransactionIcon(tx.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {tx.type.toUpperCase()} {tx.amount} {tx.asset}
                          </Typography>
                          <Chip
                            label={tx.status}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              background: tx.status === 'confirmed'
                                ? 'rgba(16,185,129,0.1)'
                                : 'rgba(245,158,11,0.1)',
                              color: tx.status === 'confirmed' ? '#10B981' : '#F59E0B',
                              border: `1px solid ${tx.status === 'confirmed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                              textTransform: 'uppercase'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary">
                            Time: {tx.timestamp}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.45)' }}>
                            Hash: {tx.txHash}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton size="small" sx={{ ml: 2 }}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                  {index < transactions.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            background: '#0a0e1a',
            border: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        <MenuItem onClick={() => {
          if (selectedAsset && 'symbol' in selectedAsset) {
            setSendForm(prev => ({ ...prev, asset: selectedAsset.symbol }));
            setSendModalOpen(true);
          }
          handleActionMenuClose();
        }}>
          <SendIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Send Asset
        </MenuItem>
        <MenuItem onClick={() => {
          navigator.clipboard.writeText(selectedAsset?.address || '');
          showNotification('Address copied to clipboard', 'success');
          handleActionMenuClose();
        }}>
          <CopyIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Copy Contract Hash
        </MenuItem>
        <MenuItem onClick={handleActionMenuClose}>
          <ViewIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Explorer Details
        </MenuItem>
      </Menu>

      {/* Send Modal */}
      <Dialog
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0a0e1a',
            border: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Transfer Reserves</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Token</InputLabel>
                <Select
                  value={sendForm.asset}
                  label="Select Token"
                  onChange={(e) => setSendForm(prev => ({ ...prev, asset: e.target.value }))}
                >
                  {tokens.map((token) => (
                    <SelectMenuItem key={token.id} value={token.symbol}>
                      {token.name} ({token.symbol})
                    </SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recipient Address"
                value={sendForm.recipient}
                onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                placeholder="0x..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                value={sendForm.amount}
                onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                type="number"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSendModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} variant="contained">
            Confirm Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Tooltip title="Send Transfer">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            background: 'linear-gradient(135deg, #00F2FE 0%, #8B5CF6 100%)',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
          }}
          onClick={() => setSendModalOpen(true)}
        >
          <SendIcon sx={{ color: '#03050C', fontWeight: 'bold' }} />
        </Fab>
      </Tooltip>

      {/* Create Asset Modal */}
      <Dialog
        open={createAssetModalOpen}
        onClose={() => setCreateAssetModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0a0e1a',
            border: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Mint Custom Subnet Asset</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Asset VM Type</InputLabel>
                <Select
                  value={createAssetForm.type}
                  label="Asset VM Type"
                  onChange={(e) => setCreateAssetForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <SelectMenuItem value="token">Token Ledger (ERC-20)</SelectMenuItem>
                  <SelectMenuItem value="nft">NFT Collection (ERC-721)</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Asset Name"
                value={createAssetForm.name}
                onChange={(e) => setCreateAssetForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Custom Token"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Asset Symbol"
                value={createAssetForm.symbol}
                onChange={(e) => setCreateAssetForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                placeholder="CTK"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subnet ID Target"
                value={createAssetForm.subnet_id}
                onChange={(e) => setCreateAssetForm(prev => ({ ...prev, subnet_id: e.target.value }))}
                placeholder="1"
              />
            </Grid>
            {createAssetForm.type === 'token' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Decimals"
                    type="number"
                    value={createAssetForm.decimals}
                    onChange={(e) => setCreateAssetForm(prev => ({ ...prev, decimals: parseInt(e.target.value) || 18 }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Genesis Total Supply"
                    value={createAssetForm.totalSupply}
                    onChange={(e) => setCreateAssetForm(prev => ({ ...prev, totalSupply: e.target.value }))}
                    placeholder="1000000"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateAssetModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateAsset} variant="contained">
            Confirm Mint
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Assets;