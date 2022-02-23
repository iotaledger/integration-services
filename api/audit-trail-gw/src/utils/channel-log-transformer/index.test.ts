import { ChannelLogTransformer, IPayload } from '.';
import { ChannelData, ChannelLog } from '@iota/is-shared-modules/lib/models/types/channel-data';
import { StreamsMessage } from '../../services/streams-service';

describe('test ChannelLogTransformer', () => {
	describe('test transformation', () => {
		it('streamsdata should return expected channel logs', async () => {
			const expectedChannelLogs: ChannelData[] = [
				{
					link: '92a2cdc1d03eebcc6d46dbbbe41ff3e9d7a8b7971da61f128662ba54d10a454e0000000000000000:8232661d2ac553604189fff6',
					messageId: 'a9cad6a23fc630255446e482b59dead3b9415ff0adb4a00302450cc683982a43',
					log: {
						created: '2021-08-17T14:05:40+02:00',
						type: 'author-test',
						metadata: {
							somedata: 2
						},
						publicPayload: {
							publicData: 'testdata12'
						},
						payload: {
							x: 'I am also a payload from the author 22'
						}
					}
				}
			];

			const streamsMessages: StreamsMessage[] = [
				{
					link: '92a2cdc1d03eebcc6d46dbbbe41ff3e9d7a8b7971da61f128662ba54d10a454e0000000000000000:8232661d2ac553604189fff6',
					messageId: 'a9cad6a23fc630255446e482b59dead3b9415ff0adb4a00302450cc683982a43',
					maskedPayload: {
						data: { x: 'I am also a payload from the author 22' }
					},
					publicPayload: {
						created: '2021-08-17T14:05:40+02:00',
						type: 'author-test',
						metadata: {
							somedata: 2
						},
						data: { publicData: 'testdata12' }
					}
				}
			];

			const channelLogs = ChannelLogTransformer.transformStreamsMessages(streamsMessages);
			expect(channelLogs).toEqual(expectedChannelLogs);
		});

		it('streamsdata should return expected channel logs for undefined payloads', async () => {
			const expectedChannelLogs: ChannelData[] = [
				{
					link: '92a2cdc1d03eebcc6d46dbbbe41ff3e9d7a8b7971da61f128662ba54d10a454e0000000000000000:8232661d2ac553604189fff6',
					messageId: 'a9cad6a23fc630255446e482b59dead3b9415ff0adb4a00302450cc683982a43',
					log: {
						created: undefined,
						type: undefined,
						metadata: undefined,
						publicPayload: undefined,
						payload: undefined
					}
				}
			];

			const streamsMessages: StreamsMessage[] = [
				{
					link: '92a2cdc1d03eebcc6d46dbbbe41ff3e9d7a8b7971da61f128662ba54d10a454e0000000000000000:8232661d2ac553604189fff6',
					messageId: 'a9cad6a23fc630255446e482b59dead3b9415ff0adb4a00302450cc683982a43',
					maskedPayload: null,
					publicPayload: null
				}
			];

			const channelLogs = ChannelLogTransformer.transformStreamsMessages(streamsMessages);
			expect(channelLogs).toEqual(expectedChannelLogs);
		});

		it('streamsdata should return empty logs for empty messages array', async () => {
			const expectedChannelLogs: ChannelData[] = [];
			const streamsMessages: StreamsMessage[] = [];
			const channelLogs = ChannelLogTransformer.transformStreamsMessages(streamsMessages);
			expect(channelLogs).toEqual(expectedChannelLogs);
		});

		it('streamsdata should return empty logs for messages=null', async () => {
			const expectedChannelLogs: ChannelData[] = [];
			const streamsMessages: StreamsMessage[] = null;
			const channelLogs = ChannelLogTransformer.transformStreamsMessages(streamsMessages);
			expect(channelLogs).toEqual(expectedChannelLogs);
		});

		it('channel logs should return expected payloads', async () => {
			const log: ChannelLog = {
				created: '2021-08-17T14:05:40+02:00',
				type: 'author-test',
				metadata: {
					somedata: 2
				},
				publicPayload: {
					publicData: 'testdata12'
				},
				payload: {
					x: 'I am also a payload from the author 22'
				}
			};

			const publicPayload: IPayload = {
				created: '2021-08-17T14:05:40+02:00',
				type: 'author-test',
				metadata: {
					somedata: 2
				},
				data: { publicData: 'testdata12' }
			};
			const maskedPayload: IPayload = {
				data: { x: 'I am also a payload from the author 22' }
			};
			const payloads = ChannelLogTransformer.getPayloads(log);
			expect(payloads).toEqual({ maskedPayload, publicPayload });
		});

		it('channel logs should return all data in encrypted payloads but created and type in public', async () => {
			const log: ChannelLog = {
				created: '2021-08-17T14:05:40+02:00',
				type: 'author-test',
				payload: {
					x: 'I am also a payload from the author 22'
				}
			};

			const publicPayload: IPayload = { created: '2021-08-17T14:05:40+02:00', type: 'author-test' };
			const maskedPayload: IPayload = {
				data: { x: 'I am also a payload from the author 22' }
			};
			const payloads = ChannelLogTransformer.getPayloads(log);
			expect(payloads).toEqual({ maskedPayload, publicPayload });
		});

		it('channel logs should return empty payloads', async () => {
			const log: ChannelLog = null;

			const publicPayload: IPayload = {};
			const maskedPayload: IPayload = {};
			const payloads = ChannelLogTransformer.getPayloads(log);
			expect(payloads).toEqual({ maskedPayload, publicPayload });
		});
	});

	describe('test validation', () => {
		const logs = [
			{
				link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:c2bf8e1ccc98cb7b5ba286c4',
				log: {
					created: '2021-09-06T14:30:08+02:00',
					type: 'author-test',
					metadata: {
						somedata: 22
					},
					publicPayload: {
						data: 'testdata123'
					},
					payload: 'I am a string from the author'
				},
				messageId: '4567570d36e11dc377faee93c8c182b0b44bcd816b4fd0e48ec85a8e8a49f69d',
				imported: '2021-09-06T14:30:14+02:00'
			},
			{
				link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:9a52fdce3e7ee09dcce3a6e1',
				log: {
					created: '2021-09-06T14:30:05+02:00',
					type: 'author-test',
					metadata: {
						somedata: 22
					},
					publicPayload: {
						data: 'testdata123'
					},
					payload: 'I am a string from the author'
				},
				messageId: '281ff5b9eea55c8eed82bef64b83f0dfe7bc175677807266d28fd900a60ac26b',
				imported: '2021-09-06T14:30:07+02:00'
			},
			{
				link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:55c9c94f5a485a8911b3afb9',
				log: {
					created: '2021-09-06T14:27:54+02:00',
					type: 'author-test',
					metadata: {
						somedata: 22
					},
					publicPayload: {
						publicData: 'testdata123'
					},
					payload: 'I am a string from the author'
				},
				messageId: '1a6bca1cae3b7f043fbce1eeb4a95b82ba70af4db2c1cdc8f149f55f79ca084b',
				imported: '2021-09-06T14:27:58+02:00'
			}
		];

		it('should have one message which is missing on the tangle', async () => {
			const tangleLogs = [logs[0], logs[1]]; // 3rd entry is missing

			const res = ChannelLogTransformer.validateLogs(logs, tangleLogs);
			expect(res).toEqual([
				{
					isValid: true,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:c2bf8e1ccc98cb7b5ba286c4'
				},
				{
					isValid: true,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:9a52fdce3e7ee09dcce3a6e1'
				},
				{
					error: 'log not found on the tangle',
					isValid: false,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:55c9c94f5a485a8911b3afb9'
				}
			]);
		});

		it('first message is not valid since different on tangle', async () => {
			const log = {
				...logs[0],
				log: {
					...logs[0].log,
					payload: 'differentpayloadontangle'
				}
			};
			const tangleLogs = [log, logs[1], logs[2]]; // 1st message is different

			const res = ChannelLogTransformer.validateLogs(logs, tangleLogs);
			expect(res).toEqual([
				{
					error: 'not the same data',
					isValid: false,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:c2bf8e1ccc98cb7b5ba286c4',
					tangleLog: {
						created: '2021-09-06T14:30:08+02:00',
						metadata: {
							somedata: 22
						},
						payload: 'differentpayloadontangle',
						publicPayload: {
							data: 'testdata123'
						},
						type: 'author-test'
					}
				},
				{
					isValid: true,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:9a52fdce3e7ee09dcce3a6e1'
				},
				{
					isValid: true,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:55c9c94f5a485a8911b3afb9'
				}
			]);
		});

		it('no messages are found', async () => {
			const tangleLogs: any[] = []; // no found

			const res = ChannelLogTransformer.validateLogs(logs, tangleLogs);
			expect(res).toEqual([
				{
					error: 'log not found on the tangle',
					isValid: false,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:c2bf8e1ccc98cb7b5ba286c4'
				},
				{
					error: 'log not found on the tangle',
					isValid: false,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:9a52fdce3e7ee09dcce3a6e1'
				},
				{
					error: 'log not found on the tangle',
					isValid: false,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:55c9c94f5a485a8911b3afb9'
				}
			]);
		});

		it('all messages are valid', async () => {
			const tangleLogs = [...logs]; // all valid

			const res = ChannelLogTransformer.validateLogs(logs, tangleLogs);
			expect(res).toEqual([
				{
					isValid: true,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:c2bf8e1ccc98cb7b5ba286c4'
				},
				{
					isValid: true,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:9a52fdce3e7ee09dcce3a6e1'
				},
				{
					isValid: true,
					link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:55c9c94f5a485a8911b3afb9'
				}
			]);
		});
	});
});
