import { Mutex, MutexInterface } from 'async-mutex';

export interface ILock {
	acquire(key: string): Promise<MutexInterface.Releaser>;
}

export class Lock implements ILock {
	private locks: Map<string, MutexInterface>;
	private static instance: Lock;

	private constructor() {
		this.locks = new Map();
	}

	public static getInstance(): Lock {
		if (!Lock.instance) {
			Lock.instance = new Lock();
		}
		return Lock.instance;
	}

	acquire(key: string) {
		if (!this.locks.has(key)) {
			this.locks.set(key, new Mutex());
		}
		return this.locks.get(key).acquire();
	}
}
