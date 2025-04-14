import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all schedules for the current user
export const getAllSchedules = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/schedules`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải lịch tưới:", error);
    throw error;
  }
};

// Create a new schedule
export const createSchedule = async (scheduleData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/schedules`, scheduleData, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo lịch tưới:", error);
    throw error;
  }
};

// Update an existing schedule
export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/schedules/${scheduleId}`, scheduleData, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật lịch tưới:", error);
    throw error;
  }
};

// Delete a schedule
export const deleteSchedule = async (scheduleId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/schedules/${scheduleId}`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa lịch tưới:", error);
    throw error;
  }
};

// Toggle schedule active status
export const toggleScheduleStatus = async (scheduleId, currentStatus) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/schedules/${scheduleId}/toggle`, {
      isActive: !currentStatus
    }, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái lịch tưới:", error);
    throw error;
  }
};