import styled from 'styled-components';

export const CheckoutItemContainer = styled.div`
	background-color: ${(props) => props.theme.background};
	padding: 5px;
	margin: 5px 15px;
	display: flex;
	align-items: center;
	border-radius: 3px;
	box-shadow: 5px 5px 16px 0px rgba(0, 0, 0, 0.4);
`;

export const CheckoutItemImage = styled.img`
	width: 35px;
	height: auto;
	margin-left: 10px;
`;

export const CheckoutItemName = styled.span`
	font-size: larger;
	margin: 0 20px;
`;
