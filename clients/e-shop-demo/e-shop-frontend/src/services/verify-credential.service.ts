import { client } from '../utils/axios-client';

export const readFile = (file: File): Promise<unknown> => {
	return new Promise((resolve, reject) => {
		try {
			const fileReader = new FileReader();
			fileReader.onload = () => {
				try {
					const result = JSON.parse(fileReader.result as string);
					resolve(result);
				} catch (e: any) {
					resolve(JSON.parse('{"error": "No valid json selected" }'));
				}
			};
			fileReader.onerror = () => reject;
			fileReader.readAsText(file);
		} catch (e: any) {
			reject();
		}
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
		throw new Error("Could not verify credential");
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
