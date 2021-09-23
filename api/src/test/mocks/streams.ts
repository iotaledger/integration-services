export const AuthorMock = {
	clone: () => AuthorMock,
	sync_state: jest.fn(),
	state: 'someteststate',
	get_public_key: () => 'test-author-public-key'
};
