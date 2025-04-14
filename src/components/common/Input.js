import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';
import { defaultTheme } from '../../utils/defaultTheme';

const InputWrapper = styled.div`
  margin-bottom: 20px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => {
    const theme = props.theme || defaultTheme;
    return theme.palette?.text?.secondary || 'rgba(0, 0, 0, 0.6)';
  }};
`;

const InputContainer = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px ${props => props.hasIcon ? '42px' : '16px'};
  border: 1px solid ${props => {
    const theme = props.theme || defaultTheme;
    if (props.error) {
      return theme.palette?.error?.main || '#d32f2f';
    }
    return theme.palette?.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.1)';
  }};
  border-radius: 8px;
  font-size: 15px;
  background-color: ${props => {
    const theme = props.theme || defaultTheme;
    return theme.palette?.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : '#fff';
  }};
  color: ${props => {
    const theme = props.theme || defaultTheme;
    return theme.palette?.text?.primary || 'rgba(0, 0, 0, 0.87)';
  }};
  transition: border-color 0.2s, background-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = props.theme || defaultTheme;
      return props.error
        ? theme.palette?.error?.main || '#d32f2f'
        : theme.palette?.primary?.main || '#1976d2';
    }};
  }
  
  &::placeholder {
    color: ${props => {
      const theme = props.theme || defaultTheme;
      return theme.palette?.text?.disabled || 'rgba(0, 0, 0, 0.38)';
    }};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: ${props => {
    const theme = props.theme || defaultTheme;
    return theme.palette?.text?.disabled || 'rgba(0, 0, 0, 0.38)';
  }};
`;

const ErrorText = styled.div`
  color: ${props => {
    const theme = props.theme || defaultTheme;
    return theme.palette?.error?.main || '#d32f2f';
  }};
  font-size: 12px;
  margin-top: 6px;
  margin-left: 2px;
`;

const Input = ({ 
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  icon,
  ...rest
}) => {
  const muiTheme = useTheme() || defaultTheme;

  return (
    <InputWrapper>
      {label && <InputLabel theme={muiTheme}>{label}</InputLabel>}
      <InputContainer>
        {icon && <IconWrapper theme={muiTheme}>{icon}</IconWrapper>}
        <StyledInput
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          hasIcon={!!icon}
          error={!!error}
          theme={muiTheme}
          {...rest}
        />
      </InputContainer>
      {error && <ErrorText theme={muiTheme}>{error}</ErrorText>}
    </InputWrapper>
  );
};

export default Input;