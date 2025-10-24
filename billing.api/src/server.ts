import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { sequelize } from './models'; // Import from models/index.ts
import billingRoutes from './routes/billing.routes';

const app: FastifyInstance = Fastify({ logger: true });

// Enable CORS
app.register(cors, { origin: '*' });

// Register routes with API prefix
app.register(billingRoutes, { prefix: '/api/billing' });

const start = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Start server
    await app.listen({ port: 3000 });
    console.log('🚀 Fastify server running at http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Start the server
start();