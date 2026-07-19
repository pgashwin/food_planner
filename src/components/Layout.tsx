import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { DRAWER_WIDTH } from '../theme/theme';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: <HomeRoundedIcon /> },
  { path: '/pantry', label: 'Pantry', icon: <KitchenRoundedIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsRoundedIcon /> },
];

function SideNav({ currentPath }: { currentPath: string }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5, py: 2, gap: 1.5 }}>
        <RestaurantMenuRoundedIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" color="primary" sx={{ lineHeight: 1.2 }}>
            Food Planner
          </Typography>
          <Typography variant="caption" color="text.secondary">
            What&apos;s for the next meal?
          </Typography>
        </Box>
      </Toolbar>

      <List sx={{ px: 1, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const selected =
            item.path === '/'
              ? currentPath === '/'
              : currentPath.startsWith(item.path);

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontWeight: selected ? 600 : 400 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const currentNavIndex = NAV_ITEMS.findIndex((item) =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path),
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          <SideNav currentPath={location.pathname} />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          pb: isDesktop ? 3 : 10,
        }}
      >
        {!isDesktop && (
          <Box
            sx={{
              px: 2,
              py: 2,
              bgcolor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantMenuRoundedIcon color="primary" />
              <Box>
                <Typography variant="h6" color="primary" sx={{ lineHeight: 1.2 }}>
                  Food Planner
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  What&apos;s for the next meal?
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
          {children}
        </Box>
      </Box>

      {!isDesktop && (
        <BottomNavigation
          value={currentNavIndex >= 0 ? currentNavIndex : 0}
          onChange={(_, value) => navigate(NAV_ITEMS[value].path)}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            bgcolor: 'background.paper',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}
