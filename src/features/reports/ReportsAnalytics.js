import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useTheme } from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FaChartLine, FaChartBar, FaChartPie, FaCalendarAlt, FaDownload,
  FaFilter, FaTable, FaPrint, FaSyncAlt, FaListUl, FaInfoCircle
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { TbPlant, TbDroplet, TbSun, TbWind } from 'react-icons/tb';
import { getUserDevices } from '../../services/deviceService';

const baseURL = process.env.REACT_APP_API_URL
// Styled components với hỗ trợ theme sáng/tối
const ReportContainer = styled.div`
  padding: 20px 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  color: ${props => props.theme.palette.text.primary};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Filter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: ${props => props.theme.palette.text.secondary};
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.palette.divider};
  background-color: ${props => props.theme.palette.background.paper};
  color: ${props => props.theme.palette.text.primary};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.palette.primary.main};
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
`;

const Tab = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active
    ? `${props.theme.palette.primary.main}20`
    : 'transparent'};
  color: ${props => props.$active
    ? props.theme.palette.primary.main
    : props.theme.palette.text.primary};
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.$active
    ? `${props.theme.palette.primary.main}30`
    : props.theme.palette.action.hover};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const Card = styled.div`
  background: ${props => props.theme.palette.background.paper};
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${props => props.theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(0, 0, 0, 0.2)'
    : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const LargeCard = styled(Card)`
  grid-column: span 3;
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: ${props => props.theme.palette.text.primary};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: ${props => props.theme.palette.primary.main};
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const SummaryCard = styled.div`
  background: ${props => props.theme.palette.mode === 'dark'
    ? props.theme.palette.background.default
    : '#f8f9fc'};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
`;

const SummaryTitle = styled.div`
  font-size: 14px;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 8px;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.palette.text.primary};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: ${props => props.theme.palette.primary.main};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid ${props => props.theme.palette.divider};
  color: ${props => props.theme.palette.text.secondary};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  
  &:hover {
    background: ${props => props.theme.palette.action.hover};
  }
`;

const TableCell = styled.td`
  padding: 12px;
  color: ${props => props.theme.palette.text.primary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${props => props.$primary
    ? props.theme.palette.primary.main
    : props.theme.palette.mode === 'dark'
      ? props.theme.palette.background.default
      : '#f5f5f5'};
  color: ${props => props.$primary
    ? '#fff'
    : props.theme.palette.text.primary};
  border: 1px solid ${props => props.$primary
    ? props.theme.palette.primary.main
    : props.theme.palette.divider};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$primary
    ? props.theme.palette.primary.dark
    : props.theme.palette.action.hover};
  }
`;

// Mock data
const wateringData = [
  { date: '01/04', autoCount: 4, manualCount: 1 },
  { date: '02/04', autoCount: 3, manualCount: 2 },
  { date: '03/04', autoCount: 5, manualCount: 0 },
  { date: '04/04', autoCount: 2, manualCount: 3 },
  { date: '05/04', autoCount: 6, manualCount: 1 },
  { date: '06/04', autoCount: 4, manualCount: 2 },
  { date: '07/04', autoCount: 5, manualCount: 1 },
];

const moistureData = [
  { date: '01/04', morning: 65, afternoon: 55, evening: 60 },
  { date: '02/04', morning: 68, afternoon: 52, evening: 63 },
  { date: '03/04', morning: 62, afternoon: 50, evening: 58 },
  { date: '04/04', morning: 70, afternoon: 58, evening: 65 },
  { date: '05/04', morning: 67, afternoon: 54, evening: 62 },
  { date: '06/04', morning: 65, afternoon: 52, evening: 60 },
  { date: '07/04', morning: 69, afternoon: 56, evening: 64 },
];

const waterConsumptionData = [
  { month: 'Jan', amount: 120 },
  { month: 'Feb', amount: 135 },
  { month: 'Mar', amount: 142 },
  { month: 'Apr', amount: 128 },
];

const zoneWateringData = [
  { name: 'Vườn trước', value: 35 },
  { name: 'Vườn sau', value: 28 },
  { name: 'Khu rau', value: 22 },
  { name: 'Khu hoa', value: 15 },
];

