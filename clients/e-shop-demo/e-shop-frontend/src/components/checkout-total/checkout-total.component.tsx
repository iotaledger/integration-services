import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../contexts/cart.provider";
import { UserContext } from "../../contexts/user.provider";
import { Button } from "../../global.styles";
import { Item } from "../../models/item.model";
import { CheckoutHeading } from "../../pages/checkout/checkout.styles";
import { verifyCredential } from "../../services/verify-credential.service";
import CheckoutWithIota from "../checkout-iota/checkout-iota.component";
import MessageBox from "../message-box/message-box.component";
import { CheckoutTotalContainer } from "./checkout-total.styles";

const CheckoutTotal = () => {
  const { items, emptyCart } = useContext(CartContext);
  const [showOrderPlaceMessage, setShowOrderPlacedMessage] = useState(false);
  const cartHasAgeRestrictedItems = !!items.find(
    (item: Item) => item.ageRestricted === true
  );
  const { authenticated, isVerified, setIsVerified } = useContext(UserContext);

  const onCheckout = () => {
    setIsVerified(false);
    emptyCart();
    showOrderMessage();
  }

  const showOrderMessage = () => {
    setShowOrderPlacedMessage(true);
    setTimeout(() => {
      setShowOrderPlacedMessage(false);
    }, 4000)
  }

  return (
    <CheckoutTotalContainer>
      <CheckoutHeading>Total</CheckoutHeading>
      Total {items.reduce((sum: number, item: Item) => sum + item.price, 0)} €
      {cartHasAgeRestrictedItems ? (
        <p>Cart has items with age restriction</p>
      ) : (
        <p>
          Cart has <b>no</b> items with age restriction
        </p>
      )}
      {items.length !== 0 && (
        <CheckoutWithIota></CheckoutWithIota>
      )}
      
      {isVerified && authenticated && <Button onClick={() => onCheckout()}>Checkout</Button>}
      <MessageBox type="success" show={showOrderPlaceMessage}>Your order has been placed!</MessageBox>
    </CheckoutTotalContainer>
  );
};

export default CheckoutTotal;
