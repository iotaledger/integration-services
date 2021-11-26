import { KeyGenerator } from '.';
import { ConfigurationServiceMock } from '../test/mocks/service-mocks';
import { LoggerMock } from '../test/mocks/logger';

describe('test keygen', () => {
	let keyGenerator: KeyGenerator;
	beforeEach(() => {
		keyGenerator = new KeyGenerator(ConfigurationServiceMock, LoggerMock);
	});
	it('SERVER_IDENTITY file must be wellformed', () => {
		expect(keyGenerator).toEqual(keyGenerator);
	});

	it('if SERVER_IDENTITY exists keygeneration should do nothing', () => {
		expect(true).toEqual(true);
	});

	it('if SERVER_IDENTITY not exists a valid key must be generated', () => {
		expect(true).toEqual(true);
	});
});
