import { useContext, useRef, useState } from 'react';
import { UserContext } from '../../contexts/user.provider';
import { SmallButton } from '../../global.styles';
import { isOverAgeRestriction, readFile, verifyCredential } from '../../services/verify-credential.service';
import { CheckoutStepHeading } from '../checkout-iota/checkout-iota.styles';
import MessageBox from '../message-box/message-box.component';
import Form from 'react-bootstrap/Form';
import credentialJson from '../../data/credential.json';
import credentialUnderAge from '../../data/credential_under_age.json';
import credentialNotTrusted from '../../data/credential_not_trusted_root.json';
import { Rings } from 'react-loader-spinner';
import { TourContext } from '../../contexts/tour.provider';
import { VcDisplay } from './verify-credential.styles';

const VerifyCredential = () => {
	const inputRef = useRef<any>();
	const [ageRestrictionError, setAgeRestrictionError] = useState<boolean>();
	const [credentialFile, setCredentialFile] = useState<any>();
	const { setCredential, setIsVerified, isVerified, setUseOwnCredential, useOwnCredential, authenticated } = useContext(UserContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>();
	const { setStep, setRun } = useContext(TourContext);

	const onVerify = async () => {
		setIsLoading(true);
		setIsVerified(undefined);
		setErrorMessage(undefined);
		let verified: boolean | undefined;
		try {
			verified = await verifyCredential(credentialFile);
		} catch (e: any) {
			console.log(e);
		}

		const overAgeRestriction = isOverAgeRestriction(credentialFile);
		setAgeRestrictionError(!overAgeRestriction);
		setIsVerified(verified);
		setCredential(credentialFile);
		setIsLoading(false);
		// User is not over 18
		if (!overAgeRestriction && verified === false) {
			setErrorMessage('Credential is under age restriction or invalid!');
			setStep(6);
			setRun(true);		
		// User is over 18 but credential is invalid
		} else if (overAgeRestriction && verified === false) {
			setErrorMessage('Credential is invalid!');
			setStep(6);
			setRun(true);	
			// Cannot reach server
		} else if (verified === undefined) {
			setErrorMessage('Cannot reach server, try again.');
			setRun(false);	
			// User is over 18 and already authenticated
		} else if (overAgeRestriction && authenticated && !useOwnCredential && verified) {
			setStep(10);
			setRun(true);
			// User is over 18 and has to authenticate
		} else if (overAgeRestriction && !authenticated && !useOwnCredential && verified) {
			setStep(7);
			setRun(true);
			// The tour will stop if the user decides to use its own credentials
		} else if (useOwnCredential) {
			setRun(false);
		}
	};

	const onFileChange = async (file: File) => {
		const credential = await readFile(file as File);
		setCredentialFile(credential);
		setIsVerified(undefined);
		setCredential(undefined);
		setAgeRestrictionError(false);
	};

	const onCredentialChange = (event: any) => {
		setIsVerified(undefined);
		setCredential(undefined);
		setAgeRestrictionError(undefined);
		setErrorMessage(undefined);
		const value = event.target.value;
		if (value === 'under') {
			setCredentialFile(credentialUnderAge);
			setUseOwnCredential(false);
			setRun(false);
		} else if (value === 'above') {
			setCredentialFile(credentialJson);
			setUseOwnCredential(false);
			setStep(5);
			setRun(true);
		} else if (value === 'notTrusted') {
			setCredentialFile(credentialNotTrusted);
			setUseOwnCredential(false);
			setRun(false);
		} else if (event.target.value === 'own') {
			setUseOwnCredential(true);
		}
	};

	return (
		<>
			<CheckoutStepHeading>Verify credential</CheckoutStepHeading>
			<Form.Select onChange={(event: any) => onCredentialChange(event)}>
				<option>Choose your credential</option>
				<option className="underAgeCredential" value="under">
					Underage credential
				</option>
				<option className="notTrusted" value="notTrusted">
					Not trusted issuer credential
				</option>
				<option className="overAgeCredential" value="above">
					Adult credential
				</option>		
				<option value="own">Use your own credential</option>
			</Form.Select>
			{useOwnCredential && (
				<Form.Group controlId="formFile" className="mb-3">
					<Form.Label>Select your credential</Form.Label>
					<Form.Control ref={inputRef} onChange={(event: any) => onFileChange(event.target.files[0] as File)} type="file" />
				</Form.Group>
			)}
			{credentialFile && (
				<>
					<SmallButton className="verifyButton" onClick={onVerify}>
						Verify
					</SmallButton>
					{isLoading && <Rings height="50" width="50" color="#d6cbd3" />}
				</>
			)}

			<MessageBox className="credentialAgeRestriction" type="danger" show={!!errorMessage}>
				{errorMessage}
			</MessageBox>

			<MessageBox className="credentialVerified" type="success" show={ageRestrictionError === false && isVerified === true}>
				Credential successful verified
			</MessageBox>
			{credentialFile && (
				<VcDisplay>
					<b>Selected Verifiable Credential:</b>
					<hr></hr>
					{JSON.stringify(credentialFile, null, 4)}
				</VcDisplay>
			)}
		</>
	);
};

export default VerifyCredential;
