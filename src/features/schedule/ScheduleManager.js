import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, CardContent, Button, Grid, TextField, 
  FormControl, InputLabel, MenuItem, Select, FormControlLabel,
  Switch, Box, Paper, Chip, IconButton, Alert, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DevicesIcon from '@mui/icons-material/Devices';
import GrassIcon from '@mui/icons-material/Grass';
import { format, isAfter, isBefore, addMinutes } from 'date-fns';
import { 
  getAllSchedules, createSchedule, updateSchedule,
  deleteSchedule, toggleScheduleStatus 
} from '../../services/scheduleService';
import { getUserDevices } from '../../services/deviceService';
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
    
    // Set up interval to refresh schedules every minute
    const interval = setInterval(fetchSchedules, 60000);
    return () => clearInterval(interval);
  }, []);

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

  // Handle area change
  const handleAreaChange = (e) => {
    const areaId = e.target.value;
    setSelectedArea(areaId);
    setSelectedPlantIndex(-1); // Reset plant selection when area changes
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
    setSelectedArea(schedule.areaId || '');
    setSelectedPlantIndex(schedule.plantIndex !== undefined ? schedule.plantIndex : -1);
    
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

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Quản lý lịch tưới cây
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {editMode ? 'Sửa lịch tưới' : 'Tạo lịch tưới mới'}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Tên lịch tưới"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              
              {/* Device selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Thiết bị bơm nước</InputLabel>
                  <Select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    label="Thiết bị bơm nước"
                  >
                    {devices
                      .filter(device => device.feeds && device.feeds.includes('pump-motor'))
                      .map(device => (
                        <MenuItem key={device.deviceId} value={device.deviceId}>
                          <Box display="flex" alignItems="center">
                            <DevicesIcon sx={{ mr: 1, color: 'primary.main' }} />
                            {device.deviceName}
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              
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
                />
              </Grid>
              
              {/* Area selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Khu vực</InputLabel>
                  <Select
                    value={selectedArea}
                    onChange={handleAreaChange}
                    label="Khu vực"
                  >
                    <MenuItem value="">
                      <em>Không chọn khu vực</em>
                    </MenuItem>
                    {areas.map(area => (
                      <MenuItem key={area._id} value={area._id}>
                        <Box display="flex" alignItems="center">
                          <GrassIcon sx={{ mr: 1, color: 'success.main' }} />
                          {area.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Plant selection (only show if area is selected) */}
              {selectedArea && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Cây trồng</InputLabel>
                    <Select
                      value={selectedPlantIndex}
                      onChange={(e) => setSelectedPlantIndex(e.target.value)}
                      label="Cây trồng"
                    >
                      <MenuItem value={-1}>
                        <em>Tưới cho toàn bộ khu vực</em>
                      </MenuItem>
                      {areas
                        .find(area => area._id === selectedArea)?.plants
                        .map((plant, index) => (
                          <MenuItem key={index} value={index}>
                            <Box display="flex" alignItems="center">
                              <WaterDropIcon sx={{ mr: 1, color: 'primary.main' }} />
                              {plant.name}
                            </Box>
                          </MenuItem>
                        )) || []}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {scheduleType === 'onetime' ? (
                <Grid item xs={12}>
                  <TextField
                    label="Thời gian"
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                    required
                  />
                </Grid>
              ) : (
                <>
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
                              <Chip key={value} label={getDayName(value)} />
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
                    </FormControl>
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={resetForm}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : (editMode ? 'Cập nhật' : 'Tạo lịch')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
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