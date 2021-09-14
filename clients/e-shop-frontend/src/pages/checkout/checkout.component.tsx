import { useContext } from "react";
import CheckoutItem from "../../components/checkout-item/checkout-item.component";
import CheckoutTotal from "../../components/checkout-total/checkout-total.component";
import { CartContext } from "../../contexts/cart.provider";
import { CheckoutContainer, CheckoutItemsContainer } from "./checkout.styles";

const Checkout = () => {
  const {items} = useContext(CartContext)
  return (
    <>
    <h3>Checkout</h3>
    <CheckoutContainer>
        <CheckoutItemsContainer>
          {items.map((item: any) => {
            return <CheckoutItem item={item}></CheckoutItem>
          })}

        </CheckoutItemsContainer>
        <CheckoutTotal></CheckoutTotal>
    </CheckoutContainer>
    </>
  );
};

export default Checkout;
