import { createContext, useEffect, useState } from "react";
import { Item } from "../models/item.model";

export const CartContext = createContext({} as any);

const CartProvider = ({ children }: any) => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    console.log(`Updated Items: `, items);
  }, [items]);

  const addToCart = (item: Item) => {
    setItems([...items, item]);
  };

  const removeFromCart = (itemToRemove: Item) => {
    const filteredItems = items.filter((item) => item.id !== itemToRemove.id);
    setItems(filteredItems);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
