import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../contexts/cart.provider';
import { UserContext } from '../../contexts/user.provider';
import { Button } from '../../global.styles';
import { Item } from '../../models/item.model';
import { CheckoutHeading } from '../../pages/checkout/checkout.styles';
import CheckoutWithIota from '../checkout-iota/checkout-iota.component';
import CheckoutTotalMessage from '../checkout-total-message/checkout-total-message.component';
import MessageBox from '../message-box/message-box.component';
import { CheckoutTotalContainer } from './checkout-total.styles';

const CheckoutTotal = () => {
	const { items, emptyCart } = useContext(CartContext);
	const [showOrderPlaceMessage, setShowOrderPlacedMessage] = useState(false);
	const [hasCheckedOut, setHasCheckedOut] = useState<boolean>(false);
	const cartHasAgeRestrictedItems = !!items.find((item: Item) => item.ageRestricted === true);
	const { authenticated, isVerified, setIsVerified, logout } = useContext(UserContext);
	const timeout = useRef<any>();

	const onCheckout = () => {
		setIsVerified(undefined);
		emptyCart();
		showOrderMessage();
		setHasCheckedOut(true);
	};

	const showOrderMessage = () => {
		setShowOrderPlacedMessage(true);
		timeout.current = setTimeout(() => {
			setShowOrderPlacedMessage(false);
		}, 4000);
	};

	// Clear timeout when user leaves page before 4s have been passed to prevent update on an unmounted component
	useEffect(() => {
		return () => {
			clearTimeout(timeout.current);
		};
	}, []);

	const showCheckoutButton = (isVerified && authenticated) || (!cartHasAgeRestrictedItems && items.length !== 0);

	return (
		<CheckoutTotalContainer>
			<CheckoutHeading>Total</CheckoutHeading>
			<CheckoutTotalMessage></CheckoutTotalMessage>
			{items.length !== 0 && cartHasAgeRestrictedItems && <CheckoutWithIota></CheckoutWithIota>}

			{showCheckoutButton && (
				<Button className="checkoutButton" onClick={onCheckout}>
					Checkout
				</Button>
			)}
			{hasCheckedOut && (
				<Link to="/">
					<Button onClick={logout}>Restart tour</Button>
				</Link>
			)}
			<MessageBox className="orderPlaced" type="success" show={showOrderPlaceMessage}>
				Your order has been placed!
			</MessageBox>
		</CheckoutTotalContainer>
	);
};

export default CheckoutTotal;
