import { useContext } from 'react';
import { CartContext } from '../../contexts/cart.provider';
import { Button } from '../../global.styles';
import { Item as ItemModel } from '../../models/item.model';
import { Card, CardHeading, CardImage, CardText } from './item.styles';

const Item = ({ item }: any) => {
	const { name, imageUrl, price } = item as ItemModel;
	const { addToCart } = useContext(CartContext);
	return (
		<Card>
			<CardHeading>{name}</CardHeading>
			<CardImage src={imageUrl}></CardImage>
			<CardText>Price: {price}€</CardText>
			<Button onClick={() => addToCart(item)}>Add to cart</Button>
		</Card>
	);
};

export default Item;
