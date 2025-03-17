import React, { useState } from 'react';
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

const Container = styled.div`
  padding: 20px;
  margin-left: 250px; /* Để tránh chồng lên NavBar */
`;

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

  @media print {
    display: none; /* Ẩn FilterBar khi in */
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  & > div {
    display: flex;
    gap: 10px; /* Thêm khoảng trắng 15px giữa "Từ ngày" và "Đến ngày" */
    align-items: center;
  }
`;

const DateInput = styled.input`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white; /* Đặt màu nền trắng để khớp với ô input */
  color: #333; /* Đặt màu chữ đen để dễ đọc */
  font-size: 14px;
  width: 150px; /* Đặt chiều rộng cố định để đồng đều */
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

  // Dữ liệu hard-coded ban đầu
  const initialData = {
    labelsDaily: ['25-02', '26-02', '27-02', '28-02', '01-03', '02-03', '03-03'],
    temperatureDataDaily: [24, 28, 27, 25, 28, 30, 26],
    airHumidityDataDaily: [60, 35, 60, 85, 35, 80, 35],
    soilHumidityDataDaily: [40, 50, 60, 40, 45, 65, 50],
    mainPumpData: [20, 15, 18, 10, 12, 15, 8],
    subPumpData: [5, 10, 8, 5, 7, 10, 5],
  };

  // Lưu trữ startDate và endDate ở định dạng yyyy-MM-dd
  const [filteredData, setFilteredData] = useState(initialData);
  const [startDate, setStartDate] = useState('2025-02-25'); // Định dạng yyyy-MM-dd
  const [endDate, setEndDate] = useState('2025-03-03'); // Định dạng yyyy-MM-dd

  // Hàm chuyển đổi định dạng yyyy-MM-dd sang dd-MM để so sánh với labelsDaily
  const formatDateForComparison = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}`;
  };

  // Hàm lọc dữ liệu theo ngày
  const filterData = () => {
    const start = formatDateForComparison(startDate);
    const end = formatDateForComparison(endDate);
    const filteredLabels = initialData.labelsDaily.filter(date => date >= start && date <= end);
    const filterIndices = initialData.labelsDaily.map((date, index) => filteredLabels.includes(date) ? index : -1).filter(index => index !== -1);

    setFilteredData({
      labelsDaily: filteredLabels,
      temperatureDataDaily: filterIndices.map(i => initialData.temperatureDataDaily[i]),
      airHumidityDataDaily: filterIndices.map(i => initialData.airHumidityDataDaily[i]),
      soilHumidityDataDaily: filterIndices.map(i => initialData.soilHumidityDataDaily[i]),
      mainPumpData: filterIndices.map(i => initialData.mainPumpData[i]),
      subPumpData: filterIndices.map(i => initialData.subPumpData[i]),
    });
  };

  // Hàm in báo cáo
  const handlePrint = () => {
    window.print();
  };

  // Dữ liệu hard-coded cho các thẻ thông số
  const temperatureAvg = '27.1°C';
  const temperatureMinMax = 'Min: 24°C | Max: 30°C';
  const airHumidityAvg = '67.0%';
  const airHumidityMinMax = 'Min: 46% | Max: 81%';
  const soilHumidityAvg = '53.7%';
  const soilHumidityMinMax = 'Min: 31% | Max: 79%';
  const totalPumpTime = '148 phút';
  const pumpTimeDetail = 'Thời gian bơm chính: 58 phút\nTự động: 90 phút';

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

  // Cấu hình dữ liệu cho biểu đồ Độ ẩm không khí (Hourly) - Không lọc theo ngày
  const humidityChartDataHourly = {
    labels: ['11:00', '11:14', '11:29', '11:44', '12:00', '12:15', '11:55:30', '12:32'],
    datasets: [
      {
        label: 'Sensor-Humidity',
        data: [100, 20, 75, 70, 65, 60, 35, 85],
        borderColor: '#1e90ff',
        backgroundColor: '#1e90ff',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Cấu hình dữ liệu cho biểu đồ Nhiệt độ (Hourly) - Không lọc theo ngày
  const temperatureChartDataHourly = {
    labels: ['11:00', '11:14', '11:29', '11:44', '12:00', '12:15', '11:55:30', '12:32'],
    datasets: [
      {
        label: 'Sensor-Temp',
        data: [24.6, 25.0, 25.4, 25.8, 26.2, 25.6, 25.0, 24.8],
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

  return (
    <>
      <NavBar />
      <Container>
        <Header>Báo Cáo Thống Kê Cảm Biến</Header>
        <FilterBar>
          <div>Dữ liệu cảm biến và hoạt động máy bơm</div>
          <FilterSection>
            <div>
              Từ ngày: <DateInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              Đến ngày: <DateInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button primary onClick={filterData}>Lọc dữ liệu</Button>
            <Button onClick={handlePrint}>In báo cáo</Button>
          </FilterSection>
          <div>Thời gian: {currentDate}</div>
        </FilterBar>
        <ChartRow>
          <div style={{ flex: 1 }}>
            <StatsWrapper>
              <StatCard>
                <StatTitle>Nhiệt độ trung bình</StatTitle>
                <StatValue>{temperatureAvg}</StatValue>
                <StatDetail>{temperatureMinMax}</StatDetail>
              </StatCard>
              <StatCard>
                <StatTitle>Độ ẩm không khí trung bình</StatTitle>
                <StatValue>{airHumidityAvg}</StatValue>
                <StatDetail>{airHumidityMinMax}</StatDetail>
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
                <StatValue>{soilHumidityAvg}</StatValue>
                <StatDetail>{soilHumidityMinMax}</StatDetail>
              </StatCard>
              <StatCard>
                <StatTitle>Tổng thời gian máy bơm</StatTitle>
                <StatValue>{totalPumpTime}</StatValue>
                <StatDetail>{pumpTimeDetail}</StatDetail>
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
              <Line data={temperatureChartDataHourly} options={{ ...hourlyChartOptions, plugins: { ...hourlyChartOptions.plugins, title: { ...hourlyChartOptions.plugins.title, text: 'Nhiệt độ (°C) (Hourly)' } } }} />
            </ChartContainer>
          </ChartWrapper>
        </ChartRow>
      </Container>
    </>
  );
};

export default AdminDashboard;