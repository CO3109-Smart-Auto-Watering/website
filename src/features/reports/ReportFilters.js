import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaFilter } from 'react-icons/fa';

const FiltersContainer = styled.div`
  background: ${props => props.theme?.palette.mode === 'dark' 
    ? props.theme.palette.background.paper 
    : 'white'};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${props => props.theme?.palette.divider || '#e0e0e0'};
`;

const FiltersTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  font-size: 18px;
  color: ${props => props.theme?.palette.text.primary || '#333'};
  
  svg {
    margin-right: 8px;
    color: ${props => props.theme?.palette.primary.main || '#4975d1'};
  }
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: ${props => props.theme?.palette.text.secondary || '#555'};
  margin-bottom: 8px;
`;

const DateInput = styled.input`
  padding: 10px;
  border: 1px solid ${props => props.theme?.palette.divider || '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  background: ${props => props.theme?.palette.background.default || 'white'};
  color: ${props => props.theme?.palette.text.primary || 'inherit'};
  
  &:focus {
    border-color: ${props => props.theme?.palette.primary.main || '#4975d1'};
    outline: none;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid ${props => props.theme?.palette.divider || '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  background: ${props => props.theme?.palette.background.default || 'white'};
  color: ${props => props.theme?.palette.text.primary || 'inherit'};
  
  &:focus {
    border-color: ${props => props.theme?.palette.primary.main || '#4975d1'};
    outline: none;
  }
`;

const NoDataOption = styled.option`
  font-style: italic;
  color: ${props => props.theme?.palette.text.disabled || '#999'};
`;

const ReportFilters = ({ filters, onFilterChange, areas = [], plants = [], theme }) => {
  const handleStartDateChange = (e) => {
    onFilterChange({ startDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    onFilterChange({ endDate: e.target.value });
  };

  const handleDataTypeChange = (e) => {
    onFilterChange({ dataType: e.target.value });
  };
  
  const handleAreaChange = (e) => {
    // Khi thay đổi khu vực, reset lại lựa chọn cây trồng về 'all'
    onFilterChange({ 
      areaId: e.target.value,
      plantId: 'all' 
    });
  };

  const handlePlantChange = (e) => {
    onFilterChange({ plantId: e.target.value });
  };

  // Lọc danh sách cây trồng dựa trên khu vực được chọn
  const filteredPlants = useMemo(() => {
    if (!filters.areaId || filters.areaId === 'all') {
      return plants; // Trả về tất cả cây nếu chọn "Tất cả khu vực"
    }
    
    // Lọc những cây thuộc khu vực được chọn
    return plants.filter(plant => {
      if (!plant) return false;
      return plant.areaId === filters.areaId || 
        (plant.areas && plant.areas.includes(filters.areaId));
    });
  }, [plants, filters.areaId]);

  // Kiểm tra xem có dữ liệu cây trồng không
  const hasPlantData = plants && plants.length > 0;
  const hasFilteredPlants = filteredPlants && filteredPlants.length > 0;

  return (
    <FiltersContainer theme={theme}>
      <FiltersTitle theme={theme}><FaFilter /> Bộ lọc báo cáo</FiltersTitle>
      
      <FiltersGrid>
        <FilterGroup>
          <FilterLabel htmlFor="startDate" theme={theme}>Từ ngày</FilterLabel>
          <DateInput
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={handleStartDateChange}
            theme={theme}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="endDate" theme={theme}>Đến ngày</FilterLabel>
          <DateInput
            type="date"
            id="endDate"
            value={filters.endDate}
            onChange={handleEndDateChange}
            theme={theme}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="dataType" theme={theme}>Loại dữ liệu</FilterLabel>
          <Select
            id="dataType"
            value={filters.dataType}
            onChange={handleDataTypeChange}
            theme={theme}
          >
            <option value="all">Tất cả dữ liệu</option>
            <option value="temperature">Nhiệt độ</option>
            <option value="humidity">Độ ẩm không khí</option>
            <option value="soil">Độ ẩm đất</option>
            <option value="watering">Lịch sử tưới nước</option>
          </Select>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="areaFilter" theme={theme}>Khu vực</FilterLabel>
          <Select
            id="areaFilter"
            value={filters.areaId}
            onChange={handleAreaChange}
            theme={theme}
          >
            <option value="all">Tất cả khu vực</option>
            {areas.map(area => (
              <option key={area._id} value={area._id}>{area.name}</option>
            ))}
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel htmlFor="plantFilter" theme={theme}>Cây trồng</FilterLabel>
          <Select
            id="plantFilter"
            value={filters.plantId}
            onChange={handlePlantChange}
            theme={theme}
            disabled={!hasPlantData}
          >
            <option value="all">Tất cả cây trồng</option>
            {hasFilteredPlants ? (
              filteredPlants.map((plant, index) => (
                <option 
                  key={plant.id || `plant-${index}`} 
                  value={plant.id || plant._id || plant}
                >
                  {plant.name || `Cây trồng ${index + 1}`}
                </option>
              ))
            ) : (
              <NoDataOption theme={theme} disabled>
                {filters.areaId === 'all' 
                  ? 'Không có dữ liệu cây trồng' 
                  : 'Không có cây trồng trong khu vực này'}
              </NoDataOption>
            )}
          </Select>
        </FilterGroup>
      </FiltersGrid>
    </FiltersContainer>
  );
};

export default ReportFilters;