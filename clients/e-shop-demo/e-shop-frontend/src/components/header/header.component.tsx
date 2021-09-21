import { HeaderButton, HeaderHeading, HeaderWrapper } from "./header.styles";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../contexts/cart.provider";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../contexts/user.provider";
import { removeAuthHeader } from "../../utils/axios-client";

const Header = () => {
  const { items } = useContext(CartContext);
  const { authenticated, setAuthenticated } = useContext(UserContext);
  const location = useLocation();
  const pageName = location.pathname.split("/")[1];

  const logout = () => {
    setAuthenticated(false);
    removeAuthHeader();
  }

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
      <div>
        {authenticated && (
          <HeaderButton onClick={() => logout()}>Logout</HeaderButton>
        )}
        
        <Link to="/checkout">
          <HeaderButton>Cart ({items.length})</HeaderButton>
        </Link>
      </div>
    </HeaderWrapper>
  );
};

export default Header;
