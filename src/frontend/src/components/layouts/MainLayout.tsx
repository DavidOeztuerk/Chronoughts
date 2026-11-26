import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Psychology,
  Timeline,
  Hub,
  Person,
  Logout,
  Brightness4,
  Brightness7,
  Add,
  Notifications,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const drawerWidth = 240;

interface ThemeContext {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const MainLayout: React.FC = () => {
  const { toggleTheme, isDarkMode } = useOutletContext<ThemeContext>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Thoughts', icon: <Psychology />, path: '/thoughts' },
    { text: 'Timeline', icon: <Timeline />, path: '/timeline' },
    { text: 'Connections', icon: <Hub />, path: '/connections' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Psychology sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" noWrap component="div">
          Chronoughts
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Chronoughts'}
          </Typography>

          <Tooltip title="New Thought">
            <IconButton
              color="inherit"
              onClick={() => navigate('/thoughts/new')}
              sx={{ mr: 1 }}
            >
              <Add />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {toggleTheme && (
            <Tooltip title="Toggle Theme">
              <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Account">
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          <Typography variant="body2">
            {user?.email}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet context={{ toggleTheme, isDarkMode }} />
      </Box>
    </Box>
  );
};

export default MainLayout;