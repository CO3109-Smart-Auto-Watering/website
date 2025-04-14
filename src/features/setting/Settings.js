import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  Avatar, IconButton, Switch, FormControlLabel, Divider,
  Snackbar, Alert, useMediaQuery, Tab, Tabs, CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
  PhotoCamera, Save, Palette, VolumeUp, Notifications,
  Security, DarkMode, LightMode, Person, WbSunny, NightsStay
} from '@mui/icons-material';
import axios from 'axios';
import { useThemeContext } from '../../context/ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Styled components for enhanced visual appearance
const SettingsCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 50px -12px rgba(0,0,0,0.15)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30%',
    height: '5px',
    background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0)}, ${theme.palette.primary.main})`,
    borderTopRightRadius: 16,
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  border: `4px solid ${theme.palette.background.paper}`,
  margin: '0 auto',
}));

const ChangeAvatarButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 5,
  right: 5,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const ThemeToggleButton = styled(Button)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.divider, 0.1),
  '&:hover': {
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.divider, 0.2),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.2s',
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
  },
}));

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentTheme, toggleTheme } = useThemeContext();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // User profile settings
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null,
    notifyWatering: true,
    notifySystem: true,
    soundEnabled: true,
    darkMode: currentTheme === 'dark',
  });

  // Security settings
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Update profile darkMode when theme changes
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      darkMode: currentTheme === 'dark'
    }));
  }, [currentTheme]);

  const fetchUserData = async () => {
    try {
      setDataLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Bạn chưa đăng nhập', 'error');
        setDataLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.data.success) {
        const userData = response.data.user;
        
        setProfile(prev => ({
          ...prev,
          name: userData.name || prev.name,
          email: userData.email || prev.email,  
          phone: userData.phone || prev.phone,
          avatar: userData.avatar || prev.avatar,
          notifyWatering: userData.preferences?.notifyWatering ?? prev.notifyWatering,
          notifySystem: userData.preferences?.notifySystem ?? prev.notifySystem,
          soundEnabled: userData.preferences?.soundEnabled ?? prev.soundEnabled,
        }));
        
        // Save username to localStorage for other components
        localStorage.setItem('username', userData.name);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showSnackbar('Không thể tải thông tin người dùng', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (event) => {
    const { name, value, checked } = event.target;
    setProfile({
      ...profile,
      [name]: name === 'notifyWatering' || name === 'notifySystem' || name === 'soundEnabled' || name === 'darkMode' 
        ? checked 
        : value
    });
  };

  const handleSecurityChange = (event) => {
    const { name, value } = event.target;
    setSecurity({
      ...security,
      [name]: value
    });
  };

  const handleAvatarChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setProfile({
          ...profile,
          avatar: e.target.result
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (isDark) => {
    // Update profile state
    setProfile({
      ...profile,
      darkMode: isDark
    });
    
    // Use the context function to update theme globally
    toggleTheme(isDark);
    
    // Show notification
    showSnackbar(`Đã chuyển sang chế độ ${isDark ? 'tối' : 'sáng'}`, 'success');
  };

  const saveProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        showSnackbar('Bạn chưa đăng nhập', 'error');
        return;
      }
      
      const profileData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar,
        preferences: {
          notifyWatering: profile.notifyWatering,
          notifySystem: profile.notifySystem,
          soundEnabled: profile.soundEnabled
        }
      };
      
      const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Save to localStorage for other components
        localStorage.setItem('username', profile.name);
        
        showSnackbar('Thông tin cá nhân đã được cập nhật', 'success');
      } else {
        showSnackbar('Không thể cập nhật thông tin', 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showSnackbar('Lỗi khi cập nhật thông tin', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      showSnackbar('Mật khẩu mới không khớp', 'error');
      return;
    }

    if (security.newPassword.length < 6) {
      showSnackbar('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        showSnackbar('Bạn chưa đăng nhập', 'error');
        return;
      }
      
      const passwordData = {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword
      };
      
      const response = await axios.put(`${API_URL}/auth/change-password`, passwordData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        showSnackbar('Mật khẩu đã được cập nhật', 'success');
        
        setSecurity({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showSnackbar(response.data.message || 'Không thể cập nhật mật khẩu', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi đổi mật khẩu';
      showSnackbar(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
            Cài đặt hệ thống
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" align="center" mb={5}>
            Điều chỉnh cài đặt để phù hợp với nhu cầu của bạn
          </Typography>
        </motion.div>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
          sx={{ 
            mb: 4,
            '& .MuiTab-root': {
              borderRadius: '12px 12px 0 0',
              minHeight: 60,
            }
          }}
        >
          <Tab 
            icon={<Person />} 
            label="Hồ sơ cá nhân" 
            iconPosition="start" 
          />
          <Tab 
            icon={<Palette />} 
            label="Giao diện" 
            iconPosition="start" 
          />
          <Tab 
            icon={<Security />} 
            label="Bảo mật" 
            iconPosition="start" 
          />
        </Tabs>

        {/* Profile Tab */}
        {tabValue === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SettingsCard>
              {dataLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box position="relative" sx={{ mb: 5, textAlign: 'center' }}>
                    <StyledAvatar 
                      src={profile.avatar || '/avatar-placeholder.png'} 
                      alt={profile.name}
                    />
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="avatar-upload"
                        type="file"
                        onChange={handleAvatarChange}
                      />
                      <label htmlFor="avatar-upload">
                        <ChangeAvatarButton size="small" component="span">
                          <PhotoCamera fontSize="small" />
                        </ChangeAvatarButton>
                      </label>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        label="Tên hiển thị"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        label="Số điện thoại"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        type="email"
                        disabled
                      />
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" gutterBottom>
                    Thông báo
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.notifyWatering}
                            onChange={handleProfileChange}
                            name="notifyWatering"
                            color="primary"
                          />
                        }
                        label="Thông báo khi hệ thống tưới cây"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.notifySystem}
                            onChange={handleProfileChange}
                            name="notifySystem"
                            color="primary"
                          />
                        }
                        label="Thông báo về trạng thái hệ thống"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.soundEnabled}
                            onChange={handleProfileChange}
                            name="soundEnabled"
                            color="primary"
                          />
                        }
                        label="Âm thanh thông báo"
                      />
                    </Grid>
                  </Grid>

                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                      onClick={saveProfile}
                      disabled={isLoading}
                      sx={{ 
                        borderRadius: 8, 
                        px: 3,
                        boxShadow: '0 8px 16px rgba(65, 157, 120, 0.2)',
                      }}
                    >
                      {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </Box>
                </>
              )}
            </SettingsCard>
          </motion.div>
        )}

        {/* Appearance Tab */}
        {tabValue === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SettingsCard>
              <Typography variant="h6" gutterBottom>
                Giao diện hiển thị
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Chọn giao diện phù hợp với sở thích của bạn
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <ThemeToggleButton
                    fullWidth
                    selected={currentTheme === 'light'}
                    onClick={() => handleThemeChange(false)}
                    startIcon={<WbSunny />}
                  >
                    Chế độ sáng
                  </ThemeToggleButton>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ThemeToggleButton
                    fullWidth
                    selected={currentTheme === 'dark'}
                    onClick={() => handleThemeChange(true)}
                    startIcon={<NightsStay />}
                  >
                    Chế độ tối
                  </ThemeToggleButton>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" gutterBottom>
                Cài đặt thiết bị
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.soundEnabled}
                        onChange={handleProfileChange}
                        name="soundEnabled"
                        color="primary"
                      />
                    }
                    label="Âm thanh thiết bị"
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={saveProfile}
                  disabled={isLoading}
                  sx={{ 
                    borderRadius: 8, 
                    px: 3,
                    boxShadow: '0 8px 16px rgba(65, 157, 120, 0.2)',
                  }}
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            </SettingsCard>
          </motion.div>
        )}

        {/* Security Tab */}
        {tabValue === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SettingsCard>
              <Typography variant="h6" gutterBottom>
                Thay đổi mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Mật khẩu mạnh giúp bảo vệ tài khoản của bạn tốt hơn
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    type="password"
                    value={security.currentPassword}
                    onChange={handleSecurityChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Mật khẩu mới"
                    name="newPassword"
                    type="password"
                    value={security.newPassword}
                    onChange={handleSecurityChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    type="password"
                    value={security.confirmPassword}
                    onChange={handleSecurityChange}
                    error={security.newPassword !== security.confirmPassword && security.confirmPassword !== ''}
                    helperText={security.newPassword !== security.confirmPassword && security.confirmPassword !== '' ? "Mật khẩu không khớp" : ""}
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Security />}
                  onClick={changePassword}
                  disabled={isLoading || !security.currentPassword || !security.newPassword || !security.confirmPassword}
                  sx={{ 
                    borderRadius: 8, 
                    px: 3,
                    boxShadow: '0 8px 16px rgba(65, 157, 120, 0.2)',
                  }}
                >
                  {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </Button>
              </Box>
            </SettingsCard>
          </motion.div>
        )}
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;