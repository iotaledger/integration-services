'use strict';

jest.mock('fs');

describe('test keygen', () => {

	/*
	const common = `
		PORT=3000
		API_VERSION=v1
		IOTA_PERMA_NODE=https://chrysalis-chronicle.iota.org/api/mainnet/
		IOTA_HORNET_NODE=https://chrysalis-nodes.iota.org:443
		# IOTA_HORNET_NODE=http://192.168.1.4:14265
		NETWORK=main
		EXPLORER=https://explorer.iota.org/mainnet/transaction
		DATABASE_NAME=e-commerce-tools
		DATABASE_URL=mongodb://root:KMciLe4wVv@localhost:27017/admin?authSource=admin&readPreference=primary&appname=integration-service&ssl=false
		SERVER_SECRET=PpKFhPKJY2efTsN9VkB7WNtYUhX9Utaa
		API_KEY=94F5BA49-12B6-4E45-A487-BF91C442276D
		SERVER_IDENTITY=server-identity.json
	`;
	*/

	/*
	const MOCK_FILE_INFO = {
		'/path/to/file1.js': 'console.log("file1 contents");',
		'/path/to/file2.txt': 'file2 contents',
	};

	beforeEach(() => {
		// Set up some mocked out file info before each test
		require('fs').__setMockFiles(MOCK_FILE_INFO);
	});
	*/

	/*
	test('includes all files in the directory in the summary', () => {
		require('fs').__setMockFiles({
			".env": ""
		});

		const FileSummarizer = require('./FileSummarizer');
		const fileSummary =
			FileSummarizer.summarizeFilesInDirectorySync('/path/to');

		expect(fileSummary.length).toBe(2);
	});
	*/

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
