import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Code as CodeIcon,
  Visibility as PreviewIcon,
  GetApp as UseTemplateIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { contractTemplates, ContractTemplate, getTemplatesByCategory, getTemplatesByDifficulty, searchTemplates } from '../data/contractTemplates';

interface ContractTemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ContractTemplate) => void;
}

const ContractTemplatesModal: React.FC<ContractTemplatesModalProps> = ({
  open,
  onClose,
  onSelectTemplate,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const categories = ['All', 'Token', 'NFT', 'DeFi', 'Governance', 'Utility', 'Game'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    let filtered = contractTemplates;

    // Apply search
    if (searchQuery.trim()) {
      filtered = searchTemplates(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Group templates by category for the categories tab
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, ContractTemplate[]> = {};
    categories.slice(1).forEach(category => {
      grouped[category] = getTemplatesByCategory(category);
    });
    return grouped;
  }, []);

  const handleUseTemplate = (template: ContractTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Token': return 'primary';
      case 'NFT': return 'secondary';
      case 'DeFi': return 'info';
      case 'Governance': return 'warning';
      case 'Utility': return 'success';
      case 'Game': return 'error';
      default: return 'default';
    }
  };

  const TemplateCard: React.FC<{ template: ContractTemplate }> = ({ template }) => (
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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" gutterBottom>
            {template.name}
          </Typography>
          <Chip
            label={template.difficulty}
            size="small"
            color={getDifficultyColor(template.difficulty) as any}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {template.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={template.category}
            size="small"
            color={getCategoryColor(template.category) as any}
            variant="outlined"
          />
          {template.tags.slice(0, 2).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
            />
          ))}
          {template.tags.length > 2 && (
            <Chip
              label={`+${template.tags.length - 2} more`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        
        {template.constructorArgs && template.constructorArgs.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Constructor args: {template.constructorArgs.length}
          </Typography>
        )}
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<PreviewIcon />}
          onClick={() => setPreviewTemplate(template)}
        >
          Preview
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<UseTemplateIcon />}
          onClick={() => handleUseTemplate(template)}
        >
          Use Template
        </Button>
      </CardActions>
    </Card>
  );

  const renderTemplateGrid = (templates: ContractTemplate[]) => (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid item xs={12} md={6} lg={4} key={template.id}>
          <TemplateCard template={template} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
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
              Contract Templates
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Search and Filters */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={selectedDifficulty}
                    label="Difficulty"
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    {difficulties.map((difficulty) => (
                      <MenuItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="All Templates" />
              <Tab label="By Category" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Box>
              {filteredTemplates.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No templates found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search or filters
                  </Typography>
                </Box>
              ) : (
                renderTemplateGrid(filteredTemplates)
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={category}
                      color={getCategoryColor(category) as any}
                      size="small"
                    />
                    {templates.length} template{templates.length !== 1 ? 's' : ''}
                  </Typography>
                  {renderTemplateGrid(templates)}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">
                {previewTemplate?.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={previewTemplate?.category}
                  size="small"
                  color={getCategoryColor(previewTemplate?.category || '') as any}
                />
                <Chip
                  label={previewTemplate?.difficulty}
                  size="small"
                  color={getDifficultyColor(previewTemplate?.difficulty || '') as any}
                />
              </Box>
            </Box>
            <IconButton onClick={() => setPreviewTemplate(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {previewTemplate && (
            <Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {previewTemplate.description}
              </Typography>

              {previewTemplate.constructorArgs && previewTemplate.constructorArgs.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Constructor Parameters
                  </Typography>
                  {previewTemplate.constructorArgs.map((arg) => (
                    <Box key={arg.name} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{arg.name}</strong> ({arg.type}): {arg.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Typography variant="h6" gutterBottom>
                Source Code
              </Typography>
              <Box
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  maxHeight: '400px',
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {previewTemplate.code}
                </pre>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewTemplate(null)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<UseTemplateIcon />}
            onClick={() => {
              if (previewTemplate) {
                handleUseTemplate(previewTemplate);
                setPreviewTemplate(null);
              }
            }}
          >
            Use Template
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContractTemplatesModal;