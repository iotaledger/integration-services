import styled from 'styled-components';

export const LogoContainer = styled.div`
	display: flex;
	align-items: flex-end;
	flex-wrap: wrap;
	gap: 30px;
	margin: 230px 70px;
	justify-content: start;
	@media only screen and (max-width: 600px) {
		justify-content: center;
		margin: 50px 70px;
	}
`;

export const Logo = styled.img`
	height: 70px;
	width: auto;
	align-self: center;
`;

export const CaixaLogo = styled(Logo)`
	@media only screen and (max-width: 600px) {
		height: 40px;
	}
`;

export const LogoText = styled.p`
	padding: 0;
	width: 300px;
	align-self: center;
	text-align: justify;
	margin-bottom: 0;
`;

export const EuText = styled(LogoText)`
	width: 400px;
`;
