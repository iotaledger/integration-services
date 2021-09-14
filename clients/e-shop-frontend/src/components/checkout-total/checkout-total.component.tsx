import { useContext } from "react";
import { CartContext } from "../../contexts/cart.provider";
import { Item } from "../../models/item.model";
import { CheckoutTotalContainer } from "./checkout-total.styles";

const CheckoutTotal = () => {
  const { items } = useContext(CartContext);

  return (
    <CheckoutTotalContainer>
        Total {items.reduce((sum: number, item: Item) => sum + item.price, 0)} €
        Cart has items with age restriction: {items.map((item: Item) => item.ageRestricted === true)}
    </CheckoutTotalContainer>
  );
};

export default CheckoutTotal;
