export enum ConcurrencyLocks {
	ChannelLock = 'channel-lock',
	CredentialLock = 'credential-lock'
}

export interface ConcurrencyLock {
	id: string;
	lock: string;
	created: Date;
}
