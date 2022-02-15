import { createContext, useEffect, useState } from 'react';
import { Item } from '../models/item.model';

export const CartContext = createContext({} as any);

const CartProvider = ({ children }: any) => {
	const [items, setItems] = useState<Item[]>([]);

	const addToCart = (item: Item) => {
		setItems([...items, item]);
	};

	const removeFromCart = (id: number) => {
		const filteredItems = items.filter((item) => item.id !== id);
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
