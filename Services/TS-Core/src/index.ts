// src/index.ts
import cluster from 'cluster';
import fastify from 'fastify';
import { cpus } from 'os';

const webServer = fastify();

/**
 * Number of cpu Threads for us to use
 */
const numCPUs = cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  if (process.env.NODE_ENV !== 'production') {
    console.log('Opening inspector');
    const { open } = await import('inspector');
    open();
  }

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died, ${code} ${signal}`);
  });
} else {
  const workerID = process.pid;

  console.log(`Starting worker: ${workerID}`);

  webServer.get('*', async (request) => {
    return 'helloWorld';
  });

  await webServer.listen(1231, '0.0.0.0');
  console.log(`Worker ${workerID} started`);
}

export {};
