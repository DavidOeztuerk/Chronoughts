import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Alert,
  CircularProgress,
  IconButton,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  Email,
  Psychology,
  Notifications,
  Security,
  Save,
  PhotoCamera,
  Edit,
  TrendingUp,
  Hub,
  Assignment,
  EmojiEvents,
  Timeline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { updateProfile } from '../store/slices/authSlice';

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

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.thoughts);
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    bio: user?.bio || '',
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en',
    publicProfile: false,
  });

  const [success, setSuccess] = useState(false);

  const handleProfileUpdate = async () => {
    try {
      await dispatch(updateProfile(profileData)).unwrap();
      setSuccess(true);
      setEditMode(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const achievements = [
    { icon: <Psychology />, title: 'Deep Thinker', description: 'Created 100+ thoughts', progress: 75 },
    { icon: <Hub />, title: 'Connector', description: 'Made 50+ connections', progress: 60 },
    { icon: <Timeline />, title: 'Consistent', description: '30-day streak', progress: 40 },
    { icon: <EmojiEvents />, title: 'Top Contributor', description: 'Most active this month', progress: 100 },
  ];

  const activityData = [
    { label: 'Thoughts Created', value: stats?.totalThoughts || 0 },
    { label: 'Connections Made', value: stats?.totalConnections || 0 },
    { label: 'Tasks Completed', value: stats?.completedTasks || 0 },
    { label: 'Active Days', value: stats?.activeDays || 0 },
  ];

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
                component="label"
              >
                <PhotoCamera fontSize="small" />
                <input type="file" hidden accept="image/*" />
              </IconButton>
            }
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </Badge>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              @{user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Button
            variant={editMode ? 'contained' : 'outlined'}
            startIcon={editMode ? <Save /> : <Edit />}
            onClick={() => editMode ? handleProfileUpdate() : setEditMode(true)}
            disabled={loading}
          >
            {editMode ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </Box>
      </Paper>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Profile" />
          <Tab label="Activity" />
          <Tab label="Achievements" />
          <Tab label="Settings" />
        </Tabs>
      </Paper>

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={profileData.username}
                    disabled
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!editMode}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <List dense>
                  {activityData.map((item) => (
                    <ListItem key={item.label}>
                      <ListItemText
                        primary={item.label}
                        secondary={item.value}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Activity Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {activityData.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={item.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUp sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="h4">{item.value}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Psychology />
              </ListItemIcon>
              <ListItemText
                primary="Created new thought"
                secondary="2 hours ago"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Hub />
              </ListItemIcon>
              <ListItemText
                primary="Connected 2 thoughts"
                secondary="5 hours ago"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Assignment />
              </ListItemIcon>
              <ListItemText
                primary="Completed task"
                secondary="Yesterday"
              />
            </ListItem>
          </List>
        </Paper>
      </TabPanel>

      {/* Achievements Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {achievements.map((achievement, index) => (
            <Grid item xs={12} sm={6} md={3} key={achievement.title}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: achievement.progress === 100 ? 'success.main' : 'grey.400',
                      margin: '0 auto',
                      mb: 2,
                    }}
                  >
                    {achievement.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {achievement.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {achievement.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={achievement.progress}
                      color={achievement.progress === 100 ? 'success' : 'primary'}
                    />
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Notifications sx={{ mr: 1 }} />
                Notifications
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive updates via email"
                  />
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Browser push notifications"
                  />
                  <Switch
                    checked={preferences.pushNotifications}
                    onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Security sx={{ mr: 1 }} />
                Privacy
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Public Profile"
                    secondary="Allow others to view your profile"
                  />
                  <Switch
                    checked={preferences.publicProfile}
                    onChange={(e) => setPreferences({ ...preferences, publicProfile: e.target.checked })}
                  />
                </ListItem>
                <ListItem>
                  <Button variant="outlined" fullWidth>
                    Change Password
                  </Button>
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="error">
                Danger Zone
              </Typography>
              <Button variant="outlined" color="error">
                Delete Account
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Profile;