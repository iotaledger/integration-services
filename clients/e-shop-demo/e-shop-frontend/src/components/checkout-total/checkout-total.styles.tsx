import styled from 'styled-components';

export const CheckoutTotalContainer = styled.div`
	background-color: ${(props) => props.theme.secondaryLight};
	min-width: 400px;
	padding: 20px;
	flex: 1;
	border-radius: 5px;
	@media screen and (max-width: 600px) {
		min-width: unset;
	}
`;
