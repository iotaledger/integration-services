import { useContext } from 'react';
import CheckoutItem from '../../components/checkout-item/checkout-item.component';
import CheckoutTotal from '../../components/checkout-total/checkout-total.component';
import { CartContext } from '../../contexts/cart.provider';
import { CheckoutContainer, CheckoutHeading, CheckoutItemsContainer } from './checkout.styles';

const Checkout = () => {
	const { items } = useContext(CartContext);
	return (
		<CheckoutContainer>
			<CheckoutItemsContainer>
				<CheckoutHeading>Cart</CheckoutHeading>
				{items.map((item: any, index: number) => {
					return <CheckoutItem key={index} index item={item}></CheckoutItem>;
				})}
				{/* If there are no items in cart, display fake item */}
				{items.length === 0 && <CheckoutItem key={1} index item={{'index': 0, 'item': {'name': 'No items', 'imageUrl': undefined, 'price': 0, 'ageRestricted': false}}}></CheckoutItem>}
			</CheckoutItemsContainer>
			<CheckoutTotal></CheckoutTotal>
		</CheckoutContainer>
	);
};

export default Checkout;
