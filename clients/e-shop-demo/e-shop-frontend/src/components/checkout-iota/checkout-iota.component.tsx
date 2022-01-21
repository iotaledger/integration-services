import { useContext } from 'react';
import { CheckoutStepHeading, CheckoutWithIotaContainer, CheckoutWithIotaContainerHeading } from './checkout-iota.styles';
import { UserContext } from '../../contexts/user.provider';
import AuthenticateCredential from '../authenticate-credential/authenticate-credential.component';
import MessageBox from '../message-box/message-box.component';
import VerifyCredential from '../verify-credential/verify-credential.component';

const CheckoutWithIota = () => {
	const { isVerified } = useContext(UserContext);

	return (
		<CheckoutWithIotaContainer>
			<CheckoutWithIotaContainerHeading>Checkout with IOTA</CheckoutWithIotaContainerHeading>
			<VerifyCredential></VerifyCredential>
			{isVerified && (
				<>
					<CheckoutStepHeading>Authenticate credential</CheckoutStepHeading>
					<AuthenticateCredential></AuthenticateCredential>
				</>
			)}
		</CheckoutWithIotaContainer>
	);
};

export default CheckoutWithIota;
