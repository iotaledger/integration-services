import promClient, { Histogram, Gauge, Registry } from 'prom-client';
import { NextFunction, Request, Response } from 'express';

//prometheus integration:
export const register = new Registry();
register.setDefaultLabels({
	app: 'integration-services'
});

promClient.collectDefaultMetrics({ register });

// Create a histogram metric
const httpRequestDurationSeconds = new Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'path', 'code'],
	buckets: [0.1, 2, 5, 10, 20, 40, 60]
});

// Create a gauge metric
const failedRequests = new Gauge({
	name: 'failed_requests',
	help: 'Number of failed HTTP requests',
	labelNames: ['method', 'path']
});

// Create a gauge metric
const totalRequests = new Gauge({
	name: 'total_requests',
	help: 'Number of successful HTTP requests',
	labelNames: ['method', 'path']
});

// // Register the histogram
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(failedRequests);
register.registerMetric(totalRequests);

export const statusMiddleware = (req: Request, res: Response, next: NextFunction) => {
	res.on('finish', () => {
		totalRequests.labels({ method: req.method, path: req.path }).inc();
		if (res.statusCode >= 400) {
			failedRequests.labels({ method: req.method, path: req.path }).inc();
			console.log('Failed request');
		}
	});
	next();
};

// middleware for prom-client:
export const latencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const end = httpRequestDurationSeconds.startTimer();
	const responseCompleted = () => {
		// we do not listen for close since we need to keep the lock until the request to the tangle has been finished.
		// otherwise the client could close the request before and we would release the lock too early.
		res.removeListener('finish', responseCompleted);
		end({ method: req.method, code: res.statusCode, path: req.path });
	};
	res.on('finish', responseCompleted);

	next();
};
