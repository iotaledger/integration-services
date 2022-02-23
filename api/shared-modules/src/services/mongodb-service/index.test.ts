import { MongoDbService } from './';

describe('test MongoDbService', () => {
	it('getPlainObject should not return values with null or undefined!', () => {
		const updateObject = MongoDbService.getPlainObject({
			id: 'test-12334',
			fieldIsNull: null,
			fieldIsUndefined: undefined,
			age: 0,
			emptyString: ''
		});
		const expectedPlainObject = {
			emptyString: '',
			age: 0,
			id: 'test-12334'
		};
		expect(updateObject).toEqual(expectedPlainObject);
	});
});
