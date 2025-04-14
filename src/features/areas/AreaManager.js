import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {Link} from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, IconButton, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Tabs, Tab, Tooltip, useTheme, Switch, FormControlLabel, Snackbar, Alert,
  CircularProgress, Divider, List, ListItem, ListItemText, ListItemIcon,
  Card, CardContent, CardHeader, CardActions, MenuItem, Select, FormControl,
  InputLabel, useMediaQuery, InputAdornment, Slider, LinearProgress, Collapse
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Add, Edit, Delete, Search, Refresh, Grass, Spa, LocalFlorist,
  ArrowUpward, ArrowDownward, Opacity, DevicesOther, CheckCircle,
  Error, FilterList, Clear, Info, Warning, ViewList, Dashboard, 
  WaterDrop, Thermostat, SensorDoor, WbSunny, WifiOff, Wifi, ArrowForward
} from '@mui/icons-material';
import { getAreas, createArea, updateArea, deleteArea, addPlantToArea, deletePlantFromArea, updatePlantInArea } from '../../services/areaService';
import { getUserDevices, getDevicesByArea } from '../../services/deviceService';

// Styled components
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100%',
  transition: 'background-color 0.3s ease',
  color: theme.palette.text.primary
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    '& > *:not(:last-child)': {
      marginBottom: theme.spacing(2)
    }
  }
}));

const SearchBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  width: 300,
  [theme.breakpoints.down('sm')]: {
    width: '100%'
  }
}));

