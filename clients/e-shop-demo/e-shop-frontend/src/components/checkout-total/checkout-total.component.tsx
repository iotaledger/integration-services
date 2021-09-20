import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../contexts/cart.provider";
import { UserContext } from "../../contexts/user.provider";
import { Button } from "../../global.styles";
import { Item } from "../../models/item.model";
import { CheckoutHeading } from "../../pages/checkout/checkout.styles";
import { verifyCredential } from "../../services/verify-credential.service";
import CheckoutWithIota from "../checkout-iota/checkout-iota.component";
import { CheckoutTotalContainer } from "./checkout-total.styles";

const CheckoutTotal = () => {
  const { items } = useContext(CartContext);
  const cartHasAgeRestrictedItems = !!items.find(
    (item: Item) => item.ageRestricted === true
  );
  const { authenticated, isVerified, setIsVerified } = useContext(UserContext);

  const onCheckout = () => {
    setIsVerified(false);
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
      <CheckoutWithIota></CheckoutWithIota>
      {isVerified && authenticated && <Button onClick={() => onCheckout()}>Checkout</Button>}
    </CheckoutTotalContainer>
  );
};

export default CheckoutTotal;
