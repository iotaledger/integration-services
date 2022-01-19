import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/user.provider';
import { Input, SmallButton } from '../../global.styles';
import { authSignedNonce, authSecretKey } from '../../services/authentication.service';
import GenerateNonce from '../generate-nonce/generate-nonce.component';
import MessageBox from '../message-box/message-box.component';
import Form from 'react-bootstrap/Form';

const AuthenticateCredential = () => {
	const [authError, setAuthError] = useState(false);
	const [signedNonce, setSignedNonce] = useState<string>('');
	const { credential, setAuthenticated, authenticated, useOwnCredential } = useContext(UserContext);

	const onAuthenticate = async () => {
		setAuthError(false);
		const identityId = credential.id;
		let auth: boolean;
		if (useOwnCredential) {
			auth = await authSignedNonce(signedNonce, identityId);
		} else {
			const secretKey = process.env.REACT_APP_SECRET_KEY;
			if (secretKey == null) {
				console.log('Please set secret key in environment vars');
				process.exit();
			}
			const signedNonce = await authSecretKey(identityId, secretKey);
			auth = await authSignedNonce(signedNonce, identityId);
		}

		setAuthError(!auth);
		setAuthenticated(auth);
	};

	return (
		<>
			{!authenticated && (
				<>
					{useOwnCredential && (
						<>
							<GenerateNonce></GenerateNonce>
							<Form.Group className="mb-3" controlId="signedNonce">
								<Form.Label>Signed Nonce</Form.Label>
								<Form.Control onChange={(event: any) => setSignedNonce(event.target.value)} type="text" placeholder="Signed Nonce" />
							</Form.Group>
						</>
					)}
					<SmallButton style={{ marginLeft: 0 }} onClick={onAuthenticate}>
						Authenticate
					</SmallButton>
				</>
			)}
			<MessageBox type="success" show={authenticated}>
				Credential successful authenticated
			</MessageBox>

			<MessageBox type="danger" show={authError}>
				Could not authenticate credential
			</MessageBox>
		</>
	);
};

export default AuthenticateCredential;
