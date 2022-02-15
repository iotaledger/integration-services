import { CartContext } from "../../contexts/cart.provider";
import { useContext } from 'react';
import { CheckoutTotalMessageContainer } from "./checkout-total-message.styles";
import { Item } from "../../models/item.model";
const CheckoutTotalMessage = () => {
    const { items } = useContext(CartContext);
    const cartHasAgeRestrictedItems = !!items.find((item: Item) => item.ageRestricted === true);
    return(
        <CheckoutTotalMessageContainer>
				Total <b>{items.reduce((sum: number, item: Item) => sum + item.price, 0)}</b> €
				{cartHasAgeRestrictedItems ? (
					<div>
						Cart has items <b>with</b> age restriction
					</div>
				) : (
					<div>
						Cart has <b>no</b> items with age restriction
					</div>
				)}
			</CheckoutTotalMessageContainer>
    )
}

export default CheckoutTotalMessage