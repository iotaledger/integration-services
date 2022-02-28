import { VcDisplay } from './credential-display.styles';

const CredentialDisplay = ({ credentialFile, showCredential }: { credentialFile: any; showCredential: boolean }) => {
	return (
		<>
			{credentialFile && showCredential && (
				<VcDisplay>
					<b>Selected Verifiable Credential:</b>
					<hr></hr>
					{JSON.stringify(credentialFile, null, 4)}
				</VcDisplay>
			)}
		</>
	);
};

export default CredentialDisplay;
