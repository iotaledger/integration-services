import * as winston from 'winston';

export interface ILogger {
	log(message: string): void;
	error(message: string): void;
}

export class Logger implements ILogger {
	readonly options = {
		level: 'info',
		format: winston.format.json(),
		defaultMeta: { service: 'user-service' },
		transports: [
			new winston.transports.Console({
				format: winston.format.combine(winston.format.colorize(), this.alignColorsAndTime())
			}),
			new winston.transports.File({
				filename: `./logs/error-${new Date().getMonth() + 1}-${new Date().getFullYear()}.log`,
				level: 'error',
				format: winston.format.combine(winston.format.colorize(), this.alignColorsAndTime())
			}),
			new winston.transports.File({
				filename: `./logs/combined-${new Date().getMonth() + 1}-${new Date().getFullYear()}.log`
			})
		]
	};

	private static instance: Logger;
	logger: winston.Logger;
	private constructor() {
		this.logger = this.createLogger();
	}

	public static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
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
				format: 'YY-MM-DD HH:MM:SS'
			}),
			winston.format.printf((info) => `${info.label}  [${info.timestamp}]  ${info.level} : ${info.message}`)
		);
	}
}
