import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  Tooltip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  Badge,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Hub,
  Visibility,
  ViewModule,
  ViewList,
  Psychology,
  Category,
  CalendarToday,
  TrendingUp,
  Link as LinkIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { fetchThoughts, deleteThought, setFilter } from '../store/slices/thoughtsSlice';

const ThoughtsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { thoughts, loading } = useSelector((state: RootState) => state.thoughts);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    dispatch(fetchThoughts({}));
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    dispatch(setFilter({ searchTerm: value }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    dispatch(setFilter({ category: category === 'all' ? undefined : category }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this thought?')) {
      await dispatch(deleteThought(id));
      dispatch(fetchThoughts({}));
    }
  };

  const filteredThoughts = thoughts
    .filter(thought => {
      if (searchTerm && !thought.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !thought.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'all' && thought.category !== selectedCategory) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'importance':
          return b.importance - a.importance;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const categories = ['all', 'idea', 'task', 'note', 'goal', 'question', 'learning'];

  const ThoughtCard = ({ thought, index }: { thought: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        {thought.importance > 3 && (
          <Badge
            badgeContent={<TrendingUp fontSize="small" />}
            color="warning"
            sx={{
              position: 'absolute',
              top: -8,
              right: 16,
              '& .MuiBadge-badge': {
                width: 32,
                height: 32,
                borderRadius: '50%',
              },
            }}
          />
        )}
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <Psychology />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {thought.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {thought.content}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<Category />}
                label={thought.category}
                size="small"
                color="primary"
                variant="outlined"
              />
              {thought.tags?.map((tag: string) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
              <Rating value={thought.importance} readOnly size="small" />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {thought.connectionsCount > 0 && (
                  <Chip
                    icon={<LinkIcon />}
                    label={thought.connectionsCount}
                    size="small"
                    sx={{ height: 24 }}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  <CalendarToday fontSize="small" sx={{ fontSize: 14, mr: 0.5 }} />
                  {new Date(thought.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>

        <CardActions>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/thoughts/${thought.id}`)}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/thoughts/${thought.id}/edit`)}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Connections">
            <IconButton
              size="small"
              onClick={() => navigate(`/thoughts/${thought.id}/connections`)}
            >
              <Hub />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(thought.id)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </motion.div>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">My Thoughts</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="grid">
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search thoughts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                label="Category"
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="importance">Importance</MenuItem>
                <MenuItem value="title">Title</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <Typography variant="body2">
                {filteredThoughts.length} thoughts
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Thoughts Grid/List */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredThoughts.map((thought, index) => (
                <Grid item xs={12} sm={6} md={4} key={thought.id}>
                  <ThoughtCard thought={thought} index={index} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredThoughts.map((thought, index) => (
                <Box key={thought.id} sx={{ width: '100%' }}>
                  <ThoughtCard thought={thought} index={index} />
                </Box>
              ))}
            </Box>
          )}
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!loading && filteredThoughts.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No thoughts found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by creating your first thought'}
          </Typography>
        </Box>
      )}

      {/* FAB */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => navigate('/thoughts/new')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default ThoughtsList;