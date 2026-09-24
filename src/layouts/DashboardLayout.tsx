import { Suspense, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LoadingScreen } from '../components/loading-screen';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAuth } from '../auth/AuthContext';
import { useThemeMode } from '../theme/ThemeModeContext';

const DRAWER_WIDTH = 280;

const nav = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Customers', path: '/customers', icon: <PeopleIcon /> },
  { label: 'Customer Types', path: '/customer-types', icon: <CategoryIcon /> },
  { label: 'Purchases', path: '/purchases', icon: <ReceiptLongIcon /> },
  { label: 'Leaderboard', path: '/leaderboard', icon: <LeaderboardIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  { label: 'Admins', path: '/admins', icon: <AdminPanelSettingsIcon /> },
];

export default function DashboardLayout() {
  const { admin, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}>
      <Box sx={{ px: 2.5, mb: 2.5 }}>
        <Typography variant="h6" sx={{ color: 'secondary.main', letterSpacing: 0.5 }}>
          Lala Traders
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Wholesale purchase tracker
        </Typography>
      </Box>
      <List sx={{ px: 1.5, flex: 1 }}>
        {nav.map((item) => {
          const selected =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                minHeight: 44,
                '&.Mui-selected': {
                  bgcolor: 'rgba(0,167,111,0.12)',
                  color: 'secondary.main',
                  '& .MuiListItemIcon-root': { color: 'secondary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: '1px dashed',
          borderColor: 'divider',
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? 'rgba(22,28,36,0.8)' : 'rgba(249,250,251,0.8)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }} />
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleMode} aria-label="Toggle color mode">
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Account menu">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: 14 }}>
              {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem disabled>{admin?.email}</MenuItem>
            <MenuItem
              onClick={() => {
                setAnchor(null);
                logout();
                navigate('/login');
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          maxWidth: '100%',
          mt: { xs: 7, sm: 8 },
          overflowX: 'hidden',
        }}
      >
        <Suspense fallback={<LoadingScreen portal />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
