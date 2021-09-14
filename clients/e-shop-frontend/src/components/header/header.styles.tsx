import styled from "styled-components";
import { Button } from "../../global.styles";

export const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${(props) => props.theme.green};
  justify-content: space-between;
`;

export const HeaderButton = styled(Button)`
  
`;
