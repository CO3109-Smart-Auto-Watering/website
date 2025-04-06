import React, { useState, useRef } from 'react';
import { useReactToPrint } from "react-to-print";
import styled from 'styled-components';
import NavBar from '../../components/layout/NavBar';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// const Container = styled.div`
//   flex: 1;
//   padding: 20px;
//   margin-left: 250px; /* Để tránh chồng lên NavBar */
// `;

const Header = styled.h1`
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
`;

const FilterBar = styled.div`
  background: #28a745;
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 5px;


`;

const FilterSection = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  & > div {
    display: flex;
    gap: 10px; /* Thêm khoảng trắng 15px giữa các input */
    align-items: center;
  }
`;

const DateInput = styled.input`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: #333;
  font-size: 14px;
  width: 150px;
`;

const TimeInput = styled.input`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: #333;
  font-size: 14px;
  width: 120px;
`;

const SelectInput = styled.select`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: #333;
  font-size: 14px;
  width: 150px;
`;

const Button = styled.button`
  padding: 5px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => (props.primary ? '#007bff' : '#ff9800')};
  color: white;
`;

const StatsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  text-align: center;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media print {
    margin-bottom: 20px; /* Thêm khoảng cách giữa các thẻ thông số */
  }
`;

const StatTitle = styled.h3`
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const StatDetail = styled.div`
  font-size: 14px;
  color: #999;
`;

const ChartWrapper = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  flex: 1;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media print {
    height: auto; /* Loại bỏ chiều cao cố định khi in */
    page-break-inside: avoid; /* Tránh ngắt trang giữa biểu đồ */
    margin-bottom: 40px; /* Thêm khoảng cách giữa các biểu đồ */
  }
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
`;

const ChartRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
`;

const AdminDashboard = () => {
  const role = localStorage.getItem('role') || 'Unknown';
  const currentDate = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Dữ liệu hard-coded ban đầu với định dạng đầy đủ yyyy-MM-dd
  const initialData = {
    labelsDaily: ['2025-02-25', '2025-02-26', '2025-02-27', '2025-02-28', '2025-03-01', '2025-03-02', '2025-03-03'],
    soilHumidityDataDaily: [40, 50, 60, 40, 45, 65, 50],
    mainPumpData: [20, 15, 18, 10, 12, 15, 8],
    subPumpData: [5, 10, 8, 5, 7, 10, 5],
  };

  // Hard-code dữ liệu theo giờ cho từng ngày
  const hourlyDataByDate = {
    '2025-02-25': {
      labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      humidity: [60, 75, 50, 80, 45, 70, 55, 85, 40, 65, 80, 50, 90, 60, 45, 75, 55, 80, 65, 40, 70, 50, 85, 60],
      temperature: [24.0, 26.5, 22.0, 27.5, 21.0, 25.0, 23.5, 28.0, 20.5, 26.0, 22.5, 27.0, 21.5, 25.5, 23.0, 28.5, 22.0, 26.5, 24.0, 20.0, 27.0, 23.5, 28.0, 21.0],
    },
    '2025-02-26': {
      labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      humidity: [35, 50, 70, 40, 65, 45, 80, 55, 75, 60, 40, 85, 50, 70, 45, 60, 80, 55, 65, 40, 75, 50, 70, 35],
      temperature: [28.0, 25.5, 29.0, 22.0, 27.5, 24.0, 28.5, 23.5, 26.0, 21.0, 27.0, 24.5, 29.0, 22.5, 26.5, 23.0, 28.0, 21.5, 25.0, 22.0, 27.5, 24.0, 28.5, 23.0],
    },
    '2025-02-27': {
      labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      humidity: [60, 80, 45, 70, 55, 85, 40, 65, 50, 75, 60, 90, 45, 70, 55, 80, 40, 65, 50, 75, 60, 85, 45, 70],
      temperature: [27.0, 23.5, 28.0, 21.0, 26.5, 24.0, 29.0, 22.5, 25.0, 20.5, 27.5, 23.0, 28.5, 21.5, 26.0, 24.5, 29.0, 22.0, 25.5, 20.0, 27.0, 23.5, 28.0, 21.0],
    },
    '2025-02-28': {
      labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      humidity: [85, 60, 75, 50, 80, 45, 70, 55, 90, 40, 65, 50, 75, 60, 85, 45, 70, 55, 80, 40, 65, 50, 75, 60],
      temperature: [25.0, 28.0, 22.5, 27.0, 21.0, 26.5, 23.5, 29.0, 20.5, 25.5, 22.0, 27.5, 24.0, 28.5, 21.5, 26.0, 23.0, 28.0, 20.0, 25.0, 22.5, 27.0, 24.0, 28.5],
    },
    '2025-03-01': {
      labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      humidity: [35, 70, 50, 80, 45, 65, 55, 85, 40, 75, 60, 90, 50, 70, 45, 80, 55, 65, 40, 75, 60, 85, 50, 70],
      temperature: [28.0, 23.5, 27.5, 21.0, 26.0, 24.5, 29.0, 22.0, 25.5, 20.5, 27.0, 23.0, 28.5, 21.5, 26.5, 24.0, 29.0, 22.5, 25.0, 20.0, 27.5, 23.5, 28.0, 21.0],
    },
    '2025-03-02': {
      labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      humidity: [80, 55, 70, 45, 85, 50, 65, 40, 75, 60, 90, 45, 70, 55, 80, 40, 65, 50, 75, 60, 85, 45, 70, 55],
      temperature: [30.0, 24.5, 28.0, 22.0, 27.5, 23.5, 29.0, 21.0, 26.0, 24.0, 28.5, 22.5, 27.0, 20.5, 25.5, 23.0, 28.0, 21.5, 26.5, 24.0, 29.0, 22.0, 27.5, 23.5],
    },
    '2025-03-03': {
      labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      humidity: [35, 65, 50, 80, 45, 70, 55, 85, 40, 75, 60, 90, 50, 70, 45, 80, 55, 65, 40, 75, 60, 85, 50, 70],
      temperature: [26.0, 23.0, 28.5, 21.5, 27.0, 24.0, 29.0, 22.5, 25.5, 20.0, 27.5, 23.5, 28.0, 21.0, 26.5, 24.5, 29.0, 22.0, 25.0, 20.5, 27.0, 23.0, 28.5, 21.5],
    },
  };
  const calculateDailyAverages = () => {
    const temperatureDataDaily = [];
    const airHumidityDataDaily = [];
  
    initialData.labelsDaily.forEach(date => {
      const hourlyData = hourlyDataByDate[date];
      const avgTemperature = (hourlyData.temperature.reduce((sum, value) => sum + value, 0) / hourlyData.temperature.length).toFixed(1);
      const avgHumidity = (hourlyData.humidity.reduce((sum, value) => sum + value, 0) / hourlyData.humidity.length).toFixed(1);
      temperatureDataDaily.push(parseFloat(avgTemperature));
      airHumidityDataDaily.push(parseFloat(avgHumidity));
    });
  
    return { temperatureDataDaily, airHumidityDataDaily };
  };
  
  const { temperatureDataDaily, airHumidityDataDaily } = calculateDailyAverages();
  // Lưu trữ startDate và endDate ở định dạng yyyy-MM-dd
  const [filteredData, setFilteredData] = useState({
    labelsDaily: initialData.labelsDaily.map(date => date.slice(5)), // Hiển thị dd-MM trên biểu đồ
    temperatureDataDaily: temperatureDataDaily,
    airHumidityDataDaily: airHumidityDataDaily,
    soilHumidityDataDaily: initialData.soilHumidityDataDaily,
    mainPumpData: initialData.mainPumpData,
    subPumpData: initialData.subPumpData,
  });
  const [startDate, setStartDate] = useState('2025-02-25'); // Định dạng yyyy-MM-dd
  const [endDate, setEndDate] = useState('2025-03-03'); // Định dạng yyyy-MM-dd

  // State cho việc chọn ngày và lọc theo giờ
  const [selectedDate, setSelectedDate] = useState(initialData.labelsDaily[0]); // Mặc định chọn ngày đầu tiên
  const [startTime, setStartTime] = useState('00:00'); // Mặc định từ 00:00
  const [endTime, setEndTime] = useState('23:00'); // Mặc định đến 23:00
  const [filteredHourlyDataState, setFilteredHourlyDataState] = useState({
    labels: hourlyDataByDate[initialData.labelsDaily[0]].labels,
    humidity: hourlyDataByDate[initialData.labelsDaily[0]].humidity,
    temperature: hourlyDataByDate[initialData.labelsDaily[0]].temperature,
  });

  // Hàm chuyển đổi ngày thành định dạng yyyyMMdd để so sánh
  const toComparableDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return parseInt(`${year}${month}${day}`, 10);
  };

  // Hàm chuyển đổi thời gian thành phút để so sánh
  const toHours = (timeString) => {
    const [hours] = timeString.split(':').map(Number);
    return hours;
  };

  // Hàm lọc dữ liệu theo ngày
  const filterData = () => {
    const start = toComparableDate(startDate);
    const end = toComparableDate(endDate);

    const filteredIndices = initialData.labelsDaily
      .map((date, index) => {
        const comparableDate = toComparableDate(date);
        return comparableDate >= start && comparableDate <= end ? index : -1;
      })
      .filter(index => index !== -1);

    const filteredLabels = filteredIndices.map(i => initialData.labelsDaily[i].slice(5)); // Hiển thị dd-MM trên biểu đồ

    setFilteredData({
      labelsDaily: filteredLabels,
      temperatureDataDaily: filteredIndices.map(i => temperatureDataDaily[i]),
      airHumidityDataDaily: filteredIndices.map(i => airHumidityDataDaily[i]),
      soilHumidityDataDaily: filteredIndices.map(i => initialData.soilHumidityDataDaily[i]),
      mainPumpData: filteredIndices.map(i => initialData.mainPumpData[i]),
      subPumpData: filteredIndices.map(i => initialData.subPumpData[i]),
    });

    // Cập nhật selectedDate nếu ngày hiện tại không còn trong danh sách đã lọc
    const newSelectedDate = initialData.labelsDaily[filteredIndices[0]] || initialData.labelsDaily[0];
    setSelectedDate(newSelectedDate);
    // Cập nhật dữ liệu theo giờ cho ngày mới
    setFilteredHourlyDataState({
      labels: hourlyDataByDate[newSelectedDate].labels,
      humidity: hourlyDataByDate[newSelectedDate].humidity,
      temperature: hourlyDataByDate[newSelectedDate].temperature,
    });
  };

  // Hàm lọc dữ liệu theo giờ
  const filterHourlyData = () => {
    const dataForDate = hourlyDataByDate[selectedDate] || { labels: [], humidity: [], temperature: [] };
    const startHour = toHours(startTime);
    const endHour = toHours(endTime);
  
    const filteredIndices = dataForDate.labels
      .map((time, index) => {
        const hour = toHours(time);
        return hour >= startHour && hour <= endHour ? index : -1;
      })
      .filter(index => index !== -1);
  
    setFilteredHourlyDataState({
      labels: filteredIndices.map(i => dataForDate.labels[i]),
      humidity: filteredIndices.map(i => dataForDate.humidity[i]),
      temperature: filteredIndices.map(i => dataForDate.temperature[i]),
    });
  };

  // Lấy dữ liệu đã lọc theo giờ cho ngày được chọn
  const filteredHourlyData = filteredHourlyDataState;
  // Hàm tính trung bình, min, max từ mảng dữ liệu
  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      return { avg: 0, min: 0, max: 0 };
    }
    const avg = (data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(1);
    const min = Math.min(...data);
    const max = Math.max(...data);
    return { avg, min, max };
  };

  // Tính toán động các giá trị trung bình và min/max
  const temperatureStats = calculateStats(filteredData.temperatureDataDaily);
  const airHumidityStats = calculateStats(filteredData.airHumidityDataDaily);
  const soilHumidityStats = calculateStats(filteredData.soilHumidityDataDaily);

  // Tính tổng thời gian máy bơm
  const mainPumpTotal = filteredData.mainPumpData.reduce((sum, value) => sum + value, 0);
  const subPumpTotal = filteredData.subPumpData.reduce((sum, value) => sum + value, 0);
  const totalPumpTime = mainPumpTotal + subPumpTotal;

  // Hàm in báo cáo
  // const handlePrint = () => {
  //   window.print();
  // };

  // Cấu hình dữ liệu cho biểu đồ Nhiệt độ & Độ ẩm không khí (Daily)
  const tempAirHumidityChartData = {
    labels: filteredData.labelsDaily,
    datasets: [
      {
        label: 'Nhiệt độ (°C)',
        data: filteredData.temperatureDataDaily,
        borderColor: '#ff69b4',
        backgroundColor: '#ff69b4',
        fill: false,
        tension: 0.4,
        yAxisID: 'y-left',
      },
      {
        label: 'Độ ẩm không khí (%)',
        data: filteredData.airHumidityDataDaily,
        borderColor: '#1e90ff',
        backgroundColor: '#1e90ff',
        fill: false,
        tension: 0.4,
        yAxisID: 'y-right',
      },
    ],
  };

  // Cấu hình dữ liệu cho biểu đồ Độ ẩm đất (Daily)
  const soilHumidityChartData = {
    labels: filteredData.labelsDaily,
    datasets: [
      {
        label: 'Độ ẩm đất (%)',
        data: filteredData.soilHumidityDataDaily,
        borderColor: '#8a2be2',
        backgroundColor: '#8a2be2',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Cấu hình dữ liệu cho biểu đồ Thời gian máy bơm (Daily)
  const pumpTimeChartData = {
    labels: filteredData.labelsDaily,
    datasets: [
      {
        label: 'Máy bơm thủ công (phút)',
        data: filteredData.mainPumpData,
        backgroundColor: '#ffa500',
      },
      {
        label: 'Máy bơm tự động (phút)',
        data: filteredData.subPumpData,
        backgroundColor: '#20b2aa',
      },
    ],
  };

  // Cấu hình dữ liệu cho biểu đồ Độ ẩm không khí (Hourly)
  const humidityChartDataHourly = {
    labels: filteredHourlyData.labels,
    datasets: [
      {
        label: 'Sensor-Humidity',
        data: filteredHourlyData.humidity,
        borderColor: '#1e90ff',
        backgroundColor: '#1e90ff',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Cấu hình dữ liệu cho biểu đồ Nhiệt độ (Hourly)
  const temperatureChartDataHourly = {
    labels: filteredHourlyData.labels,
    datasets: [
      {
        label: 'Sensor-Temp',
        data: filteredHourlyData.temperature,
        borderColor: '#1e90ff',
        backgroundColor: '#1e90ff',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Tùy chọn cho biểu đồ Nhiệt độ & Độ ẩm không khí (Daily) với hai trục Y
  const tempAirHumidityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 10,
        },
      },
      title: {
        display: true,
        text: 'Nhiệt độ & Độ ẩm không khí (Daily)',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      'y-left': {
        position: 'left',
        title: {
          display: true,
          text: 'Nhiệt độ (°C)',
        },
        min: 20,
        max: 40,
      },
      'y-right': {
        position: 'right',
        title: {
          display: true,
          text: 'Độ ẩm không khí (%)',
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Thời gian',
        },
        offset: true,
      },
    },
    layout: {
      padding: {
        bottom: 30,
      },
    },
  };

  // Tùy chọn chung cho các biểu đồ đường khác
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 10,
        },
      },
      title: {
        display: true,
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Giá trị',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Thời gian',
        },
        offset: true,
      },
    },
    layout: {
      padding: {
        bottom: 30,
      },
    },
  };

  // Tùy chọn cho biểu đồ cột
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 10,
        },
      },
      title: {
        display: true,
        text: 'Thời gian máy bơm (Daily)',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Thời gian (phút)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Thời gian',
        },
        offset: true,
      },
    },
    layout: {
      padding: {
        bottom: 30,
      },
    },
  };

  // Tùy chọn cho biểu đồ theo giờ
  const hourlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 10,
        },
      },
      title: {
        display: true,
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Giá trị',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Thời gian',
        },
        offset: true,
      },
    },
    layout: {
      padding: {
        bottom: 30,
      },
    },
  };
  const temperatureHourlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 10,
        },
      },
      title: {
        display: true,
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 50, // Giá trị tối đa của trục Y cho biểu đồ nhiệt độ
        title: {
          display: true,
          text: 'Giá trị',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Thời gian',
        },
        offset: true,
      },
    },
    layout: {
      padding: {
        bottom: 30,
      },
    },
  };
  const contentToPrintRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: contentToPrintRef,
  });

  const getPageMargins = () => {
    return `@page { margin: 0 20px 0 0 !important; }`;
  };

  return (
    <div className='flex'>
      <div className='w-[250px]'> 
        <NavBar/>
      </div>
      <div className=' '>
      <div ref={contentToPrintRef} className='flex-1  p-[20px] ' >
      <style>{getPageMargins()}</style>
        <Header> Báo Cáo Thống Kê Cảm Biến</Header>
        <FilterBar>
          <div>Dữ liệu cảm biến và hoạt động máy bơm</div>
          <FilterSection>
            <div>
              Từ ngày: <DateInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              Đến ngày: <DateInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button className='no-print' primary onClick={filterData}>Lọc dữ liệu</Button>
            <Button className='no-print' onClick={() => handlePrint()}>In báo cáo</Button>
          </FilterSection>
          <div className='no-print'>Thời gian: {currentDate}</div>
        </FilterBar>
        <ChartRow>
          <div style={{ flex: 1 }}>
            <StatsWrapper>
              <StatCard>
                <StatTitle>Nhiệt độ trung bình</StatTitle>
                <StatValue>{temperatureStats.avg}°C</StatValue>
                <StatDetail>Min: {temperatureStats.min}°C | Max: {temperatureStats.max}°C</StatDetail>
              </StatCard>
              <StatCard>
                <StatTitle>Độ ẩm không khí trung bình</StatTitle>
                <StatValue>{airHumidityStats.avg}%</StatValue>
                <StatDetail>Min: {airHumidityStats.min}% | Max: {airHumidityStats.max}%</StatDetail>
              </StatCard>
            </StatsWrapper>
            <ChartWrapper>
              <ChartTitle>Nhiệt độ & Độ ẩm không khí (Daily)</ChartTitle>
              <ChartContainer>
                <Line data={tempAirHumidityChartData} options={tempAirHumidityChartOptions} />
              </ChartContainer>
            </ChartWrapper>
          </div>
          <div style={{ flex: 1 }}>
            <StatsWrapper>
              <StatCard>
                <StatTitle>Độ ẩm đất trung bình</StatTitle>
                <StatValue>{soilHumidityStats.avg}%</StatValue>
                <StatDetail>Min: {soilHumidityStats.min}% | Max: {soilHumidityStats.max}%</StatDetail>
              </StatCard>
              <StatCard>
                <StatTitle>Tổng thời gian máy bơm</StatTitle>
                <StatValue>{totalPumpTime} phút</StatValue>
                <StatDetail>Thời gian bơm chính: {mainPumpTotal} phút<br/>Tự động: {subPumpTotal} phút</StatDetail>
              </StatCard>
            </StatsWrapper>
            <ChartWrapper>
              <ChartTitle>Độ ẩm đất (Daily)</ChartTitle>
              <ChartContainer>
                <Line data={soilHumidityChartData} options={{ ...lineChartOptions, plugins: { ...lineChartOptions.plugins, title: { ...lineChartOptions.plugins.title, text: 'Độ ẩm đất (Daily)' } } }} />
              </ChartContainer>
            </ChartWrapper>
          </div>
        </ChartRow>
        <ChartWrapper>
          <ChartTitle>Thời gian máy bơm (Daily)</ChartTitle>
          <ChartContainer>
            <Bar data={pumpTimeChartData} options={barChartOptions} />
          </ChartContainer>
        </ChartWrapper>
        <FilterBar>
          <div>Dữ liệu cảm biến theo giờ</div>
          <FilterSection>
            <div>
              <span className='no-print'>Chọn ngày: </span>
              <SelectInput className='no-print' value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                {filteredData.labelsDaily.map((label, index) => (
                  <option key={index} value={initialData.labelsDaily[initialData.labelsDaily.findIndex(date => date.slice(5) === label)]}>
                    {label}
                  </option>
                ))}
              </SelectInput>
              Từ giờ: <TimeInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              Đến giờ: <TimeInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              <Button className='no-print' primary onClick={filterHourlyData}>Lọc dữ liệu</Button>
            </div>
          </FilterSection>
          <div>Ngày: {selectedDate.slice(5)}</div>
        </FilterBar>
        <ChartRow>
          <ChartWrapper style={{ flex: 1 }}>
            <ChartTitle>Độ ẩm không khí (%) (Hourly)</ChartTitle>
            <ChartContainer>
              <Line data={humidityChartDataHourly} options={{ ...hourlyChartOptions, plugins: { ...hourlyChartOptions.plugins, title: { ...hourlyChartOptions.plugins.title, text: 'Độ ẩm không khí (%) (Hourly)' } } }} />
            </ChartContainer>
          </ChartWrapper>
          <ChartWrapper style={{ flex: 1 }}>
            <ChartTitle>Nhiệt độ (°C) (Hourly)</ChartTitle>
            <ChartContainer>
              <Line data={temperatureChartDataHourly} options={{ ...temperatureHourlyChartOptions, plugins: { ...temperatureHourlyChartOptions.plugins, title: { ...temperatureHourlyChartOptions.plugins.title, text: 'Nhiệt độ (°C) (Hourly)' } } }} />
            </ChartContainer>
          </ChartWrapper>
        </ChartRow>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;