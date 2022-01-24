import { useContext, useRef, useState } from 'react';
import { UserContext } from '../../contexts/user.provider';
import { SmallButton } from '../../global.styles';
import { isOverAgeRestriction, readFile, verifyCredential } from '../../services/verify-credential.service';
import { CheckoutStepHeading } from '../checkout-iota/checkout-iota.styles';
import MessageBox from '../message-box/message-box.component';
import Form from 'react-bootstrap/Form';
import credentialJson from '../../data/credential.json';
import credentialUnderAge from '../../data/credential_under_age.json';
import { Rings } from 'react-loader-spinner';
import { TourContext } from '../../contexts/tour.provider';

const VerifyCredential = () => {
	const inputRef = useRef<any>();
	const [ageRestrictionError, setAgeRestrictionError] = useState<boolean>();
	const [credentialFile, setCredentialFile] = useState<any>();
	const { setCredential, setIsVerified, setUseOwnCredential, useOwnCredential, authenticated } = useContext(UserContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { setStep, setRun } = useContext(TourContext);

	const onVerify = async () => {
		setIsLoading(true);
		setIsVerified(false);
		const verified = await verifyCredential(credentialFile);
		const overAgeRestriction = isOverAgeRestriction(credentialFile);
		setAgeRestrictionError(!overAgeRestriction);
		setIsVerified(verified);
		setCredential(credentialFile);
		setIsLoading(false);
		if (!overAgeRestriction) {
			setStep(6);
			setRun(true);

		} else if (overAgeRestriction && authenticated) {
			setStep(10);
			setRun(true);
		} else {
			setStep(7);
			setRun(true);
		}
	};

	const onFileChange = async (file: File) => {
		const credential = await readFile(file as File);
		setCredentialFile(credential);
		setIsVerified(false);
		setCredential(undefined);
		setAgeRestrictionError(false);
	};

	const onCredentialChange = (event: any) => {
		setIsVerified(false);
		setCredential(undefined);
		setAgeRestrictionError(undefined);
		const value = event.target.value;
		if (value === 'under') {
			setCredentialFile(credentialUnderAge);
			setUseOwnCredential(false);
			setStep(5);
			setRun(true);
		} else if (value === 'above') {
			setCredentialFile(credentialJson);
			setUseOwnCredential(false);
			setStep(5);
			setRun(true);
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
					{isLoading && <Rings height="50" width="50" color="#d6cbd3"/>}
				</>
			)}

			<MessageBox className='credentialAgeRestriction' type="danger" show={ageRestrictionError === true}>
				Credential is under age restriction!
			</MessageBox>
			<MessageBox className='credentialVerified' type="success" show={ageRestrictionError === false}>
				Credential successful verified
			</MessageBox>
		</>
	);
};

export default VerifyCredential;
