import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Header from './components/header/header.component';
import CartProvider from './contexts/cart.provider';
import UserProvider from './contexts/user.provider';
import Checkout from './pages/checkout/checkout.component';
import ItemList from './pages/item-list/item-list.component';
import Tour from './components/tour/tour.component';
import TourProvider from './contexts/tour.provider';

const App = () => {
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
