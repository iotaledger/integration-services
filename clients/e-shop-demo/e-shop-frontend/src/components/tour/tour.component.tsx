import { useContext, useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { CartContext } from '../../contexts/cart.provider';
import { steps } from '../../data/tooltips';
import { useLocation } from 'react-router-dom';
import { TourContext } from '../../contexts/tour.provider';
import ErrorBoundary from '../error-boundary/error-boundary.component';

const Tour = () => {
	const [allowClicks, setAllowClicks] = useState<boolean>(true);
	const { step, setStep, run, setRun } = useContext(TourContext);
	const { items } = useContext(CartContext);
	const location = useLocation();

	useEffect(() => {
		if (items.length > 0 && step === 3) {
			setRun(true);
		}
	}, [items]);

	useEffect(() => {
		const path = location.pathname;
		if (path === '/checkout' && items.length > 0) {
			// If items in cart continue with step 4
			setStep(4);
			setRun(true);
		} else if (path === '/checkout') {
			setRun(false);
		} else if (path === '/') {
			// Restart tour on home page
			setStep(0);
			setRun(true);
		}
	}, [location]);

	const handleJoyrideCallback = (data: CallBackProps) => {
		const { status, index, lifecycle } = data;
		const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

		// Continue with next step when the previous one is finished
		if (lifecycle === 'complete') {
			setStep(index + 1);
		}

		// Stop tour when last step is reached
		if (finishedStatuses.includes(status)) {
			setRun(false);
		}

		// Waiting with the tour until the user has selected some items
		if (index === 2 && lifecycle === 'complete' && items.length === 0) {
			setRun(false);
		}

		// Disallow clicks to make tour more 'intuitive'
		if ([3].includes(index)) {
			setAllowClicks(false);
		}

		// Allow clicks again to make tour more 'intuitive'
		if ([5].includes(index)) {
			setAllowClicks(false);
		}

		// Stop tour and wait for requests to finish
		if ([3, 4, 5, 8].includes(index) && lifecycle === 'complete') {
			setRun(false);
		}
	};

	return (
		<ErrorBoundary>
			<Joyride
				callback={handleJoyrideCallback}
				continuous={true}
				run={run}
				scrollToFirstStep={false}
				showProgress={false}
				showSkipButton={false}
				disableScrolling={true}
				steps={steps}
				styles={{
					options: {
						zIndex: 10000
					}
				}}
				spotlightClicks={allowClicks}
				stepIndex={step}
			/>
		</ErrorBoundary>
	);
};

export default Tour;
