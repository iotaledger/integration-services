import styled from 'styled-components';

export const LogoContainer = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 30px;
	margin: 50px 70px;
	@media only screen and (max-width: 600px) {
		justify-content: center;
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
`

export const LogoText = styled.p`
	padding: 20px;
	width: 300px;
	align-self: center;
`;