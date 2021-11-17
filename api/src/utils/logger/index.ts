import * as winston from 'winston';
import * as expressWinston from 'express-winston';

export interface ILogger {
	getExpressWinstonOptions(): expressWinston.LoggerOptions;
	log(message: string): void;
	error(message: string): void;
}

export class Logger implements ILogger {
	private static instance: Logger;
	logger: winston.Logger;
	readonly transports: winston.transport[] = [
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), this.alignColorsAndTime())
		})
	];
	readonly options = {
		level: 'info',
		format: winston.format.json(),
		defaultMeta: { service: 'user-service' },
		transports: this.transports
	};

	private constructor() {
		this.logger = this.createLogger();
	}

	public static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	getExpressWinstonOptions(): expressWinston.LoggerOptions {
		return {
			transports: this.transports,
			format: winston.format.json(),
			headerBlacklist: ['Authorization', 'authorization', 'cookie'],
			level: 'info',
			winstonInstance: this.logger
		};
	}

	log(message: string) {
		this.logger.log({ level: 'info', message });
	}

	error(message: string) {
		this.logger.log({ level: 'error', message });
	}

	private createLogger() {
		return winston.createLogger(this.options);
	}

	private alignColorsAndTime() {
		return winston.format.combine(
			winston.format.colorize({
				all: true
			}),
			winston.format.label({
				label: '[LOGGER]'
			}),
			winston.format.timestamp({
				format: 'YYYY-MM-DD HH:mm:ss'
			}),
			winston.format.printf((info) => `${info.label}  [${info.timestamp}]  ${info.level} : ${info.message}`)
		);
	}
}
