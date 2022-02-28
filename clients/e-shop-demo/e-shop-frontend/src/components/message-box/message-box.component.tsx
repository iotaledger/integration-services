import { MessageBoxWrapper } from './message-box.styles';
import { FunctionComponent } from 'react';

interface Props {
	className: string;
	show: boolean;
	type: string;
}
const MessageBox: FunctionComponent<Props> = ({ className, show, type, children }) => {
	return show ? <MessageBoxWrapper className={className} type={type}>{children}</MessageBoxWrapper> : null;
};

export default MessageBox;
