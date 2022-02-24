import { useContext } from 'react';
import { CartContext } from '../../contexts/cart.provider';
import { SmallButton } from '../../global.styles';
import { Item } from '../../models/item.model';
import { CheckoutItemContainer, CheckoutItemImage, CheckoutItemName, CheckoutItemPrice } from './checkout-item.styles';

const CheckoutItem = ({ item, listIndex }: { item: Item; listIndex: number }) => {
	const { id, name, price, ageRestricted, imageUrl } = item;
	const { removeFromCart } = useContext(CartContext);

	return (
		<>
			<CheckoutItemContainer>
				{imageUrl && <CheckoutItemImage src={`${process.env.PUBLIC_URL}/assets/${imageUrl}`}></CheckoutItemImage>}
				<CheckoutItemName>{name}</CheckoutItemName>
				<CheckoutItemPrice>{price} €</CheckoutItemPrice>
				{ageRestricted && <span style={{ fontSize: 'x-large' }}>&#128286;</span>}
				<SmallButton style={{ marginLeft: 'auto' }} onClick={() => removeFromCart(listIndex)}>
					X
				</SmallButton>
			</CheckoutItemContainer>
		</>
	);
};

export default CheckoutItem;
