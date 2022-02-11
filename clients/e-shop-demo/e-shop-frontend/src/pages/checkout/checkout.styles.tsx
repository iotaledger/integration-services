import styled from 'styled-components';

export const CheckoutContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin: 20px 70px;
	gap: 20px;
	flex-wrap: wrap;
`;

export const CheckoutItemsContainer = styled.div`
	display: flex;
	flex-direction: column;
	padding: 20px;
	flex: 1;
	min-width: 400px;
	background-color: ${(props) => props.theme.secondaryLight};
	@media screen and (max-width: 600px) {
		min-width: unset;
	}
`;

export const CheckoutHeading = styled.h2`
	color: white;
	margin-top: 0;
	text-align: center;
`;

export const CheckoutTotal= styled.div`
	background-color: ${(props) => props.theme.brown};
	min-width: 400px;
	padding: 20px;
	flex: 1;
	@media screen and (max-width: 600px) {
		min-width: unset;
	}
`;
