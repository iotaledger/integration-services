import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/user.provider';
import { Input, SmallButton } from '../../global.styles';
import { authenticate } from '../../services/authentication.service';
import GenerateNonce from '../generate-nonce/generate-nonce.component';
import MessageBox from '../message-box/message-box.component';

const AuthenticateCredential = () => {
	const [authError, setAuthError] = useState(false);
	const [signedNonce, setSignedNonce] = useState<string>('');
	const { credential, setAuthenticated, authenticated } = useContext(UserContext);

	const onAuthenticate = async () => {
		setAuthError(false);
		const identityId = credential.id;
		const auth = await authenticate(signedNonce, identityId);
		setAuthError(!auth);
		setAuthenticated(auth);
	};

	return (
		<>
			{!authenticated && (
				<>
					<GenerateNonce></GenerateNonce>
					<label>
						<div>Signed nonce:</div>
						<Input type="text" name="signed-nonce" onChange={(event: any) => setSignedNonce(event.target.value)}></Input>
					</label>
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
