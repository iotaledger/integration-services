import styled from 'styled-components';

export const MessageBoxWrapper = styled.div<{ type: string }>`
	${({ type }) => {
		if (type === 'success') {
			return `background-color: #bdcebe;`;
		} else {
			return `background-color: #eca1a6;`;
		}
	}}
	padding: 10px;
	color: black;
	border-radius: 3px;
`;
