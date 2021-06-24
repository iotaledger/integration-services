import * as winston from 'winston';

const alignColorsAndTime = winston.format.combine(
export interface ILogger {
	log(message: string): void;
	error(message: string): void;
}

export const logger = winston.createLogger({
export class Logger implements ILogger {
	logger: winston.Logger;
	constructor() {
		this.logger = this.createLogger();
	}

	log(message: string) {
		this.logger.log({ level: 'info', message });
