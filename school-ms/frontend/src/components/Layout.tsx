import {
    AccountCircle,
    HowToReg as AdmissionsIcon,
  Assessment as AssessmentIcon,
    Book,
  MenuBook as MenuBookIcon,
    Dashboard,
    EventAvailable,
    AttachMoney as FeeIcon,
    ExitToApp as LogoutIcon,
    Menu as MenuIcon,
    People
} from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Box,
    Chip,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';

interface LayoutProps {
  children: ReactNode;
}

const DRAWER_WIDTH = 240;

const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STAFF: 'STAFF',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
  PRINCIPAL: 'PRINCIPAL',
  LIBRARIAN: 'LIBRARIAN',
};

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  allowedRoles: string[];
}

const menuItems: MenuItem[] = [
  { 
    text: 'Dashboard', 
    icon: <Dashboard />, 
  path: '/dashboard',
  allowedRoles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF, ROLES.PARENT, ROLES.STUDENT, ROLES.LIBRARIAN]
  },
  { 
    text: 'Admissions', 
    icon: <AdmissionsIcon />, 
    path: '/admissions',
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF]
  },
  { 
    text: 'Students', 
    icon: <People />, 
    path: '/students',
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF]
  },  { 
    text: 'Staff', 
    icon: <People />, 
    path: '/staff',
    allowedRoles: [ROLES.ADMIN]
  },
  /* Courses tab hidden per requirement
  { 
    text: 'Courses', 
    icon: <Book />, 
    path: '/consolidated-courses',
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER]
  },*/  
  { 
    text: 'Staff Attendance', 
    icon: <EventAvailable />, 
    path: '/staff-attendance',
  allowedRoles: [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.STAFF, ROLES.LIBRARIAN]
  },
  { 
    text: 'Student Attendance', 
    icon: <EventAvailable />, 
    path: '/student-attendance',
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER]
  },
  { 
    text: 'Timetable', 
    icon: <EventAvailable />, 
    path: '/timetable',
    allowedRoles: [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER]
  },
  { 
    text: 'Examinations', 
    icon: <Book />, 
    path: '/exams',
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL]
  },
  { 
    text: 'Library', 
    icon: <MenuBookIcon />, 
    path: '/library',
  allowedRoles: [ROLES.ADMIN, ROLES.LIBRARIAN]
  },
  { 
    text: 'Fee Management', 
    icon: <FeeIcon />, 
    path: '/fees',
    allowedRoles: [ROLES.ADMIN]
  },
  { 
    text: 'Reports', 
    icon: <AssessmentIcon />, 
    path: '/reports',
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STAFF]
  },
];

const Layout = ({ children }: LayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    item => user && user.role && item.allowedRoles.includes(user.role)
  );

  const drawer = (
    <div>
      <Toolbar />
      <List>
    {filteredMenuItems.map((item) => (
          <ListItem 
            button 
      key={item.path} 
            onClick={() => {
              // If already on dashboard, trigger a soft refresh instead of navigating
              if (item.path === '/dashboard' && window.location.pathname === '/dashboard') {
                window.dispatchEvent(new CustomEvent('dashboard:refresh'));
              } else {
                navigate(item.path);
              }
              setDrawerOpen(false);
            }}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%',
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
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center', 
              fontSize: { xs: '1rem', sm: '1.25rem' } 
            }}
          >
            School Management System
              {/* Connection Status Indicator */}
            <Tooltip title="Backend connection status">
              <Box sx={{ ml: 2, display: { xs: 'none', sm: 'flex' } }}>
                <ConnectionStatusIndicator />
              </Box>
            </Tooltip>
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>            {/* Mobile view of connection status */}
            <Box sx={{ mr: 2, display: { xs: 'flex', sm: 'none' } }}>
              <ConnectionStatusIndicator />
            </Box>
            
            {user && (
              <>
                <Chip
                  label={user.role}
                  color="secondary"
                  size="small"
                  sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
                />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mr: 2,
                    display: { xs: 'none', sm: 'block' },
                    maxWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.username || user.email}
                </Typography>
              </>
            )}
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              edge="end"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>      </Menu>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            backgroundColor: 'background.paper',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: '100%', sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, sm: 0 },
          height: '100%',
          overflow: 'auto',
        }}
      >
        <Toolbar /> {/* This creates space at the top to account for the AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;