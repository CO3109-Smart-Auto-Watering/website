import React from 'react';
 import styled from 'styled-components';
 import { FaCalendarAlt, FaFilter } from 'react-icons/fa';
 
 const FiltersContainer = styled.div`
   background: white;
   border-radius: 8px;
   padding: 20px;
   margin-bottom: 24px;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
 `;
 
 const FiltersTitle = styled.h3`
   margin-top: 0;
   margin-bottom: 16px;
   display: flex;
   align-items: center;
   font-size: 18px;
   color: #333;
   
   svg {
     margin-right: 8px;
     color: #4975d1;
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
   color: #555;
   margin-bottom: 8px;
 `;
 
 const DateInput = styled.input`
   padding: 10px;
   border: 1px solid #ddd;
   border-radius: 4px;
   font-size: 14px;
   
   &:focus {
     border-color: #4975d1;
     outline: none;
   }
 `;
 
 const Select = styled.select`
   padding: 10px;
   border: 1px solid #ddd;
   border-radius: 4px;
   font-size: 14px;
   background: white;
   
   &:focus {
     border-color: #4975d1;
     outline: none;
   }
 `;
 
 const ReportFilters = ({ filters, onFilterChange }) => {
   const handleStartDateChange = (e) => {
     onFilterChange({ startDate: e.target.value });
   };
 
   const handleEndDateChange = (e) => {
     onFilterChange({ endDate: e.target.value });
   };
 
   const handleDataTypeChange = (e) => {
     onFilterChange({ dataType: e.target.value });
   };
 
   return (
     <FiltersContainer>
       <FiltersTitle><FaFilter /> Bộ lọc báo cáo</FiltersTitle>
       
       <FiltersGrid>
         <FilterGroup>
           <FilterLabel htmlFor="startDate">Từ ngày</FilterLabel>
           <DateInput
             type="date"
             id="startDate"
             value={filters.startDate}
             onChange={handleStartDateChange}
           />
         </FilterGroup>
         
         <FilterGroup>
           <FilterLabel htmlFor="endDate">Đến ngày</FilterLabel>
           <DateInput
             type="date"
             id="endDate"
             value={filters.endDate}
             onChange={handleEndDateChange}
           />
         </FilterGroup>
         
         <FilterGroup>
           <FilterLabel htmlFor="dataType">Loại dữ liệu</FilterLabel>
           <Select
             id="dataType"
             value={filters.dataType}
             onChange={handleDataTypeChange}
           >
             <option value="all">Tất cả dữ liệu</option>
             <option value="temperature">Nhiệt độ</option>
             <option value="humidity">Độ ẩm không khí</option>
             <option value="soil">Độ ẩm đất</option>
             <option value="watering">Lịch sử tưới nước</option>
           </Select>
         </FilterGroup>
       </FiltersGrid>
     </FiltersContainer>
   );
 };
 
 export default ReportFilters;