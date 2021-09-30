import { client } from '../utils/axios-client';

export const readFile = (file: File): Promise<unknown> => {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = () => resolve(JSON.parse(fileReader.result as string));
		fileReader.onerror = () => reject;
		fileReader.readAsText(file);
	});
};

export const verifyCredential = async (credential: any): Promise<boolean> => {
	try {
		const url = `${process.env.REACT_APP_E_SHOP_BACKEND_URL}/check-credential`;
		const response = await client.post(url, credential);
		const isVerified = response.data.isVerified;
		return isVerified;
	} catch (error) {
		console.log(error);
		return false;
	}
};

export const isOverAgeRestriction = (credential: any, ageRestriction = 18) => {
	const oneYear = 1000 * 60 * 60 * 24 * 365;
	const birthDate = Date.parse(credential?.credentialSubject?.birthDate);
	const currentDate = new Date().getTime();
	const dateDifference = currentDate - birthDate;
	const yearsOld = dateDifference / oneYear;
	const overAgeRestriction = yearsOld > ageRestriction;
	return overAgeRestriction;
};
