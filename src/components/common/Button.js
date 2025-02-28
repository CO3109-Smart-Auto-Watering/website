import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: ${props => props.variant === 'primary' ? '#4a7e2a' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#4a7e2a'};
  border: ${props => props.variant === 'primary' ? 'none' : '1px solid #4a7e2a'};
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  margin-bottom: ${props => props.marginBottom ? props.marginBottom : '0'};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#3e6b21' : '#f5f5f5'};
  }
  
  &:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
    border: none;
  }
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  fullWidth = false, 
  marginBottom = '0', 
  ...props 
}) => {
  return (
    <StyledButton 
      type={type} 
      variant={variant} 
      fullWidth={fullWidth} 
      marginBottom={marginBottom} 
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;