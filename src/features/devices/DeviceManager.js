
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, IconButton, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Tabs, Tab, Tooltip, useTheme, Switch, FormControlLabel, Snackbar, Alert,
  CircularProgress, MenuItem, Select, FormControl, InputLabel, Divider,
  List, ListItem, ListItemText, ListItemIcon, Card, CardContent, InputAdornment,
  LinearProgress, RadioGroup, Radio, FormLabel, useMediaQuery
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  DevicesOther, Add, Edit, Delete, Search, Refresh,
  MoreVert, SignalCellularAlt, Battery90, Battery50, Battery20,
  ArrowUpward, ArrowDownward, Settings, Wifi, WifiOff, Warning,
  CheckCircle, Error, SensorDoor, Thermostat, Opacity, WaterDrop,
  RoomPreferences, LightMode, Grass, LocalFlorist, ViewList, Clear,
  FilterAlt, Dashboard, TuneSharp, AreaChart, Sync
} from '@mui/icons-material';
import { getUserDevices, registerDevice, updateDevice, deleteDevice, toggleDeviceStatus, synchronizeDeviceArea } from '../../services/deviceService';
import { getAreas } from '../../services/areaService';

// Styled components
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '100%',
  overflow: 'hidden'
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    '& > *:not(:last-child)': {
      marginBottom: theme.spacing(2)
    }
  }
}));

const SearchBar = styled(Paper)(({ theme }) => ({
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  width: 400,
  [theme.breakpoints.down('md')]: {
    width: '100%',
  }
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
}));

const DeviceCard = styled(Paper)(({ theme, status, hasArea }) => ({
  padding: theme.spacing(2),
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderLeft: `4px solid ${status === 'online' ? theme.palette.success.main : theme.palette.grey[400]}`,
  borderTop: hasArea ? `4px solid ${theme.palette.primary.main}` : 'none',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start'
});

const DeviceAvatar = styled(Avatar)(({ theme, active }) => ({
  backgroundColor: active ? theme.palette.success.main : theme.palette.grey[400],
  width: 40,
  height: 40
}));

const StyledTable = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.light, 0.1),
  }
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1)
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(5),
  '& svg': {
    fontSize: 60,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2)
  }
}));

const StatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
  backgroundColor: alpha(theme.palette[color].main, 0.1),
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}));

const AreaHeader = styled(Box)(({ theme, isNone }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: isNone ? theme.palette.grey[100] : alpha(theme.palette.primary.main, 0.1),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2)
}));




// Feed types
const FEED_TYPES = [
  { value: 'sensor-temp', label: 'Nhiệt độ', icon: <Thermostat />, color: 'info' },
  { value: 'sensor-soil', label: 'Độ ẩm đất', icon: <Opacity />, color: 'success' },
  { value: 'sensor-humidity', label: 'Độ ẩm không khí', icon: <WaterDrop />, color: 'primary' },
  { value: 'pump-motor', label: 'Bơm nước', icon: <SensorDoor />, color: 'warning' },
  { value: 'mode', label: 'Chế độ', icon: <RoomPreferences />, color: 'secondary' },  
];

const DeviceManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Core states
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [areas, setAreas] = useState([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    // Retrieve saved preference or default to grid view
    return localStorage.getItem('device-view-mode') ? 
      parseInt(localStorage.getItem('device-view-mode')) : 0;
  });
  const [showByArea, setShowByArea] = useState(() => {
    // Retrieve saved preference or default to false
    return localStorage.getItem('device-group-by-area') === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
  const [openPrefsDialog, setOpenPrefsDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, deviceId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sortConfig, setSortConfig] = useState({ key: 'deviceName', direction: 'asc' });
  
  // Form states
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedFeeds, setSelectedFeeds] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedPlantIndex, setSelectedPlantIndex] = useState(-1);
  
  // Filter states
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [filterLinked, setFilterLinked] = useState('all'); // 'all', 'linked', 'unlinked'
  const [filterFeedType, setFilterFeedType] = useState('all'); // 'all' or any feed type
  const [filterAreaId, setFilterAreaId] = useState(''); // '' or area id

  // User preferences
  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem('device-manager-prefs');
    return saved ? JSON.parse(saved) : {
      cardSize: 'medium',
      colorScheme: 'default'
    };
  });

  // Fetch devices from API
  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const response = await getUserDevices();
      if (response.success) {
        console.log("Dữ liệu thiết bị nhận về:", response.devices);
        setDevices(response.devices);
        setFilteredDevices(response.devices);
      } else {
        setSnackbar({
          open: true,
          message: 'Không thể tải danh sách thiết bị',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi tải thiết bị',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch areas
  const fetchAreas = async () => {
    try {
      const response = await getAreas();
      console.log("Dữ liệu khu vực nhận về:", response.areas);
      if (response.success) {
        setAreas(response.areas);
      } else {
        setSnackbar({
          open: true,
          message: 'Không thể tải danh sách khu vực',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi tải khu vực',
        severity: 'error'
      });
    }
  };

  const synchronizeAllDevices = async () => {
    if (devices.length === 0) return;
    
    setIsLoading(true);
    try {
      console.log("Đang đồng bộ tất cả thiết bị...");
      
      for (const device of devices) {
        await synchronizeDeviceArea(device.deviceId);
      }
      
      // Tải lại dữ liệu sau khi đồng bộ
      await fetchDevices();
      await fetchAreas();
      
      setSnackbar({
        open: true,
        message: 'Đã đồng bộ dữ liệu thiết bị-khu vực thành công',
        severity: 'success'
      });
    } catch (error) {
      console.error("Lỗi khi đồng bộ thiết bị:", error);
      setSnackbar({
        open: true,
        message: 'Không thể đồng bộ thiết bị-khu vực',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDevices();
    fetchAreas();
  }, []);


  useEffect(() => {
    localStorage.setItem('device-view-mode', viewMode.toString());
    localStorage.setItem('device-group-by-area', showByArea.toString());
    localStorage.setItem('device-manager-prefs', JSON.stringify(userPreferences));
  }, [viewMode, showByArea, userPreferences]);

  // Search and filter handling
  useEffect(() => {
    let results = devices;
    
    // Apply text search
    if (searchTerm) {
      results = results.filter(device => 
        device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply activity filter
    if (filterActive !== 'all') {
      results = results.filter(device => {
        if (filterActive === 'active') return device.isActive;
        if (filterActive === 'inactive') return !device.isActive;
        return true;
      });
    }
    
    // Apply link status filter
    if (filterLinked !== 'all') {
      results = results.filter(device => {
        if (filterLinked === 'linked') return !!device.areaId;
        if (filterLinked === 'unlinked') return !device.areaId;
        return true;
      });
    }
    
    // Apply feed type filter
    if (filterFeedType !== 'all') {
      results = results.filter(device => 
        device.feeds && device.feeds.includes(filterFeedType)
      );
    }
    
    // Apply area filter
    if (filterAreaId) {
      results = results.filter(device => 
        device.areaId === filterAreaId
      );
    }
    
    setFilteredDevices(results);
  }, [searchTerm, devices, filterActive, filterLinked, filterFeedType, filterAreaId]);

  // Sorting function
  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const sortedData = [...filteredDevices].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredDevices(sortedData);
    setSortConfig({ key, direction });
  };

  // Group devices by area
  const groupDevicesByArea = (devices) => {
    const grouped = {};
    
    // Add unassigned group
    grouped['none'] = {
      name: 'Chưa phân khu vực',
      devices: devices.filter(d => !d.areaId)
    };
    
    // Group by area
    areas.forEach(area => {
      grouped[area._id] = {
        name: area.name,
        devices: devices.filter(d => d.areaId === area._id)
      };
    });
    
    return grouped;
  };

  // Dialog handlers
  const handleOpenDialog = (device = null) => {
    if (device) {
      setSelectedDevice(device);
      setSelectedFeeds(device.feeds || []);
      setSelectedAreaId(device.areaId || '');
      setSelectedPlantIndex(device.plantIndex !== undefined ? device.plantIndex : -1);
    } else {
      setSelectedDevice({
        deviceId: '',
        deviceName: '',
        feeds: []
      });
      setSelectedFeeds([]);
      setSelectedAreaId('');
      setSelectedPlantIndex(-1);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDevice(null);
    setSelectedFeeds([]);
    setSelectedAreaId('');
    setSelectedPlantIndex(-1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilterActive('all');
    setFilterLinked('all');
    setFilterFeedType('all');
    setFilterAreaId('');
    setSearchTerm('');
  };

  // API actions
  const handleSaveDevice = async () => {
    try {
      const areaId = selectedAreaId === "" ? null : selectedAreaId;
    
      const deviceData = {
        ...selectedDevice,
        feeds: selectedFeeds,
        areaId: areaId,
        plantIndex: areaId ? selectedPlantIndex : -1
      };
      
      console.log('Saving device data:', deviceData);
    
      let response;
      if (deviceData.deviceId && selectedDevice._id) {
        response = await updateDevice(deviceData.deviceId, deviceData);
      } else {
        response = await registerDevice(deviceData);
      }
    
      if (response.success) {
        // Gửi thông báo tới AreaManager để cập nhật danh sách thiết bị đã kết nối
        sessionStorage.setItem('area-device-changed', 'true');
        
        // Làm mới dữ liệu
        await fetchDevices();
        
        setSnackbar({
          open: true,
          message: response.message || 'Thiết bị đã được lưu thành công!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Không thể lưu thiết bị',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving device:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi lưu thiết bị',
        severity: 'error'
      });
    } finally {
      handleCloseDialog();
    }
  };

  const handleConfirmDelete = (deviceId) => {
    setConfirmDelete({
      open: true,
      deviceId
    });
  };

  const handleCancelDelete = () => {
    setConfirmDelete({
      open: false,
      deviceId: null
    });
  };

  const handleDeleteDevice = async () => {
    try {
      const deviceId = confirmDelete.deviceId;
      if (!deviceId) return;

      const response = await deleteDevice(deviceId);
      
      if (response.success) {
        sessionStorage.setItem('area-device-changed', 'true');
        fetchDevices();
        setSnackbar({
          open: true,
          message: response.message || 'Thiết bị đã được xóa thành công!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Không thể xóa thiết bị',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi xóa thiết bị',
        severity: 'error'
      });
    } finally {
      handleCancelDelete();
    }
  };

  const handleToggleStatus = async (deviceId) => {
    try {
      const response = await toggleDeviceStatus(deviceId);
      
      if (response.success) {
        // Update local state
        const updatedDevices = devices.map(device => {
          if (device.deviceId === deviceId) {
            return { ...device, isActive: !device.isActive };
          }
          return device;
        });
        
        setDevices(updatedDevices);
        
        // Apply filters to the updated list
        let filtered = updatedDevices;
        if (searchTerm) {
          filtered = filtered.filter(device => 
            device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            device.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setFilteredDevices(filtered);
        
        setSnackbar({
          open: true,
          message: response.message || 'Trạng thái thiết bị đã được cập nhật!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Không thể cập nhật trạng thái thiết bị',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error toggling device status:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi cập nhật trạng thái thiết bị',
        severity: 'error'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedDevice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFeed = (feed) => {
    if (!selectedFeeds.includes(feed)) {
      setSelectedFeeds([...selectedFeeds, feed]);
    }
  };

  const handleRemoveFeed = (feed) => {
    setSelectedFeeds(selectedFeeds.filter(f => f !== feed));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Helper functions
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getFeedIcon = (feedType) => {
    const feed = FEED_TYPES.find(f => f.value === feedType);
    return feed ? feed.icon : <SensorDoor />;
  };

  const getFeedLabel = (feedType) => {
    const feed = FEED_TYPES.find(f => f.value === feedType);
    return feed ? feed.label : feedType;
  };

  const getFeedColor = (feedType) => {
    const feed = FEED_TYPES.find(f => f.value === feedType);
    return feed ? feed.color : 'default';
  };

  // Stats for dashboard
  const getDeviceStats = () => {
    const total = devices.length;
    const active = devices.filter(d => d.isActive).length;
    const linked = devices.filter(d => d.areaId).length;
    
    return { total, active, linked };
  };

  // Dashboard component
  const Dashboard = () => {
    const stats = getDeviceStats();
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="primary">
            <CardContent>
              <Typography variant="overline" color="primary">Tổng số thiết bị</Typography>
              <Typography variant="h3" fontWeight="bold" color="primary.dark">
                {stats.total}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <DevicesOther color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Tất cả thiết bị trong hệ thống
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="success">
            <CardContent>
              <Typography variant="overline" color="success">Đang hoạt động</Typography>
              <Typography variant="h3" fontWeight="bold" color="success.dark">
                {stats.active}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% thiết bị đang hoạt động
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="info">
            <CardContent>
              <Typography variant="overline" color="info">Đã liên kết</Typography>
              <Typography variant="h3" fontWeight="bold" color="info.dark">
                {stats.linked}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Grass color="info" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {stats.total > 0 ? Math.round((stats.linked / stats.total) * 100) : 0}% đã liên kết với khu vực
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="warning">
            <CardContent>
              <Typography variant="overline" color="warning">Khu vực</Typography>
              <Typography variant="h3" fontWeight="bold" color="warning.dark">
                {areas.length}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <AreaChart color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {areas.reduce((acc, area) => acc + (area.plants?.length || 0), 0)} cây trồng
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>
    );
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="bold" 
            display="flex" 
            alignItems="center" 
            gap={1}
          >
            <DevicesOther sx={{ fontSize: isMobile ? 24 : 32 }} />
            Quản lý thiết bị
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Quản lý tất cả thiết bị IoT của bạn
          </Typography>
        </Box>
        
        <Box display="flex" gap={2} alignItems="center" flexWrap={isMobile ? "wrap" : "nowrap"}>
          {!isMobile && (
            <Tabs 
              value={viewMode} 
              onChange={(e, val) => setViewMode(val)}
              sx={{ borderRadius: 1, minHeight: 40 }}
            >
              <Tab 
                icon={<Tooltip title="Dạng lưới"><DevicesOther /></Tooltip>} 
                sx={{ minHeight: 40 }} 
              />
              <Tab 
                icon={<Tooltip title="Dạng danh sách"><ViewList /></Tooltip>} 
                sx={{ minHeight: 40 }} 
              />
            </Tabs>
          )}
          
          {/* Thêm nút Thêm thiết bị mới ở đây */}
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size={isMobile ? "small" : "medium"}
          >
            Thêm thiết bị
          </Button>
          
          {isMobile && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={viewMode === 0 ? <ViewList /> : <DevicesOther />}
              onClick={() => setViewMode(viewMode === 0 ? 1 : 0)}
              size="small"
              fullWidth
            >
              {viewMode === 0 ? "Dạng danh sách" : "Dạng lưới"}
            </Button>
          )}
        </Box>
      </PageHeader>

      {/* Dashboard */}
      {!isLoading && <Dashboard />}

      {/* Search and filters */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: isTablet ? 'column' : 'row', 
          justifyContent: 'space-between', 
          alignItems: isTablet ? 'stretch' : 'center', 
          mb: 3, 
          gap: 2 
        }}
      >
        <SearchBar sx={{ width: isTablet ? '100%' : 400 }}>
          <IconButton sx={{ p: 1 }} aria-label="search">
            <Search />
          </IconButton>
          <StyledInput
            placeholder="Tìm kiếm thiết bị..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="standard"
          />
          {searchTerm && (
            <IconButton sx={{ p: 1 }} onClick={() => setSearchTerm('')}>
              <Clear />
            </IconButton>
          )}
        </SearchBar>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button 
            startIcon={<FilterAlt />} 
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={() => setOpenFiltersDialog(true)}
          >
            Bộ lọc
          </Button>
          
          <Button 
            startIcon={<Refresh />} 
            onClick={fetchDevices}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
          >
            Làm mới
          </Button>
        </Box>
      </Box>

      {/* Active filter chips */}
      {(filterActive !== 'all' || filterLinked !== 'all' || filterFeedType !== 'all' || filterAreaId) && (
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Typography variant="body2" color="text.secondary" alignSelf="center">
            Bộ lọc đang áp dụng:
          </Typography>
          
          {filterActive !== 'all' && (
            <Chip
              label={filterActive === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
              onDelete={() => setFilterActive('all')}
              color={filterActive === 'active' ? 'success' : 'default'}
              size="small"
            />
          )}
          
          {filterLinked !== 'all' && (
            <Chip
              label={filterLinked === 'linked' ? 'Đã liên kết' : 'Chưa liên kết'}
              onDelete={() => setFilterLinked('all')}
              color={filterLinked === 'linked' ? 'info' : 'default'}
              size="small"
            />
          )}
          
          {filterFeedType !== 'all' && (
            <Chip
              icon={getFeedIcon(filterFeedType)}
              label={getFeedLabel(filterFeedType)}
              onDelete={() => setFilterFeedType('all')}
              color={getFeedColor(filterFeedType)}
              size="small"
            />
          )}
          
          {filterAreaId && (
            <Chip
              icon={<Grass />}
              label={areas.find(a => a._id === filterAreaId)?.name || 'Khu vực'}
              onDelete={() => setFilterAreaId('')}
              color="primary"
              size="small"
            />
          )}
          
          <Button 
            variant="text" 
            size="small" 
            onClick={handleResetFilters}
            sx={{ ml: 1 }}
          >
            Xóa tất cả
          </Button>
        </Box>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && filteredDevices.length === 0 && (
        <EmptyState>
          {searchTerm || filterActive !== 'all' || filterLinked !== 'all' || filterFeedType !== 'all' || filterAreaId ? (
            <>
              <Search fontSize="large" />
              <Typography variant="h6" gutterBottom>Không tìm thấy kết quả</Typography>
              <Typography variant="body2" color="text.secondary">
                Không có thiết bị nào phù hợp với bộ lọc hiện tại
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }} 
                onClick={handleResetFilters}
              >
                Xóa bộ lọc
              </Button>
            </>
          ) : (
            <>
              <DevicesOther fontSize="large" />
              <Typography variant="h6" gutterBottom>Chưa có thiết bị nào</Typography>
              <Typography variant="body2" color="text.secondary">
                Bắt đầu bằng cách thêm thiết bị đầu tiên của bạn
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Thêm thiết bị
              </Button>
            </>
          )}
        </EmptyState>
      )}

      {/* Group by area option for Grid view */}
      {!isLoading && filteredDevices.length > 0 && viewMode === 0 && (
        <Box mb={2}>
          <FormControlLabel
            control={
              <Switch
                checked={showByArea}
                onChange={(e) => setShowByArea(e.target.checked)}
                color="primary"
              />
            }
            label="Nhóm theo khu vực"
          />
        </Box>
      )}

      {/* Grid View */}
      {!isLoading && filteredDevices.length > 0 && viewMode === 0 && (
        showByArea ? (
          Object.entries(groupDevicesByArea(filteredDevices)).map(([areaId, areaData]) => 
            areaData.devices.length > 0 && (
              <Box key={areaId} mb={4}>
                <AreaHeader isNone={areaId === 'none'}>
                  <Grass sx={{ 
                    mr: 1, 
                    color: areaId === 'none' ? 'text.secondary' : 'primary.main' 
                  }} />
                  <Typography 
                    variant="h6" 
                    color={areaId === 'none' ? 'text.secondary' : 'primary.main'}
                    fontWeight="medium"
                  >
                    {areaData.name} ({areaData.devices.length})
                  </Typography>
                </AreaHeader>
                
                <Grid container spacing={3}>
                  {areaData.devices.map(device => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={6} 
                      md={4} 
                      lg={3} 
                      xl={2.4} 
                      key={device.deviceId}
                    >
                      <DeviceCard 
                        status={device.isActive ? 'online' : 'offline'} 
                        hasArea={!!device.areaId}
                        elevation={theme.palette.mode === 'dark' ? 3 : 1}
                      >
                        {/* Status indicator */}
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: device.isActive ? 'success.main' : 'grey.500',
                            boxShadow: '0 0 8px rgba(0,0,0,0.2)'
                          }} 
                        />
                        
                        <CardHeader>
                          <Box display="flex" alignItems="center">
                            <DeviceAvatar active={device.isActive}>
                              <DevicesOther />
                            </DeviceAvatar>
                            <Box ml={1.5}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {device.deviceName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {device.deviceId}
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <IconButton size="small" color={device.isActive ? "success" : "default"}>
                              {device.isActive ? <Wifi /> : <WifiOff />}
                            </IconButton>
                          </Box>
                        </CardHeader>

                        {/* Device feeds */}
                        <Box mt={2}>
                          <Typography 
                            variant="subtitle2" 
                            fontWeight="medium" 
                            mb={1} 
                            display="flex" 
                            alignItems="center"
                          >
                            <DevicesOther fontSize="small" sx={{ mr: 1 }} />
                            Cảm biến / Điều khiển:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {device.feeds && device.feeds.map((feed, idx) => (
                              <Chip
                                key={idx}
                                size="small"
                                icon={getFeedIcon(feed)}
                                label={getFeedLabel(feed)}
                                sx={{ 
                                  m: 0.3,
                                  bgcolor: alpha(theme.palette[getFeedColor(feed)].main, 0.1),
                                  color: theme.palette[getFeedColor(feed)].dark,
                                  borderColor: theme.palette[getFeedColor(feed)].main,
                                  borderWidth: 1,
                                  borderStyle: 'solid'
                                }}
                              />
                            ))}
                            {(!device.feeds || device.feeds.length === 0) && (
                              <Typography variant="body2" color="text.secondary">
                                Chưa có cảm biến
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        {/* Area and plant info */}
                        {device.areaId && (
                          <Box mt={2}>
                            <Divider sx={{ my: 1.5 }} />
                            
                            <Box display="flex" alignItems="center" mb={1}>
                              <Grass fontSize="small" color="success" sx={{ mr: 1 }} />
                              <Typography variant="subtitle2" fontWeight="medium">
                                Khu vực:
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              p: 1.5, 
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: theme.palette.success.light
                            }}>
                              <Typography variant="body2" fontWeight="medium" color="success.dark">
                                {areas.find(a => a._id === device.areaId)?.name || 'Khu vực không xác định'}
                              </Typography>
                              
                              {device.plantIndex >= 0 && (() => {
                                const area = areas.find(a => a._id === device.areaId);
                                const plant = area?.plants?.[device.plantIndex];
                                console.log("Area:", area, "PlantIndex:", device.plantIndex, "Plant:", plant);
                                
                                return plant && (
                                  <Box mt={1}>
                                    <Box display="flex" alignItems="center">
                                      <LocalFlorist fontSize="small" color="primary" sx={{ mr: 1 }} />
                                      <Typography variant="subtitle2" color="primary.dark" fontWeight="medium">
                                        {plant.name}
                                      </Typography>
                                    </Box>
                                    
                                    <Box mt={1}>
                                      <Typography variant="caption" display="block" color="text.secondary">
                                        Ngưỡng độ ẩm:
                                      </Typography>
                                      <Box
                                        sx={{
                                          position: 'relative',
                                          height: 8,
                                          bgcolor: 'grey.200',
                                          borderRadius: 4,
                                          mt: 0.5
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            position: 'absolute',
                                            left: `${plant.moistureThreshold.min}%`,
                                            width: `${plant.moistureThreshold.max - plant.moistureThreshold.min}%`,
                                            height: '100%',
                                            bgcolor: 'primary.main',
                                            borderRadius: 4
                                          }}
                                        />
                                      </Box>
                                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                                        <Typography variant="caption" fontWeight="bold">
                                          {plant.moistureThreshold.min}%
                                        </Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                          {plant.moistureThreshold.max}%
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                );
                              })()}
                            </Box>
                          </Box>
                        )}

                        {/* Status and actions */}
                        <Box mt="auto" pt={2}>
                          <Divider sx={{ mb: 1.5 }} />
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Hoạt động gần đây:
                              </Typography>
                              <Typography variant="body2">
                                {formatTime(device.lastActivity)}
                              </Typography>
                            </Box>
                            <Box>
                              <Tooltip title={device.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleToggleStatus(device.deviceId)}
                                  color={device.isActive ? 'success' : 'default'}
                                  sx={{ mr: 0.5 }}
                                >
                                  <Settings />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Chỉnh sửa">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOpenDialog(device)}
                                  color="primary"
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleConfirmDelete(device.deviceId)}
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>
                      </DeviceCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )
          )
        ) : (
          <Grid container spacing={3}>
            {/* Grid view content already complete in the previous part */}
            {filteredDevices.map(device => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              xl={2.4} 
              key={device.deviceId}
            >
              <DeviceCard 
                status={device.isActive ? 'online' : 'offline'} 
                hasArea={!!device.areaId}
                elevation={theme.palette.mode === 'dark' ? 3 : 1}
              >
                {/* Status indicator */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: device.isActive ? 'success.main' : 'grey.500',
                    boxShadow: '0 0 8px rgba(0,0,0,0.2)'
                  }} 
                />
                
                <CardHeader>
                  <Box display="flex" alignItems="center">
                    <DeviceAvatar active={device.isActive}>
                      <DevicesOther />
                    </DeviceAvatar>
                    <Box ml={1.5}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {device.deviceName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {device.deviceId}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" color={device.isActive ? "success" : "default"}>
                      {device.isActive ? <Wifi /> : <WifiOff />}
                    </IconButton>
                  </Box>
                </CardHeader>

                {/* Device feeds */}
                <Box mt={2}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="medium" 
                    mb={1} 
                    display="flex" 
                    alignItems="center"
                  >
                    <DevicesOther fontSize="small" sx={{ mr: 1 }} />
                    Cảm biến / Điều khiển:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {device.feeds && device.feeds.map((feed, idx) => (
                      <Chip
                        key={idx}
                        size="small"
                        icon={getFeedIcon(feed)}
                        label={getFeedLabel(feed)}
                        sx={{ 
                          m: 0.3,
                          bgcolor: alpha(theme.palette[getFeedColor(feed)].main, 0.1),
                          color: theme.palette[getFeedColor(feed)].dark,
                          borderColor: theme.palette[getFeedColor(feed)].main,
                          borderWidth: 1,
                          borderStyle: 'solid'
                        }}
                      />
                    ))}
                    {(!device.feeds || device.feeds.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        Chưa có cảm biến
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* Area and plant info */}
                {device.areaId && (
                  <Box mt={2}>
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <Grass fontSize="small" color="success" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" fontWeight="medium">
                        Khu vực:
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: theme.palette.success.light
                    }}>
                      <Typography variant="body2" fontWeight="medium" color="success.dark">
                        {areas.find(a => a._id === device.areaId)?.name || 'Khu vực không xác định'}
                      </Typography>
                      
                      {device.plantIndex >= 0 && (() => {
                        const area = areas.find(a => a._id === device.areaId);
                        const plant = area?.plants?.[device.plantIndex];
                        
                        return plant && (
                          <Box mt={1}>
                            <Box display="flex" alignItems="center">
                              <LocalFlorist fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="subtitle2" color="primary.dark" fontWeight="medium">
                                {plant.name}
                              </Typography>
                            </Box>
                            
                            <Box mt={1}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Ngưỡng độ ẩm:
                              </Typography>
                              <Box
                                sx={{
                                  position: 'relative',
                                  height: 8,
                                  bgcolor: 'grey.200',
                                  borderRadius: 4,
                                  mt: 0.5
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: `${plant.moistureThreshold.min}%`,
                                    width: `${plant.moistureThreshold.max - plant.moistureThreshold.min}%`,
                                    height: '100%',
                                    bgcolor: 'primary.main',
                                    borderRadius: 4
                                  }}
                                />
                              </Box>
                              <Box display="flex" justifyContent="space-between" mt={0.5}>
                                <Typography variant="caption" fontWeight="bold">
                                  {plant.moistureThreshold.min}%
                                </Typography>
                                <Typography variant="caption" fontWeight="bold">
                                  {plant.moistureThreshold.max}%
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })()}
                    </Box>
                  </Box>
                )}

                {/* Status and actions */}
                <Box mt="auto" pt={2}>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Hoạt động gần đây:
                      </Typography>
                      <Typography variant="body2">
                        {formatTime(device.lastActivity)}
                      </Typography>
                    </Box>
                    <Box>

                      <Tooltip title={device.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleStatus(device.deviceId)}
                          color={device.isActive ? 'success' : 'default'}
                          sx={{ mr: 0.5 }}
                        >
                          <Settings />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Chỉnh sửa">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(device)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton 
                          size="small" 
                          onClick={() => handleConfirmDelete(device.deviceId)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </DeviceCard>
            </Grid>
          ))}
          </Grid>
        )
      )}

      {/* List View */}
      {!isLoading && filteredDevices.length > 0 && viewMode === 1 && (
        <StyledTable component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="40px"></TableCell>
                <TableCell 
                  onClick={() => sortData('deviceName')}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box display="flex" alignItems="center">
                    Tên thiết bị
                    {sortConfig.key === 'deviceName' && (
                      sortConfig.direction === 'asc' ? 
                      <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>ID Thiết bị</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Cảm biến / Điều khiển</TableCell>
                <TableCell>Khu vực</TableCell>
                <TableCell>Cây trồng</TableCell>
                <TableCell 
                  onClick={() => sortData('lastActivity')}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box display="flex" alignItems="center">
                    Hoạt động gần đây
                    {sortConfig.key === 'lastActivity' && (
                      sortConfig.direction === 'asc' ? 
                      <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevices.map((device) => {
                const area = areas.find(a => a._id === device.areaId);
                const plant = area?.plants?.[device.plantIndex];
                
                return (
                  <TableRow 
                    key={device.deviceId}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                      borderLeft: device.isActive 
                        ? `4px solid ${theme.palette.success.main}` 
                        : `4px solid ${theme.palette.grey[400]}`
                    }}
                  >
                    <TableCell>
                      <DeviceAvatar active={device.isActive} sx={{ width: 32, height: 32 }}>
                        <DevicesOther fontSize="small" />
                      </DeviceAvatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {device.deviceName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {device.deviceId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="small"
                        icon={device.isActive ? <Wifi fontSize="small" /> : <WifiOff fontSize="small" />}
                        label={device.isActive ? "Hoạt động" : "Không hoạt động"}
                        color={device.isActive ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {device.feeds && device.feeds.map((feed, idx) => (
                          <Chip
                            key={idx}
                            size="small"
                            icon={getFeedIcon(feed)}
                            label={getFeedLabel(feed)}
                            sx={{ 
                              bgcolor: alpha(theme.palette[getFeedColor(feed)].main, 0.1),
                              color: theme.palette[getFeedColor(feed)].dark,
                              borderColor: theme.palette[getFeedColor(feed)].main,
                              borderWidth: 1,
                              borderStyle: 'solid'
                            }}
                          />
                        ))}
                        {(!device.feeds || device.feeds.length === 0) && (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {area ? (
                        <Chip
                          size="small"
                          icon={<Grass fontSize="small" />}
                          label={area.name}
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {plant ? (
                        <Tooltip title={`Độ ẩm: ${plant.moistureThreshold.min}% - ${plant.moistureThreshold.max}%`}>
                          <Chip
                            size="small"
                            icon={<LocalFlorist fontSize="small" />}
                            label={plant.name}
                            color="info"
                            variant="outlined"
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTime(device.lastActivity)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <ActionsContainer>
                      
                        <Tooltip title={device.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleStatus(device.deviceId)}
                            color={device.isActive ? 'success' : 'default'}
                          >
                            <Settings />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(device)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton 
                            size="small" 
                            onClick={() => handleConfirmDelete(device.deviceId)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </ActionsContainer>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </StyledTable>
      )}

      {/* Thiết bị Dialog Form - Completing the partial dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
          <Box display="flex" alignItems="center">
            {selectedDevice && selectedDevice._id ? (
              <>
                <Edit sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div">
                  Chỉnh sửa thiết bị
                </Typography>
              </>
            ) : (
              <>
                <Add sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div">
                  Thêm thiết bị mới
                </Typography>
              </>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedDevice && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }} elevation={0} variant="outlined">
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
                    Thông tin cơ bản
                  </Typography>
                  
                  <TextField
                    label="ID Thiết bị"
                    name="deviceId"
                    value={selectedDevice.deviceId || ''}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!!selectedDevice._id}
                    helperText={!!selectedDevice._id ? "ID thiết bị không thể thay đổi sau khi tạo" : ""}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DevicesOther fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    label="Tên thiết bị"
                    name="deviceName"
                    value={selectedDevice.deviceName || ''}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                  
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }} elevation={0} variant="outlined">
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="secondary.main">
                    Cảm biến / Điều khiển
                  </Typography>
                  
                  <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                    {FEED_TYPES.map((feed) => (
                      <Chip
                        key={feed.value}
                        icon={feed.icon}
                        label={feed.label}
                        color={selectedFeeds.includes(feed.value) ? feed.color : "default"}
                        onClick={() => {
                          if (selectedFeeds.includes(feed.value)) {
                            handleRemoveFeed(feed.value);
                          } else {
                            handleAddFeed(feed.value);
                          }
                        }}
                        clickable
                        sx={{ 
                          m: 0.5,
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                  {selectedFeeds.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                      Chọn ít nhất một loại cảm biến hoặc bộ điều khiển
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }} elevation={0} variant="outlined">
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="success.main">
                    Liên kết với khu vực
                  </Typography>
                  
                  <Grid container spacing={3} mt={0.5}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="area-select-label">Khu vực</InputLabel>
                        <Select
                          labelId="area-select-label"
                          id="area-select"
                          value={selectedAreaId}
                          label="Khu vực"
                          onChange={(e) => {
                            setSelectedAreaId(e.target.value);
                            setSelectedPlantIndex(-1); // Reset plant selection when area changes
                          }}
                        >
                          <MenuItem value="">
                            <em>Không liên kết với khu vực</em>
                          </MenuItem>
                          {areas.map(area => (
                            <MenuItem key={area._id} value={area._id}>
                              <Box display="flex" alignItems="center">
                                <Grass color="success" sx={{ mr: 1, fontSize: 18 }} />
                                {area.name} {area.plants && `(${area.plants.length} cây trồng)`}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {selectedAreaId && (() => {
                      const selectedArea = areas.find(a => a._id === selectedAreaId);
                      
                      if (!selectedArea || !selectedArea.plants || selectedArea.plants.length === 0) {
                        return (
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Khu vực này chưa có cây trồng nào. Hãy thêm cây trồng trước khi liên kết thiết bị.
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      }
                      
                      return (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id="plant-select-label">Cây trồng</InputLabel>
                            <Select
                              labelId="plant-select-label"
                              id="plant-select"
                              value={selectedPlantIndex}
                              label="Cây trồng"
                              onChange={(e) => setSelectedPlantIndex(e.target.value)}
                            >
                              <MenuItem value={-1}>
                                <em>Không liên kết với cây trồng cụ thể</em>
                              </MenuItem>
                              {selectedArea.plants.map((plant, index) => (
                                <MenuItem key={index} value={index}>
                                  <Box display="flex" alignItems="center">
                                    <LocalFlorist color="primary" sx={{ mr: 1, fontSize: 18 }} />
                                    {plant.name} ({plant.moistureThreshold.min}% - {plant.moistureThreshold.max}%)
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      );
                    })()}
                  </Grid>
                  
                  {selectedAreaId && selectedPlantIndex >= 0 && (() => {
                    const selectedArea = areas.find(a => a._id === selectedAreaId);
                    const selectedPlant = selectedArea?.plants?.[selectedPlantIndex];
                    
                    return selectedPlant && (
                      <Box mt={3} p={2} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocalFlorist color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" fontWeight="medium">
                            Thông tin cây trồng: {selectedPlant.name}
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Độ ẩm tối thiểu: {selectedPlant.moistureThreshold.min}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Độ ẩm tối đa: {selectedPlant.moistureThreshold.max}%
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                              Ngưỡng độ ẩm:
                            </Typography>
                            <Box
                              sx={{
                                position: 'relative',
                                height: 10,
                                bgcolor: 'grey.200',
                                borderRadius: 4,
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: `${selectedPlant.moistureThreshold.min}%`,
                                  width: `${selectedPlant.moistureThreshold.max - selectedPlant.moistureThreshold.min}%`,
                                  height: '100%',
                                  bgcolor: 'primary.main',
                                  borderRadius: 4
                                }}
                              />
                            </Box>
                            <Box display="flex" justifyContent="space-between" mt={0.5}>
                              <Typography variant="caption">0%</Typography>
                              <Typography variant="caption">100%</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    );
                  })()}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleSaveDevice}
            variant="contained"
            color="primary"
            disabled={!selectedDevice?.deviceId || !selectedDevice?.deviceName}
          >
            {selectedDevice?._id ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter dialog */}
      <Dialog 
        open={openFiltersDialog} 
        onClose={() => setOpenFiltersDialog(false)} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <FilterAlt sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Bộ lọc thiết bị</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Trạng thái hoạt động
              </Typography>
              <RadioGroup 
                value={filterActive} 
                onChange={(e) => setFilterActive(e.target.value)}
                row
              >
                <FormControlLabel value="all" control={<Radio />} label="Tất cả" />
                <FormControlLabel value="active" control={<Radio />} label="Đang hoạt động" />
                <FormControlLabel value="inactive" control={<Radio />} label="Không hoạt động" />
              </RadioGroup>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tình trạng liên kết
              </Typography>
              <RadioGroup 
                value={filterLinked} 
                onChange={(e) => setFilterLinked(e.target.value)}
                row
              >
                <FormControlLabel value="all" control={<Radio />} label="Tất cả" />
                <FormControlLabel value="linked" control={<Radio />} label="Đã liên kết" />
                <FormControlLabel value="unlinked" control={<Radio />} label="Chưa liên kết" />
              </RadioGroup>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Loại cảm biến / điều khiển
              </Typography>
              <FormControl fullWidth margin="normal">
                <Select
                  value={filterFeedType}
                  onChange={(e) => setFilterFeedType(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="all">Tất cả các loại</MenuItem>
                  {FEED_TYPES.map(feed => (
                    <MenuItem key={feed.value} value={feed.value}>
                      <Box display="flex" alignItems="center">
                        {feed.icon}
                        <Typography sx={{ ml: 1 }}>{feed.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Khu vực
              </Typography>
              <FormControl fullWidth margin="normal">
                <Select
                  value={filterAreaId}
                  onChange={(e) => setFilterAreaId(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">Tất cả các khu vực</MenuItem>
                  {areas.map(area => (
                    <MenuItem key={area._id} value={area._id}>
                      <Box display="flex" alignItems="center">
                        <Grass color="success" sx={{ mr: 1 }} />
                        <Typography>{area.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              handleResetFilters();
              setOpenFiltersDialog(false);
            }}
            color="inherit"
          >
            Xóa bộ lọc
          </Button>
          <Button 
            onClick={() => setOpenFiltersDialog(false)} 
            variant="contained"
            color="primary"
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preferences dialog */}
      <Dialog 
        open={openPrefsDialog} 
        onClose={() => setOpenPrefsDialog(false)} 
        fullWidth 
        maxWidth="xs"
      >

        <DialogContent dividers>
          <List>
            <ListItem>
              <ListItemText 
                primary="Kích thước thẻ thiết bị" 
                secondary="Điều chỉnh kích thước khi xem dạng lưới"
              />
            </ListItem>
            <ListItem>
              <RadioGroup 
                row 
                value={userPreferences.cardSize} 
                onChange={(e) => setUserPreferences(prev => ({
                  ...prev,
                  cardSize: e.target.value
                }))}
                sx={{ ml: 2 }}
              >
                <FormControlLabel value="small" control={<Radio />} label="Nhỏ" />
                <FormControlLabel value="medium" control={<Radio />} label="Vừa" />
                <FormControlLabel value="large" control={<Radio />} label="Lớn" />
              </RadioGroup>
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText 
                primary="Phối màu" 
                secondary="Tùy chỉnh bảng màu giao diện"
              />
            </ListItem>
            <ListItem>
              <RadioGroup 
                row 
                value={userPreferences.colorScheme} 
                onChange={(e) => setUserPreferences(prev => ({
                  ...prev,
                  colorScheme: e.target.value
                }))}
                sx={{ ml: 2 }}
              >
                <FormControlLabel value="default" control={<Radio />} label="Mặc định" />
                <FormControlLabel value="contrast" control={<Radio />} label="Tương phản cao" />
              </RadioGroup>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setUserPreferences({
                cardSize: 'medium',
                colorScheme: 'default'
              });
            }} 
            color="inherit"
          >
            Khôi phục mặc định
          </Button>
          <Button 
            onClick={() => setOpenPrefsDialog(false)} 
            variant="contained"
            color="primary"
          >
            Xong
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete.open}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          <Box display="flex" alignItems="center">
            <Warning sx={{ mr: 1 }} />
            <Typography variant="h6">Xác nhận xóa</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Bạn có chắc chắn muốn xóa thiết bị này? Hành động này không thể hoàn tác.
          </Typography>
          {devices.find(d => d.deviceId === confirmDelete.deviceId)?.areaId && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
              Lưu ý: Thiết bị này đang được liên kết với một khu vực. Việc xóa có thể ảnh hưởng đến hoạt động của cây trồng.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelDelete} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleDeleteDevice} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default DeviceManager;