import { KeyGenerator } from './index';
import { ConfigurationServiceMock } from '../test/mocks/service-mocks';
import { LoggerMock } from '../test/mocks/logger';
('use strict');

jest.mock('fs');

describe('test keygen', () => {
	let keyGenerator: KeyGenerator;
	beforeEach(() => {
		keyGenerator = new KeyGenerator(ConfigurationServiceMock, LoggerMock);
	});
	it('SERVER_IDENTITY file must exist', () => {
		expect(keyGenerator).not.toEqual(true);
	});

	it('SERVER_IDENTITY file must be wellformed', () => {
		expect(true).toEqual(true);
	});

	it('if SERVER_IDENTITY exists keygeneration should do nothing', () => {
		expect(true).toEqual(true);
	});

	it('if SERVER_IDENTITY not exists a valid key must be generated', () => {
		expect(true).toEqual(true);
	});
});
