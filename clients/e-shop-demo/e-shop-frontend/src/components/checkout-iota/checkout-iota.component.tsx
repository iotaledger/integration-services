import { useContext, useEffect, useState } from 'react';
import { CheckoutStepHeading, CheckoutWithIotaContainer, CheckoutWithIotaContainerHeading } from './checkout-iota.styles';
import { UserContext } from '../../contexts/user.provider';
import AuthenticateCredential from '../authenticate-credential/authenticate-credential.component';
import VerifyCredential from '../verify-credential/verify-credential.component';
import { Form } from 'react-bootstrap';

const CheckoutWithIota = () => {
	const { isVerified } = useContext(UserContext);
	const [showCredential, setShowCredential] = useState(false);
	const [credentialButtonDisabled, setCredentialButtonDisabled] = useState(false);

	// Hide credential display and disable toggle button on smaller screens
	useEffect(() => {
		checkWindowSize();
		window.addEventListener('resize', () => {
			checkWindowSize();
		});
	}, []);

	const checkWindowSize = () => {
		if (window.innerWidth < 600) {
			showCredential && setShowCredential(false);
			!credentialButtonDisabled && setCredentialButtonDisabled(true);
		} else {
			credentialButtonDisabled && setCredentialButtonDisabled(false);
		}
	};

	return (
		<CheckoutWithIotaContainer>
			<CheckoutWithIotaContainerHeading>Checkout with IOTA</CheckoutWithIotaContainerHeading>
			<VerifyCredential showCredential={showCredential}></VerifyCredential>
			{isVerified && (
				<>
					<CheckoutStepHeading>Authenticate credential</CheckoutStepHeading>
					<AuthenticateCredential></AuthenticateCredential>
				</>
			)}
			<Form.Check
				onChange={(_event) => setShowCredential(!showCredential)}
				style={{ marginTop: '20px' }}
				checked={showCredential}
				disabled={credentialButtonDisabled}
				type="switch"
				id="custom-switch"
				label="Show credential"
			/>
		</CheckoutWithIotaContainer>
	);
};

export default CheckoutWithIota;
