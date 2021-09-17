import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./components/header/header.component";
import CartProvider from "./contexts/cart.provider";
import Checkout from "./pages/checkout/checkout.component";
import ItemList from "./pages/item-list/item-list.component";
import Login from "./pages/login/login.component";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Header></Header>
        <Switch>
          <Route exact path="/" component={ItemList}></Route>
          <Route path="/checkout" component={Checkout}></Route>
          <Route path="/login" component={Login}></Route>
        </Switch>
      </Router>
    </CartProvider>
  );
};

export default App;
