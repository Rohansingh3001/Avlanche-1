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
  balance: string;
  value: number;
  change24h: number;
  address: string;
  decimals: number;
  subnetId: string;
  subnetName: string;
  logo?: string;
}

interface NFT {
  id: string;
  name: string;
  collection: string;
  tokenId: string;
  image: string;
  description: string;
  address: string;
  subnetId: string;
  subnetName: string;
  traits: any[];
  lastSale?: number;
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

  // Mock data for demonstration
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTokens: Token[] = [
          {
            id: '1',
            name: 'Avalanche',
            symbol: 'AVAX',
            balance: '125.5',
            value: 3890.25,
            change24h: 5.2,
            address: '0x0000000000000000000000000000000000000000',
            decimals: 18,
            subnetId: '1',
            subnetName: 'C-Chain',
          },
          {
            id: '2',
            name: 'DeFi Token',
            symbol: 'DEFI',
            balance: '1000.0',
            value: 250.0,
            change24h: -2.1,
            address: '0x1234567890abcdef1234567890abcdef12345678',
            decimals: 18,
            subnetId: '1',
            subnetName: 'DeFi Subnet',
          },
          {
            id: '3',
            name: 'Gaming Token',
            symbol: 'GAME',
            balance: '500.0',
            value: 125.0,
            change24h: 8.7,
            address: '0xabcdef1234567890abcdef1234567890abcdef12',
            decimals: 18,
            subnetId: '2',
            subnetName: 'Gaming Subnet',
          },
        ];

        const mockNFTs: NFT[] = [
          {
            id: '1',
            name: 'Avalanche Penguin #1234',
            collection: 'Avalanche Penguins',
            tokenId: '1234',
            image: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Penguin+%231234',
            description: 'A rare Avalanche Penguin with ice powers',
            address: '0xdef1234567890abcdef1234567890abcdef12345',
            subnetId: '2',
            subnetName: 'Gaming Subnet',
            traits: [
              { trait_type: 'Background', value: 'Ice' },
              { trait_type: 'Body', value: 'Classic' },
              { trait_type: 'Eyes', value: 'Cool' },
            ],
            lastSale: 2.5,
          },
          {
            id: '2',
            name: 'DeFi Crystal #567',
            collection: 'DeFi Crystals',
            tokenId: '567',
            image: 'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=Crystal+%23567',
            description: 'A powerful DeFi crystal that generates yield',
            address: '0x567890abcdef1234567890abcdef1234567890ab',
            subnetId: '1',
            subnetName: 'DeFi Subnet',
            traits: [
              { trait_type: 'Color', value: 'Teal' },
              { trait_type: 'Power', value: 'High' },
              { trait_type: 'Rarity', value: 'Epic' },
            ],
            lastSale: 1.8,
          },
        ];

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
            asset: 'DEFI',
            from: '0x...sender',
            to: '0x...your_address',
            timestamp: '1 hour ago',
            status: 'confirmed',
            txHash: '0xdef456...',
          },
          {
            id: '3',
            type: 'swap',
            amount: '100.0',
            asset: 'AVAX → GAME',
            from: '0x...your_address',
            to: '0x...dex_address',
            timestamp: '3 hours ago',
            status: 'confirmed',
            txHash: '0x789ghi...',
          },
        ];
        
        setTokens(mockTokens);
        setNFTs(mockNFTs);
        setTransactions(mockTransactions);
      } catch (error) {
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

  const totalPortfolioValue = tokens.reduce((sum, token) => sum + token.value, 0);

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
                          {token.balance} {token.symbol}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          ${token.value.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip
                          label={token.subnetName}
                          size="small"
                          variant="outlined"
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {token.change24h >= 0 ? (
                            <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
                          ) : (
                            <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color: token.change24h >= 0 ? 'success.main' : 'error.main',
                            }}
                          >
                            {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                          </Typography>
                        </Box>
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
                    <CardMedia
                      component="img"
                      height="200"
                      image={nft.image}
                      alt={nft.name}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {nft.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {nft.collection}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {nft.subnetName}
                      </Typography>
                      {nft.lastSale && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Last Sale: {nft.lastSale} AVAX
                        </Typography>
                      )}
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
    </Container>
  );
};

export default Assets;