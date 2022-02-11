import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/user.provider';
import { generateNonce } from '../../services/authentication.service';

const GenerateNonce = () => {
	const [nonce, setNonce] = useState<string>();
	const { credential } = useContext(UserContext);

	useEffect(() => {
		async function getNonce() {
			const identityId = credential?.id;
			identityId && setNonce(await generateNonce(identityId));	
		}
		getNonce();
	}, [credential]);

	return nonce ? (
		<>
			<p>
				Generated nonce: <b>{nonce}</b>
			</p>
			<p>Sign this nonce with your secret key using the provided tool.</p>
		</>
	) : null;
};

export default GenerateNonce;
