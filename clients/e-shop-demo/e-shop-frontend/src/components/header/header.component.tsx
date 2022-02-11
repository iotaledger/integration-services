import { HeaderButton, HeaderHeading, HeaderItem, HeaderLink, HeaderWrapper } from './header.styles';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../../contexts/cart.provider';
import { useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/user.provider';
import { removeAuthHeader } from '../../utils/axios-client';
import { Button } from '../../global.styles';

const Header = () => {
	const { items } = useContext(CartContext);
	const { authenticated, setAuthenticated } = useContext(UserContext);
	const location = useLocation();
	const pageName = location.pathname.split('/')[1];

	const logout = () => {
		setAuthenticated(false);
		removeAuthHeader();
	};

	const title = pageName ? pageName.toUpperCase() : 'Shop';
	return (
		<HeaderWrapper>
			<HeaderLink to="/" style={{ flex: '1 1 0px' }}>E-Shop</HeaderLink>
		

			<HeaderHeading style={{ flex: '1 1 0px' }}>{title}</HeaderHeading>
			<div>
				{authenticated && <HeaderItem onClick={() => logout()}>Logout</HeaderItem>}

					<HeaderLink to="/checkout" className='cartButton'>Cart ({items.length})</HeaderLink>
	
			</div>
		</HeaderWrapper>
	);
};

export default Header;
