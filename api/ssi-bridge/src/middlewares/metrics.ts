import promClient, { Histogram, Gauge, Registry } from 'prom-client';
import { NextFunction, Request, Response } from 'express';

// Prometheus integration
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
	buckets: [0.1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 40, 60]
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

// Register the histogram
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(failedRequests);
register.registerMetric(totalRequests);

export const statusMiddleware = (req: Request, res: Response, next: NextFunction) => {
	res.on('finish', () => {
		const { method, path } = req;
		totalRequests.labels({ method, path }).inc();
		if (res.statusCode >= 400) {
			failedRequests.labels({ method, path }).inc();
		}
	});
	next();
};

// middleware for prom-client
export const latencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const end = httpRequestDurationSeconds.startTimer();
	const { method, path } = req;
	const responseCompleted = () => {
		// we do not listen for close since we need to keep the lock until the request to the tangle has been finished.
		// otherwise the client could close the request before and we would release the lock too early.
		res.removeListener('finish', responseCompleted);
		end({ method, code: res.statusCode, path });
	};
	res.on('finish', responseCompleted);

	next();
};
