import { useContext, useRef, useState } from 'react';
import { UserContext } from '../../contexts/user.provider';
import { SmallButton } from '../../global.styles';
import { isOverAgeRestriction, readFile, verifyCredential } from '../../services/verify-credential.service';
import { CheckoutStepHeading } from '../checkout-iota/checkout-iota.styles';
import MessageBox from '../message-box/message-box.component';

const VerifyCredential = () => {
	const inputRef = useRef<any>();
	const [ageRestrictionError, setAgeRestrictionError] = useState<boolean>();
	const [file, setFile] = useState<File>();
	const { setCredential, setIsVerified } = useContext(UserContext);

	const onVerify = async () => {
		setIsVerified(false);
		const credential = await readFile(file as File);
		const verified = await verifyCredential(credential);
		const overAgeRestriction = isOverAgeRestriction(credential);
		setAgeRestrictionError(!overAgeRestriction);
		setIsVerified(verified);
		setCredential(credential);
	};

	const onFileChange = (file: File) => {
		setFile(file);
		setIsVerified(false);
		setCredential(undefined);
		setAgeRestrictionError(false);
	};
	return (
		<>
			<label>
				<CheckoutStepHeading>Verify credential</CheckoutStepHeading>
				<input type="file" name="credentialFile" ref={inputRef} onChange={(event: any) => onFileChange(event.target.files[0] as File)}></input>
			</label>
			{file && <SmallButton onClick={onVerify}>Verify</SmallButton>}
			<MessageBox type="danger" show={ageRestrictionError === true}>
				Credential is under age restriction!
			</MessageBox>
		</>
	);
};

export default VerifyCredential;
