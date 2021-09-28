import { MessageBoxWrapper } from './message-box.styles';
import { FunctionComponent } from 'react';

interface Props {
	show: boolean;
	type: string;
}
const MessageBox: FunctionComponent<Props> = ({ show, type, children }) => {
	return show ? <MessageBoxWrapper type={type}>{children}</MessageBoxWrapper> : null;
};

export default MessageBox;
