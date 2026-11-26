import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Divider,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Save,
  Cancel,
  Psychology,
  Add,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  AttachFile,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { createThought, updateThought, fetchThoughtById } from '../store/slices/thoughtsSlice';

const CreateThought: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { loading, error } = useSelector((state: RootState) => state.thoughts);
  const existingThought = useSelector((state: RootState) => 
    id ? state.thoughts.thoughts.find(t => t.id === id) : null
  );

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'idea',
    importance: 3,
    tags: [] as string[],
    status: 'active',
  });

  const [newTag, setNewTag] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [textFormat, setTextFormat] = useState<string[]>([]);

  useEffect(() => {
    if (id && !existingThought) {
      dispatch(fetchThoughtById(id));
    }
  }, [id, existingThought, dispatch]);

  useEffect(() => {
    if (existingThought) {
      setFormData({
        title: existingThought.title,
        content: existingThought.content,
        category: existingThought.category,
        importance: existingThought.importance,
        tags: existingThought.tags || [],
        status: existingThought.status || 'active',
      });
    }
  }, [existingThought]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      handleChange('tags', [...formData.tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    if (formData.title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (id) {
        await dispatch(updateThought({ id, data: formData })).unwrap();
        navigate(`/thoughts/${id}`);
      } else {
        const result = await dispatch(createThought(formData)).unwrap();
        navigate(`/thoughts/${result.id}`);
      }
    } catch (err) {
      console.error('Failed to save thought:', err);
    }
  };

  const categories = ['idea', 'task', 'note', 'goal', 'question', 'learning', 'reflection'];
  const statusOptions = ['active', 'archived', 'completed', 'pending'];

  const applyFormat = (format: string) => {
    // Placeholder for text formatting logic
    console.log('Apply format:', format);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Psychology sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {id ? 'Edit Thought' : 'Create New Thought'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={!!formErrors.title}
                helperText={formErrors.title}
                sx={{ mb: 3 }}
                placeholder="Enter a meaningful title for your thought..."
              />

              {/* Text Formatting Toolbar */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <ToggleButtonGroup
                  value={textFormat}
                  onChange={(_, formats) => setTextFormat(formats)}
                  size="small"
                >
                  <ToggleButton value="bold" onClick={() => applyFormat('bold')}>
                    <FormatBold />
                  </ToggleButton>
                  <ToggleButton value="italic" onClick={() => applyFormat('italic')}>
                    <FormatItalic />
                  </ToggleButton>
                  <ToggleButton value="underline" onClick={() => applyFormat('underline')}>
                    <FormatUnderlined />
                  </ToggleButton>
                </ToggleButtonGroup>
                
                <Divider orientation="vertical" flexItem />
                
                <ToggleButtonGroup size="small">
                  <ToggleButton value="bullet" onClick={() => applyFormat('bullet')}>
                    <FormatListBulleted />
                  </ToggleButton>
                  <ToggleButton value="number" onClick={() => applyFormat('number')}>
                    <FormatListNumbered />
                  </ToggleButton>
                  <ToggleButton value="code" onClick={() => applyFormat('code')}>
                    <Code />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={12}
                label="Content"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                error={!!formErrors.content}
                helperText={formErrors.content}
                sx={{ mb: 3 }}
                placeholder="Describe your thought in detail..."
              />

              {/* Tags */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {formData.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddTag}
                  >
                    Add
                  </Button>
                </Box>
              </Box>

              {/* Attachments */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Attachments
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AttachFile />}
                  component="label"
                >
                  Upload File
                  <input type="file" hidden multiple />
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Properties
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  label="Category"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Status"
                >
                  {statusOptions.map(status => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Importance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={formData.importance}
                    onChange={(_, value) => handleChange('importance', value || 1)}
                    size="large"
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({formData.importance}/5)
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {id ? 'Update Thought' : 'Create Thought'}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(id ? `/thoughts/${id}` : '/thoughts')}
                >
                  Cancel
                </Button>
              </Box>

              {id && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {existingThought && new Date(existingThought.createdAt).toLocaleDateString()}
                    <br />
                    Last modified: {existingThought && new Date(existingThought.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default CreateThought;