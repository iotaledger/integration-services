import { useContext } from 'react';
import CheckoutItem from '../../components/checkout-item/checkout-item.component';
import CheckoutTotal from '../../components/checkout-total/checkout-total.component';
import { CartContext } from '../../contexts/cart.provider';
import { Item } from '../../models/item.model';
import { CheckoutContainer, CheckoutHeading, CheckoutItemsContainer } from './checkout.styles';

const Checkout = () => {
	const { items } = useContext(CartContext);
	return (
		<CheckoutContainer>
			<CheckoutItemsContainer>
				<CheckoutHeading>Cart</CheckoutHeading>
				{items.map((item: Item, index: number) => {
					return <CheckoutItem key={index} listIndex={index} item={item}></CheckoutItem>;
				})}
				{/* If there are no items in cart, display fake item */}
				{items.length === 0 && (
					<CheckoutItem key={1} listIndex={0} item={{ name: 'No items', imageUrl: undefined, price: 0, ageRestricted: false }}></CheckoutItem>
				)}
			</CheckoutItemsContainer>
			<CheckoutTotal></CheckoutTotal>
		</CheckoutContainer>
	);
};

export default Checkout;
