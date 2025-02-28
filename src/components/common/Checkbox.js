import React from 'react';
import styled from 'styled-components';

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const StyledCheckbox = styled.input`
  margin-right: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #666;
`;

const Checkbox = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  ...props 
}) => {
  return (
    <CheckboxContainer>
      <StyledCheckbox 
        type="checkbox" 
        id={name} 
        name={name} 
        checked={checked} 
        onChange={onChange} 
        {...props} 
      />
      <Label htmlFor={name}>{label}</Label>
    </CheckboxContainer>
  );
};

export default Checkbox;