import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext({} as any);
const UserProvider = ({ children }: any) => {
	const [userIdentityId, setUserIdentityId] = useState<string>('');
	const [authenticated, setAuthenticated] = useState<boolean>();
	const [credential, setCredential] = useState<object>();
	const [isVerified, setIsVerified] = useState<boolean>();

	useEffect(() => {
		const localStorage = window.localStorage;
		const jwt = localStorage.getItem('jwt');
		const auth = jwt ? true : false;
		setAuthenticated(auth);
	}, []);

	useEffect(() => {
		console.log('Updated identity id: ', userIdentityId);
	}, [userIdentityId]);

	useEffect(() => {
		console.log('Updated authentication: ', authenticated);
	}, [authenticated]);

	useEffect(() => {
		console.log('Updated credential: ', credential);
	}, [credential]);

	useEffect(() => {
		console.log('Updated verified: ', isVerified);
	}, [isVerified]);

	return (
		<UserContext.Provider
			value={{
				userIdentityId,
				setUserIdentityId,
				authenticated,
				setAuthenticated,
				credential,
				setCredential,
				isVerified,
				setIsVerified
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export default UserProvider;
