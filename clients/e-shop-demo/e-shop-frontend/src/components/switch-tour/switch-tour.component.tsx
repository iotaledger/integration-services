import { useContext } from 'react';
import { Form } from 'react-bootstrap';
import { TourContext } from '../../contexts/tour.provider';
import { ToggleTourContainer } from './switch-tour.styles';

const SwitchTour = () => {
	const { disabled, setDisabled } = useContext(TourContext);

	return (
		<ToggleTourContainer>
			<Form.Check onChange={(_event) => setDisabled(!disabled)} checked={disabled} type="switch" id="custom-switch" label="Disable tour" />
		</ToggleTourContainer>
	);
};

export default SwitchTour;
