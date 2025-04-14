import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaTable, FaThermometerHalf, FaTint, FaSeedling, 
  FaWater, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

const Container = styled.div`
  margin-top: 24px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
`;

const Tab = styled.div`
  padding: 12px 20px;
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#4975d1' : '#666'};
  border-bottom: 2px solid ${props => props.$active ? '#4975d1' : 'transparent'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    color: #4975d1;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const TableHeader = styled.div`
  padding: 16px 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
  font-weight: 600;
  background: #f9f9f9;
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #444;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

const EmptyRow = styled.tr`
  td {
    text-align: center;
    padding: 32px 16px;
    color: #999;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
`;

const PageInfo = styled.div`
  color: #666;
  font-size: 14px;
`;

const PageControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  &:hover {
    background: ${props => props.$disabled ? 'white' : '#f5f5f5'};
  }
`;

const ReportDataView = ({ sensorData, wateringEvents, dataType }) => {
  const [activeTab, setActiveTab] = useState(
    dataType === 'watering' ? 'watering' : 'sensor'
  );
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Show watering tab based on dataType and data availability
  const showWateringTab = dataType === 'all' || dataType === 'watering';
  const showSensorTab = dataType === 'all' || dataType === 'temperature' || 
                         dataType === 'humidity' || dataType === 'soil';

  // Calculate pagination
  const sensorDataPaginated = sensorData.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );
  
  const wateringEventsPaginated = wateringEvents.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );
  
  const totalPages = Math.ceil(
    (activeTab === 'sensor' ? sensorData.length : wateringEvents.length) / itemsPerPage
  );

  // Change page
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <Container>
      <TabsContainer>
        {showSensorTab && (
          <Tab 
            $active={activeTab === 'sensor'} 
            onClick={() => { setActiveTab('sensor'); setPage(1); }}
          >
            <FaTable /> Dữ liệu cảm biến
          </Tab>
        )}
        
        {showWateringTab && wateringEvents.length > 0 && (
          <Tab 
            $active={activeTab === 'watering'} 
            onClick={() => { setActiveTab('watering'); setPage(1); }}
          >
            <FaWater /> Lịch sử tưới nước
          </Tab>
        )}
      </TabsContainer>
      
      <TableContainer>
        <TableHeader>
          {activeTab === 'sensor' ? 'Dữ liệu cảm biến theo ngày' : 'Lịch sử tưới nước'}
        </TableHeader>
        
        {activeTab === 'sensor' && (
          <Table>
            <thead>
              <tr>
                <Th>Ngày</Th>
                {(dataType === 'all' || dataType === 'temperature') && <Th>Nhiệt độ (°C)</Th>}
                {(dataType === 'all' || dataType === 'humidity') && <Th>Độ ẩm không khí (%)</Th>}
                {(dataType === 'all' || dataType === 'soil') && <Th>Độ ẩm đất (%)</Th>}
              </tr>
            </thead>
            <tbody>
              {sensorDataPaginated.length > 0 ? (
                sensorDataPaginated.map((item, idx) => (
                  <Tr key={idx}>
                    <Td>{new Date(item.date).toLocaleDateString('vi-VN')}</Td>
                    {(dataType === 'all' || dataType === 'temperature') && (
                      <Td>{item.temperature !== undefined ? item.temperature.toFixed(1) : '-'}</Td>
                    )}
                    {(dataType === 'all' || dataType === 'humidity') && (
                      <Td>{item.humidity !== undefined ? item.humidity.toFixed(1) : '-'}</Td>
                    )}
                    {(dataType === 'all' || dataType === 'soil') && (
                      <Td>{item.soilMoisture !== undefined ? item.soilMoisture.toFixed(1) : '-'}</Td>
                    )}
                  </Tr>
                ))
              ) : (
                <EmptyRow>
                  <Td colSpan="4">Không có dữ liệu cảm biến trong khoảng thời gian này</Td>
                </EmptyRow>
              )}
            </tbody>
          </Table>
        )}
        
        {activeTab === 'watering' && (
          <Table>
            <thead>
              <tr>
                <Th>Thời gian</Th>
                <Th>Thời lượng (phút)</Th>
                <Th>Khu vực</Th>
                <Th>Loại</Th>
                <Th>Lượng nước (lít)</Th>
              </tr>
            </thead>
            <tbody>
              {wateringEventsPaginated.length > 0 ? (
                wateringEventsPaginated.map((event, idx) => (
                  <Tr key={idx}>
                    <Td>{new Date(event.timestamp).toLocaleString('vi-VN')}</Td>
                    <Td>{event.duration}</Td>
                    <Td>{event.zone}</Td>
                    <Td>{event.trigger === 'automatic' ? 'Tự động' : 'Thủ công'}</Td>
                    <Td>{event.waterUsed.toFixed(1)}</Td>
                  </Tr>
                ))
              ) : (
                <EmptyRow>
                  <Td colSpan="5">Không có dữ liệu tưới nước trong khoảng thời gian này</Td>
                </EmptyRow>
              )}
            </tbody>
          </Table>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationContainer>
            <PageInfo>
              Trang {page} / {totalPages}
            </PageInfo>
            <PageControls>
              <PageButton 
                onClick={() => handlePageChange(page - 1)} 
                $disabled={page === 1}
              >
                <FaChevronLeft />
              </PageButton>
              <PageButton 
                onClick={() => handlePageChange(page + 1)} 
                $disabled={page === totalPages}
              >
                <FaChevronRight />
              </PageButton>
            </PageControls>
          </PaginationContainer>
        )}
      </TableContainer>
    </Container>
  );
};

export default ReportDataView;