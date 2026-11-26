import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Psychology,
  Timeline,
  Hub,
  Assignment,
  CalendarToday,
  ArrowForward,
  Star,
  AccessTime,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { fetchThoughts, fetchStats, fetchActivity } from '../store/slices/thoughtsSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { thoughts, stats, activity, loading } = useSelector((state: RootState) => state.thoughts);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchThoughts({ limit: 5 }));
    dispatch(fetchStats());
    dispatch(fetchActivity(5));
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Thoughts',
      value: stats?.totalThoughts || thoughts.length || 0,
      icon: <Psychology />,
      color: '#667eea',
      trend: '+12%',
    },
    {
      title: 'Connections',
      value: stats?.totalConnections || 0,
      icon: <Hub />,
      color: '#764ba2',
      trend: '+8%',
    },
    {
      title: 'Active Tasks',
      value: stats?.activeTasks || 0,
      icon: <Assignment />,
      color: '#f093fb',
      trend: '+5%',
    },
    {
      title: 'This Week',
      value: stats?.weeklyThoughts || thoughts.filter(t => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(t.createdAt) >= weekAgo;
      }).length || 0,
      icon: <CalendarToday />,
      color: '#4facfe',
      trend: '+23%',
    },
  ];

  const recentThoughts = thoughts.slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Welcome back, {user?.firstName || user?.username}!
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${stat.color}22 0%, ${stat.color}44 100%)`,
                  border: `1px solid ${stat.color}33`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: stat.color,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={stat.trend}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {/* Recent Thoughts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Psychology sx={{ mr: 1 }} />
              <Typography variant="h6">Recent Thoughts</Typography>
              <Tooltip title="View All">
                <IconButton sx={{ ml: 'auto' }} href="/thoughts">
                  <ArrowForward />
                </IconButton>
              </Tooltip>
            </Box>
            
            <List>
              {recentThoughts.map((thought, index) => (
                <motion.div
                  key={thought.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItem
                    sx={{
                      mb: 1,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Psychology />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={thought.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={thought.category}
                            size="small"
                            variant="outlined"
                          />
                          {thought.importance > 3 && (
                            <Star fontSize="small" sx={{ color: 'warning.main' }} />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            <AccessTime fontSize="small" sx={{ fontSize: 14, mr: 0.5 }} />
                            {new Date(thought.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Activity Timeline */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Timeline sx={{ mr: 1 }} />
              <Typography variant="h6">Activity</Typography>
            </Box>
            
            <List dense>
              {activity && activity.length > 0 ? (
                activity.map((item: any, index: number) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ListItem>
                      <ListItemText
                        primary={item.description}
                        secondary={new Date(item.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  </motion.div>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No recent activity"
                    secondary="Start creating thoughts to see activity"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => window.location.href = '/thoughts/new'}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology color="primary" />
                    <Typography>New Thought</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => window.location.href = '/timeline'}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timeline color="primary" />
                    <Typography>View Timeline</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => window.location.href = '/connections'}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Hub color="primary" />
                    <Typography>Explore Connections</Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;