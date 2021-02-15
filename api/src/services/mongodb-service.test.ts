import { MongoDbService } from './mongodb-service';

describe('test MongoDbService', () => {
  it('getUpdateObject should not return values with null or undefined!', () => {
    const updateObject = MongoDbService.getUpdateObject({
      userId: 'test-12334',
      fieldIsNull: null,
      fieldIsUndefined: undefined,
      age: 0,
      emptyString: ''
    });
    const expectedUpdateObject = {
      emptyString: '',
      age: 0,
      userId: 'test-12334'
    };

    expect(updateObject).toEqual(expectedUpdateObject);
  });
});
