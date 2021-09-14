import { Item } from "../../models/item.model";

const CheckoutItem = ({ item }: any) => {
  const { name, price, ageRestricted } = item as Item;

  return (
    <>
      <p>
        {name} - {price} €
      </p>
    </>
  );
};

export default CheckoutItem;
