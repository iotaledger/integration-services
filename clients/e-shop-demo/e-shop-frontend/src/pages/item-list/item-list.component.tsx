import { ItemsContainer } from "./item-list.styles";
import items from "../../data/items.json"
import Item from "../../components/item/item.component";

const ItemList = () => {
  return (
    <ItemsContainer>
      {items.map(item => {
        return <Item key={item.id} item={item}></Item>
      })}
    </ItemsContainer>
  );
};

export default ItemList;
