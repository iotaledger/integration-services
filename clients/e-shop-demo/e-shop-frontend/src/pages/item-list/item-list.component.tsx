import { ItemsContainer } from './item-list.styles';
import items from '../../data/items.json';
import Item from '../../components/list-item/list-item.component';

const ItemList = () => {
	return (
		<ItemsContainer className="tourProducts">
			{items.map((item) => {
				return <Item key={item.id} item={item}></Item>;
			})}
		</ItemsContainer>
	);
};

export default ItemList;
