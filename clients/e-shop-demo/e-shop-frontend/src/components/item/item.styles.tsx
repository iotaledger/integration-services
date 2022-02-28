import styled from 'styled-components';

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  maxhight: 400px;
  minwidth: 100px;
  background-color: ${(props) => props.theme.grey}};
`;

export const CardHeading = styled.h3`
	text-align: center;
  margin-top: 15px;
`;

export const CardImage = styled.img`
	width: 50%;
	height: auto;
	margin: auto;
`;

export const CardText = styled.p`
	text-align: center;
`;
