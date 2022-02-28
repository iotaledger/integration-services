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
				{items.length === 0 && <p>No items in cart</p>}
			</CheckoutItemsContainer>
			<CheckoutTotal></CheckoutTotal>
		</CheckoutContainer>
	);
};

export default Checkout;
