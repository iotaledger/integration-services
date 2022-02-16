import { createContext, useState } from 'react';

export const TourContext = createContext({} as any);

const TourProvider = ({ children }: any) => {
	const [step, setStep] = useState<number>(0);
	const [run, setRun] = useState<boolean>();

	return (
		<TourContext.Provider
			value={{
				step,
				setStep,
				run,
				setRun
			}}
		>
			{children}
		</TourContext.Provider>
	);
};

export default TourProvider;
