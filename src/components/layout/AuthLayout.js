import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  width: 900px;
  max-width: 100%;
  height: 550px;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin: 50px auto;
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    flex-direction: column-reverse;
  }
`;

const FormContainer = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const ImageContainer = styled.div`
  flex: 1;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

const AuthLayout = ({ children, image }) => {
  return (
    <Container>
      <FormContainer>
        {children}
      </FormContainer>
      <ImageContainer image={image} />
    </Container>
  );
};

export default AuthLayout;