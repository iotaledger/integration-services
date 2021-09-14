import styled from "styled-components";

export const theme = {
    grey: '#d6cbd3',
    red: '#eca1a6',
    green: '#bdcebe',
    brown: '#ada397'

}

export const Button = styled.button`
  background-color: ${theme.red};
  color: white;
  border: none;
  padding: 15px 32px;
  font-size: 16px;
  text-decoration: none;
  border-radius: 2px;
  margin: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${theme.brown};
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  }
`;
