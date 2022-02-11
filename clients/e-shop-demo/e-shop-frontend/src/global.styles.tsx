import styled from 'styled-components';

export const theme = {
	primary: '#1e9a93', // tealish
	secondary: '#1c1e21', // black
	secondaryLight: '#696f76', // body copy
	accent: '#603f98', // blueberry
	accentDarker: '#4c3279', // blueberry 20% darker
	background: '#c4c4c4' // light gray
};

export const Button = styled.button`
	background-color: ${theme.accent};
	color: white;
	border: none;
	padding: 15px 32px;
	font-size: 16px;
	text-decoration: none;
	border-radius: 5px;
	margin: 10px;
	cursor: pointer;
	transition: 0.2s ease;
	transition-property: color, , border-color;
	&:hover {
		background-color: ${theme.accentDarker};
		box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
	}
`;

export const SmallButton = styled(Button)`
	padding: 5px 20px;
	margin-left: 0;
`;

export const Background = styled.div`
	background-color: ${(props) => props.theme.background};
	width: 100%;
`;

export const Input = styled.input`
	width: 100%;
	padding: 8px 15px;
	box-sizing: border-box;
	margin: 8px 0;
	border-radius: 3px;
`;
