import styled from 'styled-components';

export const ItemsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-gap: 30px;
	margin: 20px 70px;

	@media screen and (max-width: 950px) {
		grid-template-columns: 1fr 1fr;
		grid-gap: 15px;
		margin: 20px 20px;
	}

	@media screen and (max-width: 600px) {
		grid-template-columns: 1fr;
		grid-gap: 15px;
		margin: 20px 20px;
	}
`;
