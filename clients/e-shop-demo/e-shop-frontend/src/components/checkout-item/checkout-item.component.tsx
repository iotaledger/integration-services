import { useContext } from 'react';
import { CartContext } from '../../contexts/cart.provider';
import { SmallButton } from '../../global.styles';
import { Item } from '../../models/item.model';
import { CheckoutItemContainer, CheckoutItemImage, CheckoutItemName } from './checkout-item.styles';

const CheckoutItem = ({ item }: any) => {
	const { name, price, ageRestricted, imageUrl } = item.item as Item;
	const { removeFromCart } = useContext(CartContext);

	return (
		<>
			<CheckoutItemContainer>
				<CheckoutItemImage src={imageUrl}></CheckoutItemImage>
				<CheckoutItemName>{name}</CheckoutItemName>
				<CheckoutItemName>{price} €</CheckoutItemName>
				{ageRestricted && <span style={{ fontSize: 'x-large' }}>&#128286;</span>}
				<SmallButton onClick={() => removeFromCart(item.index)}>X</SmallButton>
			</CheckoutItemContainer>
		</>
	);
};

export default CheckoutItem;
