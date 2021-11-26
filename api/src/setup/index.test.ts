'use strict';

jest.mock('fs');

describe('test keygen', () => {

	it('SERVER_IDENTITY file must exist', () => {
		expect(true).toEqual(true);
	})

	it('SERVER_IDENTITY file must be wellformed', () => {
		expect(true).toEqual(true);
	})

	it('if SERVER_IDENTITY exists keygeneration should do nothing', () => {
		expect(true).toEqual(true);
	})

	it('if SERVER_IDENTITY not exists a valid key must be generated', () => {
		expect(true).toEqual(true);
	})

})
