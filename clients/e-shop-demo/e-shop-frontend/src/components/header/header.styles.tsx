import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Button } from '../../global.styles';

export const HeaderWrapper = styled.div`
	display: flex;
	flex-direction: row;
	background-color: ${(props) => props.theme.primary};
	justify-content: space-between;
	align-items: center;
`;

const headeItemBaseStyle = css`
	color: white;
	padding: 10px;
	margin: 10px;
	text-decoration: none;
	font-weight: 600;

	&:hover,
	&:visited,
	&:focus,
	&:link,
	&:active {
		color: white;
	}
`;
export const HeaderItem = styled.div`
	${headeItemBaseStyle}
`;

export const HeaderLink = styled(Link)`
	${headeItemBaseStyle}
`;

export const HeaderButton = styled(Button)`
	width: auto;
`;

export const HeaderHeading = styled.h3`
	color: white;
	font-size: x-large;
`;
