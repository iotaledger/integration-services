import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Header from './components/header/header.component';
import CartProvider from './contexts/cart.provider';
import UserProvider from './contexts/user.provider';
import Checkout from './pages/checkout/checkout.component';
import ItemList from './pages/item-list/item-list.component';
import Tour from './components/tour/tour.component';
import TourProvider from './contexts/tour.provider';
import { CaixaLogo, Logo, LogoContainer, LogoText } from './app.styles';
import iotaLogo from './assets/iota_logo.png';
import ensuresecLogo from './assets/ensuresec_logo.png';
import caixaLogo from './assets/caixa_logo.png';

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
						<LogoContainer>
							<LogoText>This demo was produced for Ensuresec project by the IOTA Foundation and in collaboration with Caixa Bank.</LogoText>
							<Logo src={iotaLogo} style={{'height': '100px', 'paddingBottom': '10px'}}></Logo>
							<Logo src={ensuresecLogo}></Logo>
							<CaixaLogo src={caixaLogo}></CaixaLogo>
						</LogoContainer>
					</Router>
				</TourProvider>
			</CartProvider>
		</UserProvider>
	);
};

export default App;
