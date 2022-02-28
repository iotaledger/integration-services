import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Header from './components/header/header.component';
import CartProvider from './contexts/cart.provider';
import UserProvider from './contexts/user.provider';
import Checkout from './pages/checkout/checkout.component';
import ItemList from './pages/item-list/item-list.component';
import Tour from './components/tour/tour.component';
import TourProvider from './contexts/tour.provider';

const App = () => {
	const sk = process.env.REACT_APP_SECRET_KEY;
	const url = process.env.REACT_APP_E_SHOP_BACKEND_URL;

	if (sk === undefined || sk === '' || url === undefined || url === '') {
		console.log('Environment vars', { REACT_APP_SECRET_KEY: sk, REACT_APP_E_SHOP_BACKEND_URL: url });
		throw Error('REACT_APP_SECRET_KEY or REACT_APP_E_SHOP_BACKEND_URL not set in environment!');
	}

	return (
		<UserProvider>
			<CartProvider>
				<TourProvider>
					<Router>
						<Header></Header>
						<Tour></Tour>
						<Switch>
							<Route exact path="/" component={ItemList}></Route>
							<Route path="/checkout" component={Checkout}></Route>
						</Switch>
					</Router>
				</TourProvider>
			</CartProvider>
		</UserProvider>
	);
};

export default App;
