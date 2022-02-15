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

const headerItemBaseStyle = css`
	color: white;
	padding: 10px;
	margin: 10px;
	text-decoration: none;
	font-weight: 600;
	cursor: pointer;

	&:visited,
	&:focus,
	&:link,
	&:active {
		color: white;
	}

	&:hover {
		color: ${(props) => props.theme.background};
	}
`;
export const HeaderItem = styled.div`
	${headerItemBaseStyle}
`;

export const HeaderLink = styled(Link)`
	${headerItemBaseStyle}
`;

export const HeaderButton = styled(Button)`
	width: auto;
`;

export const HeaderHeading = styled.h3`
	color: white;
	font-size: x-large;
	@media screen and (max-width: 450px) {
		display: none;
	}
`;

export const HeaderRight = styled.div`
	display: flex;
	justify-content: end;
`;
