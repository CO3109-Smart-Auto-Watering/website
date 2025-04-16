import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, CardContent, Button, Grid, TextField, 
  FormControl, InputLabel, MenuItem, Select, FormControlLabel,
  Switch, Box, Paper, Chip, IconButton, Alert, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, CircularProgress, FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DevicesIcon from '@mui/icons-material/Devices';
import GrassIcon from '@mui/icons-material/Grass';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format, isAfter, isBefore, addMinutes } from 'date-fns';
import { 
  getAllSchedules, createSchedule, updateSchedule,
  deleteSchedule, toggleScheduleStatus 
} from '../../services/scheduleService';
import { getUserDevices, getDeviceAreaMapping } from '../../services/deviceService';
import { getAreas } from '../../services/areaService';

const ScheduleManager = () => {
  // Form states
  const [scheduleType, setScheduleType] = useState('onetime');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(10);
  
  // One-time schedule states
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  
  // Recurring schedule states
  const [startTime, setStartTime] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  
  // Device and plant states
  const [devices, setDevices] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPlantIndex, setSelectedPlantIndex] = useState(-1);
  const [deviceAreaMap, setDeviceAreaMap] = useState({});
  const [selectedDeviceActive, setSelectedDeviceActive] = useState(false);
  
  // UI states
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [editMode, setEditMode] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load existing schedules, devices and areas on component mount
  useEffect(() => {
    fetchSchedules();
    fetchDevices();
    fetchAreas();
    fetchDeviceAreaMapping();

    // Set up interval to refresh schedules every minute
    const interval = setInterval(fetchSchedules, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedDevice && deviceAreaMap[selectedDevice]) {
      setSelectedArea(deviceAreaMap[selectedDevice].areaId);
      setSelectedPlantIndex(deviceAreaMap[selectedDevice].plantIndex);
    }
  }, [selectedDevice, deviceAreaMap]);

  // Fetch all user schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await getAllSchedules();
      
      if (response.success) {
        setSchedules(response.schedules);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      showAlert("Không thể tải lịch tưới", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user devices
  const fetchDevices = async () => {
    try {
      const response = await getUserDevices();
      
      if (response.success) {
        setDevices(response.devices);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      showAlert("Không thể tải danh sách thiết bị", "error");
    }
  };

  // Fetch areas
  const fetchAreas = async () => {
    try {
      const response = await getAreas();
      
      if (response.success) {
        setAreas(response.areas);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      showAlert("Không thể tải danh sách khu vực", "error");
    }
  };

  const fetchDeviceAreaMapping = async () => {
    try {
      const response = await getDeviceAreaMapping();
      
      if (response.success) {
        // Tạo map từ deviceId -> { areaId, plantIndex }
        const mapping = {};
        response.mappings.forEach(item => {
          mapping[item.deviceId] = {
            areaId: item.areaId,
            plantIndex: item.plantIndex !== undefined ? item.plantIndex : -1
          };
        });
        setDeviceAreaMap(mapping);
      }
    } catch (error) {
      console.error("Error fetching device-area mappings:", error);
    }
  };
  
  //Handle Device change
  const handleDeviceChange = (e) => {
    const deviceId = e.target.value;
    setSelectedDevice(deviceId);
    
    // Tìm thiết bị trong danh sách để kiểm tra trạng thái hoạt động
    const device = devices.find(d => d.deviceId === deviceId);
    setSelectedDeviceActive(device ? device.isActive : false);
    
    // Tự động cập nhật khu vực và cây trồng nếu thiết bị đã được gắn với khu vực
    if (deviceAreaMap[deviceId]) {
      setSelectedArea(deviceAreaMap[deviceId].areaId);
      setSelectedPlantIndex(deviceAreaMap[deviceId].plantIndex);
    } else {
      // Nếu thiết bị chưa được gắn với khu vực nào, reset các selection
      setSelectedArea('');
      setSelectedPlantIndex(-1);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate device
      if (!selectedDevice) {
        showAlert("Vui lòng chọn thiết bị bơm nước", "error");
        setLoading(false);
        return;
      }
      
      // Kiểm tra thiết bị có đang hoạt động không
      const device = devices.find(d => d.deviceId === selectedDevice);
      if (!device || !device.isActive) {
        showAlert("Thiết bị đang không hoạt động. Không thể tạo lịch tưới.", "error");
        setLoading(false);
        return;
      }
      
      // Prepare schedule data based on type
      let scheduleData = {
        name,
        scheduleType,
        duration: parseInt(duration),
        isCompleted: false,
        deviceId: selectedDevice,
        areaId: selectedArea === '' ? null : selectedArea,
        plantIndex: selectedArea === '' ? -1 : selectedPlantIndex
      };
      
      if (scheduleType === 'onetime') {
        scheduleData.scheduledDateTime = scheduledDateTime;
      } else {
        scheduleData.startTime = startTime;
        scheduleData.daysOfWeek = daysOfWeek;
      }
      
      let response;
      
      if (editMode && editScheduleId) {
        // Update existing schedule
        response = await updateSchedule(editScheduleId, scheduleData);
        showAlert("Cập nhật lịch tưới thành công");
      } else {
        // Create new schedule
        response = await createSchedule(scheduleData);
        showAlert("Tạo lịch tưới thành công");
      }
      
      if (response.success) {
        resetForm();
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      showAlert("Lỗi khi lưu lịch tưới", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle schedule activation
  const toggleScheduleActive = async (scheduleId, currentStatus) => {
    try {
      setLoading(true);
      
      const response = await toggleScheduleStatus(scheduleId, currentStatus);
      
      if (response.success) {
        fetchSchedules();
        showAlert(`Đã ${!currentStatus ? 'kích hoạt' : 'tạm dừng'} lịch tưới`);
      }
    } catch (error) {
      console.error("Error toggling schedule status:", error);
      showAlert("Không thể thay đổi trạng thái lịch tưới", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete a schedule
  const handleDelete = async (scheduleId) => {
    try {
      setLoading(true);
      
      const response = await deleteSchedule(scheduleId);
      
      if (response.success) {
        fetchSchedules();
        showAlert("Đã xóa lịch tưới");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      showAlert("Không thể xóa lịch tưới", "error");
    } finally {
      setLoading(false);
    }
  };

  // Edit a schedule
  const handleEdit = (schedule) => {
    setEditMode(true);
    setEditScheduleId(schedule._id);
    setName(schedule.name);
    setDuration(schedule.duration);
    setScheduleType(schedule.scheduleType);
    setSelectedDevice(schedule.deviceId || '');
    
    // Tự động cập nhật khu vực và cây trồng dựa trên deviceId
    if (schedule.deviceId && deviceAreaMap[schedule.deviceId]) {
      setSelectedArea(deviceAreaMap[schedule.deviceId].areaId);
      setSelectedPlantIndex(deviceAreaMap[schedule.deviceId].plantIndex);
    } else {
      setSelectedArea(schedule.areaId || '');
      setSelectedPlantIndex(schedule.plantIndex !== undefined ? schedule.plantIndex : -1);
    }
    
    // Kiểm tra trạng thái hoạt động của thiết bị
    const device = devices.find(d => d.deviceId === schedule.deviceId);
    setSelectedDeviceActive(device ? device.isActive : false);
    
    if (schedule.scheduleType === 'onetime') {
      // Format date to local datetime-local input format
      const dateObj = new Date(schedule.scheduledDateTime);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      
      setScheduledDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setStartTime(schedule.startTime);
      setDaysOfWeek(schedule.daysOfWeek);
    }
  };

  // Reset form and exit edit mode
  const resetForm = () => {
    setEditMode(false);
    setEditScheduleId(null);
    setName('');
    setDuration(10);
    setScheduleType('onetime');
    setScheduledDateTime('');
    setStartTime('');
    setDaysOfWeek([]);
    setSelectedDevice('');
    setSelectedArea('');
    setSelectedPlantIndex(-1);
    setSelectedDeviceActive(false);
  };

  // Show alert message
  const showAlert = (message, severity = 'success') => {
    setAlert({
      show: true,
      message,
      severity
    });
  };

  // Close alert
  const handleCloseAlert = () => {
    setAlert({ ...alert, show: false });
  };

  // Get day name from day number
  const getDayName = (day) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[day];
  };

  // Helper functions for schedule status
  const isCurrentlyWatering = (schedule) => {
    if (!schedule.isActive || schedule.isCompleted) return false;
    
    const now = new Date();
    const scheduleTime = new Date(schedule.scheduledDateTime);
    const endTime = addMinutes(scheduleTime, schedule.duration);
    
    return isAfter(now, scheduleTime) && isBefore(now, endTime);
  };
  
  const isRecurringCurrentlyWatering = (schedule) => {
    if (!schedule.isActive || schedule.isCompleted) return false;
    
    const now = new Date();
    const currentDay = now.getDay();
    
    // Check if today is in the schedule days
    if (!schedule.daysOfWeek.includes(currentDay)) return false;
    
    // Parse the schedule time
    const [hours, minutes] = schedule.startTime.split(':').map(Number);
    const scheduleTimeToday = new Date();
    scheduleTimeToday.setHours(hours, minutes, 0, 0);
    
    const endTime = addMinutes(scheduleTimeToday, schedule.duration);
    
    return isAfter(now, scheduleTimeToday) && isBefore(now, endTime);
  };
  
  const isWaiting = (schedule) => {
    if (!schedule.isActive || schedule.isCompleted) return false;
    
    if (schedule.scheduleType === 'onetime') {
      const now = new Date();
      const scheduleTime = new Date(schedule.scheduledDateTime);
      return isBefore(now, scheduleTime);
    } else {
      // For recurring schedules, it's waiting if it's active but not currently watering
      return !isRecurringCurrentlyWatering(schedule);
    }
  };

  // Get the status and color for a schedule
  const getScheduleStatus = (schedule) => {
    if (!schedule.isActive) {
      return { label: "Tạm dừng", color: "default" };
    }
    
    if (schedule.isCompleted) {
      return { label: "Hoàn thành", color: "success" };
    }
    
    if (schedule.scheduleType === 'onetime') {
      if (isCurrentlyWatering(schedule)) {
        return { label: "Đang hoạt động", color: "error" };
      } else if (isWaiting(schedule)) {
        return { label: "Đang chờ", color: "warning" };
      }
    } else {
      if (isRecurringCurrentlyWatering(schedule)) {
        return { label: "Đang hoạt động", color: "error" };
      } else {
        return { label: "Đang chờ", color: "warning" };
      }
    }
    
    // Fallback
    return { label: "Đang chờ", color: "warning" };
  };

  // Get device name by ID
  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.deviceId === deviceId);
    return device ? device.deviceName : 'Không xác định';
  };

  // Get area name by ID
  const getAreaName = (areaId) => {
    const area = areas.find(a => a._id === areaId);
    return area ? area.name : '';
  };

  // Get plant name by area ID and plant index
  const getPlantName = (areaId, plantIndex) => {
    if (!areaId || plantIndex < 0) return '';
    const area = areas.find(a => a._id === areaId);
    if (!area || !area.plants || !area.plants[plantIndex]) return '';
    return area.plants[plantIndex].name;
  };

  // Lấy thông tin khu vực và cây trồng của thiết bị đã chọn
  const getSelectedDeviceAreaAndPlant = () => {
    if (!selectedDevice) return { areaName: '', plantName: '' };
    
    const areaName = getAreaName(selectedArea);
    const plantName = getPlantName(selectedArea, selectedPlantIndex);
    
    return { areaName, plantName };
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Quản lý lịch tưới cây
      </Typography>
      
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'primary.main' }}>
            {editMode ? (
              <EditIcon sx={{ mr: 1 }} />
            ) : (
              <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>+</Box>
            )}
            {editMode ? 'Sửa lịch tưới' : 'Tạo lịch tưới mới'}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3 
            }}>
              {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: 'text.secondary' }}>
                  Thông tin cơ bản
                </Typography>
                
                <TextField
                  label="Tên lịch tưới"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  placeholder="Nhập tên lịch tưới..."
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Loại lịch</InputLabel>
                      <Select
                        value={scheduleType}
                        onChange={(e) => setScheduleType(e.target.value)}
                        label="Loại lịch"
                      >
                        <MenuItem value="onetime">Một lần</MenuItem>
                        <MenuItem value="recurring">Hàng tuần</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Thời gian tưới (phút)"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      inputProps={{ min: 1, max: 120 }}
                      fullWidth
                      required
                      helperText="Thời gian tưới tối đa 120 phút"
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* PHẦN 2: CHỌN THIẾT BỊ */}
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: 'text.secondary' }}>
                  Thiết bị và khu vực
                </Typography>
                
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Thiết bị bơm nước</InputLabel>
                  <Select
                    value={selectedDevice}
                    onChange={handleDeviceChange} 
                    label="Thiết bị bơm nước"
                  >
                    {devices
                      .filter(device => device.feeds && device.feeds.includes('pump-motor'))
                      .map(device => (
                        <MenuItem key={device.deviceId} value={device.deviceId}>
                          <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
                            <Box display="flex" alignItems="center">
                              <DevicesIcon sx={{ mr: 1, color: device.isActive ? 'primary.main' : 'text.disabled' }} />
                              {device.deviceName}
                            </Box>
                            {device.isActive ? 
                              <Chip 
                                icon={<CheckCircleIcon />} 
                                label="Hoạt động" 
                                size="small" 
                                color="success" 
                                sx={{ ml: 2 }}
                              /> : 
                              <Chip 
                                icon={<ErrorIcon />} 
                                label="Không hoạt động" 
                                size="small" 
                                color="error" 
                                sx={{ ml: 2 }}
                              />
                            }
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                
                {/* Hiển thị thông tin thiết bị khi đã chọn */}
                {selectedDevice && (
                  <Box 
                    sx={{ 
                      mt: 2,
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: selectedDeviceActive ? 'success.light' : 'error.light',
                      bgcolor: selectedDeviceActive ? 'success.50' : 'error.50',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {/* Trạng thái thiết bị */}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        pb: 2,
                        borderBottom: '1px dashed',
                        borderColor: selectedDeviceActive ? 'success.light' : 'error.light',
                      }}
                    >
                      <Box sx={{ mr: 2 }}>
                        {selectedDeviceActive ? 
                          <CheckCircleIcon sx={{ fontSize: 36, color: 'success.main' }} /> : 
                          <ErrorIcon sx={{ fontSize: 36, color: 'error.main' }} />
                        }
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {getDeviceName(selectedDevice)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedDeviceActive ? 
                            "Thiết bị đang hoạt động bình thường" : 
                            "Thiết bị không hoạt động, không thể tạo lịch mới"
                          }
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Thông tin khu vực */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1 }}>
                      Thông tin khu vực và cây trồng:
                    </Typography>
                    
                    {selectedArea ? (
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        p: 1.5,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <Box display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                          <GrassIcon sx={{ mr: 1, color: 'success.main' }} />
                          <Typography sx={{ fontWeight: 'medium' }}>
                            {getSelectedDeviceAreaAndPlant().areaName}
                          </Typography>
                        </Box>
                        
                        {getSelectedDeviceAreaAndPlant().plantName ? (
                          <Box display="flex" alignItems="center" ml={3} mt={0.5}>
                            <WaterDropIcon sx={{ mr: 1, color: 'info.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'info.dark' }}>
                              {getSelectedDeviceAreaAndPlant().plantName}
                            </Typography>
                          </Box>
                        ) : (
                          <Box display="flex" alignItems="center" ml={3} mt={0.5}>
                            <Typography variant="body2" color="text.secondary">
                              Tưới cho toàn bộ khu vực
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Thiết bị chưa được liên kết với khu vực nào. Hãy liên kết thiết bị với khu vực trước khi tạo lịch tưới.
                      </Alert>
                    )}
                  </Box>
                )}
              </Paper>
              
              {/* PHẦN 3: CẤU HÌNH THỜI GIAN */}
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: 'text.secondary' }}>
                  Cấu hình thời gian
                </Typography>
                
                {scheduleType === 'onetime' ? (
                  <TextField
                    label="Thời gian tưới"
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                    required
                    helperText="Chọn thời điểm bắt đầu tưới"
                  />
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Giờ bắt đầu"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        fullWidth
                        required
                        helperText="Giờ bắt đầu tưới hàng ngày"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Ngày trong tuần</InputLabel>
                        <Select
                          multiple
                          value={daysOfWeek}
                          onChange={(e) => setDaysOfWeek(e.target.value)}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={getDayName(value)} size="small" />
                              ))}
                            </Box>
                          )}
                          label="Ngày trong tuần"
                        >
                          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                            <MenuItem key={day} value={day}>
                              {getDayName(day)}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>Chọn các ngày trong tuần cần tưới</FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>
                )}
              </Paper>
              
              {/* PHẦN 4: NÚT HÀNH ĐỘNG */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  startIcon={<DeleteIcon />}
                  sx={{ px: 3 }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !selectedDeviceActive}
                  startIcon={editMode ? <EditIcon /> : <PlayArrowIcon />}
                  sx={{ px: 3 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    editMode ? 'Cập nhật' : 'Tạo lịch'
                  )}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Danh sách lịch tưới
        </Typography>
        
        {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
        
        {!loading && schedules.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">
              Chưa có lịch tưới nào
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên lịch</TableCell>
                  <TableCell>Thiết bị</TableCell>
                  <TableCell>Khu vực/Cây trồng</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Thời lượng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => {
                  const status = getScheduleStatus(schedule);
                  const areaName = getAreaName(schedule.areaId);
                  const plantName = getPlantName(schedule.areaId, schedule.plantIndex);
                  
                  return (
                    <TableRow key={schedule._id}>
                      <TableCell>{schedule.name}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <DevicesIcon sx={{ mr: 1, fontSize: 'small', color: 'primary.main' }} />
                          {getDeviceName(schedule.deviceId)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {areaName && (
                          <Box>
                            <Box display="flex" alignItems="center">
                              <GrassIcon sx={{ mr: 1, fontSize: 'small', color: 'success.main' }} />
                              {areaName}
                            </Box>
                            {plantName && (
                              <Box display="flex" alignItems="center" ml={2} mt={0.5}>
                                <WaterDropIcon sx={{ mr: 1, fontSize: 'small', color: 'info.main' }} />
                                <Typography variant="body2" color="textSecondary">
                                  {plantName}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.scheduleType === 'onetime' ? 'Một lần' : 'Hàng tuần'}
                      </TableCell>
                      <TableCell>
                        {schedule.scheduleType === 'onetime' 
                          ? format(new Date(schedule.scheduledDateTime), 'dd/MM/yyyy HH:mm')
                          : (
                            <>
                              {schedule.startTime}<br/>
                              <small>
                                {schedule.daysOfWeek.map(day => getDayName(day)).join(', ')}
                              </small>
                            </>
                          )
                        }
                      </TableCell>
                      <TableCell>{schedule.duration} phút</TableCell>
                      <TableCell>
                        <Chip 
                          label={status.label}
                          color={status.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color={schedule.isActive ? "warning" : "success"}
                          onClick={() => toggleScheduleActive(schedule._id, schedule.isActive)}
                          disabled={schedule.isCompleted}
                          title={schedule.isActive ? "Tạm dừng" : "Kích hoạt"}
                        >
                          {schedule.isActive ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(schedule)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error"
                          onClick={() => handleDelete(schedule._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      <Snackbar
        open={alert.show}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ScheduleManager;