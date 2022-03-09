import { createContext, useState } from 'react';
import { Item } from '../models/item.model';

export const CartContext = createContext({} as any);

const CartProvider = ({ children }: any) => {
	const [items, setItems] = useState<Item[]>([]);

	const addToCart = (item: Item) => {
		setItems([...items, item]);
	};

	const removeFromCart = (listIndex: number) => {
		// A copy is needed to not splice the original array
		const itemsCopy = [...items];
		itemsCopy.splice(listIndex, 1);
		setItems(itemsCopy);
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