const wateringLogs = [
  { id: 1, date: '07/04/2023', time: '08:15', zone: 'Vườn trước', duration: '15 phút', type: 'Tự động', reason: 'Độ ẩm thấp' },
  { id: 2, date: '06/04/2023', time: '16:30', zone: 'Khu rau', duration: '10 phút', type: 'Thủ công', reason: 'Người dùng' },
  { id: 3, date: '06/04/2023', time: '09:00', zone: 'Vườn sau', duration: '12 phút', type: 'Tự động', reason: 'Lịch trình' },
  { id: 4, date: '05/04/2023', time: '17:20', zone: 'Khu hoa', duration: '8 phút', type: 'Tự động', reason: 'Độ ẩm thấp' },
  { id: 5, date: '04/04/2023', time: '10:05', zone: 'Vườn trước', duration: '15 phút', type: 'Thủ công', reason: 'Người dùng' },
];

const ReportsAnalytics = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7days');
  const [zoneFilter, setZoneFilter] = useState('all');
  const chartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [loadMode, setLoadMode] = useState({ modeLoading: true, results: [] });


  // Hàm xử lý xuất báo cáo PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Báo cáo hệ thống tưới tự động", 14, 16);
    doc.text("Thời gian: 7 ngày gần nhất", 14, 24);

    // Bảng lịch sử tưới
    doc.autoTable({
      head: [['Ngày', 'Giờ', 'Khu vực', 'Thời lượng', 'Loại', 'Lý do']],
      body: wateringLogs.map(log => [
        log.date,
        log.time,
        log.zone,
        log.duration,
        log.type,
        log.reason
      ]),
      startY: 35,
    });

    // Lưu file
    doc.save("bao-cao-he-thong-tuoi.pdf");
  };

  // Hàm in báo cáo
  const printReport = () => {
    window.print();
  };

  // Hàm tổng hợp nước đã sử dụng
  const getTotalWaterUsage = () => {
    return waterConsumptionData.reduce((sum, item) => sum + item.amount, 0);
  };

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const response = await getUserDevices();
      if (response.success) {
        console.log("Dữ liệu thiết bị nhận về:", response.devices);
        setDevices(response.devices);
        // setFilteredDevices(response.devices);
      } else {
        // setSnackbar({
        //   open: true,
        //   message: 'Không thể tải danh sách thiết bị',
        //   severity: 'error'
        // });
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      // setSnackbar({
      //   open: true,
      //   message: error.response?.data?.message || 'Lỗi khi tải thiết bị',
      //   severity: 'error'
      // });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const [avgData, setAvgData] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const [moistureData, setMoistureData] = useState([]);
  const [modeData, setModeData] = useState([]);
  const [modeState, setModeState] = useState({ modeLoading: true, results: [] });
  const [dailyData, setDailyData] = useState([]);

  // Fetch average data from API
  useEffect(() => {
    const fetchAverageData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseURL}/average`, {
          headers: { 'x-auth-token': token },
          params: { feedName: 'sensor-soil' }
        });
        setAvgData(res.data.results);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAverageData();
  }, [zoneFilter, dateRange, token]);

  // Filter data based on selected zone
  const filtered = zoneFilter === 'all'
    ? avgData
    : avgData.filter(device => device.deviceId === zoneFilter);

  // Map data to display the average values
  const displayData = filtered.map(device => {
    const average = dateRange === '7days'
      ? device.averages.last7DaysAvg
      : device.averages.last30DaysAvg;
    return {
      deviceId: device.deviceId,
      average,
      daily: device.daily // contains { date, average }
    };
  });

  // Merge daily averages across all devices for 'all'
  const mergeDailyAverages = (devices) => {
    const dailyMap = new Map();
    devices.forEach(device => {
      device.daily.forEach(entry => {
        const { date, average } = entry;
        // Filter by date range
        const entryDate = new Date(date);
        const now = new Date();
        const diff = now - entryDate;
        const limit = dateRange === '7days'
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;
        if (diff <= limit) {
          if (!dailyMap.has(date)) dailyMap.set(date, []);
          dailyMap.get(date).push(average);
        }
      });
    });
    return Array.from(dailyMap.entries())
      .map(([date, values]) => ({
        date,
        average: Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2))
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Update moistureData when filters change
  useEffect(() => {
    let data = [];
    if (zoneFilter === 'all') {
      data = mergeDailyAverages(displayData);
    } else {
      // specific device: filter its daily entries by dateRange
      const device = displayData.find(d => d.deviceId === zoneFilter);
      if (device) {
        data = device.daily.filter(entry => {
          const entryDate = new Date(entry.date);
          const now = new Date();
          const diff = now - entryDate;
          const limit = dateRange === '7days'
            ? 7 * 24 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;
          return diff <= limit;
        });
      }
    }
    setMoistureData(data);
    console.log("Moisture data:", data);
  }, [zoneFilter, dateRange, avgData]);

  // Calculate total average for 'all'
  const totalAvg = zoneFilter === 'all' && displayData.length > 0
    ? Number((displayData.reduce((sum, d) => sum + d.average, 0) / displayData.length).toFixed(1))
    : null;

  // Specific device average
  const specificAvg = zoneFilter !== 'all' && displayData.length > 0
    ? displayData[0].average
    : null;


  useEffect(() => {
    const fetchModeData = async () => {
      try {
        // setLoading(true);
        const endpoint = zoneFilter === 'all' ? '/mode/summary/cleaned' : '/mode/summary';
        const res = await axios.get(`${baseURL}${endpoint}`, {
          headers: { "x-auth-token": token },
          params: zoneFilter === 'all' ? {} : { deviceId: zoneFilter },
        });
        setModeData({
          autoMode: res.data.autoMode || 0,
          manualMode: res.data.manualMode || 0,
        });
      } catch (err) {
        console.error("Fetch mode summary error:", err);
        setModeData({ autoMode: 0, manualMode: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchModeData();
  }, [zoneFilter]);

  return (
    <ReportContainer>
      <Header>
        <HeaderTitle theme={theme}>Báo cáo & Phân tích</HeaderTitle>
        <ButtonGroup>
          <Button $primary theme={theme} onClick={exportPDF}>
            <FaDownload /> Xuất PDF
          </Button>
          <Button theme={theme} onClick={printReport}>
            <FaPrint /> In báo cáo
          </Button>
        </ButtonGroup>
      </Header>

      <FilterContainer>
        <Filter>
          <FilterLabel theme={theme}>Thời gian:</FilterLabel>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            theme={theme}
          >
            <option value="7days">7 ngày gần đây</option>
            <option value="30days">30 ngày gần đây</option>
            {/* <option value="3months">3 tháng gần đây</option>
            <option value="custom">Tùy chỉnh...</option> */}
          </Select>
        </Filter>

        <Filter>
          <FilterLabel theme={theme}>Thiết bị:</FilterLabel>
          <Select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            theme={theme}
          >
            <option value="all">Tất cả thiết bị</option>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.deviceId}
              </option>
            ))}
          </Select>
          {/* <Select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            theme={theme}
          >
            <option value="all">Tất cả khu vực</option>
            <option value="front">Vườn trước</option>
            <option value="back">Vườn sau</option>
            <option value="vegetables">Khu rau</option>
            <option value="flowers">Khu hoa</option>
          </Select> */}
        </Filter>
      </FilterContainer>

      <TabContainer theme={theme}>
        <Tab
          $active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          theme={theme}
        >
          <FaChartLine /> Tổng quan
        </Tab>
        <Tab
          $active={activeTab === 'watering'}
          onClick={() => setActiveTab('watering')}
          theme={theme}
        >
          <FaChartBar /> Lịch sử tưới
        </Tab>
        <Tab
          $active={activeTab === 'logs'}
          onClick={() => setActiveTab('logs')}
          theme={theme}
        >
          <FaListUl /> Nhật ký chi tiết
        </Tab>
        <Tab
          $active={activeTab === 'usage'}
          onClick={() => setActiveTab('usage')}
          theme={theme}
        >
          <FaChartPie /> Tiêu thụ nước
        </Tab>
      </TabContainer>

      {activeTab === 'overview' && (
        <>
          <SummaryGrid>
            <SummaryCard theme={theme}>
              <SummaryTitle theme={theme}>Lượng nước đã sử dụng</SummaryTitle>
              <SummaryValue theme={theme}>
                <TbDroplet /> {getTotalWaterUsage()} lít
              </SummaryValue>
            </SummaryCard>

            <SummaryCard theme={theme}>
              <SummaryTitle theme={theme}>Độ ẩm đất trung bình</SummaryTitle>
              <SummaryValue theme={theme}>
                <TbPlant />
                {loading ? (
                  <div>...</div>
                ) : zoneFilter === "all" ? (
                  <div>{totalAvg}%</div>
                ) : (
                  displayData.map(device => (
                    <div key={device.deviceId}>
                      {/* <h3>Thiết bị: {device.deviceId}</h3> */}
                      {device.average}%
                      {/* render biểu đồ nếu cần từ device.daily */}
                    </div>
                  ))
                )}
              </SummaryValue>
            </SummaryCard>

            <SummaryCard theme={theme}>
              <SummaryTitle theme={theme}>Số lần tưới tự động</SummaryTitle>
              <SummaryValue theme={theme}>
                <FaSyncAlt /> {loading ? "..." : `${modeData.autoMode} lần`}
              </SummaryValue>
            </SummaryCard>

            <SummaryCard theme={theme}>
              <SummaryTitle theme={theme}>Số lần tưới thủ công</SummaryTitle>
              <SummaryValue theme={theme}>
                <FaInfoCircle /> {loading ? "..." : `${modeData.manualMode} lần`}
              </SummaryValue>
            </SummaryCard>
          </SummaryGrid>

          <Grid>
            <LargeCard theme={theme} ref={chartRef}>
              <CardHeader theme={theme}>
                <CardTitle theme={theme}>
                  <FaChartLine /> Diễn biến độ ẩm đất
                </CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={moistureData}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.primary
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average" // Lấy giá trị độ ẩm trung bình
                    name="Độ ẩm trung bình đất"
                    stroke="#8884d8" // Chọn màu cho line
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </LargeCard>

            <Card theme={theme}>
              <CardHeader theme={theme}>
                <CardTitle theme={theme}>
                  <FaChartBar /> Số lần tưới
                </CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={wateringData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.primary
                    }}
                  />
                  <Legend />
                  <Bar dataKey="autoCount" name="Tự động" fill={theme.palette.primary.main} />
                  <Bar dataKey="manualCount" name="Thủ công" fill={theme.palette.secondary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card theme={theme}>
              <CardHeader theme={theme}>
                <CardTitle theme={theme}>
                  <FaChartPie /> Phân bổ tưới theo khu vực
                </CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={zoneWateringData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.primary
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </>
      )}

      {activeTab === 'logs' && (
        <Card theme={theme}>
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaListUl /> Nhật ký tưới chi tiết
            </CardTitle>
          </CardHeader>

          <Table>
            <thead>
              <tr>
                <TableHeader theme={theme}>#</TableHeader>
                <TableHeader theme={theme}>Ngày</TableHeader>
                <TableHeader theme={theme}>Giờ</TableHeader>
                <TableHeader theme={theme}>Khu vực</TableHeader>
                <TableHeader theme={theme}>Thời lượng</TableHeader>
                <TableHeader theme={theme}>Loại</TableHeader>
                <TableHeader theme={theme}>Lý do</TableHeader>
              </tr>
            </thead>
            <tbody>
              {wateringLogs.map(log => (
                <TableRow key={log.id} theme={theme}>
                  <TableCell theme={theme}>{log.id}</TableCell>
                  <TableCell theme={theme}>{log.date}</TableCell>
                  <TableCell theme={theme}>{log.time}</TableCell>
                  <TableCell theme={theme}>{log.zone}</TableCell>
                  <TableCell theme={theme}>{log.duration}</TableCell>
                  <TableCell theme={theme}>{log.type}</TableCell>
                  <TableCell theme={theme}>{log.reason}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {activeTab === 'watering' && (
        <LargeCard theme={theme}>
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaChartBar /> Lịch sử tưới theo ngày
            </CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={wateringData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary
                }}
              />
              <Legend />
              <Bar dataKey="autoCount" name="Tự động" fill={theme.palette.primary.main} />
              <Bar dataKey="manualCount" name="Thủ công" fill={theme.palette.secondary.main} />
            </BarChart>
          </ResponsiveContainer>
        </LargeCard>
      )}

      {activeTab === 'usage' && (
        <LargeCard theme={theme}>
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaChartLine /> Mức tiêu thụ nước theo tháng
            </CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={waterConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={theme.palette.primary.main}
                fill={`${theme.palette.primary.main}40`}
                name="Lượng nước (lít)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </LargeCard>
      )}
    </ReportContainer>
  );
};

export default ReportsAnalytics;