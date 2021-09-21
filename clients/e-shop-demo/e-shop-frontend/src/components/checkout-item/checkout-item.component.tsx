import { Item } from "../../models/item.model";
import { CheckoutItemContainer, CheckoutItemImage, CheckoutItemName } from "./checkout-item.styles";

const CheckoutItem = ({ item }: any) => {
  const { name, price, ageRestricted, imageUrl } = item as Item;

  return (
    <>
      <CheckoutItemContainer>
        <CheckoutItemImage src={imageUrl}></CheckoutItemImage>
        <CheckoutItemName>{name}</CheckoutItemName>
        <CheckoutItemName>{price} €</CheckoutItemName>
        {ageRestricted && <span style={{fontSize: 'x-large'}}>&#128286;</span>}
      </CheckoutItemContainer>
    </>
  );
};

export default CheckoutItem;
