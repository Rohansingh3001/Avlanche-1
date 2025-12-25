import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
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
  LinearProgress,
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
  CollectionsBookmark as CollectionIcon,
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

  // Fetch real data from backend
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/assets');
        
        if (response.ok) {
          const result = await response.json();
          const assets = result.data || [];
          
          // Separate tokens and NFTs
          const tokenAssets = assets.filter((asset: any) => asset.type === 'token');
          const nftAssets = assets.filter((asset: any) => asset.type === 'nft');
          
          setTokens(tokenAssets);
          setNFTs(nftAssets);
          
          // Mock transactions for now - in a real app, you'd fetch these from the blockchain
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
        const result = await response.json();
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
        
        // Refresh assets list
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

  const totalPortfolioValue = tokens.length * 100; // Simplified calculation for demo

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return <SendIcon />;
      case 'receive': return <TrendingDownIcon color="success" />;
      case 'swap': return <SwapIcon />;
      case 'mint': return <AddIcon />;
      default: return <MoneyIcon />;
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Assets
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Manage your digital assets and portfolio
        </Typography>

        {/* Portfolio Overview */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.1)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${totalPortfolioValue.toLocaleString()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Portfolio Value
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => setSendModalOpen(true)}
                  sx={{ background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)' }}
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
                >
                  Receive
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                >
                  History
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateAssetModalOpen(true)}
                  sx={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)' }}
                >
                  Create Asset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Tokens" />
          <Tab label="NFTs" />
          <Tab label="Transactions" />
        </Tabs>
      </Box>

      {/* Tokens Tab */}
      {tabValue === 0 && (
        <>
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} md={6} lg={4} key={item}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" width="60%" height={32} sx={{ mt: 1 }} />
                      <Skeleton variant="text" width="80%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {tokens.map((token) => (
                <Grid item xs={12} md={6} lg={4} key={token.id}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                        ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            mr: 2,
                          }}
                        >
                          <TokenIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {token.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {token.symbol}
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={(e) => handleActionMenuClick(e, token)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {token.total_supply} {token.symbol}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Total Supply
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip
                          label={`Subnet ${token.subnet_id}`}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {token.decimals} decimals
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<SendIcon />}
                        onClick={() => {
                          setSendForm(prev => ({ ...prev, asset: token.symbol }));
                          setSendModalOpen(true);
                        }}
                      >
                        Send
                      </Button>
                      <Button
                        size="small"
                        startIcon={<SwapIcon />}
                        onClick={() => setSwapModalOpen(true)}
                      >
                        Swap
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* NFTs Tab */}
      {tabValue === 1 && (
        <>
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                  <Card>
                    <Skeleton variant="rectangular" width="100%" height={200} />
                    <CardContent>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : nfts.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <NFTIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  No NFTs Yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Your NFT collection will appear here
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
            <Grid container spacing={3}>
              {nfts.map((nft) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={nft.id}>
                  <Card
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <Box
                      component="div"
                      sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'action.hover',
                      }}
                    >
                      <DiamondIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {nft.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {nft.symbol}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Subnet {nft.subnet_id}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Supply: {nft.total_supply}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<ViewIcon />}>
                        View
                      </Button>
                      <Button size="small" startIcon={<SendIcon />}>
                        Transfer
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Transactions Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <List>
              {transactions.map((tx, index) => (
                <React.Fragment key={tx.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alpha(getTransactionColor(tx.type), 0.1) }}>
                        {getTransactionIcon(tx.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} {tx.amount} {tx.asset}
                          </Typography>
                          <Chip
                            label={tx.status}
                            size="small"
                            color={tx.status === 'confirmed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {tx.timestamp}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Hash: {tx.txHash}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton>
                      <ViewIcon />
                    </IconButton>
                  </ListItem>
                  {index < transactions.length - 1 && <Divider />}
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
      >
        <MenuItem onClick={() => {
          if (selectedAsset && 'symbol' in selectedAsset) {
            setSendForm(prev => ({ ...prev, asset: selectedAsset.symbol }));
            setSendModalOpen(true);
          }
          handleActionMenuClose();
        }}>
          <SendIcon sx={{ mr: 1 }} />
          Send
        </MenuItem>
        <MenuItem onClick={() => {
          navigator.clipboard.writeText(selectedAsset?.address || '');
          showNotification('Address copied to clipboard', 'success');
          handleActionMenuClose();
        }}>
          <CopyIcon sx={{ mr: 1 }} />
          Copy Address
        </MenuItem>
        <MenuItem onClick={handleActionMenuClose}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
      </Menu>

      {/* Send Modal */}
      <Dialog
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Asset</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Asset</InputLabel>
                <Select
                  value={sendForm.asset}
                  label="Asset"
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
        <DialogActions>
          <Button onClick={() => setSendModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Tooltip title="Send Asset">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #E84142 0%, #ff6b6b 100%)',
          }}
          onClick={() => setSendModalOpen(true)}
        >
          <SendIcon />
        </Fab>
      </Tooltip>

      {/* Create Asset Modal */}
      <Dialog
        open={createAssetModalOpen}
        onClose={() => setCreateAssetModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Asset</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Asset Type</InputLabel>
                <Select
                  value={createAssetForm.type}
                  label="Asset Type"
                  onChange={(e) => setCreateAssetForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <SelectMenuItem value="token">Token (ERC20)</SelectMenuItem>
                  <SelectMenuItem value="nft">NFT Collection (ERC721)</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Asset Name"
                value={createAssetForm.name}
                onChange={(e) => setCreateAssetForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Token"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Symbol"
                value={createAssetForm.symbol}
                onChange={(e) => setCreateAssetForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                placeholder="MTK"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subnet ID"
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
                    label="Total Supply"
                    value={createAssetForm.totalSupply}
                    onChange={(e) => setCreateAssetForm(prev => ({ ...prev, totalSupply: e.target.value }))}
                    placeholder="1000000"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAssetModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateAsset} variant="contained">
            Create {createAssetForm.type.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Assets;