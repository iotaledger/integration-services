import { HeaderHeading, HeaderItem, HeaderLink, HeaderRight, HeaderWrapper } from './header.styles';
import { useContext } from 'react';
import { CartContext } from '../../contexts/cart.provider';
import { useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/user.provider';

const Header = () => {
	const { items } = useContext(CartContext);
	const { authenticated, logout } = useContext(UserContext);
	const location = useLocation();
	const pageName = location.pathname.split('/')[1];

	const title = pageName ? pageName.toUpperCase() : 'Shop';
	return (
		<HeaderWrapper>
			<HeaderLink to="/" style={{ flex: '1 1 0px' }}>
				E-Shop
			</HeaderLink>

			<HeaderHeading style={{ flex: '1 1 0px' }}>{title}</HeaderHeading>
			<HeaderRight>
				{authenticated && <HeaderItem onClick={logout}>Logout</HeaderItem>}

				<HeaderLink to="/checkout" className="cartButton">
					Cart ({items.length})
				</HeaderLink>
			</HeaderRight>
		</HeaderWrapper>
	);
};

export default Header;
