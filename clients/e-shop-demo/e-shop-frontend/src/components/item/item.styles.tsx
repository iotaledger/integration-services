import styled from 'styled-components';

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  maxhight: 400px;
  minwidth: 100px;
  border-radius: 3px;
  background-color: ${(props) => props.theme.secondaryLight}};
`;

export const CardHeading = styled.h3`
	text-align: center;
  margin-top: 15px;
  color: white;
`;

export const CardImage = styled.img`
	width: 50%;
	height: auto;
	margin: auto;
`;

export const CardText = styled.p`
	text-align: center;
  padding: 10px;
  color: white;
  font-weight: 500;
`;
