import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: #666;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4a7e2a;
    box-shadow: 0 0 0 1px #4a7e2a;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
`;

const Input = ({ 
  label, 
  name, 
  type = 'text', 
  error = '', 
  ...props 
}) => {
  return (
    <InputContainer>
      {label && <Label htmlFor={name}>{label}</Label>}
      <StyledInput 
        type={type} 
        id={name} 
        name={name} 
        className={error ? 'error' : ''} 
        {...props} 
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;