const StyledInput = styled(TextField)({
  '& .MuiInput-root': {
    '&:before, &:after': {
      display: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: '8px 0',
  },
});

const AreaCard = styled(Card)(({ theme, selected }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  borderLeft: selected ? `4px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(5),
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.secondary,
  textAlign: 'center',
  minHeight: '300px',
  boxShadow: theme.shadows[1]
}));

const PlantItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  position: 'relative',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2]
  }
}));

const MoistureRangeIndicator = styled(Box)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  position: 'relative',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(0.5)
}));

// Các loại cây trồng có sẵn
const PLANT_TYPES = [
  { value: 'vegetable', label: 'Rau củ', color: 'success' },
  { value: 'flower', label: 'Hoa', color: 'secondary' },
  { value: 'fruit', label: 'Cây ăn quả', color: 'warning' },
  { value: 'herb', label: 'Thảo mộc', color: 'info' },
  { value: 'other', label: 'Khác', color: 'default' }
];

// Hàm định dạng thời gian
const formatTime = (timestamp) => {
  if (!timestamp) return 'Chưa có dữ liệu';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Hàm lấy icon cho loại cảm biến
const getPlantIcon = (plantType) => {
  switch (plantType) {
    case 'vegetable':
      return <Spa color="success" />;
    case 'flower':
      return <LocalFlorist color="secondary" />;
    case 'fruit':
      return <WbSunny color="warning" />;
    case 'herb':
      return <Opacity color="info" />;
    default:
      return <Grass />;
  }
};

// Hàm lấy màu cho loại cảm biến
const getPlantColor = (plantType) => {
  const type = PLANT_TYPES.find(t => t.value === plantType);
  return type ? type.color : 'default';
};

const AreaManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openAreaDialog, setOpenAreaDialog] = useState(false);
  const [openPlantDialog, setOpenPlantDialog] = useState(false);
  const [openPlantEditDialog, setOpenPlantEditDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, areaId: null });
  const [confirmDeletePlant, setConfirmDeletePlant] = useState({ open: false, areaId: null, plantIndex: null });
  const [viewMode, setViewMode] = useState(0); // 0 = grid, 1 = list
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [expandedArea, setExpandedArea] = useState(null);
  const [filterPlantType, setFilterPlantType] = useState('all');
  const [areaDevices, setAreaDevices] = useState({});
  const [loadingDevices, setLoadingDevices] = useState({});
  
  // Plant form state
  const [plantForm, setPlantForm] = useState({
    name: '',
    type: 'vegetable',
    moistureThreshold: {
      min: 30,
      max: 70
    },
    notes: ''
  });
  
  // Selected plant for editing
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedPlantIndex, setSelectedPlantIndex] = useState(-1);

  // Fetch areas
  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAreas();
      if (response.success) {
        setAreas(response.areas);
        setFilteredAreas(response.areas);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    try {
      const response = await getUserDevices();
      if (response.success) {
        setDevices(response.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  }, []);

  const loadAreaDevices = useCallback(async (areaId) => {
    setLoadingDevices(prev => ({ ...prev, [areaId]: true }));
    try {
      const response = await getDevicesByArea(areaId);
      if (response.success) {
        setAreaDevices(prev => {
          const updated = {
            ...prev,
            [areaId]: response.devices || []
          };
          return updated;
        });
      } else {
        console.error('Error loading devices:', response.message);
      }
    } catch (error) {
      console.error('Error loading area devices:', error);
    } finally {
      setLoadingDevices(prev => ({ ...prev, [areaId]: false }));
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchAreas();
    fetchDevices();
  }, [fetchAreas, fetchDevices]);

  useEffect(() => {
    if (expandedArea) {
      loadAreaDevices(expandedArea);
    }
  }, [expandedArea, loadAreaDevices]);
  
  // Search and filter handling
  useEffect(() => {
    let results = areas;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(area => 
        area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply plant type filter
    if (filterPlantType !== 'all') {
      results = results.filter(area => 
        area.plants?.some(plant => plant.type === filterPlantType)
      );
    }
    
    // Sort results
    results = [...results].sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortConfig.key === 'plantCount') {
        const aCount = a.plants?.length || 0;
        const bCount = b.plants?.length || 0;
        return sortConfig.direction === 'asc' ? aCount - bCount : bCount - aCount;
      } else if (sortConfig.key === 'deviceCount') {
        const aCount = a.devices?.length || 0;
        const bCount = b.devices?.length || 0;
        return sortConfig.direction === 'asc' ? aCount - bCount : bCount - aCount;
      }
      return 0;
    });
    
    setFilteredAreas(results);
  }, [searchTerm, areas, sortConfig, filterPlantType]);

  // Sort handler
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Dialog handlers
  const handleOpenAreaDialog = (area = null) => {
    if (area) {
      setSelectedArea({...area});
      if (area._id) {
        loadAreaDevices(area._id);
      }
    } else {
      setSelectedArea({
        name: '',
        description: '',
        devices: []
      });
    }
    setOpenAreaDialog(true);
  };

  const handleCloseAreaDialog = () => {
    setOpenAreaDialog(false);
    setSelectedArea(null);
  };

  const handleOpenPlantDialog = (area) => {
    setSelectedArea(area);
    setPlantForm({
      name: '',
      type: 'vegetable',
      moistureThreshold: {
        min: 30,
        max: 70
      },
      notes: ''
    });
    setOpenPlantDialog(true);
  };

  const handleClosePlantDialog = () => {
    setOpenPlantDialog(false);
  };
  
  const handleOpenPlantEditDialog = (area, plantIndex) => {
    setSelectedArea(area);
    setSelectedPlant({...area.plants[plantIndex]});
    setSelectedPlantIndex(plantIndex);
    setOpenPlantEditDialog(true);
  };
  
  const handleClosePlantEditDialog = () => {
    setOpenPlantEditDialog(false);
    setSelectedPlant(null);
    setSelectedPlantIndex(-1);
  };

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedArea(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePlantInputChange = (e) => {
    const { name, value } = e.target;
    setPlantForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectedPlantInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPlant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // API handlers
  const handleSaveArea = async () => {
    try {
      let response;
      if (selectedArea._id) {
        // Update existing area
        response = await updateArea(selectedArea._id, selectedArea);
      } else {
        // Create new area
        response = await createArea(selectedArea);
      }

      if (response.success) {
        fetchAreas();
        //thông báo cho DeviceManager đồng bộ
        sessionStorage.setItem('device-area-changed', 'true');
        setSnackbar({
          open: true,
          message: response.message || 'Khu vực đã được lưu thành công!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Không thể lưu khu vực',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving area:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi lưu khu vực',
        severity: 'error'
      });
    } finally {
      handleCloseAreaDialog();
    }
  };

  const handleAddPlant = async () => {
    try {
      const response = await addPlantToArea(selectedArea._id, plantForm);
      
      if (response.success) {
        fetchAreas();
        setSnackbar({
          open: true,
          message: response.message || 'Thêm cây trồng thành công!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Không thể thêm cây trồng',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding plant:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi thêm cây trồng',
        severity: 'error'
      });
    } finally {
      handleClosePlantDialog();
    }
  };
  
  const handleUpdatePlant = async () => {
    try {
      const response = await updatePlantInArea(
        selectedArea._id, 
        selectedPlantIndex, 
        selectedPlant
      );
      
      if (response.success) {
        fetchAreas();
        setSnackbar({
          open: true,
          message: response.message || 'Cập nhật cây trồng thành công!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Không thể cập nhật cây trồng',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating plant:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi cập nhật cây trồng',
        severity: 'error'
      });
    } finally {
      handleClosePlantEditDialog();
    }
  };

  const handleConfirmDeleteArea = (areaId) => {
    setConfirmDelete({ open: true, areaId });
  };
  
  const handleConfirmDeletePlant = (areaId, plantIndex) => {
    setConfirmDeletePlant({ open: true, areaId, plantIndex });
  };

  const handleDeleteArea = async () => {
    try {
      const response = await deleteArea(confirmDelete.areaId);
      
      if (response.success) {
        fetchAreas();
        //thông báo cho DeviceManager đồng bộ
        sessionStorage.setItem('device-area-changed', 'true');
        setSnackbar({
          open: true,
          message: response.message || 'Xóa khu vực thành công!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Không thể xóa khu vực',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting area:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi xóa khu vực',
        severity: 'error'
      });
    } finally {
      setConfirmDelete({ open: false, areaId: null });
    }
  };
  
  const handleDeletePlant = async () => {
    try {
      const response = await deletePlantFromArea(
        confirmDeletePlant.areaId,
        confirmDeletePlant.plantIndex
      );
      
      if (response.success) {
        fetchAreas();
        setSnackbar({
          open: true,
          message: response.message || 'Xóa cây trồng thành công!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Không thể xóa cây trồng',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting plant:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi xóa cây trồng',
        severity: 'error'
      });
    } finally {
      setConfirmDeletePlant({ open: false, areaId: null, plantIndex: null });
    }
  };

  const handleExpandArea = (areaId) => {
    setExpandedArea(expandedArea === areaId ? null : areaId);
  };
  
  // Helper function to get plant type label
  const getPlantTypeLabel = (typeValue) => {
    const type = PLANT_TYPES.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
  };
  
  // Get linked devices for an area
  const getLinkedDevices = (area) => {
    // Ưu tiên sử dụng dữ liệu từ areaDevices nếu có sẵn
    if (areaDevices[area._id]) {
      return areaDevices[area._id];
    }
    
    // Fallback về cách cũ nếu chưa có dữ liệu từ API mới
    if (!area.devices || area.devices.length === 0) return [];
    return devices.filter(device => area.devices.includes(device.deviceId));
  };
  
  // Compute statistics
  const stats = useMemo(() => {
    const totalAreas = areas.length;
    const totalPlants = areas.reduce((sum, area) => sum + (area.plants?.length || 0), 0);
    
    // Sửa cách tính số thiết bị liên kết
    const linkedDevices = areas.reduce((sum, area) => {
      // Ưu tiên sử dụng areaDevices nếu có
      if (areaDevices[area._id]) {
        return sum + areaDevices[area._id].length;
      }
      // Fallback về cách cũ
      return sum + (area.devices?.length || 0);
    }, 0);
    
    return { totalAreas, totalPlants, linkedDevices };
  }, [areas, areaDevices]);
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterPlantType('all');
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <PageContainer>
      <PageHeader>
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="bold" 
            display="flex" 
            alignItems="center" 
            gap={1}
          >
            <Grass sx={{ fontSize: isMobile ? 24 : 32 }} />
            Quản lý khu vực
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Quản lý khu vực trồng cây và liên kết thiết bị
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
                icon={<Tooltip title="Dạng lưới"><Dashboard /></Tooltip>} 
                sx={{ minHeight: 40 }} 
              />
              <Tab 
                icon={<Tooltip title="Dạng danh sách"><ViewList /></Tooltip>} 
                sx={{ minHeight: 40 }} 
              />
            </Tabs>
          )}
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={() => handleOpenAreaDialog()}
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
            sx={{ fontWeight: 'bold' }}
          >
            Tạo khu vực mới
          </Button>
          
          {isMobile && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={viewMode === 0 ? <ViewList /> : <Dashboard />}
              onClick={() => setViewMode(viewMode === 0 ? 1 : 0)}
              size="small"
              fullWidth
            >
              {viewMode === 0 ? "Dạng danh sách" : "Dạng lưới"}
            </Button>
          )}
        </Box>
      </PageHeader>

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: isTablet ? 'column' : 'row', 
          justifyContent: 'space-between', 
          alignItems: isTablet ? 'stretch' : 'center', 
          mb: 3,
          mt: 2,
          gap: 2 
        }}
      >
        <SearchBar sx={{ width: isTablet ? '100%' : 400 }}>
          <IconButton sx={{ p: 1 }} aria-label="search">
            <Search />
          </IconButton>
          <StyledInput
            placeholder="Tìm kiếm khu vực..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="standard"
            fullWidth
          />
          {searchTerm && (
            <IconButton sx={{ p: 1 }} onClick={() => setSearchTerm('')}>
              <Clear />
            </IconButton>
          )}
        </SearchBar>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="plant-type-filter-label">Loại cây trồng</InputLabel>
            <Select
              labelId="plant-type-filter-label"
              id="plant-type-filter"
              value={filterPlantType}
              label="Loại cây trồng"
              onChange={(e) => setFilterPlantType(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {PLANT_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  <Box display="flex" alignItems="center">
                    {getPlantIcon(type.value)}
                    <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            startIcon={<Refresh />} 
            onClick={fetchAreas}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
          >
            Làm mới
          </Button>
        </Box>
      </Box>

      {/* Stats summary */}
      {!isLoading && filteredAreas.length > 0 && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h5" fontWeight="medium" color="primary.main">{stats.totalAreas}</Typography>
              <Typography variant="body2" color="text.secondary">Khu vực</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="h5" fontWeight="medium" color="success.main">{stats.totalPlants}</Typography>
              <Typography variant="body2" color="text.secondary">Cây trồng</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="h5" fontWeight="medium" color="info.main">{stats.linkedDevices}</Typography>
              <Typography variant="body2" color="text.secondary">Thiết bị liên kết</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Search/Filter feedback */}
      {searchTerm || filterPlantType !== 'all' ? (
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Typography variant="body2" color="text.secondary" alignSelf="center">
            Đang lọc:
          </Typography>
          
          {searchTerm && (
            <Chip
              icon={<Search fontSize="small" />}
              label={`Tìm kiếm: "${searchTerm}"`}
              onDelete={() => setSearchTerm('')}
              size="small"
            />
          )}
          
          {filterPlantType !== 'all' && (
            <Chip
              icon={getPlantIcon(filterPlantType)}
              label={`Loại: ${getPlantTypeLabel(filterPlantType)}`}
              onDelete={() => setFilterPlantType('all')}
              color={getPlantColor(filterPlantType)}
              size="small"
            />
          )}
          
          <Button 
            variant="text" 
            size="small" 
            onClick={handleResetFilters}
            sx={{ ml: 1 }}
          >
            Xóa bộ lọc
          </Button>
        </Box>
      ) : null}

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && filteredAreas.length === 0 && (
        <EmptyState>
          {searchTerm || filterPlantType !== 'all' ? (
            <>
              <Search fontSize="large" />
              <Typography variant="h6" gutterBottom>Không tìm thấy kết quả</Typography>
              <Typography variant="body2" color="text.secondary">
                Không tìm thấy khu vực phù hợp với tiêu chí tìm kiếm
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
              <Grass fontSize="large" />
              <Typography variant="h6" gutterBottom>Bạn chưa có khu vực nào</Typography>
              <Typography variant="body2" color="text.secondary">
                Hãy tạo khu vực đầu tiên để bắt đầu quản lý cây trồng
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => handleOpenAreaDialog()}
                sx={{ mt: 2 }}
              >
                Tạo khu vực mới
              </Button>
            </>
          )}
        </EmptyState>
      )}

      {/* Grid view */}
      {!isLoading && filteredAreas.length > 0 && viewMode === 0 && (
        <Grid container spacing={3}>
          {filteredAreas.map(area => (
            <Grid item xs={12} sm={6} md={4} key={area._id}>
              <AreaCard selected={expandedArea === area._id}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                      <Grass />
                    </Avatar>
                  }
                  action={
                    <Box>
                      <Tooltip title="Chỉnh sửa khu vực">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenAreaDialog(area)}
                          sx={{ mr: 0.5 }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa khu vực">
                        <IconButton 
                          size="small" 
                          onClick={() => handleConfirmDeleteArea(area._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  title={
                    <Typography variant="h6" fontWeight="medium">
                      {area.name}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        size="small"
                        icon={<LocalFlorist />}
                        label={`${area.plants?.length || 0} cây trồng`}
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 0.5 }}
                      />
                       <Chip 
                        size="small" 
                        label={stats.linkedDevices} 
                        color="info"
                        icon={<DevicesOther />}
                        variant="outlined"
                      />
                    </Box>
                  }
                />
                
                <CardContent>
                  {area.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {area.description}
                    </Typography>
                  )}
                  
                  {/* Plants section */}
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="medium">
                        Cây trồng
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleExpandArea(area._id)}
                        sx={{ 
                          transform: expandedArea === area._id ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s'
                        }}
                      >
                        <ArrowDownward fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Collapse in={expandedArea === area._id}>
                      {area.plants && area.plants.length > 0 ? (
                        <Grid container spacing={2} mt={0.5}>
                          {area.plants.map((plant, index) => (
                            <Grid item xs={12} key={index}>
                              <PlantItem variant="outlined">
                                <Box display="flex" justifyContent="space-between">
                                  <Box display="flex" alignItems="center">
                                    {getPlantIcon(plant.type)}
                                    <Box ml={1}>
                                      <Typography variant="subtitle2" fontWeight="medium">
                                        {plant.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {getPlantTypeLabel(plant.type)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box>
                                    <Tooltip title="Chỉnh sửa">
                                      <IconButton 
                                        size="small"
                                        onClick={() => handleOpenPlantEditDialog(area, index)}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa">
                                      <IconButton 
                                        size="small"
                                        onClick={() => handleConfirmDeletePlant(area._id, index)}
                                        color="error"
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                                
                                <Box mt={1.5}>
                                  <Typography variant="body2" display="flex" alignItems="center">
                                    <Opacity fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
                                    Ngưỡng độ ẩm:
                                  </Typography>
                                  <MoistureRangeIndicator>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        left: `${plant.moistureThreshold.min}%`,
                                        width: `${plant.moistureThreshold.max - plant.moistureThreshold.min}%`,
                                        height: '100%',
                                        bgcolor: theme.palette.primary.main,
                                        borderRadius: 4
                                      }}
                                    />
                                  </MoistureRangeIndicator>
                                  <Box display="flex" justifyContent="space-between">
                                    <Typography variant="caption" fontWeight="medium">
                                      {plant.moistureThreshold.min}%
                                    </Typography>
                                    <Typography variant="caption" fontWeight="medium">
                                      {plant.moistureThreshold.max}%
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {plant.notes && (
                                  <Box mt={1.5}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Ghi chú:
                                    </Typography>
                                    <Typography variant="body2">
                                      {plant.notes}
                                    </Typography>
                                  </Box>
                                )}
                                </PlantItem>
                              </Grid>
                            ))}
                            <Grid item xs={12}>
                              <Button
                                startIcon={<Add />}
                                variant="outlined"
                                size="small"
                                fullWidth
                                onClick={() => handleOpenPlantDialog(area)}
                              >
                                Thêm cây trồng
                              </Button>
                            </Grid>
                          </Grid>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Chưa có cây trồng nào trong khu vực này
                            </Typography>
                            <Button
                              startIcon={<Add />}
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenPlantDialog(area)}
                            >
                              Thêm cây trồng
                            </Button>
                          </Box>
                        )}
                        
                        {/* Devices section */}
                        <Box mt={3}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              Thiết bị đã kết nối
                            </Typography>
                            <Button
                              startIcon={<Refresh />}
                              size="small"
                              onClick={() => loadAreaDevices(area._id)}
                              disabled={loadingDevices[area._id]}
                            >
                              {loadingDevices[area._id] ? "Đang tải..." : "Làm mới"}
                            </Button>
                          </Box>
                          
                          {loadingDevices[area._id] ? (
                            <LinearProgress sx={{ my: 2 }} />
                          ) : (
                            <>
                              {getLinkedDevices(area).length > 0 ? (
                                <List 
                                disablePadding 
                                sx={{ 
                                  flexGrow: 1, 
                                  overflow: 'auto',
                                  '& .MuiListItem-root': {
                                    transition: 'background-color 0.2s',
                                    borderRadius: 1,
                                    mb: 1,
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.info.light, 0.1)
                                    }
                                  }
                                }}
                              >
                                {getLinkedDevices(area).map((device, index) => (
                                  <ListItem 
                                    key={device.deviceId || index}
                                    sx={{ 
                                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                      p: 1.5,
                                      paddingRight: 12, // Thêm padding bên phải để tránh chồng lấp
                                      position: 'relative'
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                      <DevicesOther color="info" />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={
                                        <Typography variant="subtitle2" fontWeight="medium" noWrap sx={{ maxWidth: '100%' }}>
                                          {device.name || `Thiết bị ${device.deviceId}`}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                          ID: {device.deviceId}
                                        </Typography>
                                      }
                                    />
                                    <Box 
                                      sx={{ 
                                        position: 'absolute', 
                                        right: 8, 
                                        top: '50%', 
                                        transform: 'translateY(-50%)' 
                                      }}
                                    >
                                      <Chip 
                                        size="small"
                                        color={device.isActive ? "success" : "default"}
                                        icon={device.isActive ? <Wifi fontSize="small" /> : <WifiOff fontSize="small" />}
                                        label={device.isActive ? "Trực tuyến" : "Ngoại tuyến"}
                                        variant="outlined"
                                      />
                                    </Box>
                                  </ListItem>
                                ))}
                              </List>
                              ) : (
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Chưa có thiết bị nào được liên kết với khu vực này
                                  </Typography>
                                  <Link to="/devices">
                                    <Button
                                      startIcon={<ArrowForward />}
                                      size="small"
                                      variant="text"
                                    >
                                      Đi đến quản lý thiết bị
                                    </Button>
                                  </Link>
                                </Paper>
                              )}
                            </>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                    
                    <Box mt={2} display="flex" justifyContent="center">
                      <Button
                        color="primary"
                        startIcon={expandedArea === area._id ? null : <Add />}
                        size="small"
                        onClick={() => handleExpandArea(area._id)}
                      >
                        {expandedArea === area._id ? 'Thu gọn' : 'Xem chi tiết'}
                      </Button>
                    </Box>
                  </CardContent>
                </AreaCard>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* List view */}
        {!isLoading && filteredAreas.length > 0 && viewMode === 1 && (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer' 
                      }}
                      onClick={() => handleSort('name')}
                    >
                      Tên khu vực
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> 
                          : <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer' 
                      }}
                      onClick={() => handleSort('plantCount')}
                    >
                      Cây trồng
                      {sortConfig.key === 'plantCount' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> 
                          : <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer' 
                      }}
                      onClick={() => handleSort('deviceCount')}
                    >
                      Thiết bị
                      {sortConfig.key === 'deviceCount' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> 
                          : <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAreas.map(area => (
                  <React.Fragment key={area._id}>
                    <TableRow 
                      hover
                      sx={{ 
                        '& > *': { borderBottom: 'unset' },
                        backgroundColor: expandedArea === area._id 
                          ? alpha(theme.palette.primary.main, 0.05) 
                          : 'inherit'
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography fontWeight="medium">{area.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }} noWrap>
                          {area.description || '--'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={area.plants?.length || 0} 
                          color="primary"
                          icon={<LocalFlorist />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={stats.linkedDevices} 
                          color="info"
                          icon={<DevicesOther />}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Xem chi tiết">
                          <IconButton 
                            size="small"
                            onClick={() => handleExpandArea(area._id)}
                            color={expandedArea === area._id ? "primary" : "default"}
                          >
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenAreaDialog(area)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton 
                            size="small"
                            onClick={() => handleConfirmDeleteArea(area._id)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                  <TableCell 
                    style={{ paddingBottom: 0, paddingTop: 0 }} 
                    colSpan={6}
                  >
                    <Collapse in={expandedArea === area._id} timeout="auto" unmountOnExit>
                      <Box 
                        sx={{ 
                          my: 2, 
                          mx: 2, 
                          p: 2, 
                          borderRadius: 1,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)',
                          backgroundColor: alpha(theme.palette.background.paper, 0.7)
                        }}
                      >
                        <Grid container spacing={3}>
                          {/* Plants section */}
                          <Grid item xs={12} md={6}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column'
                              }}
                            >
                              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" component="div" color="primary.main">
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <LocalFlorist />
                                    Cây trồng
                                  </Box>
                                </Typography>
                                <Button
                                  startIcon={<Add />}
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleOpenPlantDialog(area)}
                                >
                                  Thêm cây
                                </Button>
                              </Box>
                              
                              <Divider sx={{ mb: 2 }} />
                              
                              {area.plants && area.plants.length > 0 ? (
                                <Grid container spacing={1} sx={{ flexGrow: 1, overflow: 'auto' }}>
                                  {area.plants.map((plant, index) => (
                                    <Grid item xs={12} key={index}>
                                      <PlantItem 
                                        variant="outlined"
                                        sx={{
                                          borderLeft: `4px solid ${theme.palette[getPlantColor(plant.type)].main}`
                                        }}
                                      >
                                        <Box display="flex" justifyContent="space-between">
                                          <Box display="flex" alignItems="center">
                                            {getPlantIcon(plant.type)}
                                            <Box ml={1}>
                                              <Typography variant="subtitle2" fontWeight="medium">
                                                {plant.name}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                {getPlantTypeLabel(plant.type)}
                                              </Typography>
                                            </Box>
                                          </Box>
                                          <Box>
                                            <Tooltip title="Chỉnh sửa">
                                              <IconButton 
                                                size="small"
                                                onClick={() => handleOpenPlantEditDialog(area, index)}
                                              >
                                                <Edit fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                              <IconButton 
                                                size="small"
                                                onClick={() => handleConfirmDeletePlant(area._id, index)}
                                                color="error"
                                              >
                                                <Delete fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </Box>
                                        </Box>
                                        
                                        <Box mt={1.5}>
                                          <Typography variant="body2" display="flex" alignItems="center">
                                            <Opacity fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
                                            Ngưỡng độ ẩm: {plant.moistureThreshold.min}% - {plant.moistureThreshold.max}%
                                          </Typography>
                                        </Box>
                                        
                                        {plant.notes && (
                                          <Box mt={1}>
                                            <Typography variant="caption" color="text.secondary">
                                              Ghi chú: {plant.notes}
                                            </Typography>
                                          </Box>
                                        )}
                                      </PlantItem>
                                    </Grid>
                                  ))}
                                </Grid>
                              ) : (
                                <Box sx={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  flexGrow: 1,
                                  py: 3
                                }}>
                                  <LocalFlorist sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                  <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                                    Chưa có cây trồng nào trong khu vực này
                                  </Typography>
                                  <Button
                                    startIcon={<Add />}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenPlantDialog(area)}
                                    sx={{ mt: 1 }}
                                  >
                                    Thêm cây trồng
                                  </Button>
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                          
                          {/* Devices section */}
                          <Grid item xs={12} md={6}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column'
                              }}
                            >
                              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" component="div" color="info.main">
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <DevicesOther />
                                    Thiết bị liên kết
                                  </Box>
                                </Typography>
                                <Button
                                  startIcon={<Refresh />}
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                  onClick={() => loadAreaDevices(area._id)}
                                  disabled={loadingDevices[area._id]}
                                >
                                  {loadingDevices[area._id] ? "Đang tải..." : "Làm mới"}
                                </Button>
                              </Box>
                              
                              <Divider sx={{ mb: 2 }} />
                              
                              {loadingDevices[area._id] ? (
                                <Box sx={{ py: 2 }}>
                                  <LinearProgress sx={{ my: 2 }} />
                                  <Typography variant="body2" color="text.secondary" align="center">
                                    Đang tải danh sách thiết bị...
                                  </Typography>
                                </Box>
                              ) : (
                                <>
                                  {getLinkedDevices(area).length > 0 ? (
                                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                      {getLinkedDevices(area).map((device, index) => (
                                        <Box
                                          key={device.deviceId || index}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 2,
                                            mb: 2,
                                            borderRadius: 2,
                                            backgroundColor: alpha(theme.palette.info.light, 0.05),
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            '&:hover': {
                                              backgroundColor: alpha(theme.palette.info.light, 0.1),
                                              transform: 'translateY(-2px)',
                                              boxShadow: theme.shadows[2]
                                            }
                                          }}
                                        >
                                          <Avatar
                                            sx={{
                                              bgcolor: alpha(theme.palette.info.main, 0.1),
                                              color: 'info.main',
                                              mr: 2
                                            }}
                                          >
                                            <DevicesOther />
                                          </Avatar>
                                          
                                          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                            <Typography variant="subtitle1" fontWeight="medium">
                                              {device.name || `Thiết bị ${device.deviceId}`}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              ID: {device.deviceId}
                                            </Typography>
                                          </Box>
                                          
                                          <Chip 
                                            variant="outlined"
                                            size="small"
                                            label={device.isActive ? "Trực tuyến" : "Ngoại tuyến"}
                                            icon={device.isActive ? <Wifi fontSize="small" /> : <WifiOff fontSize="small" />}
                                            color={device.isActive ? "success" : "default"}
                                            sx={{ 
                                              ml: 1, 
                                              fontWeight: device.isOnline ? 'medium' : 'normal',
                                              '& .MuiChip-icon': {
                                                color: 'inherit'
                                              }
                                            }}
                                          />
                                        </Box>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Box sx={{ 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      flexGrow: 1,
                                      py: 4,
                                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                                      borderRadius: 2
                                    }}>
                                      <DevicesOther sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
                                      <Typography variant="body1" color="text.secondary" gutterBottom align="center" fontWeight="medium">
                                        Chưa có thiết bị nào được liên kết
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: '80%', mb: 2 }}>
                                        Liên kết thiết bị với khu vực này để theo dõi và kiểm soát tự động
                                      </Typography>
                                      <Link to="/devices" style={{ textDecoration: 'none' }}>
                                        <Button
                                          startIcon={<ArrowForward />}
                                          size="small"
                                          variant="outlined"
                                          color="info"
                                          sx={{ mt: 1, borderRadius: '20px' }}
                                        >
                                          Đi đến quản lý thiết bị
                                        </Button>
                                      </Link>
                                    </Box>
                                  )}
                                </>
                              )}
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
  
        {/* Area Dialog */}
        <Dialog 
          open={openAreaDialog} 
          onClose={handleCloseAreaDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedArea?._id ? 'Chỉnh sửa khu vực' : 'Tạo khu vực mới'}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Tên khu vực"
                name="name"
                value={selectedArea?.name || ''}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Mô tả"
                name="description"
                value={selectedArea?.description || ''}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAreaDialog}>Hủy</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveArea}
              disabled={!selectedArea?.name}
            >
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Plant Dialog */}
        <Dialog 
          open={openPlantDialog} 
          onClose={handleClosePlantDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Thêm cây trồng mới</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Tên cây trồng"
                name="name"
                value={plantForm.name}
                onChange={handlePlantInputChange}
                required
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="plant-type-label">Loại cây trồng</InputLabel>
                <Select
                  labelId="plant-type-label"
                  name="type"
                  value={plantForm.type}
                  onChange={handlePlantInputChange}
                  label="Loại cây trồng"
                >
                  {PLANT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center">
                        {getPlantIcon(type.value)}
                        <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box mt={3}>
                <Typography variant="body2" gutterBottom>
                  Ngưỡng độ ẩm (%)
                </Typography>
                <Slider
                  value={[plantForm.moistureThreshold.min, plantForm.moistureThreshold.max]}
                  onChange={(e, newValue) => {
                    setPlantForm(prev => ({
                      ...prev,
                      moistureThreshold: {
                        min: newValue[0],
                        max: newValue[1]
                      }
                    }));
                  }}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                />
              </Box>
              
              <TextField
                fullWidth
                margin="normal"
                label="Ghi chú"
                name="notes"
                value={plantForm.notes}
                onChange={handlePlantInputChange}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePlantDialog}>Hủy</Button>
            <Button 
              variant="contained" 
              onClick={handleAddPlant}
              disabled={!plantForm.name}
            >
              Thêm
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Plant Edit Dialog */}
        <Dialog 
          open={openPlantEditDialog} 
          onClose={handleClosePlantEditDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Chỉnh sửa cây trồng</DialogTitle>
          <DialogContent dividers>
            {selectedPlant && (
              <Box sx={{ pt: 1 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Tên cây trồng"
                  name="name"
                  value={selectedPlant.name}
                  onChange={handleSelectedPlantInputChange}
                  required
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="edit-plant-type-label">Loại cây trồng</InputLabel>
                  <Select
                    labelId="edit-plant-type-label"
                    name="type"
                    value={selectedPlant.type}
                    onChange={handleSelectedPlantInputChange}
                    label="Loại cây trồng"
                  >
                    {PLANT_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box display="flex" alignItems="center">
                          {getPlantIcon(type.value)}
                          <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box mt={3}>
                  <Typography variant="body2" gutterBottom>
                    Ngưỡng độ ẩm (%)
                  </Typography>
                  <Slider
                    value={[selectedPlant.moistureThreshold.min, selectedPlant.moistureThreshold.max]}
                    onChange={(e, newValue) => {
                      setSelectedPlant(prev => ({
                        ...prev,
                        moistureThreshold: {
                          min: newValue[0],
                          max: newValue[1]
                        }
                      }));
                    }}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 50, label: '50%' },
                      { value: 100, label: '100%' }
                    ]}
                  />
                </Box>
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Ghi chú"
                  name="notes"
                  value={selectedPlant.notes}
                  onChange={handleSelectedPlantInputChange}
                  multiline
                  rows={3}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePlantEditDialog}>Hủy</Button>
            <Button 
              variant="contained" 
              onClick={handleUpdatePlant}
              disabled={!selectedPlant?.name}
            >
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Confirm Delete Dialog */}
        <Dialog
          open={confirmDelete.open}
          onClose={() => setConfirmDelete({ open: false, areaId: null })}
        >
          <DialogTitle>Xác nhận xóa khu vực</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa khu vực này? Hành động này không thể khôi phục.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete({ open: false, areaId: null })}>
              Hủy
            </Button>
            <Button onClick={handleDeleteArea} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Confirm Delete Plant Dialog */}
        <Dialog
          open={confirmDeletePlant.open}
          onClose={() => setConfirmDeletePlant({ open: false, areaId: null, plantIndex: null })}
        >
          <DialogTitle>Xác nhận xóa cây trồng</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa cây trồng này? Hành động này không thể khôi phục.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeletePlant({ open: false, areaId: null, plantIndex: null })}>
              Hủy
            </Button>
            <Button onClick={handleDeletePlant} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </PageContainer>
    );
  };
  
export default AreaManager;
