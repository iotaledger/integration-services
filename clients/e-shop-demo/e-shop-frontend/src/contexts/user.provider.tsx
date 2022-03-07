import { createContext, useEffect, useState } from 'react';
import { removeAuthHeader } from '../utils/axios-client';

export const UserContext = createContext({} as any);
const UserProvider = ({ children }: any) => {
	const [authenticated, setAuthenticated] = useState<boolean>();
	const [credential, setCredential] = useState<object>();
	const [isVerified, setIsVerified] = useState<boolean>();
	const [useOwnCredential, setUseOwnCredential] = useState<boolean>();

	useEffect(() => {
		const localStorage = window.localStorage;
		const jwt = localStorage.getItem('jwt');
		const auth = jwt ? true : false;
		setAuthenticated(auth);
	}, []);

	const logout = () => {
		setAuthenticated(false);
		removeAuthHeader();
	};

	return (
		<UserContext.Provider
			value={{
				authenticated,
				setAuthenticated,
				credential,
				setCredential,
				isVerified,
				setIsVerified,
				useOwnCredential,
				setUseOwnCredential,
				logout
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export default UserProvider;
