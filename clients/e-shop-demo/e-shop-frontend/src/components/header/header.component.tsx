import { HeaderButton, HeaderHeading, HeaderWrapper } from "./header.styles";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../contexts/cart.provider";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { items } = useContext(CartContext);
  const location = useLocation();
  const pageName = location.pathname.split("/")[1];
  console.log(pageName);
  return (
    <HeaderWrapper>
      <Link to="/">
        <HeaderButton>Logo</HeaderButton>
      </Link>
      {pageName !== "" ? (
        <HeaderHeading>{pageName.toUpperCase()}</HeaderHeading>
      ) : (
        <HeaderHeading>Shop</HeaderHeading>
      )}
      <Link to="/login">
        <HeaderButton>Login</HeaderButton>
      </Link>
      <Link to="/checkout">
        <HeaderButton>Cart ({items.length})</HeaderButton>
      </Link>
    </HeaderWrapper>
  );
};

export default Header;
