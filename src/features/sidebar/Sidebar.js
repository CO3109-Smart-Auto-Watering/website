import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, List, ListItem, ListItemIcon, ListItemText, Typography,
  Divider, Avatar, Tooltip, useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard, Schedule, DevicesOther, Assessment, 
  Settings, Logout, WbSunny, NightsStay, Grass
} from '@mui/icons-material';
import { useThemeContext } from '../../context/ThemeContext';
import { getCurrentUser } from '../../services/authService'; // Import getUserProfile

// Styled components with MUI
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 260,
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  background: theme.palette.mode === 'dark' 
    ? theme.palette.background.paper 
    : '#fff',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1000,
  transition: 'background-color 0.3s ease',
  borderRight: `1px solid ${theme.palette.divider}`,
  
  '@media (max-width: 768px)': {
    display: 'none'
  }
}));

const Logo = styled(Box)({
  padding: '20px',
  textAlign: 'center',
  marginBottom: '10px',
});

const UserSection = styled(Box)({
  padding: '10px 20px',
  display: 'flex',
  alignItems: 'center',
  margin: '10px 0',
});

const MenuItems = styled(List)({
  padding: '10px 0',
  flexGrow: 1,
});

const MenuItem = styled(ListItem)(({ active, theme }) => ({
  padding: '12px 20px',
  cursor: 'pointer',
  marginBottom: '5px',
  borderRadius: '0 20px 20px 0',
  backgroundColor: active ? 
    theme.palette.primary.main : 'transparent',
  color: active ? '#fff' : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: active ? 
      theme.palette.primary.main : 
      theme.palette.action.hover,
  },
  transition: 'background-color 0.2s',
  marginRight: '10px',
}));

const BottomSection = styled(Box)({
  padding: '20px',
});

const SidebarLogo = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.2rem',
  color: theme.palette.primary.main,
}));

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { toggleTheme, currentTheme } = useThemeContext();
  const username = localStorage.getItem('username') || 'User';

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await getCurrentUser();
        if (response && response.user) {
          // Lưu ý: API auth/me thường trả về dữ liệu trong một field "user"
          setUserProfile(response.user);
          console.log("Đã tải thành công thông tin người dùng:", response.user);
        } else {
          // Fallback to localStorage if API fails
          const storedUsername = localStorage.getItem('username');
          setUserProfile({ name: storedUsername || 'User', role: 'User' });
          console.log("Không thể tải thông tin từ API, sử dụng localStorage");
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
        const storedUsername = localStorage.getItem('username');
        setUserProfile({ name: storedUsername || 'User', role: 'User' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  const menuItems = [
    { title: 'Bảng điều khiển', icon: <Dashboard />, path: '/dashboard' },
    { title: 'Lịch tưới', icon: <Schedule />, path: '/schedules' },
    { title: 'Thiết bị', icon: <DevicesOther />, path: '/devices' },
    { title: 'Khu vực', icon: <Grass />, path: '/areas'},    
    { title: 'Thống kê', icon: <Assessment />, path: '/reports' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };
  
  const handleThemeToggle = () => {
    toggleTheme(currentTheme === 'light');
  };

  return (
    <SidebarContainer>
      <Logo>
        <SidebarLogo variant="h5">
          GreenGuardian
        </SidebarLogo>
      </Logo>
      
      <UserSection>
        <Avatar 
           alt={userProfile?.name || userProfile?.username || 'User'}
           src={userProfile?.avatar || "/avatar-placeholder.png"} 
           sx={{ width: 40, height: 40 }}
        />
        <Box ml={2}>
        <Typography variant="subtitle2">
          {userProfile?.name || userProfile?.username || 'User'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {userProfile?.email || 'User'}
        </Typography>
        </Box>
      </UserSection>
      
      <Divider />
      
      <MenuItems>
        {menuItems.map((item) => (
          <MenuItem 
            key={item.path}
            active={location.pathname === item.path ? 1 : 0}
            onClick={() => handleNavigate(item.path)}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? 'white' : theme.palette.text.primary,
              minWidth: '40px'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </MenuItem>
        ))}
      </MenuItems>
      
      <Box flexGrow={1} />
      
      <BottomSection>
        <Divider sx={{ mb: 2 }} />
        <MenuItem 
          onClick={() => handleNavigate('/settings')}
          active={location.pathname === '/settings' ? 1 : 0}
        >
          <ListItemIcon sx={{ 
            color: location.pathname === '/settings' ? 'white' : theme.palette.text.primary,
            minWidth: '40px' 
          }}>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Cài đặt" />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: '40px' }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </MenuItem>
      </BottomSection>
    </SidebarContainer>
  );
};

export default Sidebar;