import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Psychology,
  Edit,
  Delete,
  Hub,
  CalendarToday,
  Category,
  History,
  Assignment,
  ArrowBack,
  Add,
  Link as LinkIcon,
  AttachFile,
  Share,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { fetchThoughtById, deleteThought } from '../store/slices/thoughtsSlice';
import { fetchConnectionsByThought, createConnection } from '../store/slices/connectionsSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ThoughtDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const thought = useSelector((state: RootState) => 
    state.thoughts.thoughts.find(t => t.id === id)
  );
  const connections = useSelector((state: RootState) => 
    state.connections.connections.filter(c => 
      c.sourceThoughtId === id || c.targetThoughtId === id
    )
  );
  const { loading } = useSelector((state: RootState) => state.thoughts);
  
  const [tabValue, setTabValue] = useState(0);
  const [connectionDialog, setConnectionDialog] = useState(false);
  const [newConnection, setNewConnection] = useState({
    targetThoughtId: '',
    connectionType: 'RelatesTo',
    description: '',
    strength: 1,
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchThoughtById(id));
      dispatch(fetchConnectionsByThought(id));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this thought?')) {
      await dispatch(deleteThought(id!));
      navigate('/thoughts');
    }
  };

  const handleCreateConnection = async () => {
    if (id && newConnection.targetThoughtId) {
      await dispatch(createConnection({
        sourceThoughtId: id,
        targetThoughtId: newConnection.targetThoughtId,
        connectionType: newConnection.connectionType as any,
        description: newConnection.description,
        strength: newConnection.strength,
      }));
      setConnectionDialog(false);
      setNewConnection({ targetThoughtId: '', connectionType: 'RelatesTo', description: '', strength: 1 });
      dispatch(fetchConnectionsByThought(id));
    }
  };

  if (loading || !thought) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  const connectionTypes = [
    'RelatesTo', 'EvolvesFrom', 'Contradicts', 'Implements',
    'GroupsWith', 'References', 'Continues', 'Replaces'
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/thoughts')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {thought.title}
        </Typography>
        <IconButton onClick={() => navigate(`/thoughts/${id}/edit`)}>
          <Edit />
        </IconButton>
        <IconButton color="error" onClick={handleDelete}>
          <Delete />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Metadata */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <Psychology fontSize="large" />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip
                    icon={<Category />}
                    label={thought.category}
                    color="primary"
                    variant="outlined"
                  />
                  {thought.tags?.map((tag: string) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating value={thought.importance} readOnly />
                  <Typography variant="caption" color="text.secondary">
                    <CalendarToday fontSize="small" sx={{ fontSize: 14, mr: 0.5 }} />
                    {new Date(thought.createdAt).toLocaleDateString()}
                  </Typography>
                  {thought.updatedAt !== thought.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      <History fontSize="small" sx={{ fontSize: 14, mr: 0.5 }} />
                      Updated {new Date(thought.updatedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Content Tabs */}
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Content" />
              <Tab label={`Connections (${connections.length})`} />
              <Tab label="Tasks" />
              <Tab label="History" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {thought.content}
              </Typography>
              
              {thought.attachments && thought.attachments.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <AttachFile sx={{ mr: 1 }} />
                    Attachments
                  </Typography>
                  <List>
                    {thought.attachments.map((attachment: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar>
                            <AttachFile />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={attachment.name} secondary={attachment.size} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Thought Connections
                </Typography>
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() => setConnectionDialog(true)}
                >
                  Add Connection
                </Button>
              </Box>
              
              {connections.length > 0 ? (
                <List>
                  {connections.map((connection) => {
                    const isSource = connection.sourceThoughtId === id;
                    const connectedThoughtId = isSource 
                      ? connection.targetThoughtId 
                      : connection.sourceThoughtId;
                    
                    return (
                      <motion.div
                        key={connection.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <ListItem
                          sx={{
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            mb: 1,
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => navigate(`/thoughts/${connectedThoughtId}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <Hub />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">
                                  {isSource ? 'Connects to' : 'Connected from'} Thought
                                </Typography>
                                <Chip
                                  label={connection.connectionType}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={connection.description || 'No description'}
                          />
                          <IconButton>
                            <LinkIcon />
                          </IconButton>
                        </ListItem>
                      </motion.div>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Hub sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    No connections yet
                  </Typography>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                <Assignment sx={{ mr: 1 }} />
                Related Tasks
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  No tasks created from this thought yet
                </Typography>
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Create Task
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                <History sx={{ mr: 1 }} />
                Version History
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <History />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Original version"
                    secondary={new Date(thought.createdAt).toLocaleString()}
                  />
                </ListItem>
                {thought.updatedAt !== thought.createdAt && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Edit />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Last updated"
                      secondary={new Date(thought.updatedAt).toLocaleString()}
                    />
                  </ListItem>
                )}
              </List>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  startIcon={<Edit />}
                  variant="outlined"
                  onClick={() => navigate(`/thoughts/${id}/edit`)}
                >
                  Edit Thought
                </Button>
                <Button
                  fullWidth
                  startIcon={<Hub />}
                  variant="outlined"
                  onClick={() => setConnectionDialog(true)}
                >
                  Add Connection
                </Button>
                <Button
                  fullWidth
                  startIcon={<Assignment />}
                  variant="outlined"
                >
                  Create Task
                </Button>
                <Button
                  fullWidth
                  startIcon={<Share />}
                  variant="outlined"
                >
                  Share
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Connections"
                    secondary={connections.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Word Count"
                    secondary={thought.content.split(' ').length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Character Count"
                    secondary={thought.content.length}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Connection Dialog */}
      <Dialog open={connectionDialog} onClose={() => setConnectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Connection</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Connection Type</InputLabel>
            <Select
              value={newConnection.connectionType}
              onChange={(e) => setNewConnection({ ...newConnection, connectionType: e.target.value })}
              label="Connection Type"
            >
              {connectionTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Target Thought ID"
            value={newConnection.targetThoughtId}
            onChange={(e) => setNewConnection({ ...newConnection, targetThoughtId: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (optional)"
            value={newConnection.description}
            onChange={(e) => setNewConnection({ ...newConnection, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectionDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateConnection} variant="contained">
            Create Connection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThoughtDetail;