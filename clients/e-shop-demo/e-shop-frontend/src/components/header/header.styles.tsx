import styled from 'styled-components';
import { Button } from '../../global.styles';

export const HeaderWrapper = styled.div`
	display: flex;
	flex-direction: row;
	background-color: ${(props) => props.theme.green};
	justify-content: space-between;
	align-items: center;
`;

export const HeaderButton = styled(Button)`
	width: auto;
`;

export const HeaderHeading = styled.h3`
	color: white;
`;
