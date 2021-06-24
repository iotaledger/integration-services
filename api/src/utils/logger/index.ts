import * as winston from 'winston';

const alignColorsAndTime = winston.format.combine(
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

export const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	defaultMeta: { service: 'user-service' },
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
		}),
		new winston.transports.File({
			filename: `./logs/error-${new Date().getMonth() + 1}-${new Date().getFullYear()}.log`,
			level: 'error'
		}),
		new winston.transports.File({ filename: `./logs/combined-${new Date().getMonth() + 1}-${new Date().getFullYear()}.log` })
	]
});
