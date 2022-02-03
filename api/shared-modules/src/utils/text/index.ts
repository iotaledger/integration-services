import { parseISO, formatISO } from 'date-fns';

export const getDateFromString = (dateString: string): Date | undefined => {
	return dateString ? parseISO(dateString) : undefined;
};

export const getDateStringFromDate = (date: Date): string | null | undefined => {
	return date && formatISO(date);
};

export function toBytes(str: string): Uint8Array {
	const bytes = new Uint8Array(str.length);
	for (let i = 0; i < str.length; ++i) {
		bytes[i] = str.charCodeAt(i);
	}
	return bytes;
}

export function fromBytes(bytes: Array<any> | Uint8Array): string {
	let str = '';
	for (let i = 0; i < bytes.length; ++i) {
		str += String.fromCharCode(bytes[i]);
	}
	return str;
}
