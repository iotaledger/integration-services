import { HeaderButton, HeaderWrapper } from "./header.styles";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../contexts/cart.provider";

const Header = () => {
  const { items } = useContext(CartContext);
  return (
    <HeaderWrapper>
      <Link to="/">
        <HeaderButton>Logo</HeaderButton>
      </Link>
      <Link to="/checkout">
        <HeaderButton>Cart ({items.length})</HeaderButton>
      </Link>
    </HeaderWrapper>
  );
};

export default Header;
