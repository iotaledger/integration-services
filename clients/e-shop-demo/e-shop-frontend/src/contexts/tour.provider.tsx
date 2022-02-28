import { createContext, useState } from 'react';

export const TourContext = createContext({} as any);

const TourProvider = ({ children }: any) => {
	const [step, setStep] = useState<number>(0);
	const [run, setRun] = useState<boolean>();
	const [disabled, setDisabled] = useState<boolean>(false);

	return (
		<TourContext.Provider
			value={{
				step,
				setStep,
				run: disabled ? false : run,
				setRun,
				disabled,
				setDisabled
			}}
		>
			{children}
		</TourContext.Provider>
	);
};

export default TourProvider;
