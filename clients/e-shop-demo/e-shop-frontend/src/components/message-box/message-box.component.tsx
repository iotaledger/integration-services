import { MessageBoxWrapper } from "./message-box.styles";
import { FunctionComponent } from "react";

interface Props {
  show: boolean;
}
const MessageBox: FunctionComponent<Props> = ({show, children}) => {

  return (show ? (<MessageBoxWrapper>{children}</MessageBoxWrapper>): null);
};

export default MessageBox;
