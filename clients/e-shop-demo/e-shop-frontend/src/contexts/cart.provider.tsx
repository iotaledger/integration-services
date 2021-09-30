import { createContext, useEffect, useState } from 'react';
import { Item } from '../models/item.model';

export const CartContext = createContext({} as any);

const CartProvider = ({ children }: any) => {
	const [items, setItems] = useState<any[]>([]);

	useEffect(() => {
		console.log(`Updated Items: `, items);
	}, [items]);

	const addToCart = (item: Item) => {
		setItems([...items, { item, index: items.length }]);
	};

	const removeFromCart = (index: number) => {
		const filteredItems = items.filter((item) => item.index !== index);
		setItems(filteredItems);
	};

	const emptyCart = () => {
		setItems([]);
	};

	return (
		<CartContext.Provider
			value={{
				items,
				addToCart,
				removeFromCart,
				emptyCart
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export default CartProvider;
